
export interface DaudiMeta {
  date: Date;
  adminId: string;
}

export const emptyMeta: DaudiMeta = {
  adminId: null,
  date: new Date()
};
