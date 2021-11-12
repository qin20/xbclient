const path = require('path');
const {app, BrowserWindow} = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        show: false,
        minHeight: 600,
        minWidth: 1300,
        webPreferences: {
            webSecurity: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (process.env.NODE_ENV === 'development') {
        const url = new URL('http://localhost:3000');
        url.pathname = 'index.html';
        win.loadURL(url.href);
        win.webContents.openDevTools();
    } else {
        win.loadURL(`file://${path.resolve(__dirname, '../views/build/index.html')}`);
    }

    win.maximize();
    win.show();
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
