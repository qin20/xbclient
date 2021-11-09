const projectsModel = require('../models/projects');
const ffmpegSrv = require('../services/ffmpeg');
const {dataSuccess, dataError} = require('../utils/datajson');
const handle = require('./handle');

handle('get:/projects', (e, id) => {
    const data = projectsModel.get(id);
    return dataSuccess(data);
});

handle('post:/projects', (e) => {
    const project = projectsModel.add();
    return dataSuccess(project);
});

handle('put:/projects', async (e, data) => {
    const project = await projectsModel.update(data);
    return dataSuccess(project);
});

handle('delete:/projects', (e, project) => {
    const [ret, error] = projectsModel.delete(project);
    return ret ? dataSuccess() : dataError(error || '删除失败');
});

handle('post:/projects/clip', async (e, data) => {
    const clip = await ffmpegSrv.clip(data.project, data.clip);
    return dataSuccess(clip);
});

handling('get:/projects/intra', async (reply, end, data) => {
    ffmpegSrv.intra(data, (percentage) => {
        reply(percentage);
        if (percentage === 100) {
            end();
        }
    });
});
