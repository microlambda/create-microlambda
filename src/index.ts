#!/usr/bin/env node
import { generateProject } from "./generate";

(async () => {
  try {
    await generateProject();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
