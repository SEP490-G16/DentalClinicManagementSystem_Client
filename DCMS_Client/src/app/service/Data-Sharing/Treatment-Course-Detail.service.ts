import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TreatmentCourseDetail } from 'src/app/model/ITreatmentCourseDetail';

@Injectable()
export class treatementCourseDSService {
  private treatmentCourseDetailSource = new BehaviorSubject<TreatmentCourseDetail | null>(null);
  currentTreatmentCourseDetail = this.treatmentCourseDetailSource.asObservable();

  constructor() { }

  changeTreatmentCourseDetail(detail: TreatmentCourseDetail) {
    this.treatmentCourseDetailSource.next(detail);
  }
}
