import { isString, ShapeFlags } from "@vue/shared";
import { isSameVnode } from "./vnode";
import { createVnode,Text } from "./vnode";

export function createRenderer(renderOptions){
    let {
        inset:hostInset,
        removeEventListener:hostRemove,
        setElementText:hostSetElementText,
        setText:hostSetText,
        querySelector:hostQuerySelector,
        parentNode:hostParentNode,
        nextSibling:hostNextSibling,
        creatElement:hostCreatElement,
        createText:hostCreateText,
        patchProp:hostPatchProp
    } = renderOptions

    const normalize = (children,i) => {
        if(isString(child)){
            let vnode = createVnode(Text,null,children[i])
            children[i] = vnode;
        }
        return children[i];
    }
    const mountChildren = (children,container) => {
        for(let i =0;i<children.length;i++){
            let child = normalize(children,i)
            patch(null,child,container)
        }
    }
    function mountElement(vnode,container,anChor){//递归虚拟节点，创建成真实节点。
        let {type,props} = vnode;
        // 创建元素
        let el = vnode.el = hostCreatElement(type) //将真实元素挂载到这个虚拟节点上，后续用于复用节点和更新。
        // 创建属性
        if(props){
            for(let key in props){
                hostPatchProp(el,key,null,props[key]);
            }
        }
        if(shapeFlag & ShapeFlags.TEXT_CHILDREN){//文本
            hostSetElementText(el,children)
        }else if(shapeFlag  & ShapeFlags.ARRAY_CHILDREN){//数组
            mountChildren(children,el)
        }
        // 将创建好的元素塞到容器中。
        hostInset(el,container,anChor)
    }

    const processText = (n1,n2,container) => {
        if(n1 == null){
            hostInset((n2.el = hostCreateText(n2.children)),container);
        }else{
            // 文本的内容变化了，可以复用老的节点
            const el = n2.el = n1.el;
            if(n1.children !== n2.children){
                hostSetText(el,n2.children)
            }   
        }
    }

    const patchProps = (oldProps,newProps,el) => {
        for(let key in newProps){//新的里面有，直接用新的覆盖
            hostPatchProp(el,key,oldProps[key],newProps[key]);
        }
        for(let key in oldProps){
            if(newProps[key] == null){//老的有新的没有则删除。
                hostPatchProp(el,key,oldProps[key],undefined);//如果为null则到了patchStyle中nextValue不能赋值为{}。null和undefined 区别为：undefined是表示变量声明过但并未赋过值，它是所有未赋值变量默认值；null表示一个变量将来可能指向一个对象，一般用于主动释放指向对象的引用
            }
        }
    }
    
    const unmountChildren = (children) => {
        for(let i of children){
            unmount(i);
        }
    }

    const patchKeyedChildren = (c1,c2,el) => {//比较两个儿子的差异
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        // sync from start(从头部比)
        while(i <= e1 && i <= e2){//有任何一方停止循环则直接跳出。
            let n1 = c1[i];
            let n2 = c2[i];
            if(isSameVnode(n1,n2)){
                patch(n1,n2,el)//比较两个节点的属性和子节点。
            }else{
                break;
            }
            i++
        }
        // sync from end(从头部比)
        while(i <= e1 && i <= e2){//有任何一方停止循环则直接跳出。
            let n1 = c1[e1];
            let n2 = c2[e2];
            if(isSameVnode(n1,n2)){
                patch(n1,n2,el)//比较两个节点的属性和子节点。
            }else{
                break;
            }
            e1--;
            e2--;
        }
        // common sequence + mount  同序列挂载
        // i比e1大说明有新增，i和e2之间的是新增的部分
        // 有一方比较完毕了，要么删除，要么添加
        if(i > e1){
            if(i <= e2){
                while(i <= e2){
                    const nextPos = e2 + 1;
                    const anChor = nextPos < c2.length ? c2[nextPos].el : null;
                    patch(null,c2[i],el,anChor);//创建新节点，扔到容器中。
                    i++;
                }
            }
        }else if(i > e2){//common sequence + unmount  同序列卸载
            if(i <= e1){
                while(i <= e1){
                    unmount(c1[i]);
                    i++;
                }
            }
        }

        // 优化完毕，乱序比对。
        let s1 = i;
        let s2 = i;
        const keyToNewIndexMap = new Map();//key --> newindex
        for(let i = s2;i<=e2;i++){
            keyToNewIndexMap.set(c2[i].key,i)
        }
        // 循环老的元素，看下新的里面有没有，如果有说明要比较差异，没有要添加到列表中，老的有新的没有要删除。
        const toBePatched = e2 - s2 + 1;//新的总个数
        const newIndexToOldIndexMap = new Array(toBePatched).fill(0);//一个记录是否比对过得映射表。
        for(let i = s1;i<=e1;i++){
            const oldChild = c1[i];//老的孩子
            let newIndex = keyToNewIndexMap.get(oldChild.key);//用老的孩子去新的里面找。
            if(newIndex == undefined){
                unmount(oldChild);//多余的删掉
            }else{
                // 新的位置对应的老的位置
                newIndexToOldIndexMap[newIndex-s2] = i + 1;//用来标记当前所patch过的结果。
                patch(oldChild,c2[newIndex],el);
            }
        }//到这里只是新老儿子的属性比对，没有移动位置。

        //需要移动位置
        for(let i = toBePatched - 1;i>=0;i--){
            let index = i+s2;
            let current = c2[index];//找到h
            let anChor = index + 1 < c2.length ? c2[index+1].el : null;
            if(newIndexToOldIndexMap[i] === 0){//创建
                patch(null,current,el,anChor)//倒叙插入
            }else{//不是0说明已经比对过属性和儿子了。
                hostInset(current.el,el,anChor)//倒叙插入，复用了节点。
            }
        }




    }
    const patchChildren = (n1,n2,el) => {
        //比较两个虚拟节点的儿子的差异，el就是当前的父节点。
        const c1 = n1 && n1.children;
        const c2 = n2 && n2.children;
        const prevShapeFlag = n1.shapeFlag;//之前的
        const shapeFlag = n2.shapeFlag;//之后的
        // 1.文本 2.控的null(<div></div>) 3.数组
        // 比较两个儿子列表的差异。
        /**
         *   新的 老的
         * 1.文本 数组 （删除老儿子，设置文本内容）
         * 2.文本 文本 （更新文本既可）
         * 3.数组 数组 （diff算法）
         * 4.数组 文本 （清空文本，进行挂载）
         * 5.空   数组 （删除所有儿子）
         * 6.空   文本 （清空文本）
         */
        if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
            if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
                //删除所有子节点
                unmountChildren(c1)//1.文本 数组 （删除老儿子，设置文本内容）
            }
            if(c1 !== c2){//2.文本 文本 （更新文本既可）
                hostSetElementText(el,c2)
            }
        }else{
            //现在为数组或空
            if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
                if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){//3.数组 数组 （diff算法）
                    //diff算法
                    patchKeyedChildren(c1,c2,el) //全量比对--时间复杂度为O(n)，只比较一轮
                }else{
                    //现在不是数组（文本和空，删除以前的）
                    unmountChildren(c1) // 5.空   数组 （删除所有儿子）
                }
            }else{
                if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN){//4.数组 文本 （清空文本，进行挂载）
                    hostSetElementText(el,'')
                }   
                //6.空   文本 （清空文本）
                if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
                    mountChildren(c2,el)////4.数组 文本 （清空文本，进行挂载）
                }
            }
        }
    }
    const patchElement = (n1,n2) => {//先复用节点，再比较属性，再比较儿子
        let el = n2.el = n1.el;
        let oldProps = n1.props || {};
        let newProps = n2.props || {};
        patchProps(oldProps,newProps,el);
        patchChildren(n1,n2,el)
    }
    
    const processElement = (n1,n2,container,anChor) => {
        if(n1 == null){
            mountElement(n2,container,anChor)
        }else{
            //元素比对(核心diff算法)
            patchElement(n1,n2,container)
        }
    }
    // 更新的逻辑思考
    /**
     * 1.如果前后完全没有关系，删除老的添加新的
     * 2.老的和新的一样，复用。属性可能不一样，再比对属性，更新属性。
     * 3.最后比儿子
     */
    const patch = (n1,n2,container,anChor=null) => {
        if(n1 === n2) return;
        if(n1 && !isSameVnode(n1,n2)){//1.删除老的添加新的
            unmount(n1);//删除老的
            n1 = null;
        }
        const {type,shapeFlag} = n2;
        switch(type){
            case Text:
                processText(n1,n2,container);
                break;
            default:
                if(shapeFlag & ShapeFlags.ELEMENT){
                    processElement(n1,n2,container,anChor)
                }
        }
    }

    const unmount = (vnode) => {
        hostRemove(vnode.el);
    }
    // vnode 虚拟dom
    const render = (vnode,container) => {//渲染过程是用你传入的renderOptions来渲染。
        if(vnode === null){
            // 卸载逻辑
            if(container._vnode){
                unmount(container._vnode)//el
            }
        }else{
            // patch方法既能渲染(初始化)又能更新。
            patch(container._vnode || null,vnode,container)
        }
        container._vnode = vnode
    }
    return {
        render
    }
}
// 文本的处理，需要自己增加类型，因为不能通过document.createElement('文本')
// 我们如果传入null的时候再渲染，则是卸载逻辑，需要将dom节点删掉。

