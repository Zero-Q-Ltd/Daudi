import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from "@angular/core";
import { Validators } from "@angular/forms";
import { CoreService } from "app/services/core/core.service";
import { CustomerService } from "app/services/customers.service";
import { isEqual } from "lodash";
import { FormBuilder, FormControl, FormGroup } from "ngx-strongly-typed-forms";
import { ReplaySubject, Subject } from "rxjs";
import { delay, takeUntil } from "rxjs/operators";
import { CustomerDetail } from "../../../../models/Daudi/customer/CustomerDetail";
import { DaudiCustomer } from "./../../../../models/Daudi/customer/Customer";
import { OrderContactForm } from "./../../../../models/Daudi/forms/CreateOrder";
import { Order } from "./../../../../models/Daudi/order/Order";

@Component({
  selector: "app-contact-form",
  templateUrl: "./contact-form.component.html",
  styleUrls: ["./contact-form.component.scss"]
})
export class ContactFormComponent implements OnInit, OnChanges {
  @Input() initData: Order;

  @Input() newOrder: boolean;

  @Output() modifiedOrder = new EventEmitter<Order>();
  @Output() formValid = new EventEmitter<boolean>();
  /**
   * Emits whenever a compay is selected from the dropdown
   */
  @Output() selectedCustomer = new EventEmitter<CustomerDetail>();
  /**
   * Emits whenever the selected company editable values are edited
   */
  @Output() companyEdited = new EventEmitter<boolean>();

  /**
   * An internal copy of the selected company var
   */
  selectedCustomer_: CustomerDetail;
  filteredCompanies: Subject<DaudiCustomer[]> = new Subject();
  loadingcustomers = false;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  subscriptions: Map<string, any> = new Map<string, any>();

  contactForm: FormGroup<OrderContactForm> = new FormGroup<OrderContactForm>({
    kraPin: new FormControl<string>("", [Validators.required]),
    email: new FormControl<string>("", [Validators.required, Validators.email]),
    companyName: new FormControl<string>("", [Validators.required]),
    name: new FormControl<string>("", [
      Validators.required,
      Validators.minLength(4)
    ]),
    phone: new FormControl<string>("", [
      Validators.required,
      Validators.pattern("[0-9].{8}")
    ])
  });

  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomerService,
    private core: CoreService
  ) {
    this.contactForm.valueChanges
      .pipe(
        takeUntil(this.comopnentDestroyed),
        /**
         * Wait for values to be assigned in case the user has just selected a company
         */
        delay(50)
      )
      .subscribe(values => {
        const detail: CustomerDetail = {
          Id: null,
          QbId: null,
          contact: [
            {
              email: values.email.toLowerCase(),
              name: values.name.toUpperCase(),
              phone: values.phone
            }
          ],
          krapin: values.kraPin,
          name: values.name.toUpperCase()
        };
        this.initData.customer = detail;
        /**
         * Check if its a new company charactarised by a new name
         * If a seection is made but the company name modified, this is recognised as a new company
         */
        if (this.selectedCustomer_) {
          if (this.initData.customer.name !== this.selectedCustomer_.name) {
            console.log(
              "New company",
              this.initData.customer.name,
              this.selectedCustomer_.name
            );
          } else if (
            !this.selectedCustomer_.contact.some(c =>
              isEqual(c, this.initData.customer.contact[0])
            ) ||
            this.selectedCustomer_.krapin !== this.initData.customer.krapin
          ) {
            this.initData.customer.QbId = this.selectedCustomer_.QbId;
            this.initData.customer.Id = this.selectedCustomer_.Id;
            console.log("Company modified");
          } else {
            this.initData.customer.QbId = this.selectedCustomer_.QbId;
            this.initData.customer.Id = this.selectedCustomer_.Id;
            console.log("No company changes");
          }
        } else {
          console.log("New company");
        }
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
    this.core.loaders.customers
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(value => {
        this.loadingcustomers = value;
      });
  }

  companyselect(selectedcompany: DaudiCustomer) {
    /**
     * Silently update the related values
     */
    this.contactForm.controls.kraPin.setValue(selectedcompany.krapin, {
      emitEvent: false
    });
    this.contactForm.controls.name.setValue(selectedcompany.contact[0].name, {
      emitEvent: false
    });
    this.contactForm.controls.phone.setValue(selectedcompany.contact[0].phone, {
      emitEvent: false
    });
    this.contactForm.controls.email.setValue(selectedcompany.contact[0].email, {
      emitEvent: false
    });
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
    this.selectedCustomer_ = detail;
    // const kraModified = this.initData ? this.initData.customer.krapin === values.kraPin : false;
    this.initData.customer = detail;
    // this.formValid.emit(this.contactForm.valid);
    // this.modifiedOrder.emit(this.initData);
  }

  ngOnChanges(changes: any) {
    if (!this.newOrder) {
      this.contactForm.disable();
      this.contactForm.controls.companyName.setValue(
        this.initData.customer.name,
        { emitEvent: false }
      );
      this.contactForm.controls.kraPin.setValue(this.initData.customer.krapin, {
        emitEvent: false
      });
      /**
       * Check if the contact array has values, as the initialization data which may trigger a change detection is empty
       */
      if (this.initData.customer.contact.length > 0) {
        this.contactForm.controls.email.setValue(
          this.initData.customer.contact[0].email,
          { emitEvent: false }
        );
        this.contactForm.controls.name.setValue(
          this.initData.customer.contact[0].name,
          { emitEvent: false }
        );
        this.contactForm.controls.phone.setValue(
          this.initData.customer.contact[0].phone,
          { emitEvent: false }
        );
      }
    }
    this.contactForm.updateValueAndValidity();
  }

  ngOnInit() { }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

  private _filter(value: string): DaudiCustomer[] {
    if (!value) {
      return;
    }
    const filterValue = value.toLowerCase();
    return this.core.customers.value.filter(option =>
      option.name.toLowerCase().includes(filterValue)
    );
  }
}
