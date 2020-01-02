import { TestBed } from '@angular/core/testing';

import { DBRoutesService } from './dbroutes.service';

describe('DBRoutesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DBRoutesService = TestBed.get(DBRoutesService);
    expect(service).toBeTruthy();
  });
});
