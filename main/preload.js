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
        removeAllListeners(...args) {
            return ipcRenderer.removeAllListeners.call(...args);
        },
    },
});
