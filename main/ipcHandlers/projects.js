const fs = require('fs');
const projectsModel = require('../models/projects');
const ffmpegSrv = require('../services/ffmpeg');
const {dataSuccess, dataError} = require('../utils/datajson');
const {timeToNumber, numberToTime} = require('../utils/time');
const handle = require('./handle');

/**
 * 获取项目
 */
handle('get:/projects', (e, id) => {
    let item;
    if (id) {
        item = projectsModel.getById(id);
    } else {
        item = projectsModel.getAll();
    }
    return dataSuccess(item);
});

/**
 * 新建项目
 */
handle('post:/projects', async (e, params) => {
    const item = projectsModel.insert(params);
    const poster = `${item.path}/poster.png`;
    await ffmpegSrv.getPoster(params.source, poster);
    const newItem = projectsModel.update({id: item.id, poster});
    return dataSuccess(newItem);
});

/**
 * 修改项目
 */
handle('put:/projects', (e, params) => {
    // 计算影片总时长duration
    if (params.clips && params.clips.length) {
        const duration = params.clips.reduce((ret, clip) => {
            ret += (timeToNumber(clip.end) - timeToNumber(clip.start)) || 0;
            return ret;
        }, 0);
        params.duration = numberToTime(duration, 'HH:mm:ss');
    }
    const item = projectsModel.update(params);
    return dataSuccess(item);
});

/**
 * 删除项目
 */
handle('delete:/projects', (e, params) => {
    const item = projectsModel.delete(params);
    // 删除项目的相关文件
    if (fs.existsSync(item.path)) {
        fs.rmSync(item.path, {force: true, recursive: true});
    }
    return dataSuccess(item);
});

/**
 * 剪辑电影片段
 */
handle('post:/projects/clip', async (e, params) => {
    const clip = await ffmpegSrv.clip(params.project, params.clip);
    return dataSuccess(clip);
});

/**
 * 视频转码关键帧
 */
handle.handling('get:/projects/decode', async (reply, end, project) => {
    await ffmpegSrv.decode(project, (resp) => {
        const newProject = projectsModel.update({...project, ...resp});
        reply(dataSuccess(newProject));
        if (newProject.decodeProgress === 100) {
            end();
        }
    });
});

/**
 * 合成预览
 */
handle('get:/projects/preview', async (e, params) => {
    const item = projectsModel.get(params.id);
    if (!item) {
        return dataError('项目不存在');
    }
    const src = await ffmpegSrv.mergeClips(item);
    return dataSuccess(src);
});

/**
 * 根据参数合成并导出项目
 */
handle('get:/projects/export', async (e, params) => {
    const item = projectsModel.get(params.project.id);
    if (!item) {
        return dataError('项目不存在');
    }
    const src = await ffmpegSrv.exportVedio(item, params.ratio);
    return dataSuccess(src);
});
