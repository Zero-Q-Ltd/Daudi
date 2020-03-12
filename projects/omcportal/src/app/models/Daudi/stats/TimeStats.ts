import { Core } from "./Core";

export interface TimeStats extends Core {
  customers: {
    new: number;
  };
}
