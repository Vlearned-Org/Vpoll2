"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtils = void 0;
const bson_1 = require("bson");
class StringUtils {
    static generateRandomString(length = 10) {
        const randomChars = "abcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }
    static generatePassword() {
        const numeric = "0123456789";
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        let result = "";
        for (let i = 0; i < 2; i++) {
            result += numeric.charAt(Math.floor(Math.random() * numeric.length));
            result += numeric.charAt(Math.floor(Math.random() * numeric.length));
            result += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
            result += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        }
        return result
            .split("")
            .sort(() => 0.5 - Math.random())
            .join("");
    }
    static slugify(string) {
        if (!string) {
            return "";
        }
        return string
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[\W_]+/g, "")
            .toLowerCase()
            .replace(/ /g, "-");
    }
    static isObjectId(value) {
        try {
            return new bson_1.ObjectId(value).toString() === value;
        }
        catch (e) {
            return false;
        }
    }
    static toUppercaseFirstLetter(string) {
        if (!string || string.length === 0) {
            return "";
        }
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    static removeAllNonNumberCharacters(string) {
        if (!string) {
            return "";
        }
        return string.replace(/[^0-9]/g, "");
    }
    static removeAllNonAlphabetCharacters(string) {
        if (!string) {
            return "";
        }
        return string.replace(/[^a-zA-Z ]/g, "");
    }
    static removeAllSpecialCharacters(string) {
        if (!string) {
            return "";
        }
        return string.replace(/[^a-zA-Z0-9]/g, "");
    }
    static removeAllHyphensAndForwardSlash(string) {
        if (!string) {
            return "";
        }
        return string.replace(/-/g, "").replace(/\//g, "");
    }
    static removeAllHyphens(string) {
        if (!string) {
            return "";
        }
        return string.replace(/-/g, "");
    }
    static replaceHyphensWithUnderscore(string) {
        if (!string) {
            return "";
        }
        return string.replace(/-/g, "_");
    }
    static fillFrontOfStringWithZeros(string, lengthExpected) {
        if (!string) {
            return "0".repeat(lengthExpected);
        }
        if (string.length === lengthExpected) {
            return string;
        }
        if (string.length > lengthExpected) {
            return StringUtils.shrinkString(string, lengthExpected);
        }
        const nbZeroToAdd = lengthExpected - string.length;
        for (let i = 0; i < nbZeroToAdd; i++) {
            string = `0${string}`;
        }
        return string;
    }
    static fillBackOfStringWithZeros(string, lengthExpected) {
        if (!string) {
            return "0".repeat(lengthExpected);
        }
        if (string.length === lengthExpected) {
            return string;
        }
        if (string.length > lengthExpected) {
            return StringUtils.shrinkString(string, lengthExpected);
        }
        const spaceToAdd = lengthExpected - string.length;
        for (let i = 0; i < spaceToAdd; i++) {
            string = `${string}0`;
        }
        return string;
    }
    static fillBackOfStringWithSpaces(string, lengthExpected) {
        if (!string) {
            return StringUtils.emptyString(lengthExpected);
        }
        if (string.length === lengthExpected) {
            return string;
        }
        if (string.length > lengthExpected) {
            return StringUtils.shrinkString(string, lengthExpected);
        }
        const spaceToAdd = lengthExpected - string.length;
        for (let i = 0; i < spaceToAdd; i++) {
            string = `${string} `;
        }
        return string;
    }
    static emptyString(length) {
        return length > 0 ? " ".repeat(length) : "";
    }
    static pipeString(length) {
        return length > 0 ? "|".repeat(length) : "";
    }
    static shrinkString(string, length) {
        return string.substring(0, length);
    }
    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    static nextChar(c) {
        return String.fromCharCode(c.charCodeAt(0) + 1);
    }
    static validEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
}
exports.StringUtils = StringUtils;
StringUtils.startCase = (str) => {
    return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
};
StringUtils.ObjectId = (m = Math, d = Date, h = 16, seconds = (s) => m.floor(s).toString(h)) => seconds(d.now() / 1000) + " ".repeat(h).replace(/./g, () => seconds(m.random() * h));
StringUtils.stripAccent = (label) => {
    const translate_re = /[àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ]/g;
    const translate = "aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY";
    const newstr = label.replace(translate_re, match => {
        return translate.substr(translate_re.source.indexOf(match) - 1, 1);
    });
    return newstr.toLowerCase().replace(/ /g, "_");
};
//# sourceMappingURL=string.utils.js.map