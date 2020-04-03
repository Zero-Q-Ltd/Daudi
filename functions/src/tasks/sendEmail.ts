import { QuickBooks } from "../libs/qbmain";

export function sendEmail({
  allowed,
  qbo,
  InvoiceId
}: {
  allowed: Boolean;
  qbo: QuickBooks;
  InvoiceId: String;
}): Promise<any> {
  if (allowed) {
    return qbo.sendInvoicePdf(InvoiceId);
  } else {
    return Promise.resolve("Email not allowed");
  }
}
