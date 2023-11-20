import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CognitoService } from 'src/app/service/cognito.service';
import { ToastrService } from 'ngx-toastr';
import { IStaff } from 'src/app/model/Staff';
import { IsThisSecondPipe } from 'ngx-date-fns';

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
      email: "",
      name: "",
      phone: "",
      address: "",
      description: "",
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
    email:''
  }
  isSubmitted:boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['staffEdit']) {
      this.staffId = this.staffEdit.staffId;
      this.role = this.staffEdit.roleId;
      this.staff.name = this.staffEdit.staffName;
      this.staff.address = this.staffEdit.address;
      this.staff.description = this.staffEdit.note;
      this.staff.phone = this.staffEdit.phone_number;
      this.staff.gender = this.staffEdit.gender;
      if (this.staffEdit.staffImage != '') {
        this.imageURL = this.staffEdit.image;
      }
    }
  }

  ngOnInit(): void {
   
  }

  saveEditedStaff() {
    this.staff.status = '1';
    this.staff.role = this.role;
    this.cognitoService.updateUserAttributes(sessionStorage.getItem('sub-id')+'', this.staff)
      .then((response) => {
        this.showSuccessToast('Cập nhật thông tin thành công');
      })
      .catch((error) => {
        this.showErrorToast('Cập nhật thông tin thất bại');
      });
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
