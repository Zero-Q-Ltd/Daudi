import * as requester from "request";
import * as _ from "underscore";
import * as admin from "firebase-admin";
import { SMS } from "../../models/Daudi/sms/sms";

//[START AfricasTalking credentials]
const querystring = require("querystring");
// Your login credentials
const username = "EmkayNow";
const apikey =
  "d4ec7f60ac59d2169360d2c6580617f021ea70008d9041543194d3caddd7a915";
const debug = true;

//[END AfricasTalking credentials]

export function sendsms(smsdata: SMS, smsid: string) {
  return Promise.all(
    smsdata.contact.map(contact => {
      return sendMessage(
        "+254" + contact.phone,
        `${smsdata.greeting} ${capitalizeFirstLetter(
          smsdata.company.name.toLowerCase()
        )} ${smsdata.msg}`
      ).then(result => {
        return admin
          .firestore()
          .collection("sms")
          .doc(smsid)
          .update({ status: { sent: true, delivered: false } });
      });
    })
  );
}
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function sendMessage(to: string, message: string) {
  // Build the post string from an}e${    let post_data = querystring.stringify({
  const post_data = querystring.stringify({
    username: username,
    to: to,
    message: message,
    from: "Emkay"
  });

  console.log(post_data);
  const opts = {
    method: "post",
    url: "https://api.africastalking.com/version1/messaging",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": post_data.length,
      Accept: "application/json",
      apikey
    },
    json: true,
    body: post_data
  };
  return new Promise(function(resolve, reject) {
    // if (!token) reject('null token')
    requester(opts, function(err, res, body) {
      if (debug) {
        console.log("invoking endpoint: " + opts.url);
        console.log(JSON.stringify(body, null, 2));
      }
      if (
        err ||
        res.statusCode >= 300 ||
        (_.isObject(body) &&
          body.Fault &&
          body.Fault.Error &&
          body.Fault.Error.length) ||
        (_.isString(body) && !_.isEmpty(body) && body.indexOf("<") === 0)
      ) {
        reject(body || err);
      } else {
        resolve(body);
      }
    });
  });
}

function checkresponseerror(reponse: string) {
  const jsObject = JSON.parse(reponse);
  const recipients = jsObject.SMSMessageData.Recipients;
  if (recipients.length > 0) {
    for (const i of recipients) {
      let logStr = "number=" + i.number;
      logStr += ";cost=" + i.cost;
      logStr += ";status=" + i.status; // status is either "Success" or "error message"
      // console.log(logStr);
    }
  } else {
    console.error("Error while sending: " + jsObject.SMSMessageData.Message);
  }
}

// function dbsave(Url){
//   var time = new Date().getTime();
//   firebase.database().ref('Usersfiles/' +window.logedinuser.uid ).set({
//     time : time /*here it is taking time as a string but i want it to take it as var time which is a var contains value */
//   }, function(error) {
//     if (error) {
//       console.log("failed "+error);
//       failedlol();
//
//     } else {
//       console.log("success");
//     }
//   });
// }
