/// <reference types="node" />
import Event from "../event";
import { ReadStream } from "fs";
export declare function fixedURL(url: string, paramStr: string): string;
export declare function getParamString(param?: FormData | IParam | string, dataType?: string): string | FormData;
export declare function getDefaultContentType(dataType?: string): string;
interface NodeFormDataItem {
    value?: ReadStream | string | Buffer;
    url?: string;
    name?: string;
    fileName?: string;
}
declare type NodeFormDataItemValue = NodeFormDataItem | ReadStream | string | Buffer;
export declare class NodeFormData {
    private _data;
    set(key: string, item: NodeFormDataItemValue): void;
    delete(key: string): void;
    has(key: string): boolean;
    forEach(fn: (item: NodeFormDataItemValue, key: string) => void): void;
}
interface IFStrObj {
    [propName: string]: string | number;
}
interface IParam {
    [propName: string]: number | string | boolean | Array<number | string | boolean> | IParam;
}
declare type sendParam = IParam | string | FormData | Array<number | string | boolean> | NodeFormData;
declare enum EResType {
    json = "json",
    text = "text"
}
export interface IFAjaxConf {
    timeout?: number;
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
    body: any;
    header: IFStrObj;
    jsonpKey: string;
    cache: boolean;
    withCredentials: boolean;
    xhr?: XMLHttpRequest;
    nodeReq: any;
    path: string;
    originURL: string;
    formatURL: string;
    isFormData: boolean;
    isCross: boolean;
    outFlag: boolean;
    [propName: string]: any;
}
export declare class AjaxRes {
    jsonKey: string;
    headers?: any;
    status?: number;
    text?: string;
    json?: any;
    cancel?: boolean;
    err?: any;
    result?: any;
    isTimeout?: boolean;
    isAbort?: boolean;
    [propName: string]: any;
    getData(prot: string, data?: any): any;
    getHeader(key: string): string;
}
export declare class AjaxCourse {
    req: AjaxReq;
    res: AjaxRes;
    progress?: ProgressEvent;
    ajax: Ajax;
    [propName: string]: any;
    getDate(this: AjaxCourse): Date;
    constructor(ajax: Ajax);
}
export declare class Ajax extends Event {
    _course?: AjaxCourse;
    conf: IFAjaxConf;
    parent: AjaxGroup;
    private _timeoutHandle;
    on(type: string, fn: (arg: AjaxCourse) => void, isPre?: boolean): void;
    constructor(parent: AjaxGroup, opt?: IFAjaxConf);
    setConf(opt?: IFAjaxConf): Ajax;
    abort(): Ajax;
    timeout(this: Ajax, time: number, callback?: IEventOnFn): Ajax;
    send(this: Ajax, param?: sendParam, over?: boolean): Ajax;
    then(): Promise<AjaxCourse>;
    then<T = any>(thenFn: (course: AjaxCourse) => T): Promise<T>;
    then(thenFn: "res"): Promise<AjaxCourse["res"]>;
    then(thenFn: "req"): Promise<AjaxCourse["req"]>;
    then(thenFn: "ajax"): Promise<AjaxCourse["ajax"]>;
}
declare type IEventOnFn = (this: Ajax, arg: AjaxCourse) => void;
interface shortcutEventObj {
    [propName: string]: IEventOnFn;
}
declare type shortcutEvent = shortcutEventObj | IEventOnFn;
declare type groupLoadOnNew = (ajax: Ajax) => void;
export declare class AjaxGroup extends Event {
    dateDiff: number;
    conf: IFAjaxConf;
    parent?: Global;
    on(type: string, fn: (arg: AjaxCourse) => void, isPre?: boolean): void;
    constructor(opt?: IFAjaxConf);
    setConf(opt?: IFAjaxConf): AjaxGroup;
    create(opt?: IFAjaxConf): Ajax;
    shortcut(opt: IFAjaxConf, events?: shortcutEvent): (callback: IEventOnFn | sendParam, param?: sendParam) => Ajax;
    load(url: string | IFAjaxConf, callback?: IEventOnFn | sendParam, param?: sendParam | groupLoadOnNew, onNew?: groupLoadOnNew): Ajax;
    fetch(opt?: IFAjaxConf, param?: sendParam, onNew?: groupLoadOnNew): Promise<any>;
    setDate(date: string | Date): void;
    getDate(): Date;
}
export declare class Global extends Event {
    conf: IFAjaxConf;
    on(type: string, fn: (arg: AjaxCourse) => void, isPre?: boolean): void;
    setConf(conf: IFAjaxConf): void;
    paramMerge(req: AjaxReq, param: any): void;
    fetchExecute(course: AjaxCourse, ajax: Ajax): void;
}
export declare let ajaxGlobal: Global;
export declare function responseEnd(this: Ajax, course: AjaxCourse): void;
export {};
