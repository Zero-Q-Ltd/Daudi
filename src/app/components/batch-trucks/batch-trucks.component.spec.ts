import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {BatchTrucksComponent} from "./batch-trucks.component";

describe("BatchTrucksComponent", () => {
    let component: BatchTrucksComponent;
    let fixture: ComponentFixture<BatchTrucksComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BatchTrucksComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BatchTrucksComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
