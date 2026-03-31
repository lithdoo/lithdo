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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebPageScaner = void 0;
const puppeteer_1 = require("./puppeteer");
const utils_1 = require("../utils");
__exportStar(require("./dom"), exports);
class WebPageScaner {
    constructor() {
        this.page = new utils_1.ManualPromise();
        this.tasks = [];
        if (!WebPageScaner.chrome) {
            WebPageScaner.chrome = (0, puppeteer_1.openChrome2)();
        }
        this.init();
    }
    shutdown() {
        (0, puppeteer_1.shutdownChrome)();
        WebPageScaner.chrome = undefined;
    }
    async init() {
        await WebPageScaner.chrome;
        const page = await (0, puppeteer_1.getChromePage)();
        this.page.resolve(page);
        page.on('request', (request) => {
            if (!this.current)
                return;
            if (!this.current.requestFilter)
                return;
            if (this.current.requestFilter(request.url())) {
                this.current.requests.push(request);
            }
        });
        page.on('response', (response) => {
            if (!this.current)
                return;
            if (!this.current.respondFilter)
                return;
            if (this.current.respondFilter(response.url())) {
                this.current.responds.push(response);
            }
        });
    }
    async start() {
        if (this.current)
            return;
        const current = this.tasks.shift();
        this.current = current;
        if (!this.current)
            return;
        await this.deal(current);
        await new Promise(res => setTimeout(res, Math.random() * 5 * 1000 + 2000));
        this.current = undefined;
        this.start();
    }
    run(task) {
        this.tasks.push(task);
        this.start();
    }
    read(url, waitForSelector) {
        return new Promise((onSuccess, onError) => {
            const task = {
                url, waitForSelector, onSuccess, onError, requests: [], responds: []
            };
            this.run(task);
        });
    }
    respond(url, option, waitForSelector) {
        const { filter, timeout } = option;
        return new Promise((onResolve, onError) => {
            const onSuccess = () => {
                onResolve(task.responds);
            };
            const task = {
                url, waitForSelector, onSuccess, onError, requests: [], responds: [],
                respondFilter: filter, timeout
            };
            this.run(task);
        });
    }
    request(url, option, waitForSelector) {
        const { filter, timeout } = option;
        return new Promise((onResolve, onError) => {
            const onSuccess = () => {
                onResolve(task.requests);
            };
            const task = {
                url, waitForSelector, onSuccess, onError, requests: [], responds: [],
                requestFilter: filter, timeout
            };
            this.run(task);
        });
    }
    async deal(task) {
        const page = await (0, puppeteer_1.getChromePage)();
        page.on('request', (request) => {
            if (!task.requestFilter)
                return;
            if (task.requestFilter(request.url())) {
                task.requests.push(request);
            }
        });
        page.on('response', (response) => {
            if (!task.respondFilter)
                return;
            if (task.respondFilter(response.url())) {
                task.responds.push(response);
            }
        });
        try {
            await page.goto(task.url, {
                timeout: 1000 * 60 * 20
            });
            if (task.waitForSelector) {
                await page.waitForSelector(task.waitForSelector, { timeout: 1000 * 60 * 20 });
                const html = await page.evaluate(() => document.body.innerHTML);
                if (task.timeout) {
                    await task.timeout();
                }
                task.onSuccess(html);
            }
        }
        catch (e) {
            console.error(e.message);
            task?.onError?.(e);
        }
        finally {
            page.close();
        }
    }
}
exports.WebPageScaner = WebPageScaner;
WebPageScaner.chrome = undefined;
//# sourceMappingURL=index.js.map