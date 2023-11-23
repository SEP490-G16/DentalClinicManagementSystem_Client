export interface ITreatmentCourseDetail {
  message: string
  data: TreatmentCourseDetail[]
}

export interface TreatmentCourseDetail {
  examination_id: string,
  diagnosis: any,
  xRayImage: any,
  created_date: string,
  treatment_course_id: string,
  facility_id: string,
  description: any,
  staff_id: string,
  xRayImageDes: any,
  medicine: any,
  status: number
}


export interface Examination {
  treatment_course_id: string,
  diagnosis: any,
  created_date: string,
  facility_id: string,
  description: any,
  staff_id: string,
  'x-ray-image': any,
  'x-ray-image-des': any,
  medicine: any
}
