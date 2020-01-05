import { TestBed } from "@angular/core/testing";

import { CoreAdminService } from "./core.service";

describe("CoreService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: CoreAdminService = TestBed.get(CoreAdminService);
    expect(service).toBeTruthy();
  });
});
