import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const fontsDir = join(root, 'public', 'fonts');
const imagesDir = join(root, 'public', 'img', 'performance');

await Promise.all([
  mkdir(fontsDir, { recursive: true }),
  mkdir(imagesDir, { recursive: true }),
]);

const fonts = {
  'manrope-greek.woff2': 'https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggSxSuXd.woff2',
  'manrope-latin.woff2': 'https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggexSg.woff2',
  'roboto-greek.woff2': 'https://fonts.gstatic.com/s/roboto/v51/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3-UBGEe.woff2',
  'roboto-latin.woff2': 'https://fonts.gstatic.com/s/roboto/v51/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3yUBA.woff2',
};

for (const [filename, url] of Object.entries(fonts)) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to download ${url}: ${response.status}`);
  await writeFile(join(fontsDir, filename), Buffer.from(await response.arrayBuffer()));
}

const heroSource = join(root, 'public', 'img', 'ododiatros-theodoros-kouimtzis-sto-iatrio.jpg');

for (const width of [1280, 1920, 2560]) {
  await sharp(heroSource)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 88, smartSubsample: true, effort: 5 })
    .toFile(join(imagesDir, `hero-desktop-${width}.webp`));
}

for (const width of [640, 768, 960]) {
  await sharp(heroSource)
    .extract({ left: 1134, top: 0, width: 1110, height: 2000 })
    .resize({ width })
    .webp({ quality: 90, smartSubsample: true, effort: 5 })
    .toFile(join(imagesDir, `hero-mobile-${width}.webp`));
}

const responsiveImages = [
  ['theodoros-kouimtzis-exetasi-dodia.jpg', 'feature-examination', [640, 768, 960, 1440]],
  ['voithos-iatriou-theodorou-kouimtzi.jpg', 'feature-assistant', [640, 768, 960, 1440]],
  ['ododiatros-theodoros-kouimtzis-panoramiki.jpg', 'feature-panoramic', [640, 768, 960, 1440]],
  ['masonry/ododiatros-theodoros-kouimtzis-bio.JPG', 'card-doctor', [480, 720, 768, 900]],
  ['masonry/iatrio-theodoros-kouimtzis.JPG', 'card-clinic', [480, 720, 768, 900]],
  ['masonry/ododiatros-theodoros-kouimtzis-ipiresies.jpg', 'card-services', [480, 720, 768, 900]],
];

for (const [source, outputName, widths] of responsiveImages) {
  for (const width of widths) {
    await sharp(join(root, 'public', 'img', source))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 88, smartSubsample: true, effort: 5 })
      .toFile(join(imagesDir, `${outputName}-${width}.webp`));
  }
}

console.log('Optimized fonts and responsive images generated.');
