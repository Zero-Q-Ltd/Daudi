/* tslint-disable */
/**
 * @file Node.js client for QuickBooks V3 API
 * @name node-quickbooks
 * @author based on Michael Cohen <michael_cohen@intuit.com> by  Kamana Kisinga <kisinga@zero-q.com>
 * @license ISC
 * @copyright 2018 Zero-Q
 */
import * as requester from "request";
import * as uuid from "uuid";
import * as util from "util";
import * as moment from "moment";
import * as _ from "underscore";
import { QbTypes } from "../models/QbTypes";
import { QboOrder } from "../models/Qbo/QboOrder";
import { Payment } from "../models/Qbo/Payment";
import { Item } from "../models/Qbo/Item";
import { Employee } from "../models/Qbo/Employee";
import { Customer } from "../models/Qbo/Customer";
import { Bill } from "../models/Qbo/Bill";

const version = "2.0.24";
const APP_CENTER_BASE = "https://appcenter.intuit.com";
const V3_endpoint_BASE_URL = "https://quickbooks.api.intuit.com/v3/company/";
const QUERY_OPERATORS = ["=", "IN", "<", ">", "<=", ">=", "LIKE"];
const RECONNECT_URL = APP_CENTER_BASE + "/api/v1/connection/reconnect";
const DISCONNECT_URL = APP_CENTER_BASE + "/api/v1/connection/disconnect";
let endpoint: string;
let clientID: string;
let clientSecret: string;
let token: string;
let realmId: string;
let useSandbox: boolean;
let debug: boolean;
let minorversion: number;
let refreshtoken: string;
const authConfig = {
  authorization_endpoint: null,
  token_endpoint: null
};

export type QbApiConfig = {
  clientID: string,
  clientSecret: string,
  token: string,
  realmId: string,
  useSandbox: boolean,
  debug: boolean,
  minorversion: number,
  refreshtoken: string
}

type Querycriteria = {
  field?: QbTypes | string,
  value?: string | number | Array<string> | boolean,
  operator?: ">" | "<" | ">=" | "<=" | "=" | "in"
  limit?: number,
  offset?: number,
  fetchAll?: Boolean,
  /**
   * This is important when making queries of type in
   */
  [key: string]: any
}

export class QuickBooks {
  /**
   * Global Variable declarations
   */

  /**
   * Node.js client encapsulating access to the QuickBooks V3 Rest API. An instance
   * of this class should be instantiated on behalf of each user accessing the api.
   *
   * @param {string} clientID - application key
   * @param {string} clientSecret  - application password
   * @param {string} token - the OAuth generated user-specific key
   * @param {string} realmId - QuickBooks companyId, returned as a request parameter when the user is redirected to the provided callback URL following authentication
   * @param {boolean} useSandbox - boolean - See https://developer.intuit.com/v2/blog/2014/10/24/intuit-developer-now-offers-quickbooks-sandboxes
   * @param {boolean} debug - boolean flag to turn on logging of HTTP requests, including headers and body
   * @param {number} minorversion - integer to set minorversion in request
   *
   */
  sandbox: boolean;
  companyid: string;

  constructor(qbconfig: QbApiConfig) {
    for (const key in qbconfig) {
      if (qbconfig[key] === null) {
        throw new Error(`${key} not defined`);
      }
    }
    // console.log(qbconfig)
    clientID = qbconfig.clientID;
    clientSecret = qbconfig.clientSecret;
    token = qbconfig.token;
    realmId = qbconfig.realmId;
    useSandbox = qbconfig.useSandbox;
    debug = qbconfig.debug;
    endpoint = qbconfig.useSandbox ? V3_endpoint_BASE_URL : V3_endpoint_BASE_URL.replace("sandbox-", "");
    minorversion = qbconfig.minorversion;
    refreshtoken = qbconfig.refreshtoken;
    this.sandbox = qbconfig.useSandbox;
    this.companyid = qbconfig.realmId;
    /*
    *only support OAuth 2.0
    *
    */
    //  let json = JSON.parse("");
    authConfig.authorization_endpoint = "https://appcenter.intuit.com/connect/oauth2";
    authConfig.token_endpoint = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
    const postBody = {
      url: "https://developer.api.intuit.com/.well-known/openid_configuration/",
      headers: {
        Accept: "application/json"
      }
    };

    requester.get(postBody, function (e, res, data) {
      const json = JSON.parse(res.body);
      authConfig.authorization_endpoint = json.authorization_endpoint;;
      authConfig.token_endpoint = json.token_endpoint;
    });
  }


