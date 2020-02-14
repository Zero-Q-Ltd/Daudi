export interface QbRef {
  QbId: string;
  /**
   * Sometimes we concartenate different Qb Objects to the same value
   * In the case of entry where the same entryId canot be repeated
   * It is thus important to keep a separate copy of the quantity here
   * This value is not used for calcuations and is Created ONLY ONCE
   */
  qty: number;
}
