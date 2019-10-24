import {TestBed} from "@angular/core/testing";

import {DepotsService} from "./depots.service";

describe("DepotsService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: DepotsService = TestBed.get(DepotsService);
    expect(service).toBeTruthy();
  });
});
