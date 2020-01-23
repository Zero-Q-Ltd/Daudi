import {TestBed} from "@angular/core/testing";

import {PricesService} from "./prices.service";

describe("PricesService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: PricesService = TestBed.get(PricesService);
        expect(service).toBeTruthy();
    });
});
