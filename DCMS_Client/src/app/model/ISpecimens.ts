export interface SpecimensRoot {
  message: string
  data: Specimen[]
}

export interface Specimen {
  ms_id: string
  ms_type: string
  ms_name: string
  ms_quantity: number
  ms_unit_price?: number
  ms_order_date?: string
  ms_orderer: string
  ms_received_date?: string
  ms_receiver?: string
  ms_warranty: any
  ms_description: any
  ms_status: number
  facility_id: string
  lb_id: any
  p_patient_id?: string
  p_patient_name?: string
}


export interface PutSpecimen {
  ms_type: string
  ms_name: string
  ms_quantity: number
  ms_unit_price?: number
  ms_order_date?: string
  ms_orderer: string
  ms_received_date?: string
  ms_receiver?: string,
  ms_use_date: string,
  ms_warranty: any
  ms_description: any
  ms_status: number
  facility_id: string
  lb_id: any
  p_patient_id?: string
  p_patient_name?: string
}

