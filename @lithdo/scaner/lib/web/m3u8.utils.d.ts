export interface M3U8Info {
    encryption: {
        method: string;
        keyUri: string;
        iv: string;
    } | null;
    segmentUrls: string[];
}
export declare function downloadToFile(urlStr: string, filePath: string, idx?: number): Promise<void>;
export declare function downloadM3U8toFile(m3u8Url: string, filename?: string): Promise<void>;
export declare function dowloadM3U8File(m3u8Url: string, downloadDir: string): Promise<{
    rawfilePath: string;
    m3u8Url: string;
    downloadDir: string;
}>;
export declare function createLoaclFile(m3u8Url: string, downloadDir: string, rawfilePath: string): Promise<{
    localFilePath: string;
}>;
export declare function m3u8ToMp4(localFilePath: string, outputFile: string): Promise<{}>;
//# sourceMappingURL=m3u8.utils.d.ts.map