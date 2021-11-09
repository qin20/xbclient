const { createProxyMiddleware  } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        createProxyMiddleware('/v1', {
            target : 'http://localhost:9999',
            changeOrigin : true,  // 设置跨域请求
            pathRewrite : {
                '^/v1' : '' // 将/api/v1 变为 ''
            }
        })
    );
};
