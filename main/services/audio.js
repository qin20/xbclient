const fs = require('fs');
const {app} = require('electron');
const requestAudio = require('./requestAudio');

function save(content, path) {
    fs.writeFileSync(path, content);
}

async function tryAudio(params) {
    const src = `${app.getPath('temp')}/试听.wav`;
    save(await requestAudio(params), src);
    return src;
}

module.exports = {
    save,
    tryAudio,
    requestAudio,
};
