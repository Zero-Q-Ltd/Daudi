import * as CloneDeep from "lodash.clonedeep";

export function deepCopy<T>(object: T): T {
    return CloneDeep(object);
}
