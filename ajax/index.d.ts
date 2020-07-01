import Event from "../event";
interface IFStrObj {
    [propName: string]: string;
}
interface IParam {
    [propName: string]: number | string | boolean | Array<number | string | boolean> | IParam;
}
declare type sendParam = IParam | FormData | string;
declare enum EResType {
    json = "json",
    text = "text"
}
export interface IFAjaxConf {
    baseURL?: string;
    paths?: IFStrObj;
    useFetch?: boolean;
    url?: string;
    method?: string;
    dataType?: string;
    resType?: EResType;
    param?: IParam | string;
    header?: IFStrObj;
    jsonpKey?: string;
    cache?: boolean;
    withCredentials?: boolean;
}
export declare class AjaxReq {
    baseURL?: string;
    paths: IFStrObj;
    useFetch: boolean;
    url: string;
    method: string;
    dataType: string;
    resType: EResType;
    param?: IParam | string | FormData;
    header: IFStrObj;
    jsonpKey: string;
    cache: boolean;
    withCredentials: boolean;
    xhr?: XMLHttpRequest;
    path: string;
    orginURL: string;
    formatURL: string;
    isFormData: boolean;
    isCross: boolean;
    outFlag: boolean;
    [propName: string]: any;
}
export declare class AjaxRes {
    jsonKey: string;
    headers?: Headers | string;
    status?: number;
    text?: string;
    json?: object;
    cancel?: boolean;
    err?: any;
    result?: any;
    [propName: string]: any;
    getData(prot: string, data?: any): any;
    getHeader(key: string): string;
}
export declare class AjaxCourse {
    req: AjaxReq;
    res: AjaxRes;
    progress?: ProgressEvent;
    ajax: Ajax;
    getDate(this: AjaxCourse): Date;
    constructor(ajax: Ajax);
}
export declare class Ajax extends Event {
    _course?: AjaxCourse;
    conf: IFAjaxConf;
    parent: AjaxGroup;
    on(type: string, fn: (arg: AjaxCourse) => void, isPre?: boolean): void;
    constructor(parent: AjaxGroup, opt?: IFAjaxConf);
    setConf(opt?: IFAjaxConf): Ajax;
    abort(): Ajax;
    timeout(this: Ajax, time: number, callback: IEventOnFn): Ajax;
    send(this: Ajax, param?: sendParam, over?: boolean): Ajax;
    then(): Promise<AjaxCourse>;
    then(thenFn: (course: AjaxCourse) => any): Promise<any>;
}
declare type IEventOnFn = (this: Ajax, arg: AjaxCourse) => void;
interface shortcutEventObj {
    [propName: string]: IEventOnFn;
}
declare type shortcutEvent = shortcutEventObj | IEventOnFn;
export declare class AjaxGroup extends Event {
    dateDiff: number;
    conf: IFAjaxConf;
    parent?: Global;
    on(type: string, fn: (arg: AjaxCourse) => void, isPre?: boolean): void;
    constructor(opt?: IFAjaxConf);
    setConf(opt?: IFAjaxConf): AjaxGroup;
    create(opt?: IFAjaxConf): Ajax;
    shortcut(opt: IFAjaxConf, events?: shortcutEvent): (callback: string | FormData | IParam | IEventOnFn, param: string | FormData | IParam) => Ajax;
    load(url: string | IFAjaxConf, callback?: IEventOnFn | sendParam, param?: sendParam): Ajax;
    fetch(opt?: IFAjaxConf, param?: sendParam): Promise<any>;
    setDate(date: string | Date): void;
    getDate(): Date;
}
declare class Global extends Event {
    conf: IFAjaxConf;
    on(type: string, fn: (arg: AjaxCourse) => void, isPre?: boolean): void;
    setConf(conf: IFAjaxConf): void;
}
export declare let ajaxGlobal: Global;
declare let def: AjaxGroup & {
    global: Global;
    Group: typeof AjaxGroup;
};
export default def;
