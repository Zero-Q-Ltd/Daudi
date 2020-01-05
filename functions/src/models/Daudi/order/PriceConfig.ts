export interface PriceConfig {
    /**
     * @description the price used for Creating Estimate
     */
    requestedPrice: number;
    /**
     * @description the total price of the fuel/l, inclusive of VAT
     */
    price: number;
    /**
     * @description the amount/l without tax
     */
    nonTaxprice: number;
    /**
     * @description the amount/l that is not taxed, provided by the Gov
     */
    nonTax: number;
    /**
     * @description the price set as the day's selling price used for discount calculation
     */
    retailprice: number;
    /**
     * @description the minSp as of writing the order, connected to the buying of the most recent batch number
     */
    minsp: number;
    /**
     * @description the total amount of money that the order will cost in KES
     */
    total: number;
    /**
     * @description Amount of tax in the order in KES
     */
    taxAmnt: number;
    /**
     * @description Worth of the order without tax
     */
    nonTaxtotal: number;
    /**
     * @description calculation of price minus nonTax
     */
    taxablePrice: number;
    /**
     * @description total amount on which tax is calculated on
     */
    taxableAmnt: number;
    /**
     * @description calculation of the price minus retailprice used in calculating the amount of discount
     * +ve for upmark and -ve for discount
     */
    difference: number;

}
