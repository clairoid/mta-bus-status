// Regenerates src/lib/data/generated/serviceCalendar.json from MTA GTFS
// *static* feeds.
//
//   npm run build:calendar
//
// Why a script and not an endpoint: the realtime alert feed carries no
// future-dated entries (verified: 0 of 77 alerts had a future activePeriod),
// so a forward-looking calendar has to come from GTFS static. That data
// changes a few times a year, the zips are 5-14MB each, and Vercel Hobby is
// at 11 of 12 functions — so this runs offline and commits its output. The
// app build stays hermetic and costs no function slot.
//
// The generated JSON is committed on purpose: builds must not depend on
// MTA's servers being up.

import { Unzip, UnzipInflate } from "fflate";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/lib/data/generated/serviceCalendar.json");

const FEEDS = [
  { id: "b", label: "Brooklyn", url: "https://rrgtfsfeeds.s3.amazonaws.com/gtfs_b.zip" },
  { id: "bx", label: "Bronx", url: "https://rrgtfsfeeds.s3.amazonaws.com/gtfs_bx.zip" },
  { id: "m", label: "Manhattan", url: "https://rrgtfsfeeds.s3.amazonaws.com/gtfs_m.zip" },
  { id: "q", label: "Queens", url: "https://rrgtfsfeeds.s3.amazonaws.com/gtfs_q.zip" },
  { id: "si", label: "Staten Island", url: "https://rrgtfsfeeds.s3.amazonaws.com/gtfs_si.zip" },
  { id: "busco", label: "MTA Bus Company", url: "https://rrgtfsfeeds.s3.amazonaws.com/gtfs_busco.zip" },
];

// Only these are decompressed. stop_times.txt alone is ~123MB uncompressed,
// so the archive is streamed and every other entry is skipped outright.
const WANTED = new Set(["calendar.txt", "calendar_dates.txt", "feed_info.txt"]);

const DOW = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]));
  });
}

// GTFS quotes fields containing commas (feed_version does).
function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

async function fetchFeedFiles(feed) {
  const res = await fetch(feed.url);
  if (!res.ok) throw new Error(`${feed.id}: HTTP ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());

  return new Promise((resolve, reject) => {
    const chunks = {};
    const unzip = new Unzip();
    unzip.register(UnzipInflate);
    unzip.onfile = (file) => {
      if (!WANTED.has(file.name)) return; // never started => never inflated
      const parts = [];
      file.ondata = (err, chunk, final) => {
        if (err) return reject(err);
        if (chunk?.length) parts.push(chunk);
        if (final) {
          const total = parts.reduce((n, p) => n + p.length, 0);
          const merged = new Uint8Array(total);
          let off = 0;
          for (const p of parts) { merged.set(p, off); off += p.length; }
          chunks[file.name] = new TextDecoder().decode(merged);
          if (WANTED.size === Object.keys(chunks).length) resolve({ chunks, bytes: buf.length });
        }
      };
      file.start();
    };
    unzip.push(buf, true);
    // feed_info.txt is optional in GTFS; don't hang if a feed omits it.
    setTimeout(() => resolve({ chunks, bytes: buf.length }), 0);
  });
}

function dayTypeOf(serviceId) {
  const s = serviceId.toLowerCase();
  if (s.includes("sunday")) return "sunday";
  if (s.includes("saturday")) return "saturday";
  if (s.includes("weekday")) return "weekday";
  return "other";
}

function naturalType(date) {
  const d = date.getDay();
  return d === 0 ? "sunday" : d === 6 ? "saturday" : "weekday";
}

function ymd(date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Dates where the schedule actually in effect differs from the one that
 * weekday would normally get — i.e. a rider-visible change.
 *
 * Most calendar_dates rows are NOT this. In summer the MTA suppresses the
 * plain `-Weekday` service and runs `-Weekday-SDon` instead; both are still
 * weekday schedules, so flagging every exception date would mark ~44 days as
 * "special" when only one is. Comparing effective day *type* filters those out.
 */
export function findExceptions(calendarRows, calendarDateRows) {
  const services = calendarRows.filter((r) => r.service_id);
  if (services.length === 0) return { exceptions: [], range: null };

  const exceptionsBy = new Map();
  for (const r of calendarDateRows) {
    if (!r.date) continue;
    if (!exceptionsBy.has(r.date)) exceptionsBy.set(r.date, { added: new Set(), removed: new Set() });
    const slot = exceptionsBy.get(r.date);
    (r.exception_type === "1" ? slot.added : slot.removed).add(r.service_id);
  }

  const start = services.reduce((min, r) => (r.start_date < min ? r.start_date : min), "99999999");
  const end = services.reduce((max, r) => (r.end_date > max ? r.end_date : max), "00000000");

  const activeOn = (dateStr, dowName) => {
    const set = new Set();
    for (const r of services) {
      if (r[dowName] === "1" && r.start_date <= dateStr && dateStr <= r.end_date) set.add(r.service_id);
    }
    const exc = exceptionsBy.get(dateStr);
    if (exc) {
      for (const s of exc.removed) set.delete(s);
      for (const s of exc.added) set.add(s);
    }
    return set;
  };

  // Pass 1: typical service count per natural day type, so the feed's partial
  // first/last days don't register as schedule changes. (Without this the very
  // first day of the feed shows up as an "exception" off a single service.)
  const counts = { weekday: [], saturday: [], sunday: [] };
  const cursor = new Date(`${start.slice(0, 4)}-${start.slice(4, 6)}-${start.slice(6, 8)}T12:00:00`);
  const last = new Date(`${end.slice(0, 4)}-${end.slice(4, 6)}-${end.slice(6, 8)}T12:00:00`);
  for (let d = new Date(cursor); d <= last; d.setDate(d.getDate() + 1)) {
    const nat = naturalType(d);
    counts[nat].push(activeOn(ymd(d), DOW[d.getDay()]).size);
  }
  const median = (arr) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };
  const typical = {
    weekday: median(counts.weekday),
    saturday: median(counts.saturday),
    sunday: median(counts.sunday),
  };

  const exceptions = [];
  for (let d = new Date(cursor); d <= last; d.setDate(d.getDate() + 1)) {
    const dateStr = ymd(d);
    const nat = naturalType(d);
    // The first and last day of a feed's window have partial coverage by
    // construction — a service pattern that starts tomorrow makes today look
    // like it has the "wrong" schedule. That's the feed boundary, not a
    // schedule change.
    if (dateStr === start || dateStr === end) continue;
    const active = activeOn(dateStr, DOW[d.getDay()]);
    if (active.size === 0) continue;
    // Likewise ignore unusually thin days near the edges.
    if (active.size < Math.max(2, typical[nat] * 0.4)) continue;

    const types = new Set([...active].map(dayTypeOf));
    types.delete("other");
    if (types.size === 0 || types.has(nat)) continue;

    const effective = [...types].sort()[0];
    exceptions.push({
      date: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`,
      naturalType: nat,
      effectiveType: effective,
      services: active.size,
    });
  }

  return { exceptions, range: { start, end } };
}

