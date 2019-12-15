import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { OrderContactForm } from "./../../../../models/Daudi/forms/CreateOrder";
import { Order } from "./../../../../models/Daudi/order/Order";
import { CustomerDetail } from "../../../../models/Daudi/customer/CustomerDetail";
import { FormArray, FormControl, Controls, FormGroup, FormBuilder } from "ngx-strongly-typed-forms";
import { Validators, AbstractControl } from "@angular/forms";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { DaudiCustomer } from "./../../../../models/Daudi/customer/Customer";
import { takeUntil, startWith } from "rxjs/operators";
import { CustomerService } from "./../../../services/customers.service";

@Component({
  selector: "app-contact-form",
  templateUrl: "./contact-form.component.html",
  styleUrls: ["./contact-form.component.scss"]
})
export class ContactFormComponent implements OnInit {
  @Input() initData: Order;
  // @Output() formChangesResult: EventEmitter<{ detail: CustomerDetail, kraModified: boolean }> =
  //   new EventEmitter<{ detail: CustomerDetail, kraModified: boolean }>();
  filteredCompanies: Subject<DaudiCustomer[]> = new Subject();
  loadingcustomers = false;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  subscriptions: Map<string, any> = new Map<string, any>();

  contactform: FormGroup<OrderContactForm> = new FormGroup<OrderContactForm>({
    kraPin: new FormControl<string>("", [Validators.required]),
    email: new FormControl<string>("", [Validators.required, Validators.email]),
    companyName: new FormControl<string>("", [Validators.required]),
    name: new FormControl<string>("", [Validators.required]),
    phone: new FormControl<string>("", [Validators.required, Validators.email])
  });
  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomerService
  ) {
    console.log(this.initData);
    if (this.initData) {
      this.contactform.disable();
      this.contactform.controls.email.setValue(this.initData.customer.contact[0].email);
      this.contactform.controls.name.setValue(this.initData.customer.name);
      this.contactform.controls.phone.setValue(this.initData.customer.contact[0].phone);
      this.contactform.controls.kraPin.setValue(this.initData.customer.krapin);
    }

    this.contactform.valueChanges
      .pipe(
        takeUntil(this.comopnentDestroyed),
      )
      .subscribe(values => {
        const detail: CustomerDetail = {
          Id: null,
          QbId: null,
          contact: [{
            email: values.email,
            name: values.name,
            phone: values.phone
          }],
          krapin: values.kraPin,
          name: values.name
        };
        const kraModified = this.initData ? this.initData.customer.krapin === values.kraPin : false;
        this.filteredCompanies.next(this._filter(values.name));
      });
    // this.initData.customer
    this.customerService.loadingcustomers
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(value => {
        this.loadingcustomers = value;
      });

  }

  private _filter(value: string): DaudiCustomer[] {
    if (!value) {
      return;
    }
    const filterValue = value.toLowerCase();

    return this.customerService.allcustomers.value.filter(option => option.name.toLowerCase().includes(filterValue));
  }
  companyselect(selectedcompany: DaudiCustomer) {

    this.contactform.controls.kraPin.setValue(selectedcompany.krapin, { emitEvent: false });
    this.contactform.controls.name.setValue(selectedcompany.contact[0].name, { emitEvent: false });
    this.contactform.controls.phone.setValue(selectedcompany.contact[0].phone, { emitEvent: false });
    this.contactform.controls.email.setValue(selectedcompany.contact[0].email, { emitEvent: false });

    const detail: CustomerDetail = {
      Id: selectedcompany.Id,
      QbId: selectedcompany.QbId,
      contact: selectedcompany.contact,
      krapin: selectedcompany.krapin,
      name: selectedcompany.name
    };
    // const kraModified = this.initData ? this.initData.customer.krapin === values.kraPin : false;
    // this.formChangesResult.emit({ detail, kraModified });
    // this.formChangesResult.emit({ detail, kraModified: false });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.unsubscribeAll();
  }
  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

}
