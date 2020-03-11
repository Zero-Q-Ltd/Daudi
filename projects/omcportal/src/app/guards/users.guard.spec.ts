import {inject, TestBed} from '@angular/core/testing';

import {UsersGuard} from './users.guard';

describe('UsersGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsersGuard]
    });
  });

  it('should ...', inject([UsersGuard], (guard: UsersGuard) => {
    expect(guard).toBeTruthy();
  }));
});
