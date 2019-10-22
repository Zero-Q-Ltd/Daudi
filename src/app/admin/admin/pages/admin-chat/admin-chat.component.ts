import {Component, OnInit} from "@angular/core";
import * as firebase from "firebase";
import * as moment from "moment";
import {Chat, User} from "../../../../models/Global";

@Component({
  selector: "admin-chat",
  templateUrl: "./admin-chat.component.html",
  styleUrls: ["./admin-chat.component.scss"]
})
export class AdminChatComponent implements OnInit {
  chats: any[];
  loggedinUser: string;
  loggedinUserName: string;
  photourl: string;
  testing = true;
  newmsg: string;
  chat: Chat = {};
  diff: any;
  admins: User = {};
  position = "right";

  constructor() {
    // this.firebaseService.getChat("group","admin").subscribe(chats =>{
    //   this.chats = chats;
    //   this.loggedinUser = this.authService.getUser().uid;
    //   this.loggedinUserName = this.authService.getUser().displayName;
    // });

    // firebaseService.getadminsObject().subscribe(admins => {
    //   // console.log(admins)
    //   this.admins = admins;
    // });
  }

  sendmsg() {
    console.log(this.newmsg);
    this.chat.msg = this.newmsg;
    this.chat.time = firebase.database.ServerValue.TIMESTAMP;
    this.chat.uid = this.loggedinUser;
    // this.chat.username = this.authService.getUser().displayName
    // this.firestore.addChat(this.chat, "admin")
  }

  timedifference(chattime) {
    return moment(chattime).fromNow();
  }

  ngOnInit() {
  }

}
