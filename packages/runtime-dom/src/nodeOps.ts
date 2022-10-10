//node节点创作方法
export const nodeOps = {
    // 增加 删除 修改 查询
    inset(child,parent,anchor = null){
        parent.insertBefore(child,anchor);
    },
    removeEventListener(child){
        const parentNode = child.parentNode;
        if(parentNode){
            parentNode.removeChild(child)
        }
    },
    setElementText(el,text){
        el.textContent = text;
    },
    setText(node,text){
        node.nodeValue = text;
    },
    querySelector(selector){
        return document.querySelector(selector);
    },
    parentNode(node){
        return node.parentNode;
    },
    nextSibling(node){
        return node.nextSibling;
    },
    creatElement(tagName){
        return document.createElement(tagName);
    },
    createText(text){
        return document.createTextNode;
    }
}