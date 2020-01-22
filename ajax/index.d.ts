import Event from "../event";
interface IFStrObj {
    [propName: string]: string;
}
interface IFParam {
    [propName: string]: number | string | boolean | Array<number | string | boolean>;
}
declare type sendParam = IFParam | FormData | string;
interface IFConf {
    baseURL?: string;
    paths?: IFStrObj;
    useFetch?: boolean;
    url?: string;
    method?: string;
    dataType?: string;
    resType?: string;
    param?: IFParam | string;
    header?: IFStrObj;
    jsonpKey?: string;
    cache?: boolean;
    withCredentials?: boolean;
}
declare class Req {
    baseURL?: string;
    paths?: IFStrObj;
    useFetch?: boolean;
    url?: string;
    method?: string;
    dataType?: string;
    resType?: string;
    param?: IFParam | string | FormData;
    header?: IFStrObj;
    jsonpKey?: string;
    cache?: boolean;
    withCredentials?: boolean;
    xhr?: XMLHttpRequest;
    path?: string;
    orginURL?: string;
    formatURL?: string;
    isFormData?: boolean;
    isCross?: boolean;
    parent?: Ajax;
    outFlag?: boolean;
    constructor();
}
declare class Ajax extends Event {
    _req?: Req;
    conf?: IFConf;
    constructor(parent: Group, opt: IFConf);
    setConf(opt?: IFConf): Ajax;
    assign(...args: any): Ajax;
    abort(): Ajax;
    timeout(this: Ajax, time: number, callback: Function): Ajax;
    send(this: Ajax, param?: sendParam, over?: boolean): Ajax;
    then(thenFn?: () => any): Promise<any>;
}
interface shortcutEventObj {
    [propName: string]: Function;
}
declare type shortcutEvent = shortcutEventObj | Function;
declare class Group extends Event {
    dateDiff?: number;
    conf?: IFConf;
    global?: Global;
    Request?: Function;
    static create(key?: string, opt?: IFConf): Function | Group;
    constructor(opt?: IFConf);
    setConf(opt?: IFConf): Group;
    create(opt?: IFConf): Ajax;
    shortcut(this: Group, opt: IFConf, events?: shortcutEvent): (callback: Function, param: string | FormData | IFParam) => Ajax;
    load(this: Group): Ajax;
    get(this: Group): Ajax;
    post(this: Group): Ajax;
    put(this: Group): Ajax;
    jsonp(this: Group): Ajax;
    fetch(this: Group, opt?: IFConf, param?: sendParam): Promise<any>;
    setDate(date: string | Date): void;
    getDate(): Date;
}
export declare let Request: typeof Group;
declare class Global extends Event {
    conf?: IFConf;
    constructor();
    setConf(conf: IFConf): void;
}
export declare let theGlobal: Global;
declare let def: Group;
export default def;
