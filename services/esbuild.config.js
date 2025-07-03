// esbuild.config.js
module.exports = serverless => ({
  bundle: true,
  minify: true,
  sourcemap: false,
  exclude: ['aws-sdk', '@aws-sdk/*'],
  target: 'node20',
  platform: 'node',
  concurrency: 10,
});
