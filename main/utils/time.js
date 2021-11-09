'use strict';

const moment = require('moment');

const TIME_FORMAT = 'HH:mm:ss.SSS';

/**
 * 媒体时间戳转换%H:%M:%S.%f
 * @param {*} timeString
 * @returns
 */
exports.formatTime = (timeString) => {
    if (!timeString) {
        return '';
    }
    let time = moment(timeString, TIME_FORMAT);
    return time.format(TIME_FORMAT);
}

/**
 * 时间戳转数值(毫秒)
 * @param {*} time
 * @returns
 */
exports.timeToNumber = (time) => {
    if (typeof time === 'number') {
        return time;
    }
    const t = moment(time, TIME_FORMAT);
    const s = moment(time, TIME_FORMAT).startOf('day');
    return t.diff(s);
}

/**
 * 数值(毫秒)转时间戳
 * @param {*} num
 * @returns
 */
exports.numberToTime = (num) => {
    if (typeof num === 'string') {
        return formatTime(num);
    }
    const s = moment().startOf('day').valueOf();
    return moment(s + num).format(TIME_FORMAT);
}

exports.timeDuration = (start, end) => {
    const st = moment(start, TIME_FORMAT);
    const et = moment(end, TIME_FORMAT);
    return et.diff(st);
}

exports.timeAdd = (time, duration) => {
    duration = exports.timeToNumber(duration);
    const a = exports.formatTime(moment(moment(time, TIME_FORMAT).valueOf() + duration));
    return a;
}
