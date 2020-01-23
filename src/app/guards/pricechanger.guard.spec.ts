import {inject, TestBed} from "@angular/core/testing";

import {PricechangerGuard} from "./pricechanger.guard";

describe("PricechangerGuard", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PricechangerGuard]
        });
    });

    it("should ...", inject([PricechangerGuard], (guard: PricechangerGuard) => {
        expect(guard).toBeTruthy();
    }));
});