  /**
   *
   * Use the refresh token to obtain a new access token.
   */
  refreshAccesstoken(): Promise<any> {
    // const auth = Buffer.from(clientID + ":" + clientSecret, "base64");
    const auth = (new Buffer(clientID + ":" + clientSecret).toString("base64"));
    const postBody = {
      url: authConfig.token_endpoint,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + auth
      },
      form: {
        grant_type: "refresh_token",
        refresh_token: refreshtoken
      }
    };
    return new Promise(function (resolve, reject) {
      if (debug) {
        console.log("ClientId : ", clientID, "ClientSecret : ", clientSecret);
        console.log(JSON.stringify(postBody));
      }
      requester.post(postBody, function (e, r, data) {
        console.log(JSON.parse(r.body));
        const refreshResponse = JSON.parse(r.body);
        refreshtoken = refreshResponse.refresh_token;
        token = refreshResponse.access_token;
        if (e) {
          reject(e);
        } else {
          resolve(refreshResponse);
        }
      });
    });
  };


  /**
   * Batch operation to enable an application to perform multiple operations in a single request.
   * The following batch items are supported:
   create
   update
   delete_
   query
   * The maximum number of batch items in a single request is 25.
   *
   * @param  {object} items - JavaScript array of batch items
   */
  batch(items): Promise<any> {
    return request("post", { url: "/batch" }, { BatchItemRequest: items });
  }

  /**
   * The change data capture (CDC) operation returns a list of entities that have changed since a specified time.
   *
   * @param  {object} entities - string or array of objects as received from the Notification to search for changes
   * @param  {object} since - JavaScript Date or string representation of the form '2012-07-20T22:25:51-07:00' to look back for changes until
   */
  changeDataCapture(entities: Array<any> | string, since: Date): Promise<any> {
    let url = "/cdc?entities=";

    url += typeof entities === "string" ? entities : consume(entities);
    url += "&changedSince=";
    url += typeof since === "string" ? since : moment(since).toISOString();
    return request("get", { url: url }, null);

    function consume(ent: Array<any>) {
      const data = [];
      ent.forEach((element) => {
        data.push(element.name);
      });
      //Remove any duplicate elements and comma separate the array
      return (Array.from(new Set(data))).join(",");
    }
  }

  /**
   * Uploads a file as an Attachable in QBO, optionally linking it to the specified
   * QBO Entity.
   *
   * @param  {object} stream - ReadableStream of file contents
   * @param  {object} entityType - optional string name of the QBO entity the Attachable will be linked to (e.g. Invoice)
   * @param  {object} entityId - optional Id of the QBO entity the Attachable will be linked to
   */
  upload(stream, entityType, entityId): Promise<any> {
    const opts = {
      url: "/upload",
      formData: {
        file_content_01: stream
      }
    };
    // request('post', opts, null, unwrap('AttachableResponse')).then(result =>{
    return request("post", opts, null).then(result => {
      return this.updateAttachable({
        Id: result,
        Synctoken: "0",
        AttachableRef: [{
          EntityRef: {
            type: entityType,
            value: entityId + ""
          }
        }]
      });
    }).catch(err => {
      console.log(err);
    });
  }

  /**
   * Creates the Account in QuickBooks
   *
   * @param  {object} account - The unsaved account, to be persisted in QuickBooks
   * persistent Account
   */
  createAccount(account): Promise<any> {
    return create("Account", account);
  }

  /**
   * Creates the Attachable in QuickBooks
   *
   * @param  {object} attachable - The unsaved attachable, to be persisted in QuickBooks
   * persistent Attachable
   */
  createAttachable(attachable): Promise<any> {
    return create("Attachable", attachable);
  }

  /**
   * Creates the Bill in QuickBooks
   *
   * @param  {object} bill - The unsaved bill, to be persisted in QuickBooks
   * persistent Bill
   */
  createBill(bill: Bill): Promise<any> {
    return create("Bill", bill);
  }

  /**
   * Creates the BillPayment in QuickBooks
   *
   * @param  {object} billPayment - The unsaved billPayment, to be persisted in QuickBooks
   * persistent BillPayment
   */
  createBillPayment(billPayment): Promise<any> {
    return create("BillPayment", billPayment);
  }

  /**
   * Creates the Class in QuickBooks
   *
   * persistent Class
   * @param klass
   */
  createClass(klass): Promise<any> {
    return create("Class", klass);
  }

  /**
   * Creates the CreditMemo in QuickBooks
   *
   * @param  {object} creditMemo - The unsaved creditMemo, to be persisted in QuickBooks
   * persistent CreditMemo
   */
  createCreditMemo(creditMemo): Promise<any> {
    return create("CreditMemo", creditMemo);
  }

  /**
   * Creates the Customer in QuickBooks
   *
   * @param  {object} customer - The unsaved customer, to be persisted in QuickBooks
   * persistent Customer
   */
  createCustomer(customer: Customer): Promise<any> {
    return create("Customer", customer);
  }

  /**
   * Creates the Department in QuickBooks
   *
   * @param  {object} department - The unsaved department, to be persisted in QuickBooks
   * persistent Department
   */
  createDepartment(department): Promise<any> {
    return create("Department", department);
  }

  /**
   * Creates the Deposit in QuickBooks
   *
   * @param  {object} deposit - The unsaved Deposit, to be persisted in QuickBooks
   * persistent Deposit
   */
  createDeposit(deposit): Promise<any> {
    return create("Deposit", deposit);
  }

  /**
   * Creates the Employee in QuickBooks
   *
   * @param  {object} employee - The unsaved employee, to be persisted in QuickBooks
   * persistent Employee
   */
  createEmployee(employee: Employee): Promise<any> {
    return create("Employee", employee);
  }

  /**
   * Creates the Estimate in QuickBooks
   *
   * @param  {object} estimate - The unsaved estimate, to be persisted in QuickBooks
   * persistent Estimate
   */
  createEstimate(estimate: QboOrder): Promise<any> {
    return create("Estimate", estimate);
  }

  /**
   * Creates the Invoice in QuickBooks
   *
   * @param  {object} invoice - The unsaved invoice, to be persisted in QuickBooks
   * persistent Invoice
   */
  createInvoice(invoice: QboOrder): Promise<any> {
    return create("Invoice", invoice);
  }

  /**
   * Creates the Item in QuickBooks
   *
   * @param  {object} item - The unsaved item, to be persisted in QuickBooks
   * persistent Item
   */
  createItem(item: Item): Promise<any> {
    return create("Item", item);
  }

  /**
   * Creates the JournalCode in QuickBooks
   *
   * @param  {object} journalCode - The unsaved journalCode, to be persisted in QuickBooks
   * persistent JournalCode
   */
  createJournalCode(journalCode): Promise<any> {
    return create("JournalCode", journalCode);
  }

  /**
   * Creates the JournalEntry in QuickBooks
   *
   * @param  {object} journalEntry - The unsaved journalEntry, to be persisted in QuickBooks
   * persistent JournalEntry
   */
  createJournalEntry(journalEntry): Promise<any> {
    return create("JournalEntry", journalEntry);
  }

  /**
   * Creates the Payment in QuickBooks
   *
   * @param  {object} payment - The unsaved payment, to be persisted in QuickBooks
   * persistent Payment
   */
  createPayment(payment: Payment): Promise<any> {
    return create("Payment", payment);
  }

  /**
   * Creates the PaymentMethod in QuickBooks
   *
   * @param  {object} paymentMethod - The unsaved paymentMethod, to be persisted in QuickBooks
   * persistent PaymentMethod
   */
  createPaymentMethod(paymentMethod): Promise<any> {
    return create("PaymentMethod", paymentMethod);
  }

  /**
   * Creates the Purchase in QuickBooks
   *
   * @param  {object} purchase - The unsaved purchase, to be persisted in QuickBooks
   * persistent Purchase
   */
  createPurchase(purchase): Promise<any> {
    return create("Purchase", purchase);
  }

  /**
   * Creates the PurchaseOrder in QuickBooks
   *
   * @param  {object} purchaseOrder - The unsaved purchaseOrder, to be persisted in QuickBooks
   * persistent PurchaseOrder
   */
  createPurchaseOrder(purchaseOrder): Promise<any> {
    return create("PurchaseOrder", purchaseOrder);
  }

  /**
   * Creates the RefundReceipt in QuickBooks
   *
   * @param  {object} refundReceipt - The unsaved refundReceipt, to be persisted in QuickBooks
   * persistent RefundReceipt
   */
  createRefundReceipt(refundReceipt): Promise<any> {
    return create("RefundReceipt", refundReceipt);
  }

  /**
   * Creates the SalesReceipt in QuickBooks
   *
   * @param  {object} salesReceipt - The unsaved salesReceipt, to be persisted in QuickBooks
   * persistent SalesReceipt
   */
  createSalesReceipt(salesReceipt): Promise<any> {
    return create("SalesReceipt", salesReceipt);
  }

  /**
   * Creates the TaxAgency in QuickBooks
   *
   * @param  {object} taxAgency - The unsaved taxAgency, to be persisted in QuickBooks
   * persistent TaxAgency
   */
  createTaxAgency(taxAgency): Promise<any> {
    return create("TaxAgency", taxAgency);
  }

  /**
   * Creates the TaxService in QuickBooks
   *
   * @param  {object} taxService - The unsaved taxService, to be persisted in QuickBooks
   * persistent TaxService
   */
  createTaxService(taxService): Promise<any> {
    return create("TaxService", taxService);
    // return create("TaxService/taxcode", taxService);
  }

  /**
   * Creates the Term in QuickBooks
   *
   * @param  {object} term - The unsaved term, to be persisted in QuickBooks
   * persistent Term
   */
  createTerm(term): Promise<any> {
    return create("Term", term);
  }

  /**
   * Creates the TimeActivity in QuickBooks
   *
   * @param  {object} timeActivity - The unsaved timeActivity, to be persisted in QuickBooks
   * persistent TimeActivity
   */
  createTimeActivity(timeActivity): Promise<any> {
    return create("TimeActivity", timeActivity);
  }

  /**
   * Creates the Transfer in QuickBooks
   *
   * @param  {object} transfer - The unsaved Transfer, to be persisted in QuickBooks
   * persistent Transfer
   */
  createTransfer(transfer): Promise<any> {
    return create("Transfer", transfer);
  }

  /**
   * Creates the Vendor in QuickBooks
   *
   * @param  {object} vendor - The unsaved vendor, to be persisted in QuickBooks
   * persistent Vendor
   */
  createVendor(vendor): Promise<any> {
    return create("Vendor", vendor);
  }

  /**
   * Creates the VendorCredit in QuickBooks
   *
   * @param  {object} vendorCredit - The unsaved vendorCredit, to be persisted in QuickBooks
   * persistent VendorCredit
   */
  createVendorCredit(vendorCredit): Promise<any> {
    return create("VendorCredit", vendorCredit);
  }


  /**
   * Retrieves the Account from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Account
   * persistent Account
   */
  getAccount(id: string): Promise<any> {
    return read("account", id);
  }

  /**
   * Retrieves the Attachable from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Attachable
   * persistent Attachable
   */
  getAttachable(id: string): Promise<any> {
    return read("attachable", id);
  }

  /**
   * Retrieves the Bill from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Bill
   * persistent Bill
   */
  getBill(id: string): Promise<any> {
    return read("bill", id);
  }

  /**
   * Retrieves the BillPayment from QuickBooks
   *
   * @param  {string} Id - The Id of persistent BillPayment
   * persistent BillPayment
   */
  getBillPayment(id: string): Promise<any> {
    return read("billPayment", id);
  }

  /**
   * Retrieves the Class from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Class
   * persistent Class
   */
  getClass(id: string): Promise<any> {
    return read("class", id);
  }

  /**
   * Retrieves the CompanyInfo from QuickBooks
   *
   * @param  {string} Id - The Id of persistent CompanyInfo
   * persistent CompanyInfo
   */
  getCompanyInfo(id: string): Promise<any> {
    return read("companyInfo", id);
  }

  /**
   * Retrieves the CreditMemo from QuickBooks
   *
   * @param  {string} Id - The Id of persistent CreditMemo
   * persistent CreditMemo
   */
  getCreditMemo(id: string): Promise<any> {
    return read("creditMemo", id);
  }

  /**
   * Retrieves the Customer from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Customer
   * persistent Customer
   */
  getCustomer(id: string): Promise<any> {
    return read("customer", id);
  }

  /**
   * Retrieves the Department from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Department
   * persistent Department
   */
  getDepartment(id: string): Promise<any> {
    return read("department", id);
  }

  /**
   * Retrieves the Deposit from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Deposit
   * persistent Deposit
   */
  getDeposit(id: string): Promise<any> {
    return read("deposit", id);
  }

  /**
   * Retrieves the Employee from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Employee
   * persistent Employee
   */
  getEmployee(id: string): Promise<any> {
    return read("employee", id);
  }

  /**
   * Retrieves the Estimate from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Estimate
   * persistent Estimate
   */
  getEstimate(id: string): Promise<any> {
    return read("estimate", id);
  }

  /**
   * Retrieves an ExchangeRate from QuickBooks
   *
   * @param  {object} options - An object with options including the required `sourcecurrencycode` parameter and optional `asofdate` parameter.
   * ExchangeRate
   */
  getExchangeRate(options): Promise<any> {
    const url = "/exchangerate";
    return request("get", { url: url, qs: options }, null);
  }

  /**
   * Emails the Estimate PDF from QuickBooks to the address supplied in Estimate.BillEmail.EmailAddress
   * or the specified 'sendTo' address
   *
   * @param  {string} Id - The Id of persistent Estimate
   * @param  {string} sendTo - optional email address to sent the PDF to. If not provided, address supplied in Estimate.BillEmail.EmailAddress will be used
   * Estimate PDF
   */
  sendEstimatePdf(id: string, sendTo): Promise<any> {
    let path = "/estimate/" + id + "/send";
    if (sendTo && typeof sendTo !== "function") {
      path += "?sendTo=" + sendTo;
    }
    return new Promise(function (resolve, reject) {
      request("post", { url: path }, null).then(result => {
        resolve(unwrap("Estimate"));
      }, err => {
        reject(err);
      });
    });
  }

  /**
   * Retrieves the Invoice from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Invoice
   * persistent Invoice
   */
  getInvoice(id: string): Promise<any> {
    return read("invoice", id);
  }

  /**
   * Retrieves the Invoice PDF from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Invoice
   * Invoice PDF
   */
  getInvoicePdf(id: string): Promise<any> {
    return read("Invoice", id + "/pdf");
  }

  /**
   * Emails the Invoice PDF from QuickBooks to the address supplied in Invoice.BillEmail.EmailAddress
   * or the specified 'sendTo' address
   *
   * @param  {string} Id - The Id of persistent Invoice
   * @param  {string} sendTo - optional email address to sent the PDF to. If not provided, address supplied in Invoice.BillEmail.EmailAddress will be used
   * Invoice PDF
   */
  sendInvoicePdf(id, sendTo?): Promise<any> {
    let path = "/invoice/" + id + "/send";
    if (sendTo && typeof sendTo !== "function") {
      path += "?sendTo=" + sendTo;
    }
    return request("post", { url: path }, null);
  }

  /**
   * Retrieves the Item from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Item
   * persistent Item
   */
  getItem(id: string): Promise<any> {
    return read("item", id);
  }

  /**
   * Retrieves the JournalCode from QuickBooks
   *
   * @param  {string} Id - The Id of persistent JournalCode
   * persistent JournalCode
   */
  getJournalCode(id: string): Promise<any> {
    return read("journalCode", id);
  }

  /**
   * Retrieves the JournalEntry from QuickBooks
   *
   * @param  {string} Id - The Id of persistent JournalEntry
   * persistent JournalEntry
   */
  getJournalEntry(id: string): Promise<any> {
    return read("journalEntry", id);
  }

  /**
   * Retrieves the Payment from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Payment
   * persistent Payment
   */
  getPayment(id: string): Promise<any> {
    return read("payment", id);
  }

  /**
   * Retrieves the PaymentMethod from QuickBooks
   *
   * @param  {string} Id - The Id of persistent PaymentMethod
   * persistent PaymentMethod
   */
  getPaymentMethod(id: string): Promise<any> {
    return read("paymentMethod", id);
  }

  /**
   * Retrieves the Preferences from QuickBooks
   *
   * persistent Preferences
   */
  getPreferences(callback) {
    return read("preferences", null);
  }

  /**
   * Retrieves the Purchase from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Purchase
   * persistent Purchase
   */
  getPurchase(id: string): Promise<any> {
    return read("purchase", id);
  }

  /**
   * Retrieves the PurchaseOrder from QuickBooks
   *
   * @param  {string} Id - The Id of persistent PurchaseOrder
   * persistent PurchaseOrder
   */
  getPurchaseOrder(id: string): Promise<any> {
    return read("purchaseOrder", id);
  }

  /**
   * Retrieves the RefundReceipt from QuickBooks
   *
   * @param  {string} Id - The Id of persistent RefundReceipt
   * persistent RefundReceipt
   */
  getRefundReceipt(id: string): Promise<any> {
    return read("refundReceipt", id);
  }

  /**
   * Retrieves the Reports from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Reports
   * persistent Reports
   */
  getReports(id: string): Promise<any> {
    return read("reports", id);
  }

  /**
   * Retrieves the SalesReceipt from QuickBooks
   *
   * @param  {string} Id - The Id of persistent SalesReceipt
   * persistent SalesReceipt
   */
  getSalesReceipt(id: string): Promise<any> {
    return read("salesReceipt", id);
  }

  /**
   * Retrieves the SalesReceipt PDF from QuickBooks
   *
   * @param  {string} Id - The Id of persistent SalesReceipt
   * SalesReceipt PDF
   */
  getSalesReceiptPdf(id: string): Promise<any> {
    return read("salesReceipt", id + "/pdf");
  }

  /**
   * Emails the SalesReceipt PDF from QuickBooks to the address supplied in SalesReceipt.BillEmail.EmailAddress
   * or the specified 'sendTo' address
   *
   * @param id
   * @param  {string} sendTo - optional email address to send the PDF to. If not provided, address supplied in SalesReceipt.BillEmail.EmailAddress will be used
   * SalesReceipt PDF
   */
  sendSalesReceiptPdf(id, sendTo?): Promise<any> {
    let path = "/salesreceipt/" + id + "/send";
    if (sendTo && typeof sendTo !== "function") {
      path += "?sendTo=" + sendTo;
    }
    return new Promise<any>(function (resolve, reject) {
      request("post", { url: path }, null).then(result => {
        resolve(unwrap("SalesReceipt"));
      }, err => {
        reject(err);
      });
    });
    // return request('post', { url: path }, null, unwrap('SalesReceipt'))
  }

  /**
   * Retrieves the TaxAgency from QuickBooks
   *
   * @param  {string} Id - The Id of persistent TaxAgency
   * persistent TaxAgency
   */
  getTaxAgency(id: string): Promise<any> {
    return read("taxAgency", id);
  }

  /**
   * Retrieves the TaxCode from QuickBooks
   *
   * @param  {string} Id - The Id of persistent TaxCode
   * persistent TaxCode
   */
  getTaxCode(id: string): Promise<any> {
    return read("taxCode", id);
  }

  /**
   * Retrieves the TaxRate from QuickBooks
   *
   * @param  {string} Id - The Id of persistent TaxRate
   * persistent TaxRate
   */
  getTaxRate(id: string): Promise<any> {
    return read("taxRate", id);
  }

  /**
   * Retrieves the Term from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Term
   * persistent Term
   */
  getTerm(id: string): Promise<any> {
    return read("term", id);
  }

  /**
   * Retrieves the TimeActivity from QuickBooks
   *
   * @param  {string} Id - The Id of persistent TimeActivity
   * persistent TimeActivity
   */
  getTimeActivity(id: string): Promise<any> {
    return read("timeActivity", id);
  }

  /**
   * Retrieves the Transfer from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Term
   * persistent Transfer
   */
  getTransfer(id: string): Promise<any> {
    return read("transfer", id);
  }

  /**
   * Retrieves the Vendor from QuickBooks
   *
   * @param  {string} Id - The Id of persistent Vendor
   * persistent Vendor
   */
  getVendor(id: string): Promise<any> {
    return read("vendor", id);
  }

  /**
   * Retrieves the VendorCredit from QuickBooks
   *
   * @param  {string} Id - The Id of persistent VendorCredit
   * persistent VendorCredit
   */
  getVendorCredit(id: string): Promise<any> {
    return read("vendorCredit", id);
  }


  /**
   * Updates QuickBooks version of Account
   *
   * @param  {object} account - The persistent Account, including Id and Synctoken fields
   * persistent Account
   */
  updateAccount(account): Promise<any> {
    return update("Account", account);
  }

  /**
   * Updates QuickBooks version of Attachable
   *
   * @param  {object} attachable - The persistent Attachable, including Id and Synctoken fields
   * persistent Attachable
   */
  updateAttachable(attachable): Promise<any> {
    return update("Attachable", attachable);
  }

  /**
   * Updates QuickBooks version of Bill
   *
   * @param  {object} bill - The persistent Bill, including Id and Synctoken fields
   * persistent Bill
   */
  updateBill(bill): Promise<any> {
    return update("Bill", bill);
  }

  /**
   * Updates QuickBooks version of BillPayment
   *
   * @param  {object} billPayment - The persistent BillPayment, including Id and Synctoken fields
   * persistent BillPayment
   */
  updateBillPayment(billPayment): Promise<any> {
    return update("BillPayment", billPayment);
  }

  /**
   * Updates QuickBooks version of Class
   *
   * @param  {object} class - The persistent Class, including Id and Synctoken fields
   * persistent Class
   */
  updateClass(klass): Promise<any> {
    return update("Class", klass);
  }

  /**
   * Updates QuickBooks version of CompanyInfo
   *
   * @param  {object} companyInfo - The persistent CompanyInfo, including Id and Synctoken fields
   * persistent CompanyInfo
   */
  updateCompanyInfo(companyInfo): Promise<any> {
    return update("CompanyInfo", companyInfo);
  }

  /**
   * Updates QuickBooks version of CreditMemo
   *
   * @param  {object} creditMemo - The persistent CreditMemo, including Id and Synctoken fields
   * persistent CreditMemo
   */
  updateCreditMemo(creditMemo): Promise<any> {
    return update("CreditMemo", creditMemo);
  }

  /**
   * Updates QuickBooks version of Customer
   *
   * @param  {object} customer - The persistent Customer, including Id and Synctoken fields
   * persistent Customer
   */
  updateCustomer(customer): Promise<any> {
    return update("Customer", customer);
  }

  /**
   * Updates QuickBooks version of Department
   *
   * @param  {object} department - The persistent Department, including Id and Synctoken fields
   * persistent Department
   */
  updateDepartment(department): Promise<any> {
    return update("Department", department);
  }

  /**
   * Updates QuickBooks version of Deposit
   *
   * @param  {object} deposit - The persistent Deposit, including Id and Synctoken fields
   * persistent Deposit
   */
  updateDeposit(deposit): Promise<any> {
    return update("Deposit", deposit);
  }

  /**
   * Updates QuickBooks version of Employee
   *
   * @param  {object} employee - The persistent Employee, including Id and Synctoken fields
   * persistent Employee
   */
  updateEmployee(employee): Promise<any> {
    return update("Employee", employee);
  }

  /**
   * Updates QuickBooks version of Estimate
   *
   * @param  {object} estimate - The persistent Estimate, including Id and Synctoken fields
   * persistent Estimate
   */
  updateEstimate(estimate): Promise<any> {
    return update("Estimate", estimate);
  }

  /**
   * Updates QuickBooks version of Invoice
   *
   * @param  {object} invoice - The persistent Invoice, including Id and Synctoken fields
   * persistent Invoice
   */
  updateInvoice(invoice: QboOrder): Promise<any> {
    return update("Invoice", invoice);
  }

  /**
   * Updates QuickBooks version of Item
   *
   * @param  {object} item - The persistent Item, including Id and Synctoken fields
   * persistent Item
   */
  updateItem(item): Promise<any> {
    return update("Item", item);
  }

  /**
   * Updates QuickBooks version of JournalCode
   *
   * @param  {object} journalCode - The persistent JournalCode, including Id and Synctoken fields
   * persistent JournalCode
   */
  updateJournalCode(journalCode): Promise<any> {
    return update("JournalCode", journalCode);
  }

  /**
   * Updates QuickBooks version of JournalEntry
   *
   * @param  {object} journalEntry - The persistent JournalEntry, including Id and Synctoken fields
   * persistent JournalEntry
   */
  updateJournalEntry(journalEntry): Promise<any> {
    return update("JournalEntry", journalEntry);
  }

  /**
   * Updates QuickBooks version of Payment
   *
   * @param  {object} payment - The persistent Payment, including Id and Synctoken fields
   * persistent Payment
   */
  updatePayment(payment: Payment): Promise<any> {
    return update("Payment", payment);
  }

  /**
   * Updates QuickBooks version of PaymentMethod
   *
   * @param  {object} paymentMethod - The persistent PaymentMethod, including Id and Synctoken fields
   * persistent PaymentMethod
   */
  updatePaymentMethod(paymentMethod): Promise<any> {
    return update("PaymentMethod", paymentMethod);
  }

  /**
   * Updates QuickBooks version of Preferences
   *
   * @param  {object} preferences - The persistent Preferences, including Id and Synctoken fields
   * persistent Preferences
   */
  updatePreferences(preferences): Promise<any> {
    return update("Preferences", preferences);
  }

  /**
   * Updates QuickBooks version of Purchase
   *
   * @param  {object} purchase - The persistent Purchase, including Id and Synctoken fields
   * persistent Purchase
   */
  updatePurchase(purchase): Promise<any> {
    return update("Purchase", purchase);
  }

  /**
   * Updates QuickBooks version of PurchaseOrder
   *
   * @param  {object} purchaseOrder - The persistent PurchaseOrder, including Id and Synctoken fields
   * persistent PurchaseOrder
   */
  updatePurchaseOrder(purchaseOrder): Promise<any> {
    return update("PurchaseOrder", purchaseOrder);
  }

  /**
   * Updates QuickBooks version of RefundReceipt
   *
   * @param  {object} refundReceipt - The persistent RefundReceipt, including Id and Synctoken fields
   * persistent RefundReceipt
   */
  updateRefundReceipt(refundReceipt): Promise<any> {
    return update("RefundReceipt", refundReceipt);
  }

  /**
   * Updates QuickBooks version of SalesReceipt
   *
   * @param  {object} salesReceipt - The persistent SalesReceipt, including Id and Synctoken fields
   * persistent SalesReceipt
   */
  updateSalesReceipt(salesReceipt): Promise<any> {
    return update("SalesReceipt", salesReceipt);
  }

  /**
   * Updates QuickBooks version of TaxAgency
   *
   * @param  {object} taxAgency - The persistent TaxAgency, including Id and Synctoken fields
   * persistent TaxAgency
   */
  updateTaxAgency(taxAgency): Promise<any> {
    return update("TaxAgency", taxAgency);
  }

  /**
   * Updates QuickBooks version of TaxCode
   *
   * @param  {object} taxCode - The persistent TaxCode, including Id and Synctoken fields
   * persistent TaxCode
   */
  updateTaxCode(taxCode): Promise<any> {
    return update("TaxCode", taxCode);
  }

  /**
   * Updates QuickBooks version of TaxRate
   *
   * @param  {object} taxRate - The persistent TaxRate, including Id and Synctoken fields
   * persistent TaxRate
   */
  updateTaxRate(taxRate): Promise<any> {
    return update("TaxRate", taxRate);
  }

  /**
   * Updates QuickBooks version of Term
   *
   * @param  {object} term - The persistent Term, including Id and Synctoken fields
   * persistent Term
   */
  updateTerm(term): Promise<any> {
    return update("Term", term);
  }

  /**
   * Updates QuickBooks version of TimeActivity
   *
   * @param  {object} timeActivity - The persistent TimeActivity, including Id and Synctoken fields
   * persistent TimeActivity
   */
  updateTimeActivity(timeActivity): Promise<any> {
    return update("TimeActivity", timeActivity);
  }

  /**
   * Updates QuickBooks version of Transfer
   *
   * @param  {object} Transfer - The persistent Transfer, including Id and Synctoken fields
   * persistent Transfer
   */
  updateTransfer(transfer): Promise<any> {
    return update("Transfer", transfer);
  }

  /**
   * Updates QuickBooks version of Vendor
   *
   * @param  {object} vendor - The persistent Vendor, including Id and Synctoken fields
   * persistent Vendor
   */
  updateVendor(vendor): Promise<any> {
    return update("Vendor", vendor);
  }

  /**
   * Updates QuickBooks version of VendorCredit
   *
   * @param  {object} vendorCredit - The persistent VendorCredit, including Id and Synctoken fields
   * persistent VendorCredit
   */
  updateVendorCredit(vendorCredit): Promise<any> {
    return update("VendorCredit", vendorCredit);
  }

  /**
   * Updates QuickBooks version of ExchangeRate
   *
   * @param  {object} exchangeRate - The persistent ExchangeRate, including Id and Synctoken fields
   * persistent ExchangeRate
   */
  updateExchangeRate(exchangeRate): Promise<any> {
    return update("ExchangeRate", exchangeRate);
  }


  /**
   * delete_s the Attachable from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent Attachable to be delete_d, or the Id of the Attachable, in which case an extra GET request will be issued to first retrieve the Attachable
   * status of the persistent Attachable
   */
  delete_Attachable(idOrEntity): Promise<any> {
    return delete_("Attachable", idOrEntity);
  }

  /**
   * delete_s the Bill from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent Bill to be delete_d, or the Id of the Bill, in which case an extra GET request will be issued to first retrieve the Bill
   * status of the persistent Bill
   */
  delete_Bill(idOrEntity): Promise<any> {
    return delete_("Bill", idOrEntity);
  }

  /**
   * delete_s the BillPayment from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent BillPayment to be delete_d, or the Id of the BillPayment, in which case an extra GET request will be issued to first retrieve the BillPayment
   * status of the persistent BillPayment
   */
  delete_BillPayment(idOrEntity): Promise<any> {
    return delete_("BillPayment", idOrEntity);
  }

  /**
   * delete_s the CreditMemo from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent CreditMemo to be delete_d, or the Id of the CreditMemo, in which case an extra GET request will be issued to first retrieve the CreditMemo
   * status of the persistent CreditMemo
   */
  delete_CreditMemo(idOrEntity): Promise<any> {
    return delete_("CreditMemo", idOrEntity);
  }

  /**
   * delete_s the Deposit from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent Deposit to be delete_d, or the Id of the Deposit, in which case an extra GET request will be issued to first retrieve the Deposit
   * status of the persistent Deposit
   */
  delete_Deposit(idOrEntity): Promise<any> {
    return delete_("Deposit", idOrEntity);
  }

  /**
   * delete_s the Estimate from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent Estimate to be delete_d, or the Id of the Estimate, in which case an extra GET request will be issued to first retrieve the Estimate
   * status of the persistent Estimate
   */
  delete_Estimate(idOrEntity): Promise<any> {
    return delete_("Estimate", idOrEntity);
  }

  /**
   * delete_s the Invoice from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent Invoice to be delete_d, or the Id of the Invoice, in which case an extra GET request will be issued to first retrieve the Invoice
   * status of the persistent Invoice
   */
  delete_Invoice(idOrEntity): Promise<any> {
    return delete_("Invoice", idOrEntity);
  }

  /**
   * delete_s the JournalCode from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent JournalCode to be delete_d, or the Id of the JournalCode, in which case an extra GET request will be issued to first retrieve the JournalCode
   * status of the persistent JournalCode
   */
  delete_JournalCode(idOrEntity): Promise<any> {
    return delete_("JournalCode", idOrEntity);
  }

  /**
   * delete_s the JournalEntry from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent JournalEntry to be delete_d, or the Id of the JournalEntry, in which case an extra GET request will be issued to first retrieve the JournalEntry
   * status of the persistent JournalEntry
   */
  delete_JournalEntry(idOrEntity): Promise<any> {
    return delete_("JournalEntry", idOrEntity);
  }

  /**
   * delete_s the Payment from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent Payment to be delete_d, or the Id of the Payment, in which case an extra GET request will be issued to first retrieve the Payment
   * status of the persistent Payment
   */
  delete_Payment(idOrEntity): Promise<any> {
    return delete_("Payment", idOrEntity);
  }

  /**
   * delete_s the Purchase from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent Purchase to be delete_d, or the Id of the Purchase, in which case an extra GET request will be issued to first retrieve the Purchase
   * status of the persistent Purchase
   */
  delete_Purchase(idOrEntity): Promise<any> {
    return delete_("Purchase", idOrEntity);
  }

  /**
   * delete_s the PurchaseOrder from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent PurchaseOrder to be delete_d, or the Id of the PurchaseOrder, in which case an extra GET request will be issued to first retrieve the PurchaseOrder
   * status of the persistent PurchaseOrder
   */
  delete_PurchaseOrder(idOrEntity): Promise<any> {
    return delete_("PurchaseOrder", idOrEntity);
  }

  /**
   * delete_s the RefundReceipt from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent RefundReceipt to be delete_d, or the Id of the RefundReceipt, in which case an extra GET request will be issued to first retrieve the RefundReceipt
   * status of the persistent RefundReceipt
   */
  delete_RefundReceipt(idOrEntity): Promise<any> {
    return delete_("RefundReceipt", idOrEntity);
  }

  /**
   * delete_s the SalesReceipt from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent SalesReceipt to be delete_d, or the Id of the SalesReceipt, in which case an extra GET request will be issued to first retrieve the SalesReceipt
   * status of the persistent SalesReceipt
   */
  delete_SalesReceipt(idOrEntity): Promise<any> {
    return delete_("SalesReceipt", idOrEntity);
  }

  /**
   * delete_s the TimeActivity from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent TimeActivity to be delete_d, or the Id of the TimeActivity, in which case an extra GET request will be issued to first retrieve the TimeActivity
   * status of the persistent TimeActivity
   */
  delete_TimeActivity(idOrEntity): Promise<any> {
    return delete_("TimeActivity", idOrEntity);
  }

  /**
   * delete_s the Transfer from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent Transfer to be delete_d, or the Id of the Transfer, in which case an extra GET request will be issued to first retrieve the Transfer
   * status of the persistent Transfer
   */
  delete_Transfer(idOrEntity): Promise<any> {
    return delete_("Transfer", idOrEntity);
  }

  /**
   * delete_s the VendorCredit from QuickBooks
   *
   * @param  {object} idOrEntity - The persistent VendorCredit to be delete_d, or the Id of the VendorCredit, in which case an extra GET request will be issued to first retrieve the VendorCredit
   * status of the persistent VendorCredit
   */
  delete_VendorCredit(idOrEntity): Promise<any> {
    return delete_("VendorCredit", idOrEntity);
  }


  /**
   * Finds all Accounts in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Account
   */
  findAccounts(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("account", criteria);
  }

  /**
   * Finds all Attachables in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Attachable
   */
  findAttachables(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("attachable", criteria);
  }

  /**
   * Finds all Bills in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Bill
   */
  findBills(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("bill", criteria);
  }

  /**
   * Finds all BillPayments in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of BillPayment
   */
  findBillPayments(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("billPayment", criteria);
  }

  /**
   * Finds all Budgets in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Budget
   */
  findBudgets(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("budget", criteria);
  }

  /**
   * Finds all Classs in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Class
   */
  findClasses(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("class", criteria);
  }

  /**
   * Finds all CompanyInfos in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of CompanyInfo
   */
  findCompanyInfos(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("companyInfo", criteria);
  }

  /**
   * Finds all CreditMemos in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of CreditMemo
   */
  findCreditMemos(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("creditMemo", criteria);
  }

  /**
   * Finds all Customers in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Customer
   */
  findCustomers(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("customer", criteria);
  }

  /**
   * Finds all Departments in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Department
   */
  findDepartments(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("department", criteria);
  }

  /**
   * Finds all Deposits in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Deposit
   */
  findDeposits(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("deposit", criteria);
  }

  /**
   * Finds all Employees in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Employee
   */
  findEmployees(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("employee", criteria);
  }

  /**
   * Finds all Estimates in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Estimate
   */
  findEstimates(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("estimate", criteria);
  }

  /**
   * Finds all Invoices in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Invoice
   */
  findInvoices(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("invoice", criteria);
  }

  /**
   * Finds all Items in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Item
   */
  findItems(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("item", criteria);
  }

  /**
   * Finds all JournalCodes in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of JournalCode
   */
  findJournalCodes(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("journalCode", criteria);
  }

  /**
   * Finds all JournalEntrys in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of JournalEntry
   */
  findJournalEntries(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("journalEntry", criteria);
  }

  /**
   * Finds all Payments in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Payment
   */
  findPayments(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("payment", criteria);
  }

  /**
   * Finds all PaymentMethods in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of PaymentMethod
   */
  findPaymentMethods(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("paymentMethod", criteria);
  }

  /**
   * Finds all Preferencess in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Preferences
   */
  findPreferenceses(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("preferences", criteria);
  }

  /**
   * Finds all Purchases in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Purchase
   */
  findPurchases(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("purchase", criteria);
  }

  /**
   * Finds all PurchaseOrders in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of PurchaseOrder
   */
  findPurchaseOrders(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("purchaseOrder", criteria);
  }

  /**
   * Finds all RefundReceipts in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of RefundReceipt
   */
  findRefundReceipts(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("refundReceipt", criteria);
  }

  /**
   * Finds all SalesReceipts in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of SalesReceipt
   */
  findSalesReceipts(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("salesReceipt", criteria);
  }

  /**
   * Finds all TaxAgencys in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of TaxAgency
   */
  findTaxAgencies(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("taxAgency", criteria);
  }

  /**
   * Finds all TaxCodes in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of TaxCode
   */
  findTaxCodes(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("taxCode", criteria);
  }

  /**
   * Finds all TaxRates in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of TaxRate
   */
  findTaxRates(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("taxRate", criteria);
  }

  /**
   * Finds all Terms in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Term
   */
  findTerms(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("term", criteria);
  }

  /**
   * Finds all TimeActivitys in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of TimeActivity
   */
  findTimeActivities(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("timeActivity", criteria);
  }

  /**
   * Finds all Transfers in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Transfer
   */
  findTransfers(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("transfer", criteria);
  }

  /**
   * Finds all Vendors in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of Vendor
   */
  findVendors(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("vendor", criteria);
  }

  /**
   * Finds all VendorCredits in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of VendorCredit
   */
  findVendorCredits(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("vendorCredit", criteria);
  }

  /**
   * Finds all ExchangeRates in QuickBooks, optionally matching the specified criteria
   *
   * @param  {object} criteria - (Optional) String or single-valued map converted to a where clause of the form "where key = 'value'"
   * list of ExchangeRates
   */
  findExchangeRates(criteria: Querycriteria | Array<Querycriteria>): Promise<any> {
    return query("exchangerate", criteria);
  }


  /**
   * Retrieves the BalanceSheet Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * BalanceSheet Report
   */
  reportBalanceSheet(options): Promise<any> {
    return report("BalanceSheet", options);
  }

  /**
   * Retrieves the ProfitAndLoss Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * ProfitAndLoss Report
   */
  reportProfitAndLoss(options): Promise<any> {
    return report("ProfitAndLoss", options);
  }

  /**
   * Retrieves the ProfitAndLossDetail Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * ProfitAndLossDetail Report
   */
  reportProfitAndLossDetail(options): Promise<any> {
    return report("ProfitAndLossDetail", options);
  }

  /**
   * Retrieves the TrialBalance Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * TrialBalance Report
   */
  reportTrialBalance(options): Promise<any> {
    return report("TrialBalance", options);
  }

  /**
   * Retrieves the CashFlow Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * CashFlow Report
   */
  reportCashFlow(options): Promise<any> {
    return report("CashFlow", options);
  }

  /**
   * Retrieves the InventoryValuationSummary Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * InventoryValuationSummary Report
   */
  reportInventoryValuationSummary(options): Promise<any> {
    return report("InventoryValuationSummary", options);
  }

  /**
   * Retrieves the CustomerSales Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * CustomerSales Report
   */
  reportCustomerSales(options): Promise<any> {
    return report("CustomerSales", options);
  }

  /**
   * Retrieves the ItemSales Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * ItemSales Report
   */
  reportItemSales(options): Promise<any> {
    return report("ItemSales", options);
  }

  /**
   * Retrieves the CustomerIncome Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * CustomerIncome Report
   */
  reportCustomerIncome(options): Promise<any> {
    return report("CustomerIncome", options);
  }

  /**
   * Retrieves the CustomerBalance Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * CustomerBalance Report
   */
  reportCustomerBalance(options): Promise<any> {
    return report("CustomerBalance", options);
  }

  /**
   * Retrieves the CustomerBalanceDetail Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * CustomerBalanceDetail Report
   */
  reportCustomerBalanceDetail(options): Promise<any> {
    return report("CustomerBalanceDetail", options);
  }

  /**
   * Retrieves the AgedReceivables Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * AgedReceivables Report
   */
  reportAgedReceivables(options): Promise<any> {
    return report("AgedReceivables", options);
  }

  /**
   * Retrieves the AgedReceivableDetail Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * AgedReceivableDetail Report
   */
  reportAgedReceivableDetail(options): Promise<any> {
    return report("AgedReceivableDetail", options);
  }

  /**
   * Retrieves the VendorBalance Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * VendorBalance Report
   */
  reportVendorBalance(options): Promise<any> {
    return report("VendorBalance", options);
  }

  /**
   * Retrieves the VendorBalanceDetail Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * VendorBalanceDetail Report
   */
  reportVendorBalanceDetail(options): Promise<any> {
    return report("VendorBalanceDetail", options);
  }

  /**
   * Retrieves the AgedPayables Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * AgedPayables Report
   */
  reportAgedPayables(options): Promise<any> {
    return report("AgedPayables", options);
  }

  /**
   * Retrieves the AgedPayableDetail Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * AgedPayableDetail Report
   */
  reportAgedPayableDetail(options): Promise<any> {
    return report("AgedPayableDetail", options);
  }

  /**
   * Retrieves the VendorExpenses Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * VendorExpenses Report
   */
  reportVendorExpenses(options): Promise<any> {
    return report("VendorExpenses", options);
  }

  /**
   * Retrieves the TransactionList Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * TransactionList Report
   */
  reportTransactionList(options): Promise<any> {
    return report("TransactionList", options);
  }

  /**
   * Retrieves the GeneralLedgerDetail Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * GeneralLedgerDetail Report
   */
  reportGeneralLedgerDetail(options): Promise<any> {
    return report("GeneralLedger", options);
  }

  /**
   * Retrieves the TaxSummary Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * TaxSummary Report
   */
  reportTaxSummary(options): Promise<any> {
    return report("TaxSummary", options);
  }

  /**
   * Retrieves the DepartmentSales Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * DepartmentSales Report
   */
  reportDepartmentSales(options): Promise<any> {
    return report("DepartmentSales", options);
  }

  /**
   * Retrieves the ClassSales Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * ClassSales Report
   */
  reportClassSales(options): Promise<any> {
    return report("ClassSales", options);
  }

  /**
   * Retrieves the AccountListDetail Report from QuickBooks
   *
   * @param  {object} options - (Optional) Map of key-value pairs passed as options to the Report
   * AccountListDetail Report
   */
  reportAccountListDetail(options): Promise<any> {
    return report("AccountList", options);
  }


}

