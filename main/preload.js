const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        invoke(...args) {
            return ipcRenderer.invoke.call(ipcRenderer, ...args);
        },
        send(...args) {
            return ipcRenderer.send.call(ipcRenderer, ...args);
        },
        on(...args) {
            return ipcRenderer.on.call(ipcRenderer, ...args);
        },
        once(...args) {
            return ipcRenderer.once.call(ipcRenderer, ...args);
        },
        removeListener(...args) {
            return ipcRenderer.removeListener.call(ipcRenderer, ...args);
        },
        removeAllListeners(...args) {
            return ipcRenderer.removeAllListeners.call(ipcRenderer, ...args);
        },
    },
});
