import puppeteer from 'puppeteer';
import * as cp from 'child_process';
import * as path from 'path';
import fetch from 'node-fetch';
import m3u8ToMp4 from 'm3u8-to-mp4'
import { existsSync } from 'fs';

const converter = new m3u8ToMp4();

export const downloadM3U8 = async (url: string, filePath: string) => {
    await converter
        .setInputFile(url)
        .setOutputFile(filePath)
        .start();

    console.log('转换完成');
    await new Promise(res => setTimeout(res, 3000))
}

export const shutdownChrome = () => new Promise(res => {
    console.log('before 关闭 Chrome')
    const e = cp.exec('taskkill /F /IM "chrome.exe"')
    console.log('exec 关闭 Chrome')
    e.on('exit', () => res(null))
})

export const openChrome = () => new Promise(async res => {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    const cmd = `"${chromePath}" --remote-debugging-port=9222 --user-data-dir="C:\\Temp\\EdgeProfile"`;
    console.log(cmd);
    const e = cp.exec(cmd);
    e.on('exit', () => res(null))
})

export const openChrome2 = () => new Promise(async (res) => {
    try{
        await shutdownChrome()
    }catch(e){
        console.warn('shutdown 失败')
    }
    console.log('done 关闭 Chrome')
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    console.log('Puppeteer 内置 Chromium 路径:', chromePath);
    if(!existsSync(chromePath)){
        throw new Error('Chromium 路径不正确：' + chromePath)
    }
    const user = path.resolve(__dirname, 'ChromeData') || 'C:\\Temp\\EdgeProfile'
    const chrome = cp.spawn(
        chromePath,
        ['--remote-debugging-port=9222', `--user-data-dir=${user}`],
    );

    setTimeout(() => { res(null) }, 5000)
    chrome.on('exit', () => { res(null) })
})

export const getChromePage = async () => {

    // const version = await fetch('http://127.0.0.1:9222/json/version')
    // const json = await version.text()
    // console.log(json)
    const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });
    return page
}


export const waitSec = async (sec: number) => {
    return new Promise<void>((res) => {
        setTimeout(() => {
            res()
        }, sec * 1000)
    })
}
