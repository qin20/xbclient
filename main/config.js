const path = require('path');

exports.STATIC_DIR = path.join(__dirname, 'tmp').replace(/\\/g, '/');
exports.PROJECTS_DIR = `${exports.STATIC_DIR}/projects`;
// 阿里云语音合成服务器
exports.AUDIO_API = 'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts';
// 阿里云语音合成app_key
exports.AUDIO_APP_KEY = 'zyVeguUpc7uH0Te8';
exports.AUDIO_APP_KEY_LIST = [
    'zyVeguUpc7uH0Te8',
];
// 阿里云语音合成token
exports.AUDIO_TOKEN = 'b8e4d8409a2848f69a765cd54513db58';
