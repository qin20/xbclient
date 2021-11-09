const fs = require('fs');
const path = require('path');
const BaseModel = require('./Base');
const moment = require('moment');
const {app} = require('electron');
const ffmpegSrv = require('../services/ffmpeg');

class Projects extends BaseModel {
    constructor() {
        super();
        this.name = 'projects';
    }

    getDefaultProject() {
        const name = moment().format('YYYYMMDDhhmmss');
        const output = path.resolve(app.getPath('videos'));

        return {
            'name': name,
            'output': output,
            'clipDir': `${output}/${name}/clips`,
            'source': '', // 转码后的source
            '_source': '', // 源source
            'duration': '00:00:00',
            'size': '0k',
            'voice': {
                'type': '方言场景',
                'desc': '粤语女声',
                'voice': 'qiaowei',
                'nickname': '桃子',
                'sex': 0,
                'speech_rate': 110,
                'pitch_rate': 20,
                'volume': 100,
            },
            'clips': [],
        };
    }

    getOutputPath(project) {
        return `${project.output}/${project.name}`;
    }

    add(project=this.getDefaultProject()) {
        this.insert(project);
        return project;
    }

    async update(project) {
        const old = this.get(project.id);
        if (old.name !== project.name || old.output !== project.output) {
            project.clipDir = `${project.output}/${project.name}/clips`;
            if (!fs.existsSync(project.clipDir)) {
                fs.mkdirSync(project.clipDir, {recursive: true});
            }
        }
        if (project._source && project._source !== old._source) {
            const dir = `${project.output}/${project.name}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {recursive: true});
            }
            project.poster = `${dir}/poster.jpeg`;
            await ffmpegSrv.getPoster(
                project._source,
                project.poster,
            );
        }
        return super.update(project);
    }
};

module.exports = new Projects();
