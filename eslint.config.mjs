import nextConfig from 'eslint-config-next';

const config = [
  ...nextConfig.flat(),
  {
    rules: {},
  },
];

export default config;
