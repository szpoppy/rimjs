declare type setDataFn = (data: any) => void;
declare type getDataFn = (setData: setDataFn, para: any) => void;
export declare function promiseCache<T = any>(getFn: getDataFn, eTime?: number, getKey?: (key: any) => string): (para?: any) => Promise<T>;
declare const _default: {
    promise: typeof promiseCache;
};
export default _default;
