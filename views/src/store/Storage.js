import { endcode, decode, btoa } from "../utils/encode";
import invoke from '../utils/invoke';

const defaultOptions = {
    sync: true, // 同步至main线程
};

export default class Storage {
    constructor(storage = localStorage, options=defaultOptions) {
        this.storage = storage;
        this.options = options;
    }

    formatKey(key) {
        return btoa(key);
    }

    setItem(key, v) {
        let value = v;
        key = this.formatKey(key);
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        try {
            value = endcode(value);
            this.storage.setItem(key, value);
            invoke('put:/store', v);
        } catch(e) {}
    }

    getItem(key) {
        let data;
        key = this.formatKey(key);
        try {
            data = decode(this.storage.getItem(key));
        } catch(e) {}

        try {
            data = JSON.parse(data);
        } catch(e) {}

        return data;
    }

    removeItem(key) {
        key = this.formatKey(key);
        try {
            this.storage.removeItem(key);
        } catch(e) {}
    }
}
