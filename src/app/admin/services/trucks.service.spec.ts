import {TestBed} from "@angular/core/testing";

import {TrucksService} from "./trucks.service";

describe("TrucksService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: TrucksService = TestBed.get(TrucksService);
    expect(service).toBeTruthy();
  });
});
