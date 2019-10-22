//This is te universal model to be used with cloud firestore
import { firestore } from "firebase";

export type fuelTypes = "pms" | "ago" | "ik"

export const inituser = {
  name: null,
  time: null,
  uid: null
};
export type User = {
  uid: string,
  name: string,
  time: firestore.Timestamp,
}

export interface Metadata {
  /**
   * Sometimes we may just want to modify the last edited date
   */
  created?: Meta;
  edited: Meta;
}

export interface Meta {
  date: Date;
  adminId: string;
}
export const emptymetadata: Metadata = {
  created: null,
  edited: null,
};

export interface ipnmodel {
  billNumber: string,
  billAmount: number,
  currencyCode: "KES",
  customerRefNumber: number,
  bankreference: string,
  tranParticular: string,
  paymentMode: string,
  phonenumber: number,
  debitaccount: number,
  debitcustname: string,
  passwowrd: string,
  username: string,
  transactionDate: Date
  daudiFields: {
    companyid: string,
    sandbox: boolean,
    /**
     * 0 : empty company
     * 1 : unprocessed
     * 2 : complete
     * 3 : error
     * 48 : special code to tell cloud functions to process the payment
     */
    status: 0 | 1 | 2 | 3 | 48,
    error?: any,
    errordetail?: any,
    approvedby?: User,
    bank: "equity" | "kcb",
  }
}


export type QbTypes =
  "Account" |
  "Attachable" |
  "Batch" |
  "Bill" |
  "BillPayment" |
  "Budget" |
  "ChangeDataCapture" |
  "Class" |
  "CompanyInfo" |
  "CreditMemo" |
  "Customer" |
  "Department" |
  "Deposit" |
  "Employee" |
  "Estimate" |
  "Invoice" |
  "Item" |
  "JournalEntry" |
  "Payment" |
  "PaymentMethod" |
  "Preferences" |
  "Purchase" |
  "PurchaseOrder" |
  "RefundReceipt" |
  "Reports" |
  "SalesReceipt" |
  "TaxAgency" |
  "TaxCode" |
  "TaxRate" |
  "TaxService" |
  "Term" |
  "TimeActivity" |
  "Transfer" |
  "Vendor" |
  "VendorCredit"

