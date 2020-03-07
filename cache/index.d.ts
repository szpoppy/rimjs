declare type setDataFn = (data: any) => void;
declare type getDataFn = (setData: setDataFn, key: string) => void;
export declare function promiseCache<T = any>(getFn: getDataFn): (key?: string) => Promise<T>;
declare const _default: {
    promise: typeof promiseCache;
};
export default _default;
