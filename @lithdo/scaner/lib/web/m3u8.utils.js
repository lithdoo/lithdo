"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadToFile = downloadToFile;
exports.downloadM3U8toFile = downloadM3U8toFile;
exports.dowloadM3U8File = dowloadM3U8File;
exports.createLoaclFile = createLoaclFile;
exports.m3u8ToMp4 = m3u8ToMp4;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const url_1 = require("url");
const util_1 = require("util");
const puppeteer_1 = require("./puppeteer");
const child_process_1 = require("child_process");
const stream_1 = require("stream");
const mkdirAsync = (0, util_1.promisify)(fs_1.default.mkdir);
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function fetchContent(url) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new url_1.URL(url);
        const client = parsedUrl.protocol === 'https:' ? https_1.default : http_1.default;
        const req = client.request({
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; M3U8-Downloader/1.0)'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                }
                else {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}
function downloadFile(urlStr, filePath, idx = 0) {
    return new Promise((resolve, reject) => {
        if (idx >= 100) {
            reject(new Error(`重试次数超过 100; file:${filePath} url:${urlStr}`));
        }
        else if (idx > 0) {
            console.log(`重试下载 idx:${idx} file:${filePath} url:${urlStr}`);
        }
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        const parsedUrl = new url_1.URL(urlStr);
        const client = parsedUrl.protocol === 'https:' ? https_1.default : http_1.default;
        const writeStream = fs_1.default.createWriteStream(filePath);
        writeStream.on('error', reject);
        writeStream.on('finish', () => resolve());
        const req = client.request({
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            timeout: 1000 * 60 * 1,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; M3U8-Downloader/1.0)'
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                writeStream.destroy(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                return;
            }
            res.pipe(writeStream);
        });
        req.on('error', (err) => {
            writeStream.destroy(err);
            console.warn(err.message);
            resolve(downloadToFile(urlStr, filePath, idx + 1));
        });
        req.end();
    });
}
const streamPipeline = (0, util_1.promisify)(stream_1.pipeline);
async function downloadToFile(urlStr, filePath, idx = 0) {
    if (idx >= 20) {
        throw new Error(`重试次数超过 20; file:${filePath} url:${urlStr}`);
    }
    else if (idx > 0) {
        console.log(`重试下载 idx:${idx} file:${filePath} url:${urlStr}`);
    }
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
    try {
        const controller = new AbortController();
        const signal = controller.signal;
        const timeout = setTimeout(() => {
        }, 1000 * 60 * 4);
        await Promise.race([
            Promise.resolve()
                .then(async () => {
                const response = await fetch(urlStr, { signal });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log('http请求成功:', urlStr);
                const dest = fs_1.default.createWriteStream(filePath);
                console.log('开始下载文件:', filePath);
                await streamPipeline(response.body, dest);
                console.log('文件下载完成:', filePath);
            }),
            Promise.resolve()
                .then(async () => {
                await (0, puppeteer_1.waitSec)(2 * 60);
                controller.abort();
                throw new Error(`请求超时：${urlStr}`);
            })
        ]);
        clearTimeout(timeout);
    }
    catch (error) {
        console.error('下载失败:', error);
        return downloadToFile(urlStr, filePath, idx + 1);
    }
}
function getSegmentUrls(m3u8Content, m3u8Url) {
    const segmentUrls = [];
    const baseUrl = new url_1.URL(m3u8Url);
    const lines = m3u8Content.split('\n').filter(line => line.trim());
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#')) {
            continue;
        }
        if (line.indexOf('.ts') >= 0) {
            const absoluteUrl = new url_1.URL(line, baseUrl).toString();
            segmentUrls.push(absoluteUrl);
        }
    }
    if (segmentUrls.length == 0) {
        throw new Error('缺少分段信息');
    }
    return segmentUrls;
}
async function downloadM3U8toFile(m3u8Url, filename = 'C:\\Users\\lithd\\Videos\\temp\\test') {
    const $1 = {
        m3u8Url, filename, downloadDir: filename.replace(/.mp4$/, '')
    };
    if (!fs_1.default.existsSync($1.downloadDir)) {
        fs_1.default.mkdirSync($1.downloadDir);
    }
    const $2 = {
        ...$1,
        ...await dowloadM3U8File($1.m3u8Url, $1.downloadDir),
        outputFile: $1.downloadDir + '.mp4'
    };
    const $3 = {
        ...$2,
        ...await createLoaclFile($1.m3u8Url, $1.downloadDir, $2.rawfilePath)
    };
    const $4 = {
        ...$3,
        ...await m3u8ToMp4($3.localFilePath, $3.outputFile)
    };
    console.log($4);
    fs_1.default.rmSync($4.downloadDir, { recursive: true, force: true });
}
async function dowloadM3U8File(m3u8Url, downloadDir) {
    const rawfilePath = path_1.default.resolve(downloadDir, 'raw.m3u8');
    await downloadToFile(m3u8Url, rawfilePath);
    return {
        rawfilePath, m3u8Url, downloadDir
    };
}
async function createLoaclFile(m3u8Url, downloadDir, rawfilePath) {
    const m3u8Content = fs_1.default.readFileSync(rawfilePath).toString();
    let localContent = m3u8Content;
    const lines = m3u8Content.split('\n');
    let keyLine;
    for (const line of lines) {
        if (line.trim().startsWith('#EXT-X-KEY:')) {
            keyLine = line;
            break;
        }
    }
    if (keyLine) {
        const params = new URLSearchParams(keyLine.replace('#EXT-X-KEY:', '').split(',').map(p => p.trim()).join('&'));
        const keyUri = params.get('URI') || '';
        const keyPath = path_1.default.join(downloadDir, 'crypt.key');
        await downloadToFile(keyUri.replaceAll('"', ''), keyPath);
        localContent = localContent.replace(keyUri, `"${keyPath.replaceAll('\\', '/')}"`);
    }
    try {
        await mkdirAsync(downloadDir, { recursive: true });
        const segmentUrls = getSegmentUrls(m3u8Content, m3u8Url);
        for (let i = 0; i < segmentUrls.length; i++) {
            const segmentUrl = segmentUrls[i];
            const fileName = `${i}.ts`;
            const filePath = path_1.default.join(downloadDir, fileName);
            console.log(`正在下载: ${fileName} from ${segmentUrl}`);
            await downloadToFile(segmentUrl, filePath);
            console.log(`下载完成: ${fileName} 进度 ${i + 1}/${segmentUrls.length}`);
            localContent = localContent.replace(segmentUrl, filePath.replaceAll('\\', '/'));
            await (0, puppeteer_1.waitSec)(0);
        }
        console.log(`所有切片下载完成，共 ${segmentUrls.length} 个文件。`);
    }
    catch (error) {
        console.error('下载失败:', error);
        throw error;
    }
    const localFilePath = path_1.default.resolve(downloadDir, 'local.m3u8');
    fs_1.default.writeFileSync(localFilePath, localContent);
    return {
        localFilePath
    };
}
async function m3u8ToMp4(localFilePath, outputFile) {
    const command = `ffmpeg -allowed_extensions ALL -i "${localFilePath}" -c copy "${outputFile}" -y`;
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
        console.warn('FFmpeg 警告:', stderr);
    }
    console.log(`合并完成！输出文件: ${outputFile}`);
    return {};
}
//# sourceMappingURL=m3u8.utils.js.map