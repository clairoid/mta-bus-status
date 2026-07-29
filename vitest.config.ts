import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Node by default (the api/ helpers are pure); files needing a DOM opt in
    // with a `@vitest-environment jsdom` docblock.
    environment: "node",
    include: ["tests/**/*.test.{ts,js}"],
  },
});
