import { TestBed } from '@angular/core/testing';

import { LocationCoordinatesService as LocationCoordinatesService } from './location-coordinates.service';

describe('LocationCoordinatesService', () => {
  let service: LocationCoordinatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationCoordinatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
