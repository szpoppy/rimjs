declare type initedNum = 0 | 2;
declare type setDataFn = (data: any, initNum?: initedNum) => void;
declare type getDataFn = (setData: setDataFn, para: any) => void;
export declare type IPromiseCacheBackFn<T = any> = (para?: any) => Promise<T>;
export declare function promiseCache<T = any>(getFn: getDataFn, eTime?: number, getKey?: (key: any) => string): IPromiseCacheBackFn<T>;
declare const _default: {
    promise: typeof promiseCache;
};
export default _default;
