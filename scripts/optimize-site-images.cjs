// Run with Node.js and the sharp package available in NODE_PATH or node_modules.
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const images = [
  ["assets/loadpage.png", 960],
  ["assets/atanas-photo.jpg", 640],
  ["assets/about/school-building.jpg", 1280],
  ["assets/activities/kmit-5/angry-birds-horizontal.png", 1600],
  ["assets/activities/kmit-6/pictoblox-horizontal.png", 1600],
  ["assets/activities/it-8/google-sites-horizontal.png", 1600],
  ["assets/activities/inclusive-education/graphic-tablet.png", 1600],
  ["assets/activities/club-govori-internet/podcast2.jpg", 1600],
];

async function main() {
  let before = 0;
  let after = 0;

  for (const [relativePath, maxSize] of images) {
    const source = path.join(root, relativePath);
    const destination = source.replace(/\.(png|jpg)$/, ".webp");
    const original = await fs.stat(source);
    const output = await sharp(source)
      .rotate()
      .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toFile(destination);

    before += original.size;
    after += output.size;
    console.log(`${relativePath}: ${original.size} -> ${output.size} bytes (${output.width}x${output.height})`);
  }

  console.log(`Total: ${before} -> ${after} bytes; saved ${((1 - after / before) * 100).toFixed(1)}%`);
}

main().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
