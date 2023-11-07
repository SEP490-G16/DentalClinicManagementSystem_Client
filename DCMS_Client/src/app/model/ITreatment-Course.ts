export type ITreatmentCourse = TreatmentCourse[];

export interface TreatmentCourse {
  treatment_course_id: string
  patient_id: string
  description: string
  status: number
  created_date: string
  name: string
}
