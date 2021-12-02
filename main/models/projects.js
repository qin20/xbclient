const path = require('path');
const BaseModel = require('./Base');
const {app} = require('electron');
const {uuid} = require('uuidv4');

class Projects extends BaseModel {
    constructor() {
        super();
        this.name = 'projects';
    }

    getDefault(item) {
        const id = item.id || uuid();
        return {
            'id': id,
            'name': '未命名',
            'path': path.join(app.getPath('userData'), 'temp_data', id),
            // 'path': `${app.getPath('userData')}/temp_data/${id}`,
            'source': '', // 转码后的source
            // '_source': '', // 源source
            // 'decodeProgress': '', // 转码进度
            'duration': '00:00:00',
            'clips': [], // 片段
            ...item,
            'voice': {
                'type': '方言场景',
                'desc': '粤语女声',
                'voice': 'qiaowei',
                'nickname': '桃子',
                'sex': 0,
                'speech_rate': 110,
                'pitch_rate': 20,
                'volume': 100,
                ...item.voice,
            },
        };
    }
};

module.exports = new Projects();
