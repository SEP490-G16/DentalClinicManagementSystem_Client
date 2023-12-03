//Get Appointments
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
  appointment_id: string;
  patient_id: string;
  patient_name: string;
  phone_number: number;
  procedure: number;
  doctor: string;
  time: number;
  migrated: string;
}

export interface DateDisabledItem {
  date: any;
  procedure: number;
}

//Add Appointment
export interface IAddAppointment {
  epoch: number
  appointment: AppointmentObject
}
export interface AppointmentObject {
  patient_id: string
  patient_name: string
  phone_number: string
  procedure_id: string,
  procedure_name: string,
  patient_created_date:string,
  reason: string,
  doctor: string,
  status: number,
  time: number
}


//Set to Edit Appointment
export interface ISelectedAppointment {
  appointment_id:string;
  patient_id:string ;
  doctor:string;
  patient_name:string;
  phone_number:string;
  procedure:string;
  time:number
}


//Edit Appointemnt
export interface IEditAppointmentBody {
  epoch: number
  new_epoch: number
  appointment: EditAppointment
}

export interface EditAppointment {
  patient_id: string
  patient_name: string
  phone_number: string
  procedure_id: string,
  procedure_name: string,
  reason: string,
  doctor: string,
  status: number,
  time: number
}
