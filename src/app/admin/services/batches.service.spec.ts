import {TestBed} from "@angular/core/testing";

import {BatchesService} from "./batches.service";

describe("BatchesService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: BatchesService = TestBed.get(BatchesService);
    expect(service).toBeTruthy();
  });
});
