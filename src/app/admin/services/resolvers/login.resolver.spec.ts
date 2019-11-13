import { TestBed } from "@angular/core/testing";

import { LoginResolver } from "./login.resolver";

describe("LoginService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: LoginResolver = TestBed.get(LoginResolver);
    expect(service).toBeTruthy();
  });
});
