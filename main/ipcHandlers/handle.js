const {ipcMain} = require('electron');
const {ipcError} = require('../utils/datajson');
const debug = require('debug')('ipcMain');

function errorHandler(e) {
    debug(e);
    return ipcError(e.message || e || '未知错误');
}

module.exports = function handle(channel, listener) {
    const callback = async (...args) => {
        try {
            return await listener.call(null, ...args);
        } catch (e) {
            return errorHandler(e);
        }
    };

    ipcMain.handle(channel, callback);
};

exports.handling = function(channel, listener) {
    ipcMain.on(channel, (event, arg) => {
        const reply = (data) => {
            event.sender.send(channel, data);
        };
        const end = () => {
            event.sender.send(`${channel}-end`);
        };
        listener(reply, end, arg);
    });
};
