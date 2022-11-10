//plugins\devPlugin.ts
import { ViteDevServer } from "vite";
export let devPlugin = () => {
  return {
    name: "dev-plugin",
    configureServer(server: ViteDevServer) {
      // 使用 esbuild 模块完成了主进程 TypeScript 代码的编译工作
      require("esbuild").buildSync({
        entryPoints: ["./src/main/mainEntry.ts"],
        bundle: true,
        platform: "node",
        outfile: "./dist/mainEntry.js",
        external: ["electron"],
      });
      // 监听 server.httpServer 的 listening 事件来判断 httpServer 是否已经成功启动。
      server.httpServer!.once("listening", () => {
        // 通过spawn 方法启动 electron 子进程
        let { spawn } = require("child_process");
        let addressInfo = server.httpServer!.address();
        let httpAddress = `http://${addressInfo.address}:${addressInfo.port}`;
        // 传递了两个参数  cwd 当前工作目录  stdio 设置子进程的控制台同步到主进程的控制台
        let electronProcess = spawn(require("electron").toString(), ["./dist/mainEntry.js", httpAddress], {
          cwd: process.cwd(),
          stdio: "inherit",
        });
        // 子进程退出的时候 关闭vite的http服务,并控制父进程退出.
        electronProcess.on("close", () => {
          server.close();
          process.exit();
        });
      });
    },
  };
};


// 我们在这个方法中把一些常用的 Node 模块和 electron 的内置模块提供给了 
// vite-plugin-optimizer 插件，以后想要增加新的内置模块只要修改这个方法即可。
// 而且 vite-plugin-optimizer 插件不仅用于开发环境，编译 Vue 项目时，它也会参与工作 
export let getReplacer = () => {
  let externalModels = ["os", "fs", "path", "events", "child_process", "crypto", "http", "buffer", "url", "better-sqlite3", "knex"];
  let result = {};
  for (let item of externalModels) {
    result[item] = () => ({
      find: new RegExp(`^${item}$`),
      code: `const ${item} = require('${item}');export { ${item} as default }`,
    });
  }
  result["electron"] = () => {
    let electronModules = ["clipboard", "ipcRenderer", "nativeImage", "shell", "webFrame"].join(",");
    return {
      find: new RegExp(`^electron$`),
      code: `const {${electronModules}} = require('electron');export {${electronModules}}`,
    };
  };
  return result;
};