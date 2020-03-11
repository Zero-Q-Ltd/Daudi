import { DaudiMeta, emptyMeta } from "./Meta";
import { deepCopy } from "functions/src/models/utils/deepCopy";

export interface Metadata {
  /**
   * Sometimes we may just want to modify the last edited date
   */
  created?: DaudiMeta;
  edited: DaudiMeta;
}

export const emptymetadata: Metadata = {
  created: deepCopy<DaudiMeta>(emptyMeta),
  edited: deepCopy<DaudiMeta>(emptyMeta)
};
