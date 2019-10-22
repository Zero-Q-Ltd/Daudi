import { fuelTypes } from "../common";

const inittaxconfig: fueltaxconfig = {
  nonTax: 0,
  QbId: '',
  MetaData: {
    CreateTime: '',
    LastUpdatedTime: ''
  }
};

type fueltaxconfig = {
  nonTax: number;
  QbId: string;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
};

export type taxconfig = {
  [key in fuelTypes]: fueltaxconfig;
};

export const emptytaxconfig: taxconfig = {
  pms: { ...inittaxconfig },
  ago: { ...inittaxconfig },
  ik: { ...inittaxconfig }
};
