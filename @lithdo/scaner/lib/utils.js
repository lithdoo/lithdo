"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toml = exports.ManualPromise = void 0;
class ManualPromise {
    constructor() {
        this.done = false;
        this.reject = null;
        this.resolve = null;
        this.target = new Promise((res, rej) => {
            this.reject = (val) => {
                this.done = true;
                rej(val);
            };
            this.resolve = (val) => {
                this.done = true;
                res(val);
            };
        });
    }
}
exports.ManualPromise = ManualPromise;
var toml_1 = require("@iarna/toml");
Object.defineProperty(exports, "toml", { enumerable: true, get: function () { return __importDefault(toml_1).default; } });
//# sourceMappingURL=utils.js.map