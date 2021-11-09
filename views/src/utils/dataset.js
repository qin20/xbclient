export function dataset(obj) {
    return Object.keys(obj).reduce((ret, key) => {
        ret[`data-${key}`] = obj[key];
        return ret;
    }, { 'data-isdataset': 1 });
}

export function getDataset(target) {
    const dom = target.closest('[data-isdataset]');
    const { isdataset, ...dataset } = dom.dataset || {};
    return dataset;
}