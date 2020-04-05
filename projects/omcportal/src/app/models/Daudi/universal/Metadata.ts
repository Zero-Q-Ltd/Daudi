import {deepCopy} from "../../utils/deepCopy";
import {DaudiMeta, emptyMeta} from "./Meta";

export interface Metadata {
  /**
   * Sometimes we may just want to modify the last edited date
   */
  created?: DaudiMeta;
  edited: DaudiMeta;
}

export const emptymetadata: Metadata = {
  created: deepCopy<DaudiMeta>(emptyMeta),
  edited: deepCopy<DaudiMeta>(emptyMeta),
};
