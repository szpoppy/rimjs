/**
 * [2020-09-07] 开发
 */
export declare class LakeEvent<D = any> {
    lakes: Lake[];
    instruct: string;
    from: Lake | null;
    data: D;
    [propName: string]: any;
    constructor(from: Lake | null, data: D, query?: string);
    get lake(): Lake<any>;
}
export declare function lakePub<D>(lake: Lake, query: string, data?: D): Promise<LakeEvent<D>>;
export declare function lakePub<D>(lake: string, query?: D): Promise<LakeEvent<D>>;
export interface ILakeArg<T> {
    id?: string;
    group?: string | Array<string>;
    target?: T;
}
interface lakeInstruct {
    [propName: string]: Function[];
}
export declare class Lake<T = any> {
    protected _instruct_: lakeInstruct;
    target: T | Lake;
    id: string;
    group: Array<string>;
    static pub: typeof lakePub;
    static getId: (id: string) => Lake<any>;
    static getGroup: (name: string) => Lake<any>[];
    protected _monitor_back_: null | ReturnType<typeof setTimeout>;
    constructor({ id, group, target }?: ILakeArg<T>);
    protected listenExec(): Lake;
    listen(instruct: string, callback: Function): Lake;
    unListen(instruct?: string, callback?: Function): Lake;
    destroy(): void;
    setId(id: string): Lake;
    setGroup(group: string | string[]): this;
    has(type: string): boolean;
    sub<D = any>(type: string, fn: (arg: LakeEvent<D>, next: () => Promise<void>) => void): Lake;
    getSubs(query: string): Function[];
    unSub(type?: string, fn?: Function): Lake;
    pub<D>(query: string, data?: D): Promise<LakeEvent<D>>;
}
export default Lake;
