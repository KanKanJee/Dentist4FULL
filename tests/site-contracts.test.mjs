import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';

const pages = [
  ['index.html', 'Παιδοδοντίατρος Θεόδωρος Κουιμτζής Νέα Σμύρνη / Αθήνα'],
  ['paidododiatros.html', 'Ο Παιδοδοντίατρος Θεόδωρος Κουιμτζής, Νέα Σμύρνη / Αθήνα'],
  ['iatrio.html', 'Ιατρείο - Παιδοδοντίατρος Θεόδωρος Κουιμτζής, Νέα Σμύρνη / Αθήνα'],
  ['ipiresies.html', 'Υπηρεσίες - Παιδοδοντίατρος Θεόδωρος Κουιμτζής, Νέα Σμύρνη / Αθήνα'],
  ['epigoda.html', 'Επειγοντα - Παιδοδοντίατρος Παιδοδοντίατρος Θεόδωρος Κουιμτζής, Νέα Σμύρνη / Αθήνα'],
  ['sixnes-erotisis.html', 'Συχνές Ερωτήσεις - Παιδοδοντίατρος Θεόδωρος Κουιμτζής, Νέα Σμύρνη / Αθήνα'],
  ['epikinonia.html', 'Επικοινωνία - Παιδοδοντίατρος Θεόδωρος Κουιμτζής, Νέα Σμύρνη / Αθήνα'],
];

test('all seven legacy routes build with their original titles', async () => {
  for (const [file, title] of pages) {
    const html = await readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8');
    assert.match(html, new RegExp(`<title>${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`));
  }
});

test('critical biography, service, FAQ, emergency and contact copy is preserved', async () => {
  const doctor = await readFile(new URL('../dist/paidododiatros.html', import.meta.url), 'utf8');
  assert.match(doctor, /Aποφοίτησε από την Οδοντιατρική Σχολή του Αριστοτελείου Πανεπιστημίου Θεσσαλονίκης, το 1984\./);
  assert.match(doctor, /Από το 1990 μέχρι σήμερα ασχολείται αποκλειστικά με την Οδοντιατρική για παιδιά και εφήβους/);
  assert.match(doctor, /17 μαραθωνίους/);

  const services = await readFile(new URL('../dist/ipiresies.html', import.meta.url), 'utf8');
  assert.match(services, /Προληπτικές καλύψεις οπών και σχισμών \(Sealants\)/);
  assert.match(services, /Εξειδικευμένο προληπτικό πρόγραμμα για αθλητές/);

  const faq = await readFile(new URL('../dist/sixnes-erotisis.html', import.meta.url), 'utf8');
  assert.match(faq, /Πότε να κάνω την πρώτη μου επίσκεψη στον παιδοδοδοντίατρο;/);
  assert.match(faq, /Τι είναι ουλίτιδα και πως μπορώ να την αντιμετωπίσω;/);

  const emergency = await readFile(new URL('../dist/epigoda.html', import.meta.url), 'utf8');
  assert.match(emergency, /ΜΗΝ ΤΟ ΤΟΠΟΘΕΤΗΣΕΤΕ στη θέση του/);
  assert.match(emergency, /ΚΑΛΕΣΤΕ ΜΑΣ/);

  const contact = await readFile(new URL('../dist/epikinonia.html', import.meta.url), 'utf8');
  assert.match(contact, /Ελ\. Βενιζέλου 81, Νέα Σμύρνη 17123/);
  assert.match(contact, /210 9354588/);
  assert.match(contact, /693 701 9896/);
  assert.match(contact, /info@dentistforchildren\.gr/);
});

test('all original image assets are present in the static output', async () => {
  const required = [
    'SMILE.png',
    'ododiatros-theodoros-kouimtzis-sto-iatrio.jpg',
    'ododiatros-theodoros-kouimtzis-portrait-bio.jpg',
    'ododiatros-theodoros-kouimtzis-rantevou.jpg',
    '0076-opt.JPG',
    '0091-opt.JPG',
  ];
  for (const file of required) {
    await access(new URL(`../dist/img/${file}`, import.meta.url));
  }
});

