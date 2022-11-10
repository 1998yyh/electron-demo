import path from "path";
import fs from "fs";

class BuildObj {
  //编译主进程代码
  // vite编译前会清空
  buildMain() {
    require("esbuild").buildSync({
      entryPoints: ["./src/main/mainEntry.ts"],
      bundle: true,
      platform: "node",
      minify: true,
      outfile: "./dist/mainEntry.js",
      external: ["electron"],
    });
  }
  //为生产环境准备package.json
  // 启动我们的应用程序时，实际上是通过 Electron 启动一个 Node.js 的项目
  preparePackageJson() {
    let pkgJsonPath = path.join(process.cwd(), "package.json");
    let localPkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
    let electronConfig = localPkgJson.devDependencies.electron.replace("^", "");
    localPkgJson.main = "mainEntry.js";
    delete localPkgJson.scripts;
    delete localPkgJson.devDependencies;
    localPkgJson.devDependencies = { electron: electronConfig };
    let tarJsonPath = path.join(process.cwd(), "dist", "package.json");
    fs.writeFileSync(tarJsonPath, JSON.stringify(localPkgJson));
    fs.mkdirSync(path.join(process.cwd(), "dist/node_modules"));
  }
  //使用electron-builder制成安装包
  // 这个方法负责调用electron-builder提供的 API 以生成安装包。，这是通过config.directories.output指定的。静态文件所在目录是通过config.directories.app配置项指定
  buildInstaller() {
    let options = {
      config: {
        directories: {
          // 最终生成的安装包被放置在release目录下
          output: path.join(process.cwd(), "release"),
          app: path.join(process.cwd(), "dist"),
        },
        files: ["**"],
        extends: null,
        productName: "JueJin",
        appId: "com.juejin.desktop",
        asar: true,
        nsis: {
          oneClick: true,
          perMachine: true,
          allowToChangeInstallationDirectory: false,
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          shortcutName: "juejinDesktop",
        },
        publish: [{ provider: "generic", url: "http://localhost:5500/" }],
      },
      project: process.cwd(),
    };
    return require("electron-builder").build(options);
  }
}
export let buildPlugin = () => {
  return {
    name: "build-plugin",
    closeBundle: () => {
      let buildObj = new BuildObj();
      buildObj.buildMain();
      buildObj.preparePackageJson();
      buildObj.buildInstaller();
    },
  };
};


/**
 *  electron-builder 背后做了什么工作
 *  1. electron-builder 会收集应用程序的配置信息。比如应用图标、应用名称、应用 id、附加资源等信息。没有提供的信息使用默认的配置,生成一个全局的配置信息
 *  2. 检查package.json 目录下是否有 dependencies 依赖, 如果存在 会在输出目录下安装这些依赖
 *  3. 根据用户配置的信息asar的值为true或false,来判断是否需要把输出目录下的文件合并成一个asar文件
 *  asar文件是一个归档文件,用于使用electron打包应用程序的源代码
 *  4. 把 Electron 可执行程序及其依赖的动态链接库及二进制资源拷贝到安装包生成目录下的 win-ia32-unpacked 子目录内。
 *  5. 检查用户是否在配置信息中指定了 extraResources 配置项，如果有，则把相应的文件按照配置的规则，拷贝到对应的目录中。
 *  6. 根据配置信息使用一个二进制资源修改器修改 electron.exe 的文件名和属性信息（版本号、版权信息、应用程序的图标等）。
 *  7. 使用 7z 压缩工具，把子目录 win-ia32-unpacked 下的内容压缩成一个名为 yourProductName-1.3.6-ia32.nsis.7z 的压缩包。
 *  8. 使用 NSIS 工具生成卸载程序的可执行文件，这个卸载程序记录了 win-ia32-unpacked 目录下所有文件的相对路径，当用户卸载我们的应用时，卸载程序会根据这些相对路径删除我们的文件，同时它也会记录一些安装时使用的注册表信息，在卸载时清除这些注册表信息。
 *  9. 使用 NSIS 工具生成安装程序的可执行文件，然后把压缩包和卸载程序当作资源写入这个安装程序的可执行文件中。当用户执行安装程序时，这个可执行文件会读取自身的资源，并把这些资源释放到用户指定的安装目录下。
 * 
 */

