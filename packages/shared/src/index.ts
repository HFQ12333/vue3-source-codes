export const isOjbect = (value: null) => typeof value==='object' && value !== null;
export const isString = (value: any) => typeof value==='string';
export const isNumber = (value: any) => typeof value==='number';
export const isFunction = (value: any) => typeof value==='function';
export const isArray = Array.isArray;
export const assign = Object.assign;

export function ShapeFlags = {//vue3提供的形状标识
    ELEMENT = 1,
    FUNCTION_COMPONENT = 1 << 1,
    STATEFUL_COMPONENT = 1 << 2,
    TEXT_CHILDREN = 1 << 3,
    ARRAY_CHILDREN = 1 << 4,
    SLOTS_CHILDREN = 1 << 5,
    TELEPORT = 1 << 6,
    SUSPENSE = 1 << 7,
    COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
    COMPONENT_KEEP_ALIVE = 1 << 9,
    COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTION_COMPONENT
}