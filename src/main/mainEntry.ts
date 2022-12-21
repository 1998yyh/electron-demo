import { app, BrowserWindow } from 'electron'
import { CommonWindowEvent } from './CommonWindowEvent'
import { CustomScheme } from './CustomScheme'


app.on('browser-window-created',(e,win)=>{
  CommonWindowEvent.regWinEvent(win)
})

// 如果渲染进程的代码可以访问 Node.js 的内置模块，而且渲染进程加载的页面（或脚本）是第三方开发的，那么恶意第三方就有可能使用 Node.js 的内置模块伤害最终用户 。
// ELECTRON_DISABLE_SECURITY_WARNINGS 用于设置渲染进程开发者调试工具的警告，这里设置为 true 就不会再显示任何警告了。
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";

let mainWindow: BrowserWindow;

// mainWindow 被设置成一个全局变量，这样可以避免主窗口被 JavaScript 的垃圾回收器回收掉。

app.whenReady().then(() => {
  let config = {
    frame: false,
    show: false,
    webPreferences: {
      // nodeIntegration配置项的作用是把 Node.js 环境集成到渲染进程中
      nodeIntegration: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      // contextIsolation配置项的作用是在同一个 JavaScript 上下文中使用 Electron API。
      contextIsolation: false,
      webviewTag: true,
      spellcheck: false,
      disableHtmlFullscreenWindowResize: true,
    },
  }


  mainWindow = new BrowserWindow(config);
  // webContents的openDevTools方法用于打开开发者调试工具
  mainWindow.webContents.openDevTools({ mode: "undocked" });
  

  // 一开始隐藏窗口 触发事件后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  })
  //src\main\mainEntry.ts
  if (process.argv[2]) {
    mainWindow.loadURL(process.argv[2]);
  } else {
    CustomScheme.registerScheme();
    mainWindow.loadURL(`app://index.html`);
  }

  CommonWindowEvent.listen();
});

// app 和 BrowserWindow 都是 Electron 的内置模块，这些内置模块是通过 ES Module 的形式导入进来的，
// 我们知道 Electron 的内置模块都是通过 CJS Module 的形式导出的，
// 这里之所以可以用 ES Module 导入，是因为我们接下来做的主进程编译工作帮我们完成了相关的转化工作。