module.exports = function(context, options) {
  return {
    name: 'proxy-plugin',
    configureWebpack() {
      return {
        devServer: {
          proxy: [
            {
              context: ['/api', '/users'],
              target: 'http://localhost:8000',
              secure: false,
              changeOrigin: true,
            }
          ]
        }
      };
    },
  };
};
