const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const rootDir = path.resolve(__dirname, '../../');
const htmlFiles = getHtmlFiles(path.join(rootDir, 'frontend'));
let totalBroken = 0;

console.log('=====================================================');
console.log('   Teryak Platform - HTML & Asset Integrity Tests   ');
console.log('=====================================================');

for (const htmlFile of htmlFiles) {
  const content = fs.readFileSync(htmlFile, 'utf8');
  const dir = path.dirname(htmlFile);

  // Check script src
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    const src = match[1];
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) continue;
    const cleanSrc = src.split('?')[0].split('#')[0];
    const resolved = path.resolve(dir, cleanSrc);
    if (!fs.existsSync(resolved)) {
      console.error(`[FAIL] Broken script in ${path.relative(rootDir, htmlFile)}: ${src}`);
      totalBroken++;
    }
  }

  // Check stylesheet href
  const cssRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
  while ((match = cssRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) continue;
    const cleanHref = href.split('?')[0].split('#')[0];
    const resolved = path.resolve(dir, cleanHref);
    if (!fs.existsSync(resolved)) {
      console.error(`[FAIL] Broken CSS in ${path.relative(rootDir, htmlFile)}: ${href}`);
      totalBroken++;
    }
  }

  // Check local <a> href
  const aRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  while ((match = aRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith('#') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
    const cleanHref = href.split('?')[0].split('#')[0];
    if (!cleanHref) continue;
    const resolved = path.resolve(dir, cleanHref);
    if (!fs.existsSync(resolved)) {
      console.error(`[FAIL] Broken link in ${path.relative(rootDir, htmlFile)}: ${href}`);
      totalBroken++;
    }
  }

  // Check local <img> src
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((match = imgRegex.exec(content)) !== null) {
    const src = match[1];
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//') || src.startsWith('data:') || src === '') continue;
    const cleanSrc = src.split('?')[0].split('#')[0];
    const resolved = path.resolve(dir, cleanSrc);
    if (!fs.existsSync(resolved)) {
      console.error(`[FAIL] Broken image in ${path.relative(rootDir, htmlFile)}: ${src}`);
      totalBroken++;
    }
  }
}

if (totalBroken > 0) {
  console.error(`\n[FAILED] Found ${totalBroken} broken HTML/asset references.`);
  process.exit(1);
} else {
  console.log(`[PASS] ✓ All ${htmlFiles.length} HTML files verified: 0 broken scripts, styles, links, or images.`);
  console.log('=====================================================');
}
