export interface IPostWaitingRoom {
  epoch: string
  produce_id: string
  produce_name: string
  patient_id: string
  patient_name: string
  reason: string
  status: string,
  patient_created_date: string,
  appointment_id:string,
  appointment_epoch:string
}

export interface IPostWaitingRoomNew {
  epoch: string;
  time_attr: string;
  produce_id: string;
  produce_name: string;
  patient_id: string;
  patient_name: string;
  is_new: boolean;
  reason: string;
  status_attr:string;
  foreign_sk: string;
}

export interface IPutWaitingRoomNew {
  time_attr: string;
  produce_id: string;
  produce_name: string;
  patient_id: string;
  patient_name: string;
  is_new: boolean;
  reason: string;
  status_attr:string;
  foreign_sk: string;
}
