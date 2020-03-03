/**
 * 深度混合 对象
 * @param  target
 * @param  objs 每个单元应该同target 的数据类型一致
 */
export declare function merge<T, U>(target: T, source: U): T & U;
export declare function merge<T, U, V>(target: T, source1: U, source2: V): T & U & V;
export declare function merge<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
/**
 * 深度克隆 对象
 * @param target
 * @param objs 每个单元应该同target 的数据类型一致
 */
export declare function assign<T, U>(target: T, source: U): T & U;
export declare function assign<T, U, V>(target: T, source1: U, source2: V): T & U & V;
export declare function assign<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
declare const _default: {
    merge: typeof merge;
    assign: typeof assign;
};
export default _default;
