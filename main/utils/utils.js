'use strict';
var fs = require('fs');

exports.uid = () => {
    return Math.floor(new Date().getTime() * Math.random());
};
