export interface RequestBodyTimekeeping {
  epoch: number
  sub_id: string
  role: string
  register_clock_in?: number
  register_clock_out?: number
  staff_name: string
  staff_avt: string
  clock_in: number
  clock_out: number
  timekeeper_name?: string
  timekeeper_avt?: string
  status:number
}


export interface StaffTimekeeping {
  name: string,
  role: string,
  sub: string,
  staff_avt: string,
  locale:string,
  clockInStatus: string,
  clockOutStatus: string,
  clock_in: string,
  clock_out: string,
  register_clock_in?: number,
  register_clock_out?: number,
  isClockinDisabled?: boolean;
  isClockoutDisabled?: boolean;
  isInputEnabled?: boolean;
  isClockin: boolean,
  isClockout: boolean,
  weekTimekeeping: { [key: number]: { clockIn: string, clockOut: string } };
}
