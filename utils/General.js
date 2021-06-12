module.exports = {
    trimArray(arr, maxLen = 10) {
        if (arr.length > maxLen) {
            arr = arr.slice(0, maxLen);
            arr.push(`${arr.length - maxLen} more...`);
        }
        return arr;
    },

    shorten(text, maxLen = 2000) {
        return text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text;
    },

    formatNumber(number, minimumFractionDigits = 0) {
        return Number.parseFloat(number).toLocaleString(undefined, {
            minimumFractionDigits,
            maximumFractionDigits: 2
        });
    },

    base64(text, mode = 'encode') {
        if (mode === 'encode') return Buffer.from(text).toString('base64');
        if (mode === 'decode') return Buffer.from(text, 'base64').toString('utf8') || null;
        return null;
    },

    embedURL(title, url, display) {
        return `[${title}](${url.replace(/\)/g, '%27')}${display ? ` "${display}"` : ''})`;
    },

    hash(text, algorithm) {
        return crypto.createHash(algorithm).update(text).digest('hex');
    },

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    replaceAll(str, term, replacement) {
        return str.replace(new RegExp(this.escapeRegex(term), 'g'), replacement);
    },

    chunk(array, chunkSize = 0) {
        if (!Array.isArray(array)) throw new Error('First Parameter must be an array');
        return array.reduce((previous, current) => {
            let chunk;
            if (previous.length === 0 || previous[previous.length - 1].length === chunkSize) {
                chunk = [];
                previous.push(chunk);
            } else {
                chunk = previous[previous.length - 1];
            }
            chunk.push(current);
            return previous;
        }, []);
    },

    shuffle(obj) {
        if (!obj) return null;
        if (Array.isArray(obj)) {
            let i = obj.length;
            while (i) {
                let j = Math.floor(Math.random() * i);
                let t = obj[--i];
                obj[i] = obj[j];
                obj[j] = t;
            }
            return obj;
        }
        if (typeof obj === 'string') return this.shuffle(obj.split('')).join('');
        return obj;
    },

    removeFromArray(arr) {
        let what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax= arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    },

    capitalize(s) {
        if (typeof s !== 'string') return '';
        let j = s.split(" ");
        let a = j.map(x => x.charAt(0).toUpperCase() + x.slice(1))
        return a.join(" ")
    },
}