export declare class ManualPromise<T> {
    target: Promise<T>;
    done: boolean;
    reject: (e: Error) => void;
    resolve: (val: T) => void;
    constructor();
}
export { default as toml } from '@iarna/toml';
//# sourceMappingURL=utils.d.ts.map