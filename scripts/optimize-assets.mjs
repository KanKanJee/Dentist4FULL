import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const fontsDir = join(root, 'public', 'fonts');
const imagesDir = join(root, 'public', 'img', 'performance');
const avifVersion = 'v2';
const cardDoctorAvifVersion = 'v3';

await Promise.all([
  mkdir(fontsDir, { recursive: true }),
  mkdir(imagesDir, { recursive: true }),
]);

const siteFontFiles = ['manrope-site-v2.woff2', 'roboto-site-v2.woff2'];
const missingSiteFonts = [];
for (const filename of siteFontFiles) {
  try {
    await access(join(fontsDir, filename));
  } catch {
    missingSiteFonts.push(filename);
  }
}

if (missingSiteFonts.length > 0) {
  const ascii = Array.from({ length: 95 }, (_, index) => String.fromCodePoint(32 + index)).join('');
  const greek = Array.from({ length: 144 }, (_, index) => String.fromCodePoint(0x0370 + index)).join('');
  const symbols = [
    0x00a0, 0x00a9, 0x00ab, 0x00b7, 0x00bb, 0x00d7, 0x00e9, 0x2013, 0x2014,
    0x2018, 0x2019, 0x201c, 0x201d,
    0x2026, 0x20ac, 0x2191, 0x2192, 0x2193, 0x2197, 0x25f7, 0x2661, 0x2713,
    0x2726, 0x2764, 0xfe0f,
  ].map((codePoint) => String.fromCodePoint(codePoint)).join('');
  const fontCssUrl = new URL('https://fonts.googleapis.com/css2');
  fontCssUrl.searchParams.set('family', 'Manrope:wght@400..700');
  fontCssUrl.searchParams.append('family', 'Roboto:wght@300..500');
  fontCssUrl.searchParams.set('display', 'swap');
  fontCssUrl.searchParams.set('text', ascii + greek + symbols);

  const cssResponse = await fetch(fontCssUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0 AppleWebKit/537.36 Chrome/149.0.0.0 Safari/537.36',
    },
  });
  if (!cssResponse.ok) throw new Error(`Unable to download ${fontCssUrl}: ${cssResponse.status}`);
  const fontUrls = [...(await cssResponse.text()).matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)]
    .map((match) => match[1]);
  if (fontUrls.length !== siteFontFiles.length) throw new Error('Unexpected Google Fonts subset response.');

  for (const [index, filename] of siteFontFiles.entries()) {
    if (!missingSiteFonts.includes(filename)) continue;
    const response = await fetch(fontUrls[index]);
    if (!response.ok) throw new Error(`Unable to download ${fontUrls[index]}: ${response.status}`);
    await writeFile(join(fontsDir, filename), Buffer.from(await response.arrayBuffer()));
  }
}

const heroSource = join(root, 'public', 'img', 'ododiatros-theodoros-kouimtzis-sto-iatrio.jpg');

for (const width of [1280, 1920, 2560]) {
  await Promise.all([
    sharp(heroSource)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 88, smartSubsample: true, effort: 5 })
      .toFile(join(imagesDir, `hero-desktop-${width}.webp`)),
    sharp(heroSource)
      .resize({ width, withoutEnlargement: true })
      .avif({ quality: 68, effort: 8, chromaSubsampling: '4:4:4' })
      .toFile(join(imagesDir, `hero-desktop-${width}-${avifVersion}.avif`)),
  ]);
}

for (const width of [640, 768, 960]) {
  await Promise.all([
    sharp(heroSource)
      .extract({ left: 1134, top: 0, width: 1110, height: 2000 })
      .resize({ width })
      .webp({ quality: 90, smartSubsample: true, effort: 5 })
      .toFile(join(imagesDir, `hero-mobile-${width}.webp`)),
    sharp(heroSource)
      .extract({ left: 1134, top: 0, width: 1110, height: 2000 })
      .resize({ width })
      .avif({ quality: 68, effort: 8, chromaSubsampling: '4:4:4' })
      .toFile(join(imagesDir, `hero-mobile-${width}-${avifVersion}.avif`)),
  ]);
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
  const avifQuality = outputName === 'card-doctor' ? 54 : outputName.startsWith('card-') ? 60 : 65;
  const outputAvifVersion = outputName === 'card-doctor' ? cardDoctorAvifVersion : avifVersion;
  for (const width of widths) {
    const input = join(root, 'public', 'img', source);
    await Promise.all([
      sharp(input)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 88, smartSubsample: true, effort: 5 })
        .toFile(join(imagesDir, `${outputName}-${width}.webp`)),
      sharp(input)
        .resize({ width, withoutEnlargement: true })
        .avif({ quality: avifQuality, effort: 8, chromaSubsampling: '4:4:4' })
        .toFile(join(imagesDir, `${outputName}-${width}-${outputAvifVersion}.avif`)),
    ]);
  }
}

console.log('Optimized fonts and responsive WebP/AVIF images generated.');
