import {AdminModule} from "./admin.module";

describe("BackendModule", () => {
  let backendModule: AdminModule;

  beforeEach(() => {
    backendModule = new AdminModule();
  });

  it("should create an instance", () => {
    expect(backendModule).toBeTruthy();
  });
});
