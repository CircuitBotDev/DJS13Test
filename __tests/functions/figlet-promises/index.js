const fs = require('fs');
const path = require('path');
const font_path = path.join(__dirname,"fonts");
module.exports = class {
    constructor(){
        this.fonts = new Map();
    }

    parseFont(name) {
		if(this.fonts.has(name))return;
	    return this._parseFont(name, this.loadFont(name));
	}

    loadFont(name) {
        return fs.readFileSync(path.join(font_path, name + ".flf"), "utf-8");
    }

    loadFonts(){
        let files = fs.readdirSync(font_path);
        for(const file of files){
            if(file.endsWith('.flf')) {
                let name = file.slice(0,file.length-4);
                this.parseFont(name);
            }
        }
        return;
    }

    _parseFont (name, defn) {
        let lines = defn.split("\n"),
            header = lines[0].split(" "),
            hardblank = header[0].charAt(header[0].length - 1),
            height = +header[1],
            comments = +header[5];

        this.fonts.set(name,{
            defn: lines.slice(comments + 1),
            hardblank: hardblank,
            height: height,
            char: {}
        });
        return;
    }

    parseChar (char, font) {
        let fontDefn = this.fonts.get(font);

        if (char in fontDefn.char) {
            return fontDefn.char[char];
        }

        let height = fontDefn.height,
            start = (char - 32) * height,
            charDefn = [],
            i;

        for (i = 0; i < height; i++) {
            charDefn[i] = fontDefn.defn[start + i]
                .replace(/@/g, "")
                .replace(RegExp("\\" + fontDefn.hardblank, "g"), " ");
        }
        fontDefn.char[char] = charDefn
        this.fonts.set(font,fontDefn);
        return charDefn;
    }

    write (str,font){
        if(!str)throw new Error('No string provided!');
        if(!font) throw new Error('No font provided!');
        if(!this.fonts.has(font)) throw new Error('Invalid font!');

        let chars = [],
            result = "",
            len,i,height;

        for (i = 0, len = str.length; i < len; i++) {
            chars[i] = this.parseChar(str.charCodeAt(i), font);
        }
        for (i = 0, height = chars[0].length; i < height; i++) {
            for (var j = 0; j < len; j++) {
                result += chars[j][i];
            }
            result += "\n";
        }
        return result;
    }
};
