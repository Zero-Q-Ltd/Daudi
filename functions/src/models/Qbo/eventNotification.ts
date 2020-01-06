import {QbTypes} from "../QbTypes";

export type eventnotifications = {
  name: QbTypes;
  id: string;
  operation: "Create" | "update";
  lastUpdated: string;
};
