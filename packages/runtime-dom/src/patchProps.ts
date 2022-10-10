import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

// dom属性的操作api
export function patchProp(el,key,prveValue,nextValue){
    // 类名
    if(key === 'class'){
        patchClass(el,nextValue)
    }else if(key === 'style'){ // 样式
        patchStyle(el,prveValue,nextValue)
    }else if(/^on[^a-z]/.test(key)){// events
        patchEvent(el,key,nextValue)
    }else{// 普通属性
        patchAttr(el,key,nextValue);
    }
}

/**
 * 虚拟dom
 * 如何创建真实dom
 * domdiff 最长递增子序列
 * 组件的实现 模板渲染 核心的组件更新
 * 模板编译原理 + 代码转化 + 代码生成  （编译优化）
 */