const Store = require('electron-store');

const store = new Store();

const FRONT_KEY = 'front-storage';

function getFrontStorage() {
    return store.get(FRONT_KEY);
}

function setFrontStorage(data) {
    store.set(FRONT_KEY, data);
}

module.exports = {
    store: store,
    getFrontStorage,
    setFrontStorage,
};
