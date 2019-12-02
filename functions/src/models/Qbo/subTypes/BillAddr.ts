/**
*
PhysicalAddress
Bill-to address of the Invoice.
If BillAddris not specified, and a default Customer:BillingAddr is specified in QuickBooks for this customer,
the default bill-to address is used by QuickBooks.
For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country.
If a physical address is updated from within the transaction object,
the QuickBooks Online API flows individual address components differently into the Line elements of the transaction
response then when the transaction was first created:
*/
export interface BillAddr {
    CountrySubDivisionCode: string;
    City: string;
    PostalCode: string;
    Id: string;
    Line1: string;
}
