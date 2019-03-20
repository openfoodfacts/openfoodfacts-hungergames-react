const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    proxy('/off', {
      target: 'https://world.openfoodfacts.org',
      changeOrigin: true,
      pathRewrite: {
        '^/off': '',
      },
    }),
    proxy('/robotoff', {
      target: 'https://robotoff.openfoodfacts.org',
      changeOrigin: true,
      pathRewrite: {
        '^/robotoff': '',
      },
    }),
  );
};
