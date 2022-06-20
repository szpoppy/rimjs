declare type initedNum = 0 | 2;
declare type setDataFn = (data: any, initNum?: initedNum) => void;
declare type getDataFn = (setData: setDataFn, para: any) => void;
declare type backFn<T> = (value: T) => void;
declare class Cache<T> {
    backs: backFn<T>[];
    inited: initedNum | 1;
    date: number;
    data: T;
    setData(data: T, inited?: initedNum | Boolean): void;
}
export interface IPromiseCacheBackFn<T = any> {
    (para?: any): Promise<T>;
    caches: Record<string, Cache<T>>;
}
export declare function promiseCache<T = any>(getFn: getDataFn, eTime?: number, getKey?: (key: any) => string): IPromiseCacheBackFn<T>;
declare const _default: {
    promise: typeof promiseCache;
};
export default _default;