// **********************  Query Api **********************
// function count(obj, url) {
//   for (let p in obj) {
//     if (obj[p] && p.toLowerCase() === "count") {
//       url = url.replace("select \* from", "select count(*) from");
//       delete obj[p];
//     }
//   }
// }


// **********************  Report Api **********************
function report(reportType, criteria): Promise<any> {
  let url = "/reports/" + reportType;
  if (criteria && typeof criteria !== "function") {
    url += reportCriteria(criteria) || "";
  }
  return request("get", { url: url }, criteria);
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function checkProperty(field, name) {
  return (field && field.toLowerCase() === name);
}

function toCriterion(c) {
  const fields = Object.keys(c);
  if (_.intersection(fields, ["field", "value"]).length === 2) {
    return {
      field: c.field,
      value: c.value,
      operator: c.operator || "="
    };
  } else {
    return fields.map(function (k) {
      return {
        field: k,
        value: c[k],
        operator: Array.isArray(c[k]) ? "IN" : "="
      };
    });
  }
}

function criteriaToString(criteria) {
  if (typeof criteria === "string") {
    return criteria.indexOf(" ") === 0 ? criteria : " " + criteria;
  }
  const cs = Array.isArray(criteria) ? criteria.map(toCriterion) : toCriterion(criteria);
  const flattened = _.flatten([cs]);
  let sql = "", limit, offset, desc, asc;
  for (let i = 0, l = flattened.length; i < l; i++) {
    const criterion = flattened[i];
    if (checkProperty(criterion.field, "fetchall")) {
      continue;
    }
    if (checkProperty(criterion.field, "limit")) {
      limit = criterion.value;
      continue;
    }
    if (checkProperty(criterion.field, "offset")) {
      offset = criterion.value;
      continue;
    }
    if (checkProperty(criterion.field, "desc")) {
      desc = criterion.value;
      continue;
    }
    if (checkProperty(criterion.field, "asc")) {
      asc = criterion.value;
      continue;
    }
    if (sql !== "") {
      sql += " and ";
    }
    sql += criterion.field + " " + criterion.operator + " ";
    if (Array.isArray(criterion.value)) {
      sql += "(" + criterion.value.map(quote).join(",") + ")";
    } else {
      sql += quote(criterion.value);
    }
  }
  if (sql !== "") {
    sql = " where " + sql;
  }
  if (asc) {
    sql += " orderby " + asc + " asc";
  }
  if (desc) {
    sql += " orderby " + desc + " desc";
  }
  sql += " startposition " + (offset || 1);
  sql += " maxresults " + (limit || 1000);
  return sql;
}

function reportCriteria(criteria) {
  let s = "?";
  for (const p in criteria) {
    s += p + "=" + criteria[p] + "&";
  }
  return s;
}

function capitalize(s) {
  return s.substring(0, 1).toUpperCase() + s.substring(1);
}

function quote(x) {
  return _.isString(x) ? "'" + x.replace(/'/g, "\\'") + "'" : x;
}

function pluralize(s) {
  const last = s.substring(s.length - 1);
  if (last === "s") {
    return s + "es";
  } else if (last === "y") {
    return s.substring(0, s.length - 1) + "ies";
  } else {
    return s + "s";
  }
}


function unwrap(entityName) {
  return capitalize(entityName);
}

// **********************  CRUD Api **********************
function create(entityName: QbTypes, entity): Promise<any> {
  const url = "/" + entityName.toLowerCase();
  return request("post", { url: url }, entity);
}

function read(entityName, id: string): Promise<any> {
  let url = "/" + entityName.toLowerCase();
  if (id) {
    url = url + "/" + id;
  }
  return request("get", { url: url }, unwrap(entityName));
}

function update(entityName: QbTypes, entity): Promise<any> {
  if (debug) {
    console.log(`updating ${entityName}`);
    // console.log(entity);
    // console.log(entity.Id, entity.SyncToken);
  }

  if (!entity.Id || !entity.SyncToken) {
    if (entityName !== "ExchangeRate") {
      throw new Error(entityName + " must contain Id and Synctoken fields: " +
        util.inspect(entity, { showHidden: false, depth: null }));
    }
  }
  if (!entity.hasOwnProperty("sparse")) {
    entity.sparse = true;
  }
  const url = "/" + entityName.toLowerCase() + "?operation=update";
  const opts: any = { url: url };
  if (entity.void && entity.void.toString() === "true") {
    opts.qs = { include: "void" };
    delete entity.void;
  }
  return request("post", opts, entity);
}

function delete_(entityName: QbTypes, idOrEntity): Promise<any> {
  const url = "/" + entityName.toLowerCase() + "?operation=delete";
  if (_.isObject(idOrEntity)) {
    return request("post", { url: url }, idOrEntity);
  } else {
    return read(entityName, idOrEntity).then(result => {
      /**
       * Capitalize the first letter like qbo response body
       */
      return request("post", { url: url }, result[unwrap(entityName)]);
    });
  }
}

function query(entity, criteria: Array<Querycriteria> | Querycriteria) {
  let url = "/query?query@@select * from " + entity;
  const count = function (obj) {
    for (const p in obj) {
      if (obj[p] && p.toLowerCase() === "count") {
        url = url.replace("select \* from", "select count(*) from");
        delete obj[p];
      }
    }
  };
  count(criteria);
  if (Array.isArray(criteria)) {
    for (let i = 0; i < criteria.length; i++) {
      if (typeof criteria === "object") {
        const j = Object.keys(criteria[i]).length;
        count(criteria[i]);
        if (j !== Object.keys(criteria[i]).length) {
          criteria.splice(i, i + 1);
        }
      }
    }
  }

  let fetchAll = false, limit = 1000, offset = 1;
  if (Array.isArray(criteria)) {
    const lmt = _.find(criteria, function (obj) {
      return obj.field && obj.field === "limit";
    });
    if (lmt) {
      limit = Number(lmt.value);
    }
    const ofs = _.find(criteria, function (obj) {
      return obj.field && obj.field === "offset";
    });
    if (!ofs) {
      criteria.push({ field: "offset", value: 1 });
    } else {
      offset = Number(ofs.value);
    }
    const fa = _.find(criteria, function (obj) {
      return obj.field && obj.field === "fetchAll";
    });
    if (fa && fa.value) {
      fetchAll = true;
    }
  } else if (typeof criteria === "object") {
    limit = criteria.limit = criteria.limit || 1000;
    offset = criteria.offset = criteria.offset || 1;
    if (criteria.fetchAll) {
      fetchAll = true;
    }
  }

  if (criteria && !_.isFunction(criteria)) {
    url += criteriaToString(criteria) || "";
    url = url.replace(/%/g, "%25")
      .replace(/'/g, "%27")
      .replace(/=/g, "%3D")
      .replace(/</g, "%3C")
      .replace(/>/g, "%3E")
      .replace(/&/g, "%26")
      .replace(/#/g, "%23")
      .replace(/\\/g, "%5C")
      .replace(/\+/g, "%2B");
  }
  url = url.replace("@@", "=");
  return new Promise(function (resolve, reject) {

    return request("get", { url: url }, null).then(function (data) {
      const fields = Object.keys(data.QueryResponse);
      const key = _.find(fields, function (k) {
        return k.toLowerCase() === entity.toLowerCase();
      });
      if (fetchAll) {
        if (data && data.QueryResponse && data.QueryResponse.maxResults === limit) {
          if (Array.isArray(criteria)) {
            _.each(criteria, function (e) {
              if (e.field === "offset") {
                e.value = Number(e.value) + limit;
              }
            });
          } else if (!Array.isArray(criteria)) {
            criteria.offset = criteria.offset + limit;
          }
          query(entity, criteria).then(more => {
            data.QueryResponse[key] = data.QueryResponse[key].concat(more["QueryResponse"][key] || []);
            data.QueryResponse.maxResults = data.QueryResponse.maxResults + (more["QueryResponse"].maxResults || 0);
            data.time = more["time"] || data.time;
            resolve(data);
          }).catch(err => {
            reject(err);
          });
        } else {
          resolve(data);
        }
      } else {
        resolve(data);
      }
    }).catch(function (err) {
      reject(err);
    });
  });
}


function resolver(functiontoresolve) {
  return new Promise((resolve, reject) => {
    functiontoresolve.then(result => {
      resolve(result);
    }).catch(err => {
      reject(err);
    });
  });
}



function request(verb: string, options: any, entity): Promise<any> {
  let url = endpoint + realmId + options.url;
  if (options.url === RECONNECT_URL || options.url === DISCONNECT_URL) {
    url = options.url;
  }
  const opts = {
    method: verb,
    url: url,
    qs: options.qs || {},
    headers: options.headers || {},
    json: true
  };
  opts.qs.minorversion = opts.qs.minorversion || minorversion;
  opts.headers["User-Agent"] = "node-quickbooks: version " + version;
  opts.headers["Request-Id"] = uuid.v1();
  opts.qs.format = "json";
  opts.headers["Authorization"] = "Bearer " + token;
  if (options.url.match(/pdf$/)) {
    opts.headers["accept"] = "application/pdf";
    opts["encoding"] = null;
  }
  if (entity !== null) {
    opts["body"] = entity;
  }
  if (options.formData) {
    opts["formData"] = options.formData;
  }
  return new Promise(function (resolve, reject) {
    // if (!token) reject('null token')
    requester(opts, (err, res, body) => {
      if (debug) {
        console.log("invoking endpoint: " + url);
        console.log(util.inspect(entity, false, null, false /* enable colors */) || "");
        // console.log(opts)
        console.log(util.inspect(body, false, null, false /* enable colors */));
      }
      if (err ||
        res.statusCode >= 300 ||
        (_.isObject(body) && body.Fault && body.Fault.Error && body.Fault.Error.length) ||
        (_.isString(body) && !_.isEmpty(body) && body.indexOf('<') === 0)) {
        reject(body || err);
      } else {
        resolve(body);
      }

    });

  });
}
