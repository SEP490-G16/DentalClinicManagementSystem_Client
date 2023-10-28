export interface RootObject {
  date: number;
  appointments: Appointment[];
}

export interface Appointment {
  procedure: number;
  count: number;
  details: Detail[];
}

export interface Detail {
  appointment_id: number;
  patient_id: string;
  patient_name: string;
  phone_number: number;
  procedure: number;
  doctor: string;
  time: number;
  migrated: string;
}




export interface IAddAppointment {
  epoch: number
  appointment: AppointmentObject
}

export interface AppointmentObject {
  patient_id: string
  patient_name: string
  phone_number: string
  procedure: number
  doctor: string
  time: number
}
