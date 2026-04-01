#!/usr/bin/env node
/**
 * @cmpsbl/cli — CMPSBL® Command Line Interface
 * Usage: npx @cmpsbl/cli <command> [args]
 *
 * © CMPSBL® — All rights reserved.
 */

import { run } from './index';

// #5: Exit with weight — SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  console.log('');
  console.log('  Substrate going dark.');
  await new Promise(resolve => setTimeout(resolve, 600));
  console.log('  Your work is remembered.');
  await new Promise(resolve => setTimeout(resolve, 400));
  console.log('');
  process.exit(0);
});

run(process.argv.slice(2)).catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
