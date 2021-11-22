const qs = require('querystring');
const request = require('request');
const debug = require('debug')('requestAudio');
const store = require('../utils/store');

// 阿里云语音合成服务器
const AUDIO_API = 'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts';
// 阿里云语音合成app_key
const AUDIO_APP_KEY_LIST = [
    store.get('AppKey'),
];
// 阿里云语音合成token
const AUDIO_TOKEN = store.get('AppToken');

const keyMap = AUDIO_APP_KEY_LIST.reduce((ret, key) => {
    ret[key] = [];
    return ret;
}, {});
const queue = [];
const max = 2;

module.exports = function(params) {
    return new Promise((resolve, reject) => {
        queue.push({
            params,
            resolve,
            reject,
        });
        startQueue();
    });
};

async function startQueue() {
    let hasEmpty = true;
    while (hasEmpty && queue.length) {
        hasEmpty = addRequestTask(queue[0]);
        hasEmpty && queue.shift();
    }
}

function addRequestTask(task) {
    for (let i = 0; i < AUDIO_APP_KEY_LIST.length; i++) {
        const key = AUDIO_APP_KEY_LIST[i];
        if (keyMap[key].length < max) {
            const req = doRequest(task, key).finally(() => {
                keyMap[key].splice(index - 1, 1);
                startQueue();
            });
            const index = keyMap[key].push(req);
            return true;
        }
    }
    return false;
}

function doRequest(task, key) {
    return new Promise((resolve, reject) => {
        const params = task.params;
        const url = `${AUDIO_API}?${qs.stringify({
            appkey: key,
            token: AUDIO_TOKEN,
            format: 'wav',
            sample_rate: 44100,
            ...params,
        })}`;
        debug(`文字转配音：${key} : GET ${url}`);
        request({
            url,
            method: 'GET',
            encoding: null,
        }, function(error, response, body) {
            if (error != null) {
                debug(error);
                task.reject(error);
                reject(error);
            } else {
                const contentType = response.headers['content-type'];
                if (contentType === undefined || contentType != 'audio/mpeg') {
                    let error;
                    try {
                        error = JSON.parse(body.toString());
                    } catch (e) {
                        error = body.toString();
                    }
                    debug(error);
                    task.reject(error);
                    reject(error);
                } else {
                    task.resolve(body);
                    resolve(body);
                }
            }
        });
    });
}
