"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBodyContainer = void 0;
const jsdom_1 = require("jsdom");
const createBodyContainer = () => {
    const dom = new jsdom_1.JSDOM('<!DOCTYPE html><html><body></body></html>');
    const document = dom.window.document;
    const body = document.querySelector('body');
    return body;
};
exports.createBodyContainer = createBodyContainer;
//# sourceMappingURL=dom.js.map