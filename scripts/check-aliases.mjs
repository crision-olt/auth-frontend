#!/usr/bin/env node

/**
 * Custom linter to enforce path aliases (@/) instead of relative imports.
 * Pass --fix to rewrite relative imports that resolve inside src/ to @/ aliases.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'src');

const relativeImportPattern = /from\s+['"`](\.\.[\\/].*?)['"``]/g;
const extensions = ['.ts', '.tsx', '.js', '.jsx'];
const fix = process.argv.includes('--fix');

let hasErrors = false;

function toAlias(filePath, relativeImport) {
  const target = path.resolve(path.dirname(filePath), relativeImport);
  const aliasPath = path.relative(srcDir, target).split(path.sep).join('/');
  return aliasPath.startsWith('..') ? null : `@/${aliasPath}`;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath);
      }
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      const original = fs.readFileSync(filePath, 'utf-8');
      const relPath = path.relative(process.cwd(), filePath);
      const content = fix
        ? original.replace(relativeImportPattern, (statement, relativeImport) => {
            const alias = toAlias(filePath, relativeImport);
            return alias ? statement.replace(relativeImport, alias) : statement;
          })
        : original;

      if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`fixed: ${relPath}`);
      }

      let match;
      relativeImportPattern.lastIndex = 0;

      while ((match = relativeImportPattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        console.error(`${relPath}:${lineNumber}: error: Relative imports are not allowed. Use '@/' aliases instead.`);
        console.error(`  Found: from '${match[1]}'`);
        console.error(`  Use: from '@/...'`);
        hasErrors = true;
      }
    }
  });
}

walkDir(srcDir);

if (hasErrors) {
  process.exit(1);
}
