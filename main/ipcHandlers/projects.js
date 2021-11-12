const fs = require('fs');
const projectsModel = require('../models/projects');
const ffmpegSrv = require('../services/ffmpeg');
const {dataSuccess, dataError} = require('../utils/datajson');
const {timeToNumber, numberToTime} = require('../utils/time');
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
    const oldProject = projectsModel.get(data.id);
    if (
        oldProject.name !== data.name ||
        oldProject.output !== data.output
    ) {
        data.clipDir = `${data.output}/${data.name}/clips`;
        if (!fs.existsSync(data.clipDir)) {
            fs.mkdirSync(data.clipDir, {recursive: true});
        }
    }
    if (data._source && data._source !== oldProject._source) {
        const dir = `${data.output}/${data.name}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }
        data.poster = `${dir}/poster.jpeg`;
        data.source = '';
        data.decodeProgress = 0;
        await ffmpegSrv.getPoster(
            data._source,
            data.poster,
        );
    }
    if (data.clips && data.clips.length) {
        const duration = data.clips.reduce((ret, clip) => {
            ret += (timeToNumber(clip.end) - timeToNumber(clip.start)) || 0;
            return ret;
        }, 0);
        data.duration = numberToTime(duration, 'HH:mm:ss');
    }
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

handle.handling('get:/projects/decode', async (reply, end, project) => {
    await ffmpegSrv.decode(project, (resp) => {
        const newProject = projectsModel.update({...project, ...resp});
        reply(dataSuccess(newProject));
        if (newProject.decodeProgress === 100) {
            end();
        }
    });
});

handle('get:/projects/preview', async (e, data) => {
    const project = projectsModel.get(data.id);
    if (!project) {
        return dataError('项目不存在');
    }
    const src = await ffmpegSrv.mergeClips(project);
    return dataSuccess(src);
});

handle('get:/projects/export', async (e, data) => {
    const project = projectsModel.get(data.project.id);
    if (!project) {
        return dataError('项目不存在');
    }
    const src = await ffmpegSrv.exportVedio(project, data.ratio);
    return dataSuccess(src);
});
