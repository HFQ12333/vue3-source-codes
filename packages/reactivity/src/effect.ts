/**
 * vue3实现响应式原理：
 * 1.先搞了一个响应式对象new Proxy
 * 2.effect默认数据变化要能更新，我们先将正在执行的effet作为全局变量，渲染（取值），我们在get方法中进行依赖收集
 * 3.weakmap（对象：map（属性：set（activeEffect）））
 * 4.稍后用户发生数据变化，会通过对象属性来查找对应的effect集合，找到effect全部执行
 */

function cleanupEffect(effect){
    const {deps} = effect;//deps里面存的是name对应的effect
    for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect);//解除effect重新收集依赖        
    }
    effect.deps.length = 0;
}

export let activeEffect = undefined;
export class ReactiveEffect{
    // 这里表示在实例上新增了属性
    public parent = null;
    public deps = [];
    public active = true;
    constructor(public fn,public scheduler){}//用户传递的参数也会到this上，this.fn = fn
    run(){
        if(!this.active){this.fn()};//这里表示如果是非激活的情况，只需要执行函数，不需要进行依赖收集
        try{
            this.parent = activeEffect;
            activeEffect = this;
            // 这里我们需要在执行用户函数之前将之前收集的内容清空
            cleanupEffect(this)
            return this.fn();
        }finally{
            activeEffect = this.parent;
        }
    }
    stop(){
        if(this.active){
            this.active = false;
            cleanupEffect(this); // 停止effect的收集
        }
    }
}
//组件就是嵌套的effect
export function effect(fn,options:any={}){
    // 这里fn可以根据状态变化，重新执行，effect可以嵌套着写
    const _effect = new ReactiveEffect(fn,options.scheduler);//创建响应式的effect
    _effect.run();//默认先执行一次

    const runner = _effect.run.bind(_effect); //绑定this执行
    runner.effect = _effect//将effect挂载到runner函数上
    return runner;
}

// 一个effect对应多个属性；一个属性对应多个effect（多对多）
const targetMap = new WeakMap(); //WeakMap为弱引用，属性被删除后可自动垃圾回收
export function track(target,type,key){
    if(!activeEffect) return;
    let depsMap = targetMap.get(target);
    if(!depsMap){
        targetMap.set(target,(depsMap = new Map()))
    }
    let dep = depsMap.get(key) //key-->name/age
    if(!dep){
        depsMap.set(key,(dep=new Set()))
    }
    trackEffects(dep);
    // 单向指的是属性记录了effect，双向记录，应该让effect也
    // 记录他被哪些属性收集过，这样做的好处是为了可以清理。
}
export function trackEffects(dep){
    if(activeEffect){
        let shouldTrack = !dep.has(activeEffect);//去重了
        if(shouldTrack){
            dep.add(activeEffect);
            // 存放的是属性对应的set
            activeEffect.deps.push(dep)//让effect记录对应的dep，清理的时候会用到
        }
    }
}

export function trigger(target,type,key,value,oldValue){
    const depsMap = targetMap.get(target);
    if(!depsMap) return;//触发的值不在模板中使用
    let effects = depsMap.get(key);//找到了属性中对应的effect
    // 永远在执行之前，先拷贝一份再执行，不要关联引用。
    if(effects){
        triggerEffects(effects)
    }
}
export function triggerEffects(effects){
    effects = new Set();//或  effects = [...effects]
    // 循环的和添加删除的不是同一个，可解决死循环
    effects.forEach(effect=>{
        // 若在执行effect的时候，又要执行自己，我们需要屏蔽掉，不要无限调用
        if(effect !== activeEffect){
            if(effect.scheduler){
                effect.scheduler();//如果用户传入了调度函数则用用户的
            }else{
                effect.run();//否则默认刷新试图
            }
        }
    })
}