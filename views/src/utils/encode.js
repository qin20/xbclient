export function endcode(obj) {
    try {
        const strs = JSON.stringify(obj);
        const ret = { is: [], s1: '', s2: '' };
        for (let i = 0; i < strs.length; i++) {
            const s = strs[i];
            if (Math.random() > 0.9 && /[0-9a-zA-Z]/.test(s) && i > 20 && strs[i + 1] !== ',') {
                ret.is.push(i * 3);
                ret.s1 += s;
            } else {
                ret.s2 += s;
            }
        }
        return window.btoa(JSON.stringify(ret));
    } catch (e) {
        console.error(e);
    }
}

export function decode(strs) {
    try {
        const {is = [], s1 = '', s2 = ''} = JSON.parse(window.atob(strs));
        const ss1 = s1.split('');
        const ss2 = s2.split('');
        let s = '';
        for (let i = 0; i < s1.length + s2.length; i++) {
            if (is.indexOf(i * 3) >= 0) {
                s += ss1.shift();
            } else {
                s += ss2.shift();
            }
        }
        return JSON.parse(s);
    } catch (e) {
        console.error(e);
    }
}
