export function endcode(strs) {
    strs = window.btoa(strs);
    try {
        const ret = { s1: '', s2: '', is: [], };
        for (let i = 0; i < strs.length; i++) {
            const s = strs[i];
            if (Math.random() > 0.5) {
                ret.is.push(i * 3);
                ret.s1 += s;
            } else {
                ret.s2 += s;
            }
        }
        return JSON.stringify(ret);
    } catch (e) {
        console.error(e);
    }
}

export function decode(strs) {
    try {
        const {is = [], s1 = '', s2 = ''} = JSON.parse(strs);
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
        return window.atob(s);
    } catch (e) {
        console.error(e);
    }
}

export const atob = window.atob;
export const btoa = window.btoa;
