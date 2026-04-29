/**
 * MIT License
 *
 * Copyright (c) 2025-present Eduardo Turcios.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const OLD_COPYRIGHT_RE =
  /^\/\*\*\n \* @copyright[\s\S]*?\*\/\n/;

function loadGitignorePatterns(root) {
  try {
    const raw = readFileSync(join(root, '.gitignore'), 'utf-8');
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));
  } catch {
    return [];
  }
}

function makeIgnoreFn(patterns) {
  const dirPatterns = patterns
    .filter((p) => p.endsWith('/'))
    .map((p) => p.slice(0, -1));

  const globPatterns = patterns.filter((p) => p.includes('*'));
  const exactPatterns = patterns.filter((p) => !p.endsWith('/') && !p.includes('*'));

  function matchGlob(pattern, name) {
    const re = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
    return re.test(name);
  }

  return function isIgnored(entryName, isDir) {
    if (isDir) return dirPatterns.includes(entryName);
    if (exactPatterns.includes(entryName)) return true;
    return globPatterns.some((p) => matchGlob(p, entryName));
  };
}

const gitignorePatterns = loadGitignorePatterns('.');
const isIgnored = makeIgnoreFn(gitignorePatterns);

const MIT_HEADER = `/**
 * MIT License
 *
 * Copyright (c) 2025-present Eduardo Turcios.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */\n`;

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const isDir = statSync(full).isDirectory();
    if (isIgnored(entry, isDir)) continue;
    if (isDir) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

const allFiles = walk('.')
  .filter((f) => /\.(js|ts|mjs|tsx)$/.test(f))
  .filter((f) => !/\.config\.(js|ts|mjs|cjs)$/.test(basename(f)));

let updated = 0;
let added = 0;
let skipped = 0;

processFiles(allFiles);

console.log(`\nDone: ${updated} replaced, ${added} added, ${skipped} skipped.`);

function processFiles(files) {
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');

    if (OLD_COPYRIGHT_RE.test(content)) {
      writeFileSync(file, content.replace(OLD_COPYRIGHT_RE, MIT_HEADER));
      updated++;
      console.log(`Replaced: ${file}`);
    } else if (content.includes('MIT License')) {
      skipped++;
      console.log(`Skipped (already MIT): ${file}`);
    } else {
      writeFileSync(file, MIT_HEADER + content);
      added++;
      console.log(`Added MIT header: ${file}`);
    }
  }
}
