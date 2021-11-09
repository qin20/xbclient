'use strict';

const CODE_SUCCESS = 0;
const CODE_ERROR = -1;
const IPC_ERROR = 500;

exports.dataSuccess = function(data=null) {
    return {code: CODE_SUCCESS, msg: '成功', data};
};

exports.dataError = function(error) {
    return {code: CODE_ERROR, msg: '错误', error};
};

exports.ipcError = function(error) {
    return {code: IPC_ERROR, msg: '异常', error};
};
