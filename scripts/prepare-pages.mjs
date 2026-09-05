import { copyFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const outputDirectory = join(process.cwd(), 'dist', 'client');
const repositoryName =
  process.env.GITHUB_REPOSITORY?.split('/').at(-1) || 'corso-ai';
const prefixedAssets = join(outputDirectory, repositoryName, '_next');
const publicAssets = join(outputDirectory, '_next');
const indexFile = join(outputDirectory, 'index.html');

await stat(indexFile);
await rm(publicAssets, { recursive: true, force: true });
await rename(prefixedAssets, publicAssets);
await rm(join(outputDirectory, repositoryName), { recursive: true, force: true });
await copyFile(indexFile, join(outputDirectory, '404.html'));
await writeFile(join(outputDirectory, '.nojekyll'), '');

console.log(`GitHub Pages artifact ready for /${repositoryName}/`);
