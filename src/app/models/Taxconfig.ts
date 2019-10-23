import { fuelTypes } from "./universal";


const inittaxconfig = {
  nonTax: 0,
  MetaData: {
    CreateTime: null,
    LastUpdatedTime: null
  }
};

interface fueltaxconfig {
  nonTax: number,
  MetaData: {
    CreateTime: string,
    LastUpdatedTime: string,
  }
}

export type taxconfig = {
  [key in fuelTypes]: fueltaxconfig
};

export const emptytaxconfig: taxconfig = {
  pms: inittaxconfig,
  ago: inittaxconfig,
  ik: inittaxconfig

};


