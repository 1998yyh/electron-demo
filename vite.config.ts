import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { getReplacer,devPlugin } from './plugins/devPlugin'
// 使用 vite
import optimizer from 'vite-plugin-optimizer'
// vite-plugin-optimizer 插件会为你创建一个临时目录：node_modules.vite-plugin-optimizer。
// 然后把类似 const fs = require('fs'); export { fs as default } 这样的代码写入这个目录下的 fs.js 文件中。
// 渲染进程执行到：import fs from "fs" 时，就会请求这个目录下的 fs.js 文件，这样就达到了在渲染进程中引入 Node 内置模块的目的。
import {buildPlugin} from './plugins/buildPlugin'
// https://vitejs.dev/config/




export default defineConfig({
  plugins: [optimizer(getReplacer()), devPlugin(), vue()],
  build: {
    rollupOptions: {
      plugins: [buildPlugin()],
    },
  },
});
