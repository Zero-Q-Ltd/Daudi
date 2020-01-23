export enum OrderStages {
  'Estimates' = 1,
  'Invoiced',
  'Paid',
  'Loading Orders',
  'Complete',
  'Deleted',
}

export const OrderStageIds = Object.keys(OrderStages).filter(key => isNaN(Number(OrderStages[key]))).map(t => Number(t));
export const OrderStageNames = Object.keys(OrderStages).filter(key => !isNaN(Number(OrderStages[key])));
