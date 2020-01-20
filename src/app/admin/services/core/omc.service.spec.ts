import {TestBed} from '@angular/core/testing';

import {OmcService} from './omc.service';

describe('OmcService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: OmcService = TestBed.get(OmcService);
        expect(service).toBeTruthy();
    });
});
