import {fuelTypes} from "./universal";


const inittaxconfig = {
  nonTax: 0,
  QbId: null,
  MetaData: {
    CreateTime: null,
    LastUpdatedTime: null
  }
};

type fueltaxconfig = {
  nonTax: number,
  QbId: string
  MetaData: {
    CreateTime: string,
    LastUpdatedTime: string,
  }
};

export type taxconfig = {
  [key in fuelTypes]: fueltaxconfig
}

export const emptytaxconfig: taxconfig = {
  pms: inittaxconfig,
  ago: inittaxconfig,
  ik: inittaxconfig

};


