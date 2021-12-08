const {ipcMain} = require('electron');
const debug = require('debug')('ipcMain');

function errorHandler(e) {
    debug(e);
    return {code: -1, msg: '未知错误', ...e};
}

function handle(channel, listener) {
    const callback = async (...args) => {
        try {
            return await listener.call(null, ...args);
        } catch (e) {
            return errorHandler(e);
        }
    };

    ipcMain.handle(channel, callback);
}

function handling(channel, listener) {
    ipcMain.on(channel, async (event, arg) => {
        const reply = (data) => {
            event.sender.send(channel, data);
        };
        const end = () => {
            event.sender.send(`${channel}-end`);
        };
        try {
            await listener(reply, end, arg);
        } catch (e) {
            reply(errorHandler(e));
            end();
        }
    });
}

handle.handling = handling;
module.exports = handle;
