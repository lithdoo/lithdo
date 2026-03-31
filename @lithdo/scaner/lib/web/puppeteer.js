"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitSec = exports.getChromePage = exports.openChrome2 = exports.openChrome = exports.shutdownChrome = exports.downloadM3U8 = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const cp = __importStar(require("child_process"));
const path = __importStar(require("path"));
const m3u8_to_mp4_1 = __importDefault(require("m3u8-to-mp4"));
const fs_1 = require("fs");
const converter = new m3u8_to_mp4_1.default();
const downloadM3U8 = async (url, filePath) => {
    await converter
        .setInputFile(url)
        .setOutputFile(filePath)
        .start();
    console.log('转换完成');
    await new Promise(res => setTimeout(res, 3000));
};
exports.downloadM3U8 = downloadM3U8;
const shutdownChrome = () => new Promise(res => {
    console.log('before 关闭 Chrome');
    const e = cp.exec('taskkill /F /IM "chrome.exe"');
    console.log('exec 关闭 Chrome');
    e.on('exit', () => res(null));
});
exports.shutdownChrome = shutdownChrome;
const openChrome = () => new Promise(async (res) => {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const cmd = `"${chromePath}" --remote-debugging-port=9222 --user-data-dir="C:\\Temp\\EdgeProfile"`;
    console.log(cmd);
    const e = cp.exec(cmd);
    e.on('exit', () => res(null));
});
exports.openChrome = openChrome;
const openChrome2 = () => new Promise(async (res) => {
    try {
        await (0, exports.shutdownChrome)();
    }
    catch (e) {
        console.warn('shutdown 失败');
    }
    console.log('done 关闭 Chrome');
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    console.log('Puppeteer 内置 Chromium 路径:', chromePath);
    if (!(0, fs_1.existsSync)(chromePath)) {
        throw new Error('Chromium 路径不正确：' + chromePath);
    }
    const user = path.resolve(__dirname, 'ChromeData') || 'C:\\Temp\\EdgeProfile';
    const chrome = cp.spawn(chromePath, ['--remote-debugging-port=9222', `--user-data-dir=${user}`]);
    setTimeout(() => { res(null); }, 5000);
    chrome.on('exit', () => { res(null); });
});
exports.openChrome2 = openChrome2;
const getChromePage = async () => {
    // const version = await fetch('http://127.0.0.1:9222/json/version')
    // const json = await version.text()
    // console.log(json)
    const browser = await puppeteer_1.default.connect({ browserURL: 'http://127.0.0.1:9222' });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });
    return page;
};
exports.getChromePage = getChromePage;
const waitSec = async (sec) => {
    return new Promise((res) => {
        setTimeout(() => {
            res();
        }, sec * 1000);
    });
};
exports.waitSec = waitSec;
//# sourceMappingURL=puppeteer.js.map