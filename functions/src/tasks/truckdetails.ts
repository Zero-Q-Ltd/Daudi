// import { firestore } from "firebase-admin";
// import moment = require("moment");
// import { Truck } from "../models/Daudi/order/Truck";

// export function truckDetails(truckquerydata: { D: string; T: string }) {
//     return firestore()
//         .collection("depots")
//         .doc(truckquerydata.D)
//         .collection("trucks")
//         .where("truckId", "==", truckquerydata.T)
//         .get()
//         .then(truckdata => {
//             if (truckdata.empty) {
//                 return "<h1>The specified order does not exist!!!</br> PLease contact 0711234567 if you think it is a mistake</h1></br><img src=\"https://emkaynow.com/assets/images/home-header.png\" style=\"width:100%; max-width:300px;\">";
//             }
//             const truck = truckdata.docs[0].data() as Truck;
//             return compose(truck);
//         });
// }

// function compose(truckdata: Truck) {
//     const response = ` <!doctype html>
//     <html id="background">
//     <head>
//         <meta charset="utf-8">
//         <title>Emkay International Invoice Verification</title>

//         <style>
//         @page 
//         {
//             size: auto;   /* auto is the initial value */
//             margin: 0mm;  /* this affects the margin in the printer settings */
//         }
//         @media print {
//         #printbtn {
//             display :  none;
//         }
// }
//         .invoice-box{
//             max-width:800px;
//             margin:auto;
//             padding:30px;
//             border:1px solid #eee;
//             box-shadow:0 0 10px rgba(0, 0, 0, .15);
//             font-size:16px;
//             line-height:24px;
//             font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
//             color:#555;
//         }

//         .invoice-box table{
//             width:100%;
//             line-height:inherit;
//             text-align:left;
//         }

//         .invoice-box table td{
//             padding:5px;
//             vertical-align:top;
//         }

//         .invoice-box table tr td:nth-child(2){
//             text-align:right;
//         }

//         .invoice-box table tr.top table td{
//             padding-bottom:20px;
//         }

//         .invoice-box table tr.top table td.title{
//             font-size:45px;
//             line-height:45px;
//             color:#333;
//         }

//         .invoice-box table tr.information table td{
//             padding-bottom:40px;
//         }

//         .invoice-box table tr.heading td{
//             background:#eee;
//             border-bottom:1px solid #ddd;
//             font-weight:bold;
//         }

//         .invoice-box table tr.details td{
//             padding-bottom:20px;
//         }

//         .invoice-box table tr.item td{
//             border-bottom:1px solid #eee;
//         }

//         .invoice-box table tr.item.last td{
//             border-bottom:none;
//         }

//         .invoice-box table tr.total td:nth-child(2){
//             border-top:2px solid #eee;
//             font-weight:bold;
//         }

//         @media only screen and (max-width: 600px) {
//             .invoice-box table tr.top table td{
//                 width:100%;
//                 display:block;
//                 text-align:center;
//             }

//             .invoice-box table tr.information table td{
//                 width:100%;
//                 display:block;
//                 text-align:center;
//             }
//         }
//         .mk-logo{
//           width:100%;
//           max-width:300px;
//         }
//         .vuta-right{
//           text-align: right;
//         }
//          #background{
//             z-index:0;
//             background:white;
//         }
//         #bg-text
//         {
//             color:lightgray;
//             font-size:120px;
//             transform:rotate(300deg);
//             -webkit-transform:rotate(300deg);
//             text-align: center;
//         }

//         .color-pms{
//             color: #ff6347;
//             font-size: 14px
//         }
//         .color-ago{
//             color: #ffc107;
//             font-size: 14px
//         }
//         .color-ik{
//             color: #008542;
//             font-size: 14px
//         }
//          .color-null{
//             color: #404040;
//             font-size: 14px
//         }
//         </style>
//     </head>

//     <body>
//         <div class="invoice-box">
//             <table cellpadding="0" cellspacing="0">
//                 <tr class="top">
//                     <td colspan="7">
//                         <table>
//                             <tr>
//                                 <td class="title">
//                                     <img src="https://emkaybeta.firebaseapp.com/assets/images/EmkayIntlLogo.svg" class="mk-logo">
//                                 </td>
//                                 <td>
//                                     Loading Order #: ${truckdata.truckId}<br>
//                                     Truck Created: ${moment(truckdata.stagedata["0"].user.time).format("YYYY/M/D,  h:mm a")}<br>
//                                     Depot: ${truckdata.config.depot.name}
//                                 </td>
//                             </tr>
//                         </table>
//                     </td>
//                 </tr>

