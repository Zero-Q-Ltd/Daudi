import { Component, OnInit } from '@angular/core';
import { PaymentsService } from 'app/services/payments.service';
import { CoreService } from 'app/services/core/core.service';
import { DaudiPayment, emptyPayment } from 'app/models/payment/DaudiPayment';
import { paymentStatus } from 'app/models/payment/DaudiPayment';

@Component({
  templateUrl: './create-payment.component.html',
  styleUrls: ['./create-payment.component.scss']
})
export class CreatePaymentComponent implements OnInit {

  constructor(private paymentsService: PaymentsService, private core: CoreService) {
  }

  ngOnInit() {
  }
  createPayment() {
    const payment: DaudiPayment = emptyPayment()
    payment.transaction.amount = '10000',
      payment.transaction.billNumber = "1",
      payment.Id = this.core.createId(),
      payment.daudiFields.status = paymentStatus.Processing;
    payment.depositedBy.name = "Kamana Kisinga"
    this.paymentsService.paymentsDoc(this.core.omcId, payment.Id).set(payment)
  }
}
