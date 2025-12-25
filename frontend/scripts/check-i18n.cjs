#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(colors.red, `Error loading ${filePath}: ${error.message}`);
    return null;
  }
}

function flattenObject(obj, prefix = '') {
  let result = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

function compareTranslations(vi, en) {
  const viKeys = Object.keys(vi);
  const enKeys = Object.keys(en);

  const missingInEn = viKeys.filter(key => !enKeys.includes(key));
  const missingInVi = enKeys.filter(key => !viKeys.includes(key));

  const extraInEn = enKeys.filter(key => !viKeys.includes(key));
  const extraInVi = viKeys.filter(key => !enKeys.includes(key));

  return {
    missingInEn,
    missingInVi,
    extraInEn,
    extraInVi
  };
}

function main() {
  const localesDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');

  log(colors.blue, '🔍 Checking i18n translations...');

  // Load translation files
  const viPath = path.join(localesDir, 'vi.json');
  const enPath = path.join(localesDir, 'en.json');

  const viData = loadJSON(viPath);
  const enData = loadJSON(enPath);

  if (!viData || !enData) {
    log(colors.red, '❌ Failed to load translation files');
    process.exit(1);
  }

  // Flatten objects for comparison
  const viFlat = flattenObject(viData);
  const enFlat = flattenObject(enData);

  log(colors.blue, `📊 Found ${Object.keys(viFlat).length} Vietnamese keys`);
  log(colors.blue, `📊 Found ${Object.keys(enFlat).length} English keys`);

  // Compare translations
  const comparison = compareTranslations(viFlat, enFlat);

  let hasIssues = false;

  if (comparison.missingInEn.length > 0) {
    hasIssues = true;
    log(colors.red, `\n❌ Missing in English (${comparison.missingInEn.length}):`);
    comparison.missingInEn.forEach(key => {
      log(colors.red, `   - ${key}`);
    });
  }

  if (comparison.missingInVi.length > 0) {
    hasIssues = true;
    log(colors.red, `\n❌ Missing in Vietnamese (${comparison.missingInVi.length}):`);
    comparison.missingInVi.forEach(key => {
      log(colors.red, `   - ${key}`);
    });
  }

  if (!hasIssues) {
    log(colors.green, '\n✅ All translations are synchronized!');
    log(colors.green, `✅ Total keys: ${Object.keys(viFlat).length}`);
  } else {
    log(colors.yellow, '\n⚠️  Translation files are not synchronized');
    log(colors.yellow, '💡 Run this script after adding new translation keys');
  }

  // Check for common issues
  log(colors.blue, '\n🔧 Checking for common issues...');

  const allKeys = [...Object.keys(viFlat), ...Object.keys(enFlat)];
  const duplicateKeys = allKeys.filter((key, index) => allKeys.indexOf(key) !== index);

  if (duplicateKeys.length > 0) {
    log(colors.yellow, `⚠️  Found duplicate keys: ${duplicateKeys.join(', ')}`);
  }

  // Check for empty values
  const emptyValues = [];
  Object.entries(viFlat).forEach(([key, value]) => {
    if (!value || value === '') {
      emptyValues.push(`vi.${key}`);
    }
  });
  Object.entries(enFlat).forEach(([key, value]) => {
    if (!value || value === '') {
      emptyValues.push(`en.${key}`);
    }
  });

  if (emptyValues.length > 0) {
    log(colors.yellow, `⚠️  Found empty values: ${emptyValues.slice(0, 10).join(', ')}${emptyValues.length > 10 ? '...' : ''}`);
  }

  if (!hasIssues && duplicateKeys.length === 0 && emptyValues.length === 0) {
    log(colors.green, '🎉 All checks passed!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { compareTranslations, flattenObject };
