#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const OUT_PATH = path.join(__dirname, '..', 'src', 'i18n', 'hardcoded-strings.json');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, filelist);
    } else if (/\.(tsx|ts|jsx|js)$/.test(file)) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '_')
    .replace(/^_+/, '')
    .replace(/_+$/, '')
    .slice(0, 60);
}

function detectHardcoded(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const items = [];

  const attrRegex = /\b(placeholder|title|alt|aria-label)\s*=\s*(['"`])([^'"`]{1,})\2/g;
  const toastRegex = /\b(?:showSuccess|showError|showWarning|showInfo|toast\.show(?:Success|Error|Warning)?|toast\.show)\s*\(\s*(['"`])([^'"`]+)\1\s*\)/g;
  const jsxTextRegex = />\s*([^<{][^<>{}]*)\s*</g;

  // Attributes & placeholders
  lines.forEach((ln, idx) => {
    let m;
    attrRegex.lastIndex = 0;
    while ((m = attrRegex.exec(ln)) !== null) {
      const type = 'attribute';
      const keyName = m[1];
      const text = m[3].trim();
      if (text.length === 0) continue;
      const suggestedKey = `${relativeKey(filePath)}.${keyName}.${slugify(text)}`;
      items.push({ file: filePath, line: idx + 1, type, attr: keyName, text, suggestedKey });
    }

    // Toasts / inline messages
    toastRegex.lastIndex = 0;
    while ((m = toastRegex.exec(ln)) !== null) {
      const type = 'toast';
      const text = m[2].trim();
      if (text.length === 0) continue;
      const suggestedKey = `${relativeKey(filePath)}.toast.${slugify(text)}`;
      items.push({ file: filePath, line: idx + 1, type, text, suggestedKey });
    }

    // JSX text nodes (simple heuristic)
    jsxTextRegex.lastIndex = 0;
    let jm;
    while ((jm = jsxTextRegex.exec(ln)) !== null) {
      const txt = jm[1].trim();
      // Filter icons and short symbols
      if (!txt) continue;
      if (txt.length < 2) continue;
      // Exclude lines that look like class names or code
      if (/^[\w\.\-]+$/.test(txt)) continue;
      const type = 'jsx_text';
      const suggestedKey = `${relativeKey(filePath)}.text.${slugify(txt)}`;
      items.push({ file: filePath, line: idx + 1, type, text: txt, suggestedKey });
    }
  });

  return items;
}

function relativeKey(absPath) {
  const rel = path.relative(SRC_DIR, absPath);
  return rel.replace(/\\+/g, '/').replace(/\.(tsx|ts|jsx|js)$/, '').replace(/\//g, '.');
}

function main() {
  const filelist = walk(SRC_DIR);
  const results = [];
  filelist.forEach((f) => {
    try {
      const items = detectHardcoded(f);
      if (items.length) {
        results.push(...items);
      }
    } catch (e) {
      // ignore read errors
      console.error('Error scanning', f, e.message);
    }
  });

  const out = {
    generatedAt: new Date().toISOString(),
    count: results.length,
    items: results,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log(`✅ Extracted ${results.length} hard-coded strings to ${OUT_PATH}`);
}

if (require.main === module) main();






