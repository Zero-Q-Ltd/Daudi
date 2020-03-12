import { Core, emptyCoreStat } from "./Core";

export interface TimeStats extends Core {
  customers: {
    new: number;
  };
}

export const emptyTimeStats: TimeStats = {
  ...{ customers: { new: 0 }, ...emptyCoreStat }
};
