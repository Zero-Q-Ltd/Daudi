import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AdminsService } from './admins.service';
import { BehaviorSubject } from 'rxjs';
import { CompanyData, emptycompanydata } from '../../models/CompayData';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  companydata: BehaviorSubject<CompanyData> = new BehaviorSubject<CompanyData>({ ...emptycompanydata });

  constructor(private db: AngularFirestore, private adminservice: AdminsService) {
    adminservice.observableuserdata
      .subscribe(admin => {
        if (admin) {
          this.fetchcompany();
        }
      });
  }
  fetchcompany() {
    this.db.firestore.collection("companies")
      .doc("default")
      .onSnapshot(companydata => {
        if (!companydata.exists) {
          return;
        }
        this.companydata.next(Object.assign({}, { ...emptycompanydata }, { id: companydata.id }, companydata.data()));
      });
  }
  savecompany(data: CompanyData) {
    return this.db.firestore.collection("companies")
      .doc("default")
      .set(data)
  }
}
