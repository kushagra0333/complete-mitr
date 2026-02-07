// In src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      headers: {
        'x-api-key': 'mitr@2025'
      },
      onProxyReq: (proxyReq) => {
        console.log('Proxying request to:', proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error' });
      }
    })
  );
};