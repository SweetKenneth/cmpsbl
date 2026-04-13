#!/usr/bin/env node
/**
 * mana — Silent Software Symbiosis
 * Usage: npx mana attach
 *
 * U.S. Patent App. No. 64/031,637
 * © CMPSBL® — All rights reserved.
 */

import { run } from './index';

process.on('SIGINT', async () => {
  console.log('');
  console.log('  Layer detaching gracefully.');
  await new Promise(resolve => setTimeout(resolve, 400));
  console.log('  Your code remains unchanged.');
  console.log('');
  process.exit(0);
});

run(process.argv.slice(2)).catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
