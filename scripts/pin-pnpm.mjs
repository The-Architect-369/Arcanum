import fs from 'node:fs';

function patch(file) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  j.packageManager = 'pnpm@9.10.0';
  j.engines = { ...(j.engines || {}), node: '22.x' };
  if (file.includes('apps/site/')) {
    j.scripts = { ...(j.scripts || {}), preinstall: 'corepack enable && corepack prepare pnpm@9.10.0 --activate' };
  }
  fs.writeFileSync(file, JSON.stringify(j, null, 2));
  console.log('Updated', file);
}

patch('package.json');
patch('apps/site/package.json');