//                 <tr class="information">
//                     <td colspan="7">
//                         <table>
//                             <tr>
//                                 <td>
//                                     Emkay International Ltd<br>
//                                     Annex A,Watermark Business park<br>
//                                     KAREN
//                                 </td>
//                                 <td>
//                                     ${truckdata.company.name}<br>
//                                     ${truckdata.company.contactname}<br>
//                                     ${truckdata.company.phone}
//                                 </td>
//                             </tr>
//                         </table>
//                         <table>
//                           <tr>
//                               <td></td>
//                               <td>
//                                   Driver Name: ${truckdata.drivername}
//                               </td><td>
//                                   Driver ID: ${truckdata.driverid}
//                               </td>
//                           </tr>
//                         </table>

//                         <div id="bg-text"> ${
//         truckdata.stage > 3 ? "PASSED" : ""
//         }</div>
//                     </td>
//                 </tr>
//                 <tr class="heading">
//                     <td colspan="3">
//                         Truck Number plate
//                     </td>
//                     <td colspan="3" class="vuta-right">
//                         Seal Numbers
//                     </td>
//                     <td colspan="3" class="vuta-right">
//                         Broken Seal(s)
//                     </td>
//                 </tr>
//                 <tr class="details">
//                     <td colspan="3">
//                         ${truckdata.numberplate}
//                     </td>
//                     <td colspan="3" class="vuta-right">
//                         ${
//         truckdata.stagedata["4"].data
//             ? truckdata.stagedata["4"].data.seals.range
//             : ""
//         }
//                     </td>    
//                     <td colspan="3" class="vuta-right">
//                         ${
//         truckdata.stagedata["4"].data
//             ? truckdata.stagedata["4"].data.seals.broken
//             : ""
//         }
//                     </td>
//                 </tr>
//                  <tr class="heading">
//                       <td>Comp 1</td>
//                       <td>Comp 2</td>
//                       <td>Comp 3</td>
//                       <td>Comp 4</td>
//                       <td>Comp 5</td>
//                       <td>Comp 6</td>
//                       <td>Comp 7</td>
//                  </tr>
//                   <tr>
//                       <td class="color-${truckdata.compartments[0].fueltype} ">
//                         ${truckdata.compartments[0].qty}
//                          <span >${truckdata.compartments[0].fueltype}</span>
//                       </td>
//                       <td class="color-${truckdata.compartments[1].fueltype} ">
//                         ${truckdata.compartments[1].qty}
//                         <span >${truckdata.compartments[1].fueltype}</span>
//                       </td>
//                       <td class="color-${truckdata.compartments[2].fueltype} ">
//                         <span >${truckdata.compartments[2].fueltype}</span>
//                         ${truckdata.compartments[2].qty}
//                       </td>
//                       <td class="color-${truckdata.compartments[3].fueltype} ">
//                         ${truckdata.compartments[3].qty}
//                         <span >${truckdata.compartments[3].fueltype}</span>
//                       </td>
//                       <td class="color-${truckdata.compartments[4].fueltype} ">
//                         ${truckdata.compartments[4].qty}
//                         <span >${truckdata.compartments[4].fueltype}</span>
//                       </td>
//                       <td class="color-${truckdata.compartments[5].fueltype} ">
//                         ${truckdata.compartments[5].qty}
//                         <span>${truckdata.compartments[5].fueltype}</span>
//                       </td>
//                       <td class="color-${truckdata.compartments[6].fueltype} ">
//                         ${truckdata.compartments[6].qty}
//                         <span>${truckdata.compartments[6].fueltype}</span>
//                       </td>
//                     </tr>

//                 <tr class="heading">
//                     <td  colspan="6">
//                         Item
//                     </td>
//                     <td>
//                         Quantity
//                     </td>
//                 </tr>
//                 <tr class="item color-pms" >
//                     <td colspan="6">
//                         PMS
//                     </td>
//                     <td>
//                         ${truckdata.fuel.pms.qty}
//                     </td>
//                 </tr>
//                 <tr class="item color-ago">
//                    <td colspan="6">
//                        AGO
//                     </td>
//                    <td>
//                         ${truckdata.fuel.ago.qty}
//                     </td>
//                 </tr>

//                 <tr class="item last color-ik">
//                      <td colspan="6">
//                         IK
//                     </td>
//                      <td>
//                         ${truckdata.fuel.ik.qty}
//                     </td>
//                 </tr>
//                 <tr class="total">
//                 </tr>
//             </table>
//             <span style="width: 100%">
//                   <input id ="printbtn" class="vuta-right" type="button" value="Print this page" onclick="window.print();" >
//             </span>
//         </div>
//     </body>
//     </html>`;
//     return response;
// }
