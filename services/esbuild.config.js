// esbuild.config.js
module.exports = serverless => ({
  bundle: true,
  minify: false,
  sourcemap: true,
  exclude: ['aws-sdk'],
  target: 'node20',
  platform: 'node',
  concurrency: 10,
});
