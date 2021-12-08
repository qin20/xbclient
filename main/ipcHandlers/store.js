const {dataSuccess} = require('../utils/datajson');
const handle = require('./handle');
const {setFrontStorage} = require('../utils/store');

/**
 * 共享状态接口
 */
handle('put:/store', async (e, data) => {
    setFrontStorage(data);
    return dataSuccess();
});
