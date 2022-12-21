export let createDialog = (url:string,config:any):Promise<Window> => {
  // 通过window.open打开子窗口后，当前窗口马上监听message事件，子窗口有消息发送给当前窗口时，这个事件将被触发。
  return new Promise((resolve,reject)=>{
    let windowProxy = window.open(url,"_blank",JSON.stringify(config)) as Window;

    let readyHandler = (e:any) => {
      let msg = e.data;
      if(msg["msgName"] === '__dialogReady') {
        // 父窗口收到子窗口发来的这个消息后，将触发message事件，也就会执行我们在createDialog方法中撰写的逻辑了。
        window.removeEventListener('message',readyHandler)
        resolve(windowProxy)
      }
    }

    window.addEventListener('message',readyHandler)
  })
}

// 子窗口完成了必要的业务逻辑之后，就可以执行这个方法，通知父窗口自己已经加载成功。
export let dialogReady = () => {
  let msg = { msgName: `__dialogReady` };
  window.opener.postMessage(msg);
};