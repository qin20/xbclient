const audioSrv = require('../services/audio');
const {dataSuccess} = require('../utils/datajson');
const handle = require('./handle');

handle('get:/try-audio', async (e, params) => {
    try {
        const src = await audioSrv.tryAudio(params);
        return dataSuccess(src);
    } catch (e) {
        debug(e);
        return dataError(e.message || e);
    }
});
