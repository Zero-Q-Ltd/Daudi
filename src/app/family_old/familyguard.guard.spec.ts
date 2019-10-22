import {inject, TestBed} from "@angular/core/testing";

import {FamilyguardGuard} from "./familyguard.guard";

describe("FamilyguardGuard", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FamilyguardGuard]
    });
  });

  it("should ...", inject([FamilyguardGuard], (guard: FamilyguardGuard) => {
    expect(guard).toBeTruthy();
  }));
});
