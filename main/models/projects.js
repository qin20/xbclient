const path = require('path');
const BaseModel = require('./Base');
const moment = require('moment');
const {app} = require('electron');
const storage = require('../utils/storage');

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
            'decodeProgress': '', // 转码进度
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

    get(id) {
        if (id) {
            const project = super.get(id);
            if (storage.get('AppKey')) {
                project.AppKey = storage.get('AppKey');
            }
            if (storage.get('AppToken')) {
                project.AppToken = storage.get('AppToken');
            }
            return project;
        }
        return super.get();
    }

    getOutputPath(project) {
        return `${project.output}/${project.name}`;
    }

    add(project=this.getDefaultProject()) {
        this.insert(project);
        return project;
    }

    update(data) {
        if (data.AppKey) {
            storage.set('AppKey', data.AppKey);
        }
        if (data.AppToken) {
            storage.set('AppToken', data.AppToken);
        }
        return super.update(data);
    }
};

module.exports = new Projects();
