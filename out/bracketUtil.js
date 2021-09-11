'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.bracketUtil = void 0;
var bracketUtil;
(function (bracketUtil) {
    let bracketParis = [
        ["(", ")"],
    ];
    function isMatch(open, close) {
        return bracketParis.findIndex(p => p[0] === open && p[1] === close) >= 0;
    }
    bracketUtil.isMatch = isMatch;
    function isOpenBracket(char) {
        return bracketParis.findIndex(pair => pair[0] === char) >= 0;
    }
    bracketUtil.isOpenBracket = isOpenBracket;
    function isCloseBracket(char) {
        return bracketParis.findIndex(pair => pair[1] === char) >= 0;
    }
    bracketUtil.isCloseBracket = isCloseBracket;
    function isLetter(char) {
        return char.length === 1 && char.match(/[a-z.]/i);
    }
    bracketUtil.isLetter = isLetter;
})(bracketUtil = exports.bracketUtil || (exports.bracketUtil = {}));
//# sourceMappingURL=bracketUtil.js.map