#!/usr/bin/env node
/**
 * @cmpsbl/cli — CMPSBL® Command Line Interface
 * Usage: npx @cmpsbl/cli <command> [args]
 *
 * © CMPSBL® — All rights reserved.
 */

import { run } from './index';

run(process.argv.slice(2)).catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
