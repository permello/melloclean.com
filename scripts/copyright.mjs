/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const COPYRIGHT = `/**
 * @copyright 2026 Eduardo Turcios. All rights reserved.
 * Unauthorized use, reproduction, or distribution of this file is strictly prohibited.
 */\n`;

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

const files = walk('frontend')
  .filter((f) => /\.(ts|tsx)$/.test(f))
  .filter((f) => !basename(f).includes('config'));

let added = 0;
let skipped = 0;
for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  if (content.includes('@copyright')) {
    skipped++;
    console.log(`Skipped (already has copyright): ${file}`);
  } else {
    writeFileSync(file, COPYRIGHT + content);
    added++;
    console.log(`Added copyright: ${file}`);
  }
}

console.log(`\nDone. Added: ${added}, Skipped: ${skipped}`);
