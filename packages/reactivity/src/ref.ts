import { isArray, isOjbect } from "@vue/shared";
import { trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

function toReactive(value: null){
    return isOjbect(value) ? reactive(value) : value;
}

class ImplRef{
    public _value;
    public dep = new Set();
    public __v_isRef = true;
    constructor(public rawValue:any){
        this._value = toReactive(rawValue)
    }
    get value(){
        trackEffects(this.dep)
        return this._value;
    }
    set value(newValue){
        if(this.rawValue !== newValue){
            this._value = toReactive(newValue);
            this.rawValue = newValue;
            triggerEffects(this.dep)
        }
    }
}

export function ref(value: any){
    return new ImplRef(value)
}

// 二、toRefs与toRef的实现
class ObjectRefImpl{//只是将.vaule的属性代理到原始类型上。
    [x: string]: any;
    constructor(object: any,key: any){}
    get value(){
        return this.object[this.key];
    }
    set value(newValue){
        this.object[this.key] = newValue;
    }
}
export function toRef(object: any,key: string){
    return new ObjectRefImpl(object,key);
}
export function toRefs(object: any){
    let result = isArray(object) ? new Array(object.length) : {};
    for(let key in object){
        result = toRef(object,key)
    }
    return result;
}

// proxyRefs
export function proxyRefs(object: any){
    return new Proxy(object,{
        get(target,key,receiver){
            let r = Reflect.set(target,key,receiver)
            return r.__v_isRef ? r.value : r;
        },
        set(target,key,value,receiver){
            let oldValue = target[key];
            if(oldValue.__v_isRef){
                oldValue.value = value;
                return true;
            }else{
                return Reflect.set(target,key,value,receiver)
            }
        }
    })
}