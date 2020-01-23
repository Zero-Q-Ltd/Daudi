import {TestBed} from '@angular/core/testing';
import {AdminService} from "../admin.service;

describe('AdminsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdminService = TestBed.get(AdminService);
    expect(service).toBeTruthy();
  });
});
