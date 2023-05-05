const path = require('path')
const { name } = require('./package')

function resolve (dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  publicPath: process.env.NODE_ENV === 'customer' ? "/Child/WebScheduler/" : "", // 项目整合，单独部署的时候注释掉这个参数。 process.env.NODE_ENV === 'customer', 客户的部署环境。
  filenameHashing: true,
  lintOnSave: false,
  runtimeCompiler: true,
  productionSourceMap: false,
  devServer: {
    hot: true,
    disableHostCheck: true,
    port: 8007,
    overlay: {
      warnings: false,
      errors: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    proxy: {
      "/api": {
        target: "", // 后台接口域名
        ws: false, //如果要代理 websockets，配置这个参数
        secure: false, // 如果是https接口，需要配置这个参数
        changeOrigin: true, //是否跨域
        pathRewrite: {
          "^/api": "",
        },
      },
    },
    // 自定义webpack配置
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: "javascript/auto"
        },
      ],
    },
    // 让主应用能正确识别微应用暴露出来的一些信息
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd', // 把子应用打包成 umd 库格式
      jsonpFunction: `webpackJsonp_${name}`
    }
  }
};
