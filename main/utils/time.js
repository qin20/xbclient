'use strict';

const moment = require('moment');

const TIME_FORMAT = 'HH:mm:ss.SSS';

const formatTime = (timeString) => {
    if (!timeString) {
        return '';
    }
    return moment(timeString, TIME_FORMAT).format(TIME_FORMAT);
};

const timeToNumber = (time) => {
    if (typeof time === 'number') {
        return time;
    }
    const t = moment(time, TIME_FORMAT);
    const s = moment(time, TIME_FORMAT).startOf('day');
    return t.diff(s);
};

const numberToTime = (num, format=TIME_FORMAT) => {
    if (typeof num === 'string') {
        return formatTime(num);
    }
    const s = moment().startOf('day').valueOf();
    return moment(s + num).format(format);
};

module.exports = {
    formatTime,
    timeToNumber,
    numberToTime,
};
