const store = require('../utils/store');
const moment = require('moment');

module.exports = class BaseModel {
    constructor() {}

    generateId() {
        return Date.now() - new Date(1970, 1, 1).getTime();
    }

    get(id) {
        const collection = store.get(this.name);
        if (id) {
            return collection[id];
        }
        return collection ? Object.values(collection) : [];
    }

    insert(data) {
        const collection = store.get(this.name) || {};
        const id = this.generateId();
        const now = moment().format('YYYY-MM-DD hh:mm:ss');
        data.id = id;
        data.createTime = now;
        data.updateTime = now;
        collection[id] = data;
        store.set(this.name, collection);
    }

    update(data) {
        const id = data.id;
        const collection = store.get(this.name);
        if (!collection[id]) {
            return data;
        }
        const project = {
            ...collection[id],
            ...data,
            updateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        };
        collection[id] = project;
        store.set(this.name, collection);
        return project;
    }

    delete(data) {
        const id = typeof data === 'string' ? data : data.id;
        const collection = store.get(this.name);
        if (collection[id]) {
            delete collection[id];
            store.set(this.name, collection);
            return [true, ''];
        }
        return [false, '项目不存在'];
    }
};
