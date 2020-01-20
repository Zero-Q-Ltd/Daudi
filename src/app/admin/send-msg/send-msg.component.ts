import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material"; // added dialog data receive
import {NotificationService} from "../../shared/services/notification.service";
import {emptysms, SMS} from "../../models/Daudi/sms/sms";
import {AngularFirestore} from "@angular/fire/firestore";
import {SmsService} from "../services/sms.service";
import {CoreService} from "../services/core/core.service";

@Component({
    selector: "send-msg",
    templateUrl: "./send-msg.component.html",
    styleUrls: ["./send-msg.component.scss"]
})
export class SendMsgComponent implements OnInit {


    dialogProperties: object = {}; // added to sent data via dialog
    saving = false;
    bulk = false;
    tempbulkmodel: SMS = {...emptysms};

    constructor(
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public tempsms: SMS | Array<SMS>,
        private sms: SmsService,
        private notificationService: NotificationService,
        private db: AngularFirestore,
        private core: CoreService
    ) {
        console.log(tempsms);
        if (this.tempsms instanceof Array) {
            this.bulk = true;
            this.tempbulkmodel.greeting = "Jambo";
            this.tempsms = this.tempsms.filter(smsdata => !smsdata.company.name.includes("DELETED"));
        }
    }

    ngOnInit() {
    }

    sendSMS() {
        this.saving = true;
        if (this.tempsms instanceof Array) {
            const batchaction = this.db.firestore.batch();
            this.tempsms.forEach((sms, index) => {
                if (this.validatephone(sms.contact[0].phone)) {
                    sms.greeting = this.tempbulkmodel.greeting;
                    sms.msg = `ID ${sms.company.Id} ${this.tempbulkmodel.msg}`;
                    sms.type = {
                        origin: "bulk",
                        reason: this.tempbulkmodel.type.reason
                    };
                    batchaction.set(this.sms.smsCollection(this.core.currentOmc.value.Id).doc(this.core.createId()), sms);
                }
            });
            batchaction.commit().then(() => {
                {
                    this.saving = false;
                    this.notificationService.notify({
                        alert_type: "success",
                        title: "Success",
                        body: "Bulk SMS's queued for sending"
                    });
                }
            });
        } else {
            this.tempsms.msg = `ID ${this.tempsms.company.QbId} ${this.tempsms.msg}`;
            this.sms.createsms(this.core.currentOmc.value.Id, this.tempsms).then(result => {
                this.saving = false;
                this.notificationService.notify({
                    alert_type: "success",
                    title: "Success",
                    body: "SMS successfully queued for sending"
                });
            });
        }

    }

    validatephone(phone: string) {

        return (phone && phone.length === 9);
    }


}
