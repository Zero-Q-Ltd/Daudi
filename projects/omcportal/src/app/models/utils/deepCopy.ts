import {cloneDeep} from "lodash";

export function deepCopy<T>(object: T): T {
  return cloneDeep(object);
}
