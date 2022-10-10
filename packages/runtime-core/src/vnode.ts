// 借助位运算（|）将两个类型联合在一起，用与（&）运算判断他是否属于某种类型。
// 若果&为0,则不包含该权限.

import { isArray, isString, ShapeFlags } from "@vue/shared";


export const Text = Symbol('Text');

export function isVnode(value){
    return !!(value && value.__v_isVnode)
}
export function isSameVnode(n1,n2){//判断两个虚拟节点是否是相同节点，1.标签名相同2.key相同。
    return (n1.type === n2.type) && (n1.key === n2.key)
}
// 虚拟节点有很多：组件的、元素的、文本的、
// 虚拟dom就是一个对象,为了diff算了/可以跨平台。真实dom的属性比较多，如果直接创建真实dom来比对，性能会很差，还可能会导致页面重绘、重渲染。
// key用来标识虚拟节点的类型是什么 
// 每个虚拟节点一定对应一个真实节点，比对完以后要更新真实节点。
export function createVnode(type,props,children){
    let shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
    const vnode = {
        type,
        props,
        children,
        el:null,//虚拟节点上对应的真实节点，后续diff算法。
        key:props?.['key'],
        __v_isVnode:true,
        shapeFlag
    }
    if(children){
        let type = 0;
        if(isArray(children)){
            type = ShapeFlags.ARRAY_CHILDREN;
        }else{
            children = String(children);
            type = ShapeFlags.TEXT_CHILDREN;
        }
        vnode.shapeFlag |= type
    }
    return vnode;
}