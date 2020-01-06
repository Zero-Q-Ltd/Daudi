import { AttachIdPipe } from "../../models/utils/SnapshotUtils";

describe("AttachIdPipe", () => {
  it("create an instance", () => {
    const pipe = new AttachIdPipe();
    expect(pipe).toBeTruthy();
  });
});
