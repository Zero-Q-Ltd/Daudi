import { Component, OnInit } from "@angular/core";
import { DaudiPayment, emptyPayment } from "app/models/payment/DaudiPayment";
import { paymentStatus } from "app/models/payment/DaudiPayment";
import { CoreService } from "app/services/core/core.service";
import { PaymentsService } from "app/services/payments.service";

@Component({
  templateUrl: "./create-payment.component.html",
  styleUrls: ["./create-payment.component.scss"]
})
export class CreatePaymentComponent implements OnInit {
  payment: DaudiPayment = emptyPayment();
  constructor(private paymentsService: PaymentsService, private core: CoreService) {
  }

  ngOnInit() {
  }
  createPayment() {
    this.payment.daudiFields.status = paymentStatus.Processing;
    this.payment.depositedBy.name = "Kamana Kisinga";
    this.paymentsService.paymentsDoc(this.core.omcId, this.payment.Id).set(this.payment);
  }
}
