/**
 * 深度混合 对象
 * @param  target
 * @param  objs 每个单元应该同target 的数据类型一致
 */
export declare function merge(target: any, ...objs: Array<any>): any;
/**
 * 深度克隆 对象
 * @param target
 * @param objs 每个单元应该同target 的数据类型一致
 */
export declare function assign(target: any, ...objs: Array<any>): any;
export default assign;
