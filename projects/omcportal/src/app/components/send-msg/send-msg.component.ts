import { Component, Inject, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DaudiCustomer } from "app/models/Daudi/customer/Customer";
import { CustomerDetail } from "app/models/Daudi/customer/CustomerDetail";
import { CoreService } from "app/services/core/core.service";
import { SmsService } from "app/services/sms.service";
import { emptysms, SMS } from "../../models/Daudi/sms/sms";
import { NotificationService } from "../../shared/services/notification.service";

@Component({
  selector: "send-msg",
  templateUrl: "./send-msg.component.html",
  styleUrls: ["./send-msg.component.scss"]
})
export class SendMsgComponent implements OnInit {
  dialogProperties: object = {}; // added to sent data via dialog
  saving = false;
  baseSms: SMS = { ...emptysms };

  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public customers: CustomerDetail[] | DaudiCustomer[],
    private sms: SmsService,
    private notificationService: NotificationService,
    private db: AngularFirestore,
    private core: CoreService
  ) {
    console.log(customers);
    if (customers.length === 1) {
      this.baseSms.company = customers[0];
      this.baseSms.contact = customers[0].contact;
    }
  }

  ngOnInit() {}

  sendSMS() {
    this.saving = true;
    const batchaction = this.db.firestore.batch();
    this.customers.forEach((customer, index) => {
      if (this.validatephone(customer.contact[0].phone)) {
        const sms = { ...this.baseSms };
        sms.contact = customer.contact;
        sms.company = customer;
        sms.msg = `ID ${customer.QbId} ${this.baseSms.msg}`;
        batchaction.set(
          this.sms
            .smsCollection(this.core.currentOmc.value.Id)
            .doc(this.core.createId()),
          sms
        );
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
  }

  validatephone(phone: string) {
    return phone && phone.length === 9;
  }
}
