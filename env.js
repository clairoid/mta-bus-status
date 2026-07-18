// Loads .env into process.env for local `node server.js` runs.
// Must be imported before anything that reads process.env at module load
// (api/lib.js captures MTA_BUSTIME_KEY as a const). Vercel sets env itself.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

try {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), ".env");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, key, raw] = m;
    if (process.env[key] !== undefined) continue;
    process.env[key] = raw.replace(/^["']|["']$/g, "");
  }
} catch {
  // no .env file — rely on the environment
}

if (!process.env.MTA_BUSTIME_KEY) {
  console.warn("WARNING: MTA_BUSTIME_KEY is not set — all MTA API calls will fail.");
}
