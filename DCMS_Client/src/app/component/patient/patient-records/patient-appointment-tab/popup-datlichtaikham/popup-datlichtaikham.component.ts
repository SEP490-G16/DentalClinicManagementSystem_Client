import { Component, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCalendar, NgbDate, NgbDateStruct, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';
import 'moment/locale/vi';
import { ToastrService } from 'ngx-toastr';
import { DateDisabledItem, IAddAppointment, RootObject } from 'src/app/model/IAppointment';
import { IPatient, Patient } from 'src/app/model/IPatient';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';

@Component({
  selector: 'app-popup-datlichtaikham',
  templateUrl: './popup-datlichtaikham.component.html',
  styleUrls: ['./popup-datlichtaikham.component.css']
})
export class PopupDatlichtaikhamComponent implements OnInit, OnChanges {

  procedure: string = "1";
  isPatientInfoEditable: boolean = false;

  dateDisabled: any;
  AppointmentBody: IAddAppointment;
  appointmentTime = "";

  model!: NgbDateStruct;
  datePickerJson = {};
  markDisabled: any;
  isDisabled: any;
  json = {
    disabledDates: [
      { year: 2023, month: 11, day: 10 },
      { year: 1970, month: 1, day: 1 },
      { year: 1970, month: 1, day: 1 }
    ]
  };
  validateAppointment = {
    phoneNumber: '',
    procedure: '',
    appointmentTime: '',
    appointmentDate: '',
  }
  isSubmitted: boolean = false;

  seedDateDisabled = [
    {
      "date": 1699589964,
      "appointments": [
        {
          "procedure": 1,
          "count": 16,
          "details": [
            {
              "appointment_id": "6e005b74-dc60-4ad9-9a4f-11954b94c2a7",
              "patient_id": "P-000001",
              "patient_name": "Nguyễn Văn An",
              "phone_number": "0123456789",
              "procedure": 1,
              "doctor": "Bác sĩ A",
              "time": "1698688620",
              "attribute_name": "",
              "epoch": 0,
              "migrated": "false"
            }
          ]
        }
      ]
    },
    {
      "date": 1,
      "appointments": [
        {
          "procedure": 4,
          "count": 20,
          "details": [
            {
              "appointment_id": "6e005b74-dc60-4ad9-9a4f-11954b94c2a7",
              "patient_id": "P-000001",
              "patient_name": "Nguyễn Văn An",
              "phone_number": "0123456789",
              "procedure": 1,
              "doctor": "Bác sĩ A",
              "time": "1698688620",
              "attribute_name": "",
              "epoch": 0,
              "migrated": "false"
            }
          ]
        }
      ]
    },
    // Thêm các đối tượng khác tại đây nếu cần
  ];


  mindate: Date;
  minTime: string;
  constructor(private APPOINTMENT_SERVICE: ReceptionistAppointmentService,
    private PATIENT_SERVICE: PatientService,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private config: NgbDatepickerConfig,
    private calendar: NgbCalendar
  ) {
    this.isDisabled = (date: NgbDateStruct) => {
      return this.dateDisabled.find((x: any) =>
        (new NgbDate(x.year, x.month, x.day).equals(date))
      )
        ? true
        : false;
    };

    this.AppointmentBody = {
      epoch: 0,    //x
      appointment: {
        patient_id: '',  //x
        patient_name: '', //x
        phone_number: '', //x
        procedure: 1,  //x
        doctor: '', //x
        time: 0  //x
      }
    } as IAddAppointment;

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.minTime = `${hours}:${minutes}`;
    this.mindate = new Date();

    const currentTime = new Date();

    // Set date time hiện tại
    const currentTimeGMT7 = moment.tz('Asia/Ho_Chi_Minh').format('HH:mm');
    this.appointmentTime = currentTimeGMT7;

    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

    this.model = {
      year: parseInt(currentDateGMT7.split('-')[0]),
      month: parseInt(currentDateGMT7.split('-')[1]),
      day: parseInt(currentDateGMT7.split('-')[2])
    };
    console.log(this.appointmentDate);

    //Date disabled
    this.dateDisabled = this.seedDateDisabled
      .filter(item => item.appointments.some(appointment => appointment.count > 15))
      .map(item => ({ date: item.date, procedure: item.appointments[0].procedure }));
    console.log(this.dateDisabled);
  }

  id: string = "";

  startDate: any;
  endDate: string = "2023-12-31";
  startDateTimestamp: number = 0;
  endDateTimestamp: number = 0;
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.startDate = currentDateGMT7;

    this.startDateTimestamp = this.dateToTimestamp(currentDateGMT7);
    this.endDateTimestamp = this.dateToTimestamp(this.endDate);
    this.getAppointmentList();

    this.getPatientById();
  }
  appointmentList: RootObject[] = [];
  getAppointmentList() {

    // console.log(startDateTimestamp);
    this.APPOINTMENT_SERVICE.getAppointmentList(this.startDateTimestamp, this.endDateTimestamp).subscribe(data => {
      this.appointmentList = ConvertJson.processApiResponse(data);
      console.log("Appointment List: ", this.appointmentList);

      this.appointmentDateInvalid();
    })
  }


  datesDisabled: DateDisabledItem[] = [];
  appointmentDateInvalid() {
    // Get Date
    this.datesDisabled = this.seedDateDisabled
      .filter(item => item.appointments.some(appointment => appointment.count > 15))
      .map(item => {
        const dateString: string = this.convertTimestampToVNDateString(item.date);
        console.log(item.date);
        console.log(dateString);
        const dateStruct: NgbDateStruct = this.convertDateStringToNgbDateStruct(dateString);
        return { date: dateStruct, procedure: item.appointments[0].procedure };
      });

    console.log("Date disabled: ", this.datesDisabled);

    // Convert to JSON format
    this.json.disabledDates = this.datesDisabled.map(date => ({
      year: date.date.year,
      month: date.date.month,
      day: date.date.day
    }));
    console.log(this.json);
  }

  convertDateStringToNgbDateStruct(dateString: string): NgbDateStruct {
    const [year, month, day] = dateString.split('/').map(Number);
    return { year, month, day };
  }


  patientData: any;
  getPatientById() {
    this.PATIENT_SERVICE.getPatientById(this.id).subscribe(data => {
      console.log("Patient: ", data);
      this.patientData = data;
      this.AppointmentBody.appointment.patient_id = this.patientData.patient_id;
      this.AppointmentBody.appointment.patient_name = this.patientData.patient_name;
      this.AppointmentBody.appointment.phone_number = this.patientData.phone_number;
      this.appointmentDateInvalid();
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['datesDisabled'] && this.datesDisabled && this.datesDisabled.length > 0) {
    //   this.datesDisabled = this.datesDisabled.map((timestamp: number) => {
    //     const date = new Date(timestamp * 1000); // Chuyển đổi timestamp sang date
    //     return date.toISOString().slice(0, 10); // Lấy phần yyyy-MM-dd
    //   });
    //   console.log("Date Parse: ", this.datesDisabled);
    // }
  }


  selectedDoctor: any = null;
  selectDoctor(doctor: any) {
    this.selectedDoctor = doctor;
    console.log(this.AppointmentBody.appointment.doctor = doctor.name)
    this.AppointmentBody.appointment.doctor = doctor.name;
  }

  appointmentDate: string = '';
  onPostAppointment() {

    //Convert model to string
    const selectedYear = this.model.year;
    const selectedMonth = this.model.month.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số
    const selectedDay = this.model.day.toString().padStart(2, '0'); // Đảm bảo có 2 chữ số

    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    console.log(selectedDate); // Đây là ngày dưới dạng "YYYY-MM-DD"


    this.AppointmentBody.epoch = this.dateToTimestamp(selectedDate);
    console.log(this.AppointmentBody.epoch);
    this.AppointmentBody.appointment.time = this.timeAndDateToTimestamp(this.appointmentTime, selectedDate);

    console.log("AppointmentBody: ", this.AppointmentBody);
    // Gọi API POST

    this.APPOINTMENT_SERVICE.postAppointment(this.AppointmentBody).subscribe(
      (response) => {
        console.log('Lịch hẹn đã được tạo:', response);
        this.showSuccessToast('Lịch hẹn đã được tạo thành công!');
        this.AppointmentBody = {
          epoch: 0,    //x
          appointment: {
            patient_id: '',  //x
            patient_name: '', //x
            phone_number: '', //x
            procedure: 1,  //x
            doctor: '', //x
            time: 0  //x
          }
        } as IAddAppointment;
        this.procedure = '';
        this.appointmentTime = '';
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      },
      (error) => {
        console.error('Lỗi khi tạo lịch hẹn:', error);
        this.showErrorToast('Lỗi khi tạo lịch hẹn!');
      }
    );

  }

  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm:ss'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf();
    return timestamp;
  }

  timestampToGMT7String(timestamp: number): string {
    // Chuyển timestamp thành chuỗi ngày và thời gian dựa trên múi giờ GMT+7
    const dateTimeString = moment.tz(timestamp * 1000, 'Asia/Ho_Chi_Minh').format('HH:mm');
    return dateTimeString;
  }


  timeAndDateToTimestamp(timeStr: string, dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày và thời gian
    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const timestamp = moment.tz(dateTimeStr, format, timeZone).valueOf();
    return timestamp;
  }

  convertTimestampToDateString(timestamp: number): string {
    return moment(timestamp).format('YYYY-MM-DD');
  }

  convertTimestampToVNDateString(timestamp: number): string {
    return moment(timestamp * 1000).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY');
  }



  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }


  close() {
    this.AppointmentBody = {
      epoch: 0,    //x
      appointment: {
        patient_id: '',  //x
        patient_name: '', //x
        phone_number: '', //x
        procedure: 1,  //x
        doctor: '', //x
        time: 0  //x
      }
    } as IAddAppointment;
  }

  doctors = [
    { name: 'Bác sĩ A. Nguyễn', specialty: 'Nha khoa', image: 'https://th.bing.com/th/id/OIP.62F1Fz3e5gRZ1d-PAK1ihQAAAA?pid=ImgDet&rs=1' },
    { name: 'Bác sĩ B. Trần', specialty: 'Nha khoa', image: 'https://gamek.mediacdn.vn/133514250583805952/2020/6/8/873302766563216418622655364023183338578077n-15915865604311972647945.jpg' },
    { name: 'Bác sĩ C. Lê', specialty: 'Nha khoa', image: 'https://img.verym.com/group1/M00/03/3F/wKhnFlvQGeCAZgG3AADVCU1RGpQ414.jpg' },
  ];
  private resetValidate() {
    this.validateAppointment = {
      phoneNumber: '',
      procedure: '',
      appointmentTime: '',
      appointmentDate: '',
    }
    this.isSubmitted = true;
  }

}