test('the generated pages no longer ship Bootstrap or jQuery', async () => {
  for (const [file] of pages) {
    const html = await readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /bootstrap(?:\.min)?\.(?:css|js)/i);
    assert.doesNotMatch(html, /jquery(?:\.min)?\.js/i);
  }
});

test('the navigation hides on downward scroll and returns on upward scroll', async () => {
  const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

  assert.match(home, /data-site-header/);
  assert.match(home, /requestAnimationFrame\(/);
  assert.match(home, /classList\.toggle\(`-translate-y-full`/);
  assert.match(home, /passive:!0/);
});

test('the narrow mobile hero title fits and a back-to-top control is available', async () => {
  const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

  assert.match(home, /text-\[clamp\(1\.9rem,9\.3vw,3rem\)\]/);
  assert.match(home, /class="block whitespace-nowrap">Παιδοδοντίατρος/);
  assert.match(home, /data-back-to-top/);
  assert.match(home, /aria-label="Επιστροφή στην κορυφή"/);
  assert.match(home, /scrollTo\(/);
});

test('critical fonts and homepage images are self-hosted and responsive', async () => {
  const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

  assert.doesNotMatch(home, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
  assert.match(home, /href="\/fonts\/manrope-site-v1\.woff2"/);
  assert.match(home, /href="\/fonts\/roboto-site-v1\.woff2"/);
  assert.match(home, /hero-mobile-640\.webp 640w/);
  assert.match(home, /hero-mobile-640-v2\.avif 640w/);
  assert.match(home, /hero-desktop-1280\.webp 1280w/);
  assert.match(home, /hero-desktop-1280-v2\.avif 1280w/);
  assert.match(home, /card-doctor-480\.webp 480w/);
  assert.match(home, /card-doctor-480-v3\.avif 480w/);
  assert.match(home, /feature-examination-640\.webp 640w/);
  assert.match(home, /feature-examination-640-v2\.avif 640w/);
  assert.doesNotMatch(home, /rel="stylesheet"/);
  assert.match(home, /rel="preload" as="image"/);
  assert.match(home, /imagesrcset="\/img\/performance\/hero-mobile-640-v2\.avif 640w/);
  assert.equal((home.match(/rel="preconnect"/g) ?? []).length, 0);
  assert.doesNotMatch(home, /cdn-cookieyes\.com/);
  assert.match(home, /gtm\.blocklist/);
  assert.match(home, /sandboxedScripts/);
  assert.match(home, /data-consent-banner/);
  assert.match(home, /data-consent-revisit/);
  assert.match(home, /data-consent-accept/);
  assert.match(home, /data-consent-reject/);
  assert.match(home, /data-consent-customize/);
  assert.match(home, /dentist_cookie_consent/);
  assert.match(home, /<!--email_off-->/);
  assert.doesNotMatch(home, /googletagmanager\.com\/ns\.html/);
  assert.match(home, /requestIdleCallback/);
  assert.match(home, /addEventListener\(['"`]load['"`]/);
});

test('legacy URLs are permanent redirects', async () => {
  const redirects = await readFile(new URL('../dist/_redirects', import.meta.url), 'utf8');
  const rules = redirects
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  assert.ok(rules.length > 0);
  for (const rule of rules) {
    assert.match(rule, /\s301$/);
  }
});

test('legal policies are local, customized and excluded from indexing', async () => {
  const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const privacy = await readFile(new URL('../dist/privacy-policy.html', import.meta.url), 'utf8');
  const cookies = await readFile(new URL('../dist/cookie-policy.html', import.meta.url), 'utf8');

  assert.match(home, /href="\/privacy-policy"/);
  assert.match(home, /href="\/cookie-policy"/);

  for (const policy of [privacy, cookies]) {
    assert.match(policy, /dentistforchildren\.gr/);
    assert.match(policy, /Theodoros Kouimtzis/);
    assert.match(policy, /El\. Venizelou 81, Nea Smyrni 17123, Greece/);
    assert.match(policy, /info@dentistforchildren\.gr/);
    assert.match(policy, /name="robots" content="noindex, nofollow"/);
    assert.doesNotMatch(policy, /fullofsmiles\.gr/i);
    assert.doesNotMatch(policy, /iubenda\.com/i);
  }
});
