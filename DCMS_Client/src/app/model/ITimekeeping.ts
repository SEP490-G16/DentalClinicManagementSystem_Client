export interface RequestBodyTimekeeping {
  epoch: number
  sub_id: string
  staff_role: string
  register_clock_in?: number
  register_clock_out?: number
  staff_name: string
  staff_avt: string
  clock_in: number
  clock_out: number
  //timekeeper_name?: string
  //timekeeper_avt?: string
  status_attr:number
}
export interface TimekeepingDetail {
  clock_in?: string;
  clock_out?: string;
  register_clock_in?: string,
  register_clock_out?: string,
  staff_name?: string;
}
export interface TimekeepingSubRecord {
  subId: string;
  details: TimekeepingDetail;
}

export interface TimekeepingRecord {
  epoch: string;
  type?: string;
  records: TimekeepingSubRecord[];
}

export interface StaffTimekeeping {
  name: string,
  role: string,
  sub: string,
  staff_avt: string,
  locale:string,
  register_clock_in?: number,
  register_clock_out?: number,
  weekTimekeeping: { [key: number]: { clockIn: string, clockOut: string } };
}

export interface StaffRegisterWorkSchedule {
  name: string,
  role: string,
  subId: string,
  staff_avt: string,
  locale:string,
  clock_in: number,
  clock_out: number,
  register_clock_in: string,
  register_clock_out: string,
  epoch:number,
  registerSchedules: { [key: number]: { startTime: string, endTime: string } };
}


export interface RegisterWorkSchedule {
  epoch: string;
  type?: string;
  records: RegisterWorkScheduleRecord[];
}

export interface RegisterWorkScheduleRecord {
  subId: string;
  clock_in?: string;
  clock_out?: string;
  register_clock_in?: string;
  register_clock_out?: string;
  staff_name?: string;
  epoch: string;
}
