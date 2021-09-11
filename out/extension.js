'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const bracketUtil_1 = require("./bracketUtil");
const history = require("./selectionHistory");
class SearchResult {
    constructor(bracket, offset) {
        this.bracket = bracket;
        this.offset = offset;
    }
}
function findBackward(text, index) {
    const bracketStack = [];
    let insideAngleBracket = false;
    for (let i = index; i >= 0; i--) {
        let char = text.charAt(i);
        if (bracketUtil_1.bracketUtil.isOpenBracket(char)) {
            if (bracketStack.length == 0) {
                for (let j = i - 1; i >= 0; j--) {
                    const char1 = text.charAt(j);
                    if (char1 === '>') {
                        insideAngleBracket = true;
                        continue;
                    }
                    if (char1 === '<') {
                        insideAngleBracket = false;
                        continue;
                    }
                    if (!insideAngleBracket && !bracketUtil_1.bracketUtil.isLetter(text.charAt(j))) {
                        return new SearchResult(char, j + 1);
                    }
                }
            }
            else {
                let top = bracketStack.pop();
                if (!bracketUtil_1.bracketUtil.isMatch(char, top)) {
                    throw 'Unmatched bracket pair';
                }
            }
        }
        else if (bracketUtil_1.bracketUtil.isCloseBracket(char)) {
            bracketStack.push(char);
        }
    }
    //we are geting to the edge
    return null;
}
function findForward(text, index) {
    const bracketStack = [];
    for (let i = index; i < text.length; i++) {
        let char = text.charAt(i);
        if (bracketUtil_1.bracketUtil.isCloseBracket(char)) {
            if (bracketStack.length == 0) {
                return new SearchResult(char, i);
            }
            else {
                let top = bracketStack.pop();
                if (!bracketUtil_1.bracketUtil.isMatch(top, char)) {
                    throw 'Unmatched bracket pair';
                }
            }
        }
        else if (bracketUtil_1.bracketUtil.isOpenBracket(char)) {
            bracketStack.push(char);
        }
    }
    return null;
}
function showInfo(msg) {
    vscode.window.showInformationMessage(msg);
}
function getSearchContext(selection) {
    const editor = vscode.window.activeTextEditor;
    let selectionStart = editor.document.offsetAt(selection.start);
    let selectionEnd = editor.document.offsetAt(selection.end);
    return {
        backwardStarter: selectionStart - 1,
        forwardStarter: selectionEnd,
        text: editor.document.getText()
    };
}
function toVscodeSelection({ start, end }) {
    const editor = vscode.window.activeTextEditor;
    return new vscode.Selection(editor.document.positionAt(start + 1), //convert text index to vs selection index
    editor.document.positionAt(end));
}
function isMatch(r1, r2) {
    return r1 != null && r2 != null && bracketUtil_1.bracketUtil.isMatch(r1.bracket, r2.bracket);
}
function expandSelection(includeBrack) {
    const editor = vscode.window.activeTextEditor;
    let originSelections = editor.selections;
    let selections = originSelections.map((originSelection) => {
        const newSelect = selectText(includeBrack, originSelection);
        return newSelect ? toVscodeSelection(newSelect) : originSelection;
    });
    let haveChange = selections.findIndex((s, i) => !s.isEqual(originSelections[i])) >= 0;
    if (haveChange) {
        history.changeSelections(selections);
    }
}
function selectText(includeBrack, selection) {
    const searchContext = getSearchContext(selection);
    let { text, backwardStarter, forwardStarter } = searchContext;
    if (backwardStarter < 0 || forwardStarter >= text.length) {
        return;
    }
    let selectionStart, selectionEnd;
    var backwardResult = findBackward(searchContext.text, searchContext.backwardStarter);
    var forwardResult = findForward(searchContext.text, searchContext.forwardStarter);
    while (forwardResult != null
        && !isMatch(backwardResult, forwardResult)) {
        forwardResult = findForward(searchContext.text, forwardResult.offset + 1);
    }
    while (backwardResult != null
        && !isMatch(backwardResult, forwardResult)) {
        backwardResult = findBackward(searchContext.text, backwardResult.offset - 1);
    }
    if (!isMatch(backwardResult, forwardResult)) {
        showInfo('No matched bracket pairs found');
        return;
    }
    // we are next to a bracket
    // this is the case for doule press select
    if (backwardStarter == backwardResult.offset && forwardResult.offset == forwardStarter) {
        selectionStart = backwardStarter - 1;
        selectionEnd = forwardStarter + 1;
    }
    else {
        if (includeBrack) {
            selectionStart = backwardResult.offset - 1;
            selectionEnd = forwardResult.offset + 1;
        }
        else {
            selectionStart = backwardResult.offset;
            selectionEnd = forwardResult.offset;
        }
    }
    return {
        start: selectionStart,
        end: selectionEnd,
    };
}
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand("copy-widget.highlight", function () {
        expandSelection(true);
    }));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map