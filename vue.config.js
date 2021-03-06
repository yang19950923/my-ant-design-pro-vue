const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

// vue.config.js
module.exports = {
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,
  configureWebpack: {
    // 关闭 webpack 的性能提示
    performance: {
      hints: false
    }
  },

  chainWebpack: (config) => {
    config.resolve.alias
      .set('@$', resolve('src'))
      .set('@api', resolve('src/api'))
      .set('@assets', resolve('src/assets'))
      .set('@comp', resolve('src/components'))
      .set('@views', resolve('src/views'))
      .set('@layout', resolve('src/layout'))
      .set('@static', resolve('src/static'))
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {},
        javascriptEnabled: true
      }
    }
  },

  devServer: {
    port: 5000
    // proxy: {
    //   '/deepLearning': {
    //     target: 'http://127.0.0.1:8080', // 本地接口地址
    //     ws: true,
    //     changeOrigin: true
    //   }
    // }
  },

  lintOnSave: undefined
}
