import type { NextConfig } from 'next';

const githubPages = process.env.GITHUB_PAGES === 'true';
const repositoryName =
  process.env.GITHUB_REPOSITORY?.split('/').at(-1) || 'corso-ai';
const assetPrefix = githubPages ? `/${repositoryName}` : '';

const nextConfig: NextConfig = {
  output: githubPages ? 'export' : undefined,
  basePath: '',
  assetPrefix,
  trailingSlash: githubPages,
};

export default nextConfig;
