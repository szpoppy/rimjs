/**
 * 深度混合 对象
 * @param  target
 * @param  objs 每个单元应该同　target 的数据类型一致
 */
export declare function merge(target: object, ...objs: Array<object>): object;
/**
 * 深度克隆 对象
 * @param target
 * @param objs 每个单元应该同　target 的数据类型一致
 */
export declare function assign(target: object, ...objs: Array<object>): object;
export default assign;
