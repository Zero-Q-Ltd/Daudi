import {inject, TestBed} from '@angular/core/testing';

import {LoggingService} from './logging-service.service';

describe('LoggingServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggingService]
    });
  });

  it('should be created', inject([LoggingService], (service: LoggingService) => {
    expect(service).toBeTruthy();
  }));
});
