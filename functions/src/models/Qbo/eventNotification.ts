import { QbTypes } from "../common";

export type eventnotifications = {
  name: QbTypes;
  id: string;
  operation: "Create" | "update";
  lastUpdated: string;
};
