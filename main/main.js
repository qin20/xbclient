const path = require('path');
const {app, BrowserWindow} = require('electron');
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    const win = new BrowserWindow({
        show: false,
        frame: true,
        useContentSize: true,
        resizable: true,
        maximizable: true,
        // transparent: true,
        webPreferences: {
            devTools: isDev,
            webSecurity: false,
            preload: path.join(__dirname, 'preload.js'),
            enableWebSQL: false,
            webgl: false,
        },
    });

    if (process.env.NODE_ENV === 'development') {
        const url = new URL('http://localhost:32221');
        url.pathname = 'index.html';
        win.loadURL(url.href);
        win.openDevTools();
    } else {
        win.loadURL(`file://${path.resolve(__dirname, '../views/build/index.html')}`);
    }

    win.show();

    // 自动更新
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
}

app.whenReady().then(() => {
    require('./ipcHandlers');

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
