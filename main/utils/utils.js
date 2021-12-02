'use strict';
const fs = require('fs');

/**
 * 删除文件夹
 * @param {*} dir
 * @param {*} options
 */
function removeDir(dir, options={
    excludes: [],
}) {
    const files = fs.readdirSync(dir);
    const {excludes} = options;
    files.forEach((file) => {
        const subpath = `${dir}/${file}`;
        if (fs.lstatSync(subpath).isDirectory()) {
            removeDir(subpath);
        } else if (excludes.indexOf(subpath) < 0) {
            fs.rmSync(subpath);
        }
    });
    // 如果没有需要保留的文件，就连文件夹一起删除
    if (!excludes || !excludes.length) {
        fs.rmSync(dir);
    }
}

module.exports = {
    removeDir,
};
