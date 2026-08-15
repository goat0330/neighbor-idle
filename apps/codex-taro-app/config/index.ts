import { defineConfig } from '@tarojs/cli'
import path from 'path'

export default defineConfig({
  projectName: 'neighbor-idle-codex',
  date: '2026-08-14',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: `dist/${process.env.TARO_ENV}`,
  framework: 'react',
  compiler: 'vite',
  alias: {
    '@': `${__dirname}/../src`,
    '@components': path.resolve(__dirname, '../src/components'),
    '@services': path.resolve(__dirname, '../src/services'),
    '@utils': path.resolve(__dirname, '../src/utils'),
    '@config': path.resolve(__dirname, '../src/config'),
    '@styles': path.resolve(__dirname, '../src/styles'),
  },
  sass: {
    resource: [
      path.resolve(__dirname, '../src/styles/tokens.scss'),
      path.resolve(__dirname, '../src/styles/mixins.scss'),
    ],
  },
  mini: {
    imageUrlLoaderOption: {
      limit: 0,
      name: (moduleId: string) => `assets/${path.basename(moduleId)}`,
    },
    postcss: {
      autoprefixer: {
        enable: true,
      },
      cssModules: {
        enable: true,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  h5: {
    publicPath: '/',
    devServer: {
      host: '127.0.0.1',
      port: 10086,
      open: '/index.html',
    },
  },
})
