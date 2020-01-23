import {TestBed} from '@angular/core/testing';

import {AseService} from './ase.service';

describe('AseService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: AseService = TestBed.get(AseService);
        expect(service).toBeTruthy();
    });
});
