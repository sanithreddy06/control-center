/**
 * Generate PWA icons from SVG. Run: node scripts/generate-icons.js
 */
const fs = require("fs");
const path = require("path");

const svg = fs.readFileSync(path.join(__dirname, "../public/icons/icon.svg"), "utf8");

function svgToDataUrl(size) {
  const sized = svg.replace('viewBox="0 0 512 512"', `viewBox="0 0 512 512" width="${size}" height="${size}"`);
  return `data:image/svg+xml;base64,${Buffer.from(sized).toString("base64")}`;
}

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.log("Install sharp to generate PNG icons: npm install sharp");
    console.log("Using SVG fallback - update manifest to use icon.svg for now.");
    return;
  }

  const svgBuffer = fs.readFileSync(path.join(__dirname, "../public/icons/icon.svg"));
  const outDir = path.join(__dirname, "../public/icons");

  for (const size of [192, 512]) {
    await sharp(svgBuffer).resize(size, size).png().toFile(path.join(outDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }
}

main();
