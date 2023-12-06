import { Component, OnInit } from "@angular/core";

@Component({
  selector: 'app-register-work-schedule',
  templateUrl: './register-work-schedule.component.html',
  styleUrls: ['./register-work-schedule.component.css'],
})
export class RegisterWorkScheduleComponent implements OnInit {
  UserObj: any;
  roleId: any;
  selectedShift: { [key: string]: number } = {};
  constructor() {
  }

  ngOnInit(): void {
    const role = sessionStorage.getItem("role");
    if (role != null) {
      this.roleId = role;
    }
    var storedUserJsonString = sessionStorage.getItem('UserObj');
    if (storedUserJsonString !== null) {
      var storedUserObject: User = JSON.parse(storedUserJsonString);
      console.log("Oki or Ok?: ", (storedUserObject !== null || undefined) ? "Oki" : "Ok");
      this.UserObj = storedUserObject;
      console.log(this.UserObj);
    } else {
      console.error('Stored user JSON string is null.');
      this.UserObj = null;
    }
  }

  weekDays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

  registeredData: RegisteredData = {
    'Thứ Hai': {
      shift1: [{ name: 'Nguyễn Văn A', avatar: 'path/to/avatar1.jpg' }, { name: 'Trần Thị B', avatar: 'path/to/avatar2.jpg' }],
      shift2: [{ name: 'Lê Văn C', avatar: 'path/to/avatar3.jpg' }, { name: 'Phạm Thị D', avatar: 'path/to/avatar4.jpg' }]
    },
    'Thứ Ba': {
      shift1: [{ name: 'Hoàng Văn E', avatar: 'path/to/avatar5.jpg' }],
      shift2: [{ name: 'Nguyễn Thị F', avatar: 'path/to/avatar6.jpg' }, { name: 'Võ Văn G', avatar: 'path/to/avatar7.jpg' }]
    },
  };
  registerShift(day: string, shiftNumber: number) {
    this.selectedShift[day] = shiftNumber;

  }
  registerEmployee(day: string, shift: number): void {

  }

  getRegisteredEmployees(day: string, shift: number) {
    let shiftKey: 'shift1' | 'shift2' = shift === 1 ? 'shift1' : 'shift2';
    return this.registeredData[day] ? this.registeredData[day][shiftKey] : [];
  }
}


interface User {
  role: string;
  subId: string;
  username: string;
  locale: string;
  clock_in: number;
  clock_out: number;
}

interface Employee {
  name: string;
  avatar: string;
}

interface ShiftSchedule {
  shift1: Employee[];
  shift2: Employee[];
}

interface RegisteredData {
  [day: string]: ShiftSchedule;
}
