export interface RequestBodyTimekeeping {
  epoch: number
  sub_id: string
  staff_name: string
  staff_avt: string
  clock_in: number
  clock_out: number
  timekeeper_name: string
  timekeeper_avt: string
  status:number
}


export interface Staff {
  name: string,
  role: string,
  sub: string,
  clockInStatus: string,
  clockOutStatus: string,
  timeClockin: string,
  timeClockout: string,
  isClockin: boolean,
  isClockout: boolean,
  weekTimekeeping: { [key: number]: { clockIn: string, clockOut: string } };
}
