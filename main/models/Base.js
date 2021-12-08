/**
 * 基于electron-store实现的model，类似于mysql的table
 */

const {store} = require('../utils/store');
const moment = require('moment');
const {uuid} = require('uuidv4');

module.exports = class BaseModel {
    constructor() {}

    getDefault(data) {
        return data || {};
    }

    getTimestamp() {
        return moment().format('YYYY-MM-DD hh:mm:ss');
    }

    generateId() {
        return uuid();
    }

    getAll() {
        const collection = store.get(this.name);
        return collection ? Object.values(collection) : null;
    }

    getById(id) {
        const collection = store.get(this.name);
        return collection[id] || null;
    }

    insert(data) {
        const item = this.getDefault(data);
        const collection = store.get(this.name) || {};
        const now = this.getTimestamp();
        item.id = item.id || this.generateId();
        item.createTime = now;
        item.updateTime = now;
        collection[item.id] = item;
        store.set(this.name, collection);
        return collection[item.id];
    }

    update(data) {
        const id = data.id;
        const collection = store.get(this.name);
        if (!collection[id]) {
            throw Error('更新失败，项目不存在');
        }
        collection[id] = {
            ...collection[id],
            ...data,
            updateTime: this.getTimestamp(),
        };
        store.set(this.name, collection);
        return collection[id];
    }

    delete(data) {
        const id = typeof data === 'string' ? data : data.id;
        const collection = store.get(this.name);
        const item = collection[id];
        if (!item) {
            throw Error('删除失败，项目不存在');
        }
        delete collection[id];
        store.set(this.name, collection);
        return item;
    }
};
