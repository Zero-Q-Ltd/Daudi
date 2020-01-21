import {TestBed} from "@angular/core/testing";

import {AdminConfigService} from "./admin-config.service";

describe("CompanyService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: AdminConfigService = TestBed.get(AdminConfigService);
        expect(service).toBeTruthy();
    });
});
