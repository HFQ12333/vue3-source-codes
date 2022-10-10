import { isArray, isOjbect } from "@vue/shared";
import { createVnode, isVnode } from "./vnode";

export function h(type,propsOrChildren,children){
    const l = arguments.length;
    /**
     * h的用法
     * 1、h('div)
     * 2、h('div',{style:{"color":"red"}})// 2个
     * 2、h('div',h('span'))// 2个
     * 2、h('div',[h('span'),h('span')])// 2个
     * 2、h('div','hello') //2个
     * 3、h('div',{style:{"color":"red"}},'hello)
     * 4、h('div',{style:{"color":"red"}},'hello)
     */
    if(l === 2){//为什么将儿子包装成数组，因为元素可以循环创建；文本不需要包装。
        if(isOjbect(propsOrChildren) && !isArray(propsOrChildren)){
            if(isVnode(propsOrChildren)){//虚拟节点就包装成数组
                return createVnode(type,null,[propsOrChildren])
            }
            return createVnode(type,propsOrChildren); //属性
        }else{
            return createVnode(type,null,propsOrChildren)//是数组或文本
        }
    }else{
        if(l > 3){
            children = Array.from(arguments).slice(2);
        }else if(l ===3 && isVnode(children)){
            children = [children]
        }
        return createVnode(type,propsOrChildren,children);//children的情况有两种：文本、数组。
    }
}