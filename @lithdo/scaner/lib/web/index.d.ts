import { Page } from "puppeteer";
import { ManualPromise } from "../utils";
export * from './dom';
interface Response {
    url(): string;
}
interface Request {
    url(): string;
}
export declare class WebPageScaner {
    static chrome: undefined | Promise<any>;
    page: ManualPromise<Page>;
    tasks: ScanerTask[];
    current?: ScanerTask;
    constructor();
    shutdown(): void;
    init(): Promise<void>;
    start(): Promise<void>;
    run(task: ScanerTask): void;
    read(url: string, waitForSelector?: string): Promise<string>;
    respond(url: string, option: {
        filter: (url: string) => boolean;
        timeout: () => Promise<void>;
    }, waitForSelector?: string): Promise<Response[]>;
    request(url: string, option: {
        filter: (url: string) => boolean;
        timeout: () => Promise<void>;
    }, waitForSelector?: string): Promise<Request[]>;
    currentTask?: ScanerTask;
    private deal;
}
export interface ScanerTask {
    url: string;
    waitForSelector?: string;
    onError(e: Error): void;
    onSuccess(html: string): void;
    requestFilter?: (url: string) => boolean;
    respondFilter?: (url: string) => boolean;
    requests: Request[];
    responds: Response[];
    timeout?: () => Promise<void>;
}
//# sourceMappingURL=index.d.ts.map