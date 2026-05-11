const path = require('path')

module.exports = {
  transpileDependencies: [],
  css: {
    loaderOptions: {
      scss: {
        additionalData: `
          @import "${path.resolve(__dirname, 'src/styles/_variables.scss').replace(/\\/g, '/')}";
          @import "${path.resolve(__dirname, 'src/styles/_mixins.scss').replace(/\\/g, '/')}";
        `
      }
    }
  }
}
