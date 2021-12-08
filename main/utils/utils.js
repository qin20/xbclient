const path = require('path');
const {app} = require('electron');

const tempPath = path.join(app.getPath('userData'), 'temp_data');

module.exports = {
    tempPath,
};
