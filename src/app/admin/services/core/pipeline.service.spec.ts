import { TestBed } from '@angular/core/testing';

import { PipelineService } from './pipeline.service';

describe('PipelineService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PipelineService = TestBed.get(PipelineService);
    expect(service).toBeTruthy();
  });
});
