const fs = require('fs');
const {app} = require('electron');
const debug = require('debug')('services:audio');
const request = require('request');

function save(content, path) {
    fs.writeFileSync(path, content);
}

async function tryAudio(params) {
    const src = `${app.getPath('temp')}/试听.wav`;
    save(await textToSpeech(params), src);
    return src;
}

function textToSpeech(params) {
    const api = 'http://127.0.0.1:32222';

    return new Promise((resolve, reject) => {
        const urlParams = new URLSearchParams(params);
        const url = `${api}?${urlParams.toString()}`;
        debug(`文字转配音：${url}`);
        request({
            url,
            method: 'GET',
            encoding: null,
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
