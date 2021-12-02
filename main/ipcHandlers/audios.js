const audioSrv = require('../services/audio');
const {dataSuccess, dataError} = require('../utils/datajson');
const handle = require('./handle');
const debug = require('debug')('ipcMain');

handle('get:/try-audio', async (e, params) => {
    try {
        const src = await audioSrv.tryAudio(params);
        return dataSuccess(src);
    } catch (e) {
        debug(e);
        return dataError(e.message || e);
    }
});
