/**
 * Reference to a customer or job.
 * Query the Customer name list resource to determine the appropriate Customer object for this reference.
 * Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name, respectively.
 */
export interface CustomerRef {
    name?: string;
    value: string;
}