const LABELS = { saturday: "Saturday schedule", sunday: "Sunday schedule", weekday: "Weekday schedule" };

async function main() {
  const perFeed = [];
  for (const feed of FEEDS) {
    process.stdout.write(`  ${feed.label.padEnd(16)} `);
    try {
      const { chunks, bytes } = await fetchFeedFiles(feed);
      if (!chunks["calendar.txt"]) throw new Error("no calendar.txt");
      const { exceptions, range } = findExceptions(
        parseCsv(chunks["calendar.txt"]),
        chunks["calendar_dates.txt"] ? parseCsv(chunks["calendar_dates.txt"]) : []
      );
      const info = chunks["feed_info.txt"] ? parseCsv(chunks["feed_info.txt"])[0] : null;
      perFeed.push({ feed, exceptions, range, version: info?.feed_version ?? null });
      console.log(`${(bytes / 1e6).toFixed(1)}MB  ${exceptions.length} exception(s)  ${range?.start}-${range?.end}`);
    } catch (err) {
      console.log(`SKIPPED (${err.message})`);
    }
  }

  if (perFeed.length === 0) throw new Error("no feeds could be read");

  // Merge: one entry per date, recording which boroughs agree.
  const merged = new Map();
  for (const { feed, exceptions } of perFeed) {
    for (const e of exceptions) {
      if (!merged.has(e.date)) merged.set(e.date, { ...e, feeds: [] });
      merged.get(e.date).feeds.push(feed.id);
    }
  }

  const out = {
    generatedAt: new Date().toISOString(),
    source: "MTA GTFS static (rrgtfsfeeds.s3.amazonaws.com)",
    rangeStart: perFeed.map((f) => f.range?.start).filter(Boolean).sort()[0] ?? null,
    rangeEnd: perFeed.map((f) => f.range?.end).filter(Boolean).sort().pop() ?? null,
    feeds: perFeed.map((f) => ({ id: f.feed.id, label: f.feed.label, version: f.version })),
    exceptions: [...merged.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => ({
        date: e.date,
        naturalType: e.naturalType,
        effectiveType: e.effectiveType,
        label: LABELS[e.effectiveType] ?? "Modified schedule",
        feeds: e.feeds.sort(),
      })),
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`\n  wrote ${OUT.replace(ROOT + "/", "")}`);
  console.log(`  range ${out.rangeStart} - ${out.rangeEnd}, ${out.exceptions.length} schedule change(s)`);
  for (const e of out.exceptions) console.log(`    ${e.date}  ${e.naturalType} -> ${e.effectiveType}  [${e.feeds.join(",")}]`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
