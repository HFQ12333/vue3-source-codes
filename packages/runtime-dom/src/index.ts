import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProps";
import { createRenderer } from "@vue/runtime-core";
const renderOptions = Object.assign(nodeOps,{patchProp});//domAPI 属性API
export function render(vnode,container){
    // 在创建渲染器的时候，传入选项。
    createRenderer(renderOptions).render(vnode,container)
}
export * from "@vue/runtime-core"




// render(h('h1',{style:{color:'red',background:'blue'}},'ceshi'),app)
/**
 * 逻辑梳理：
 *     1.调用render函数的时候，render函数内部创建渲染器createRenderer并传入选项（渲染方法），然后再 . 调用render(vnode,container)。
 *     2.createRenderer函数返回render函数，在render函数中，进行逻辑处理。
 *     3.先判断vnode是不是为空，如果不为空调用patch方法，patch方法既能渲染(初始化)又能更新；如果为空进行调用unmount(container._vnode)//el卸载。
 *     4.在调用patch方法时，传入 patch(container._vnode || null,vnode,container)，第一个参数为app容器中的_vnode（旧虚拟节点），第二个参数为新虚拟节点，第三个参数为容器。
 *     5.进入patch方法中，首先判断前两个参数（n1与n2）是否相等，若相同则直接return；如果新老节点不相同，则删除老的添加新的；
 *     6.还要进行判断虚拟节点的type是否为Text文本，如果是文本则单独处理文本，因为不能通过document.createElement('文本');如果不是文本，则使用ShapeFlags（vue3提供的形状标识）进行shapeFlag & ShapeFlags.ELEMENT判断。
 *     7.如果旧节点为null，则递归虚拟节点，创建成真实节点(创建元素,创建属性将真实元素挂载到这个虚拟节点上，后续用于复用节点和更新),再判断是文本还是数组，数组的话进行createVnode后递归patch。
 *     8.如果旧节点不为null，进行元素比对(核心diff算法)，先复用节点，再比较属性，再比较儿子；比较属性时候新的里面有，直接用新的覆盖，老的有新的没有则删除。比较儿子的时候，合并后分为6种情况。
 *     9.// 1.文本 2.控的null(<div></div>) 3.数组
         // 比较两个儿子列表的差异。
         *   新的 老的
         * 1.文本 数组 （删除老儿子，设置文本内容）
         * 2.文本 文本 （更新文本既可）
         * 3.数组 数组 （diff算法）
         * 4.数组 文本 （清空文本，进行挂载）
         * 5.空   数组 （删除所有儿子）
         * 6.空   文本 （清空文本）
       （查vue3与vue2中的diff算的区别）（数组--数组）
 */