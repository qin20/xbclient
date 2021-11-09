const fs = require('fs');
const path = require('path');
const config = require('../config');
const {timeToNumber, numberToTime} = require('../utils/time');
const debug = require('debug')('service:project');
const store = require('../store');

/**
 * 获取所有项目列表
 */

function getProjects() {
  return store.get('projects', []).sort((a, b) => (b.updateTime || 0) - (a.updateTime || 0));
  // const dirs = fs.readdirSync(config.PROJECTS_DIR, {withFileTypes: true})
  //     .filter((dirent) => dirent.isDirectory());
  // return dirs.map((dirent) => ({
  //   name: dirent.name,
  //   ...getProjectConf(dirent.name),
  // })).sort((a, b) => (b.updateTime || 0) - (a.updateTime || 0));
}

/**
 * 获取项目路径
 * @param {*} name
 * @returns
 */

function getDir(name) {
  return path.resolve(`${config.PROJECTS_DIR}/${name}`).replace(/\\/g, '/');
}

/**
 *
 * @param {*} name
 * @returns
 */

function create(name, config) {
  const dir = getDir(name);
  if (fs.existsSync(getProjectConfigPath(name))) {
    return `项目<${name}>已经存在`;
  }
  fs.mkdirSync(`${dir}/clips`, {recursive: true});
  updateConfig(name, {name: name, ...config, clips: []});
}

/**
 * 获取配置文件路径
 * @param {*} name
 * @returns
 */
function getProjectConfigPath(name) {
  return `${getDir(name)}/config.js`;
}

/**
 * 获取项目数据
 * @param {*} name
 * @returns
 */
function getProjectConf(name) {
  const filepath = getProjectConfigPath(name);
  let config;
  try {
    if (fs.existsSync(filepath)) {
      delete require.cache[require.resolve(filepath)];
      config = require(filepath);
    }
  } catch (e) {
    debug(e.stack);
  }
  return config;
}

function updateClip(project, clip) {
  const projectConf = getProjectConf(project);
  for (let i = 0; i < projectConf.clips.length; i++) {
    if (projectConf.clips[i].id === clip.id) {
      projectConf.clips[i] = {
        ...projectConf.clips[i],
        ...clip,
      };
      break;
    }
  }
  return updateConfig(project, projectConf);
}

/**
 * 更新项目信息
 * @param {*} name
 * @param {*} clips
 */
function updateConfig(name, data) {
  const projectConf = getProjectConf(name);
  const config = {clips: [], ...projectConf, ...data};
  const duration = config.clips.reduce((ret, clip) => {
    ret += (timeToNumber(clip.end) - timeToNumber(clip.start)) || 0;
    return ret;
  }, 0);
  config.duration = numberToTime(duration);
  if (!config.createTime) {
    config.createTime = Date.now();
  }
  config.updateTime = Date.now();
  fs.writeFileSync(
      getProjectConfigPath(name),
      `module.exports = ${JSON.stringify(config, null, 4)};`,
  );
  const {clips, ...ret} = config;
  return ret;
}

module.exports = {
  getProjects,
  getProjectConf,
  updateConfig,
  updateClip,
  create,
  getDir,
};
