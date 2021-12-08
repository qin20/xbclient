const fs = require('fs');
const path = require('path');
const debug = require('debug')('services:audio');
const request = require('request');
const {tempPath} = require('../utils/utils');
const {getFrontStorage} = require('../utils/store');

function save(content, output) {
    if (!fs.existsSync(path.dirname(output))) {
        fs.mkdirSync(path.dirname(output), {recursive: true});
    }
    fs.writeFileSync(output, content);
}

async function tryAudio(params) {
    const src = path.join(tempPath, '试听.wav');
    save(await textToSpeech(params), src);
    return src;
}

function textToSpeech(params) {
    const api = 'http://127.0.0.1:32222/tts';
    const storage = getFrontStorage() || {};

    return new Promise((resolve, reject) => {
        const urlParams = new URLSearchParams({type: 'ali', ...params});
        const url = `${api}?${urlParams.toString()}`;
        debug(`文字转配音：${url}`);
        request({
            url,
            method: 'GET',
            encoding: null,
            headers: {'Authorization': `Bearer ${storage.user && storage.user.token}`},
        }, function(error, response, body) {
            if (error != null) {
                debug(error);
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
                    reject(error);
                } else {
                    resolve(body);
                }
            }
        });
    });
}

module.exports = {
    save,
    tryAudio,
    textToSpeech,
};
