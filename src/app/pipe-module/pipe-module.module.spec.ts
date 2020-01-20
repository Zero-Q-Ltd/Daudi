import {PipeModuleModule} from "./pipe-module.module";

describe("PipeModuleModule", () => {
    let pipeModuleModule: PipeModuleModule;

    beforeEach(() => {
        pipeModuleModule = new PipeModuleModule();
    });

    it("should create an instance", () => {
        expect(pipeModuleModule).toBeTruthy();
    });
});
