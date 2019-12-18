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

  @Input() newOrder: boolean;

  @Output() initDataChange = new EventEmitter<Order>();
  @Output() formValid = new EventEmitter<boolean>();

  // @Output() formChangesResult: EventEmitter<{ detail: CustomerDetail, kraModified: boolean }> =
  //   new EventEmitter<{ detail: CustomerDetail, kraModified: boolean }>();
  filteredCompanies: Subject<DaudiCustomer[]> = new Subject();
  loadingcustomers = false;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  subscriptions: Map<string, any> = new Map<string, any>();

  contactForm: FormGroup<OrderContactForm> = new FormGroup<OrderContactForm>({
    kraPin: new FormControl<string>("", [Validators.required]),
    email: new FormControl<string>("", [Validators.required, Validators.email]),
    companyName: new FormControl<string>("", [Validators.required]),
    name: new FormControl<string>("", [Validators.required, Validators.minLength(4)]),
    phone: new FormControl<string>("", [Validators.required, Validators.pattern("[0-9].{8}")])
  });
  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomerService
  ) {
    this.contactForm.valueChanges
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
        this.filteredCompanies.next(this._filter(values.companyName));
        /**
         * emit the form validity
         * A disabled form is considered invalid by default, so omit
         */
        if (this.newOrder) {
          this.formValid.emit(this.contactForm.valid);
        } else {
          this.formValid.emit(true);
        }
      });
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

    /**
     * Silently update the related values
     */
    this.contactForm.controls.kraPin.setValue(selectedcompany.krapin, { emitEvent: false });
    this.contactForm.controls.name.setValue(selectedcompany.contact[0].name, { emitEvent: false });
    this.contactForm.controls.phone.setValue(selectedcompany.contact[0].phone, { emitEvent: false });
    this.contactForm.controls.email.setValue(selectedcompany.contact[0].email, { emitEvent: false });
    /**
     * emit the cahnges at once
     */
    this.contactForm.updateValueAndValidity();

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
  ngOnChanges(changes: any) {
    if (!this.newOrder) {
      this.contactForm.disable();
      this.contactForm.controls.companyName.setValue(this.initData.customer.name, { emitEvent: false });
      this.contactForm.controls.kraPin.setValue(this.initData.customer.krapin, { emitEvent: false });
      /**
       * Check if the contact array has values, as the initialization data which may trigger a change detection is empty
       */
      if (this.initData.customer.contact.length > 0) {
        this.contactForm.controls.email.setValue(this.initData.customer.contact[0].email, { emitEvent: false });
        this.contactForm.controls.name.setValue(this.initData.customer.contact[0].name, { emitEvent: false });
        this.contactForm.controls.phone.setValue(this.initData.customer.contact[0].phone, { emitEvent: false });
      }
    }
    this.contactForm.updateValueAndValidity();
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
