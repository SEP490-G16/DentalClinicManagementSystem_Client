import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CognitoService } from 'src/app/service/cognito.service';
import { ToastrService } from 'ngx-toastr';
import { IStaff } from 'src/app/model/Staff';
import { IsThisSecondPipe } from 'ngx-date-fns';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-popup-edit-staff',
  templateUrl: './popup-edit-staff.component.html',
  styleUrls: ['./popup-edit-staff.component.css']
})
export class PopupEditStaffComponent implements OnInit {
 
  @Input() staffEdit:any;
  
  staff: IStaff;
  staffId: string = ""; 
  role:string = "0";
  imageURL: string | ArrayBuffer = 'https://icon-library.com/images/staff-icon/staff-icon-15.jpg';
  constructor(
    private cognitoService: CognitoService,
    private toastr: ToastrService
  ) {
    this.staff = {
      username: "",
      email: "",
      name: "",
      phone: "",
      address: "",
      description: "",
      role: "",
      DOB: "",
      status: "1",
      image: ""
    } as IStaff;
  }
  vailidateStaff = {
    name:'',
    dob:'',
    address:'',
    phone:'',
    gender:'',
    email:'', 
    role: '',
  }
  isSubmitted:boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['staffEdit']) {
      this.staffId = this.staffEdit.staffId;
      this.staff.username = this.staffEdit.staffUserName;
      this.staff.name = this.staffEdit.staffName;
      this.staff.address = this.staffEdit.address;
      this.staff.description = this.staffEdit.note;
      this.staff.role = this.staffEdit.roleId;
      this.staff.phone = this.staffEdit.phone_number;
      this.staff.gender = this.staffEdit.gender;
      this.staff.email = this.staffEdit.email;
      this.staff.DOB = this.timestampToDate(this.staffEdit.dob)
      if (this.staffEdit.staffImage != '') {
        this.imageURL = this.staffEdit.image;
      }
    }
  }

  ngOnInit(): void {
   
  }

  saveEditedStaff(userName:string, roleId: string) {
    this.cognitoService.putStaff(userName, roleId).subscribe(
      (res) => {
        this.showSuccessToast("Sửa Labo thành công");
        window.location.reload();
      },
      () => {
        this.showErrorToast("Sửa Labo thất bại");
      }
    );
  }

  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
  }

  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000,
    });
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000,
    });
  }
}