export const zmprovinces = [
  {
    id: 1, name: "Central Zambia", fine: [
      { id: "30-1", name: "Baringo Central" }
    ]
  },
  {
    id: 2, name: "Copperbelt", fine: [
      { id: "30-1", name: "Baringo Central" }
    ]
  },
  {
    id: 3, name: "East Zambia", fine: [
      { id: "30-1", name: "Baringo Central" }
    ]
  },
  {
    id: 4, name: "Luapula", fine: [
      { id: "30-1", name: "Baringo Central" }
    ]
  },
  {
    id: 5, name: "Lusaka", fine: [
      { id: "30-1", name: "Baringo Central" }
    ]
  },
  {
    id: 6, name: "Muchinga", fine: [
      { id: "30-1", name: "Baringo Central" }
    ]
  },
  {
    id: 7, name: "Northwest Zambia", fine: [
      { id: "30-1", name: "Baringo Central" }
    ]
  },
  {
    id: 8, name: "North Zambia", fine: [
      { id: "30-1", name: "Baringo Central" }
    ]
  },
  {
    id: 9, name: "South Zambia", fine: [
      { id: "30-1", name: "Baringo Central" }
    ]
  },
  {
    id: 10, name: "West Zambia", fine: [
      { id: "30-1", name: "Baringo Central" }
    ]
  }
];
export const kecounties = [
  {
    id: 30, name: "Baringo", fine: [//Baringo
      { id: "30-1", name: "Baringo Central" },
      { id: "30-2", name: "Baringo North" },
      { id: "30-3", name: "Baringo South" },
      { id: "30-4", name: "Eldama Ravine" },
      { id: "30-5", name: "Mogotio" },
      { id: "30-6", name: "Tiaty" }
    ]
  },
  {
    id: 36, name: "Bomet", fine: [//Bomet
      { id: "36-1", name: "Baringo Central" },
      { id: "36-2", name: "Baringo East" },
      { id: "36-3", name: "Chepalungu" },
      { id: "36-4", name: "Konoin" },
      { id: "36-5", name: "Sotik" }
    ]
  },
  {
    id: 39, name: "Bungoma", fine: [//Bungoma
      { id: "39-1", name: "Baringo Central" },
      { id: "39-2", name: "Baringo East" },
      { id: "39-3", name: "Chepalungu" },
      { id: "39-4", name: "Konoin" },
      { id: "39-5", name: "Sotik" }
    ]
  },
  {
    id: 40, name: "Busia", fine: [
      //Busia
      { id: "40-1", name: "Budalangi" },
      { id: "40-2", name: "Butula" },
      { id: "40-3", name: "Funyula" },
      { id: "40-4", name: "Matayos" },
      { id: "40-5", name: "Nambale" },
      { id: "40-6", name: "Matayos" },
      { id: "40-7", name: "Nambale" }
    ]
  },
  {
    id: 28, name: "Elgeyo Marakwet", fine: [ //Elgeyo Marakwet
      { id: "28-1", name: "Keiyo North" },
      { id: "28-2", name: "Keiyo South" },
      { id: "28-3", name: "Marakwet East" },
      { id: "28-4", name: "Marakwet West" }
    ]
  },
  {
    id: 14, name: "Embu", fine: [
      //Embu
      { id: "14-1", name: "Manyatta" },
      { id: "14-2", name: "Mbeere North" },
      { id: "14-3", name: "Mbeere South" },
      { id: "14-4", name: "Runyenjes" }
    ]
  },
  {
    id: 7, name: "Garissa", fine: [
      //Garissa
      { id: "7-1", name: "Dadaab" },
      { id: "7-2", name: "Fafi" },
      { id: "7-3", name: "Garissa Township" },
      { id: "7-4", name: "Ijaara" },
      { id: "7-5", name: "Lagdera" },
      { id: "7-6", name: "Hulugho" }
    ]
  },
  {
    id: 43, name: "Homa Bay", fine: [

      //Homa Bay
      { id: "43-1", name: "Mbita" },
      { id: "43-2", name: "Ndhiwa" },
      { id: "43-3", name: "HB Town" },
      { id: "43-4", name: "Rangwe" },
      { id: "43-5", name: "Karachuonyo" },
      { id: "43-6", name: "Kabondo" },
      { id: "43-5", name: "Kasipul" },
      { id: "43-6", name: "Suba" }
    ]
  },
  {
    id: 11, name: "Isiolo", fine: [
      //   //Isiolo
      { id: "11-1", name: "Central" },
      { id: "11-2", name: "Garba Tula" },
      { id: "11-3", name: "Kinna" },
      { id: "11-4", name: "Merti" },
      { id: "11-5", name: "Oldonyiro" },
      { id: "11-6", name: "Sericho" }

    ]
  },
  {
    id: 34, name: "Kajiado", fine: [
      //   //Kajiado
      { id: "34-1", name: "Isinya" },
      { id: "34-2", name: "Kajiado Central" },
      { id: "34-3", name: "Kajiado North" },
      { id: "34-4", name: "Loitoktok" },
      { id: "34-5", name: "Mashuuru" }
    ]
  },
  {
    id: 37, name: "Kakamega", fine: [

      //   //Kakamega
      { id: "37-1", name: "Butere" },
      { id: "37-2", name: "Khwisero" },
      { id: "37-3", name: "Kakamega Central" },
      { id: "37-4", name: "Kakamega East" },
      { id: "37-5", name: "Kakamega North" },
      { id: "37-6", name: "Kakamega South" },
      { id: "37-7", name: "Likuyani" },
      { id: "37-8", name: "Lugari" },
      { id: "37-9", name: "Matete" },
      { id: "37-10", name: "Matungu" },
      { id: "37-11", name: "Mumias" },
      { id: "37-12", name: "Navakholo" }


    ]
  },
  {
    id: 35, name: "Kericho", fine: [
      //   //Kericho
      { id: "35-1", name: "Ainamoi" },
      { id: "35-2", name: "Belgut" },
      { id: "35-3", name: "Bureti" },
      { id: "35-4", name: "Kipkelion East" },
      { id: "35-5", name: "Kipkelion West" },
      { id: "35-6", name: "Sigowet" }
    ]
  },
  {
    id: 22, name: "Kiambu", fine: [
      //   //Kiambu
      { id: "22-1", name: "Limuru" },
      { id: "22-2", name: "Kikuyu" },
      { id: "22-3", name: "Kabete" },
      { id: "22-4", name: "Gatundu South" },
      { id: "22-5", name: "Gatundu North" },
      { id: "22-6", name: "Githunguri" },
      { id: "22-7", name: "Kiambu" },
      { id: "22-8", name: "Kiambaa" },
      { id: "22-9", name: "Ruiru" },
      { id: "22-10", name: "Juja" },
      { id: "22-11", name: "Thika Town" },
      { id: "22-12", name: "Lari" }
    ]
  },
  {
    id: 3, name: "Kilifi", fine: [

      //   //Kilifi
      { id: "3-1", name: "Kilifi" },
      { id: "3-2", name: "Ganze" },
      { id: "3-3", name: "Malindi" },
      { id: "3-4", name: "Magarini" },
      { id: "3-5", name: "Rabai" },
      { id: "3-6", name: "Kaloleni" }
    ]
  },
  {
    id: 20, name: "Kirinyaga", fine: [
      //   //Kirinyaga
      { id: "20-1", name: "Kirinyaga Central" },
      { id: "20-2", name: "Kirinyaga East" },
      { id: "20-3", name: "Kirinyaga West" },
      { id: "20-4", name: "Mwea East" },
      { id: "20-5", name: "Mwea West" }
    ]
  },
  {
    id: 45, name: "Kisii", fine: [
      //Kisii
      { id: "45-1", name: "Bobasi" },
      { id: "45-2", name: "Bonchari" },
      { id: "45-3", name: "Bomachoge Borabu" },
      { id: "45-4", name: "Bomachoge Chache" },
      { id: "45-5", name: "Kitutu Chache North" },
      { id: "45-6", name: "Kitutu Chache South" },
      { id: "45-7", name: "Nyaribari Chache" },
      { id: "45-8", name: "Nyaribari Masaba" }
    ]
  },
  {
    id: 42, name: "Kisumu", fine: [
      //Kisumu
      { id: "42-1", name: "Kisumu Central" },
      { id: "42-2", name: "Kisumu East" },
      { id: "42-3", name: "Kisumu West" },
      { id: "42-4", name: "Muhoroni" },
      { id: "42-5", name: "Nyakach" },
      { id: "42-6", name: "Nyando" },
      { id: "42-7", name: "Seme" }
    ]
  },
  {
    id: 15, name: "Kitui", fine: [
      //Kitui
      { id: "15-1", name: "Kitui Central" },
      { id: "15-2", name: "Kitui East" },
      { id: "15-3", name: "Kitui West" },
      { id: "15-4", name: "Kitui South" },
      { id: "15-5", name: "Kitui Rural" },
      { id: "15-6", name: "Mwingi Central" },
      { id: "15-7", name: "Mwingi West" }


    ]
  },
  {
    id: 2, name: "Kwale", fine: [
      //Kwale
      { id: "2-1", name: "Kinango" },
      { id: "2-2", name: "Lunga Lunga" },
      { id: "2-3", name: "Matuga" },
      { id: "2-4", name: "Msambweni" }
    ]
  },
  {
    id: 31, name: "Laikipia", fine: [
      //Laikipia
      { id: "31-1", name: "Laikipia East" },
      { id: "31-2", name: "Laikipia West" },
      { id: "31-3", name: "Laikipia North" }

    ]
  },
  {
    id: 5, name: "Lamu", fine: [
      //Lamu
      { id: "5-1", name: "Lamu East" },
      { id: "5-2", name: "Lamu West" }
    ]
  },
  {
    id: 16, name: "Machakos", fine: [
      //Machakos
      { id: "16-1", name: "Kangundo" },
      { id: "16-2", name: "Kathiani" },
      { id: "16-3", name: "Machakos Town" },
      { id: "16-4", name: "Masinga" },
      { id: "16-5", name: "Matungulu" },
      { id: "16-6", name: "Mavoko" },
      { id: "16-7", name: "Mwala" },
      { id: "16-8", name: "Yatta" }
    ]
  },
  {
    id: 17, name: "Makueni", fine: [
      //Makueni
      { id: "17-1", name: "Kaiti" },
      { id: "17-2", name: "Kibwezi East" },
      { id: "17-3", name: "Kibwezi West" },
      { id: "17-4", name: "Kilome" },
      { id: "17-5", name: "Makueni" },
      { id: "17-6", name: "Mbooni" }
    ]
  },
  {
    id: 9, name: "Mandera", fine: [
      //Mandera
      { id: "9-1", name: "Banisa" },
      { id: "9-2", name: "Lafey" },
      { id: "9-3", name: "Mandera East" },
      { id: "9-4", name: "Mandera West" },
      { id: "9-5", name: "Mandera North" },
      { id: "9-6", name: "Mandera South" }
    ]
  },
  {
    id: 10, name: "Marsabit", fine: [
      //Marsabit
      { id: "10-1", name: "Laisamis" },
      { id: "10-2", name: "Moyale" },
      { id: "10-3", name: "North Horr" },
      { id: "10-4", name: "Saku" }
    ]
  },
  {
    id: 12, name: "Meru", fine: [
      //Meru
      { id: "12-1", name: "Buuri" },
      { id: "12-2", name: "Central Imenti" },
      { id: "12-3", name: "Igembe Central" },
      { id: "12-4", name: "Igembe South" },
      { id: "12-5", name: "Igembe North" },
      { id: "12-6", name: "North Imenti" },
      { id: "12-7", name: "Tigania East" },
      { id: "12-8", name: "Tigania West" }
    ]
  },
  {
    id: 44, name: "Migori", fine: [
      //Migori
      { id: "44-1", name: "Nyatike" },
      { id: "44-2", name: "Migori" },
      { id: "44-3", name: "Rongo" },
      { id: "44-4", name: "Uriri" }
    ]
  },
  {
    id: 1, name: "Mombasa", fine: [
      //Mombasa
      { id: "12-1", name: "Changamwe" },
      { id: "12-2", name: "Kisauni" },
      { id: "12-3", name: "Likoni" },
      { id: "12-4", name: "Mombasa Island" }
    ]
  },
  {
    id: 21, name: "Muranga", fine: [
      //Murang'a
      { id: "21-1", name: "Gatanga" },
      { id: "21-2", name: "Kandara" },
      { id: "21-3", name: "Kangema" },
      { id: "21-4", name: "Kiharu" },
      { id: "21-5", name: "Kigumo" },
      { id: "21-6", name: "Mathioya" },
      { id: "21-7", name: "Muranga South" }
    ]
  },
  {
    id: 47, name: "Nairobi", fine: [
      //Nairobi
      { id: "47-1", name: "Westlands" },
      { id: "47-2", name: "Dagoretti North" },
      { id: "47-3", name: "Dagoretti North" },
      { id: "47-4", name: "Langata" },
      { id: "47-5", name: "Kibra" },
      { id: "47-6", name: "Roysambu" },
      { id: "47-7", name: "Kasarani" },
      { id: "47-8", name: "Ruaraka" },
      { id: "47-9", name: "Embakasi South" },
      { id: "47-10", name: "Embakasi North" },
      { id: "47-11", name: "Embakasi Central" },
      { id: "47-12", name: "Embakasi East" },
      { id: "47-13", name: "Embakasi West" },
      { id: "47-14", name: "Muranga South" },
      { id: "47-15", name: "Makadara" },
      { id: "47-16", name: "Kamukunji" },
      { id: "47-17", name: "Starehe" },
      { id: "47-18", name: "Mathare" }
    ]
  },
  {
    id: 32, name: "Nakuru", fine: [
      //Nakuru
      { id: "32-1", name: "Naivasha" },
      { id: "32-2", name: "Nakuru Town West" },
      { id: "32-3", name: "Nakuru Town East" },
      { id: "32-4", name: "Kuresoi South" },
      { id: "32-5", name: "Kuresoi North" },
      { id: "32-6", name: "Molo" },
      { id: "32-7", name: "Rongai" },
      { id: "32-8", name: "Subukia" },
      { id: "32-8", name: "Njoro" },
      { id: "32-10", name: "Gilgil" },
      { id: "32-11", name: "Bahati" }
    ]
  },
  {
    id: 29, name: "Nandi", fine: [
      //Nandi
      { id: "29-1", name: "Mosop" },
      { id: "29-2", name: "Chesumei" },
      { id: "29-3", name: "Aldai" },
      { id: "29-4", name: "Emgwen" },
      { id: "29-5", name: "Nandi Hills" },
      { id: "29-6", name: "Tinderet" }
    ]
  },
  {
    id: 33, name: "Narok", fine: [
      //Narok
      { id: "33-1", name: "Emurua Dikirr" },
      { id: "33-2", name: "Kilgoris" },
      { id: "33-3", name: "Narok North" },
      { id: "33-4", name: "Narok South" },
      { id: "33-5", name: "Narok East" },
      { id: "33-6", name: "Narok West" }
    ]
  },
  {
    id: 46, name: "Nyamira", fine: [
      //Nyamira
      { id: "46-1", name: "Borabu" },
      { id: "46-2", name: "Manga" },
      { id: "46-3", name: "Masaba North" },
      { id: "46-4", name: "Nyamira South" },
      { id: "46-5", name: "Nyamira North" }
    ]
  },
  {
    id: 18, name: "Nyandarua", fine: [
      //Nyandarua
      { id: "18-1", name: "Kinangop" },
      { id: "18-2", name: "Kipipiri" },
      { id: "18-3", name: "Ol Kalou" },
      { id: "18-4", name: "Ol Joro Orok" },
      { id: "18-6", name: "Ndaragwa" }
    ]
  },
  {
    id: 19, name: "Nyeri", fine: [

      //Nyeri
      { id: "19-1", name: "Kieni East" },
      { id: "19-2", name: "Kieni West" },
      { id: "19-3", name: "Mathira East" },
      { id: "19-4", name: "Mathira West" },
      { id: "19-4", name: "Mukurweini" },
      { id: "19-5", name: "Nyeri Central" },
      { id: "19-6", name: "Nyeri South" },
      { id: "19-4", name: "Tetu" }
    ]
  },
  {
    id: 25, name: "Samburu", fine: [
      //Samburu
      { id: "25-1", name: "Samburu East" },
      { id: "25-2", name: "Samburu West" },
      { id: "25-3", name: "Samburu North" }
    ]
  },
  {
    id: 41, name: "Siaya", fine: [
      //Siaya
      { id: "41-1", name: "Alego" },
      { id: "41-2", name: "Bondo" },
      { id: "41-3", name: "Gem" },
      { id: "41-4", name: "Rarieda" },
      { id: "41-6", name: "Ugenya" },
      { id: "41-7", name: "Ugunja" }
    ]
  },
  {
    id: 6, name: "Taita-Taveta", fine: [
      //Taita Taveta
      { id: "6-1", name: "Mwatate" },
      { id: "6-2", name: "Voi" },
      { id: "6-3", name: "Wundanyi" },
      { id: "6-4", name: "Taveta" }
    ]
  },
  {
    id: 4, name: "Tana River", fine: [
      //Tana River
      { id: "4-1", name: "Bura" },
      { id: "4-2", name: "Galole" },
      { id: "4-3", name: "Garsen" }
    ]
  },
  {
    id: 13, name: "Tharaka-Nithi", fine: [
      //Tharaka Nithi
      { id: "13-1", name: "Chuka" },
      { id: "13-2", name: "Maara" },
      { id: "13-3", name: "Tharaka" }

    ]
  },
  {
    id: 26, name: "Trans-Nzoia", fine: [
      //Trans Nzoia
      { id: "26-1", name: "Cherangany" },
      { id: "26-2", name: "Endebess" },
      { id: "26-3", name: "Kiminini" },
      { id: "26-4", name: "Kwanza" },
      { id: "26-5", name: "Saboti" }

    ]
  },
  {
    id: 23, name: "Turkana", fine: [
      //Turkana
      { id: "23-1", name: "Loima" },
      { id: "23-2", name: "Turkana Central" },
      { id: "23-3", name: "Turkana East" },
      { id: "23-4", name: "Turkana West" },
      { id: "23-5", name: "Turkana North" },
      { id: "23-6", name: "Turkana South" }
    ]
  },
  {
    id: 27, name: "Uasin Gishu", fine: [
      //Uasin Gishu
      { id: "27-1", name: "Soy" },
      { id: "27-2", name: "Turbo" },
      { id: "27-3", name: "Moiben" },
      { id: "27-4", name: "Ainabkoi" },
      { id: "27-5", name: "Kapseret" },
      { id: "27-6", name: "Kasses" }
    ]
  },
  {
    id: 38, name: "Vihiga", fine: [
      //Vihiga
      { id: "38-1", name: "Emuhaya" },
      { id: "38-2", name: "Sabatia" },
      { id: "38-3", name: "Luanda" },
      { id: "38-4", name: "Hamisi" },
      { id: "38-5", name: "Vihiga" }

    ]
  },
  {
    id: 8, name: "Wajir", fine: [
      //Wajir
      { id: "8-1", name: "Eldas" },
      { id: "8-2", name: "Wajir East" },
      { id: "8-3", name: "Wajir West" },
      { id: "8-4", name: "Wajir North" },
      { id: "8-5", name: "Wajir South" },
      { id: "8-6", name: "Tarbaj" }
    ]
  },
  {
    id: 24, name: "West Pokot", fine: [
      //West Pokot
      { id: "24-1", name: "Kacheliba" },
      { id: "24-2", name: "Kapenguria" },
      { id: "24-3", name: "Sigor" },
      { id: "24-4", name: "Pokot" }
    ]
  }
];
