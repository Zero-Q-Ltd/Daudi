import { animate, sequence, state, style, transition, trigger } from "@angular/animations";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatPaginator, MatTableDataSource } from "@angular/material";
import { SmsService } from 'app/services/sms.service';
import { ReplaySubject } from "rxjs";
import { emptysms, SMS } from "../../../../models/Daudi/sms/sms";

@Component({
    selector: "sms-logs",
    templateUrl: './sms-logs.component.html',
    styleUrls: ['./sms-logs.component.scss'],
    animations: [
        trigger('flyIn', [
            state('in', style({ transform: 'translateX(0)' })),
            transition('void => *', [
                style({ height: '*', opacity: '0', transform: 'translateX(-550px)', 'box-shadow': 'none' }),
                sequence([
                    animate('.20s ease', style({ height: '*', opacity: '.2', transform: 'translateX(0)', 'box-shadow': 'none' })),
                    animate('.15s ease', style({ height: '*', opacity: 1, transform: 'translateX(0)' }))
                ])
            ])
        ]),
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ])]
})
export class SmsLogsComponent implements OnInit, OnDestroy {
    position = 'right';
    smslogs = new MatTableDataSource();
    displayedColumns: string[] = ['timestamp', 'QbId', 'name', 'name', 'contactname', 'phone', 'origin', 'reason', 'greeting', 'status'];
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    constructor(private sms: SmsService) {
        this.sms.getsmslogs().get().then(snapshot => {
            this.smslogs.data = snapshot.docs.map(val => {
                const value: SMS = Object.assign({}, emptysms, val.data());
                value.Id = val.id;
                return value;
            });
        });
    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
        this.comopnentDestroyed.complete();
    }

    ngOnInit() {
        this.smslogs.paginator = this.paginator;
    }

    filterorders(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.smslogs.filter = filterValue;
    }

}
