import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { DaudiPayment, emptyPayment } from "app/models/payment/DaudiPayment";
import { paymentStatus } from "app/models/payment/DaudiPayment";
import { AdminService } from "app/services/core/admin.service";
import { CoreService } from "app/services/core/core.service";
import { PaymentsService } from "app/services/payments.service";
import { NotificationService } from "app/shared/services/notification.service";

@Component({
  templateUrl: "./create-payment.component.html",
  styleUrls: ["./create-payment.component.scss"]
})
export class CreatePaymentComponent implements OnInit {
  payment: DaudiPayment = emptyPayment();
  saving = false;
  constructor(
    private paymentsService: PaymentsService,
    private core: CoreService,
    private admin: AdminService,
    public dialogRef: MatDialogRef<CreatePaymentComponent>,
    private notification: NotificationService
  ) {}

  ngOnInit() {}
  createPayment() {
    this.saving = true;
    this.payment.Id = this.payment.bank.reference;
    this.payment.daudiFields.status = paymentStatus.Processing;
    this.payment.depositedBy.name = this.admin.userdata.profile.name;
    this.paymentsService
      .paymentsDoc(this.core.omcId, this.payment.Id)
      .set(this.payment)
      .then(() => {
        this.saving = false;
        this.dialogRef.close();
        this.notification.notify({
          body: "Processing in the background",
          alert_type: "success",
          title: "Success",
          duration: 3000
        });
      });
  }
}
