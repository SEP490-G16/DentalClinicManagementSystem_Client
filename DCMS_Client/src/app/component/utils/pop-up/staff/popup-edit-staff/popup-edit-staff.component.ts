import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CognitoService } from 'src/app/service/cognito.service';
import { ToastrService } from 'ngx-toastr';
import { IStaff } from 'src/app/model/Staff';
import { IsThisSecondPipe } from 'ngx-date-fns';
import * as moment from 'moment-timezone';
import { MedicalProcedureGroupService } from 'src/app/service/MedicalProcedureService/medical-procedure-group.service';
import {ResponseHandler} from "../../../libs/ResponseHandler";
import {FacilityService} from "../../../../../service/FacilityService/facility.service";

@Component({
  selector: 'app-popup-edit-staff',
  templateUrl: './popup-edit-staff.component.html',
  styleUrls: ['./popup-edit-staff.component.css']
})
export class PopupEditStaffComponent implements OnInit {


  @Input() staffEdit: any;
  checked: boolean = true;
  staff: IStaff;
  staffId: string = "";
  role: string = "0";
  disable:boolean = false;
  imageURL: string | ArrayBuffer = 'https://icon-library.com/images/staff-icon/staff-icon-15.jpg';
  facilityList:any[]=[];
  constructor(
    private cognitoService: CognitoService,
    private serviceGroup: MedicalProcedureGroupService,
    private toastr: ToastrService,
    private facilityService:FacilityService
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
      image: "",
      zoneinfo: "",
      locale:""
    } as IStaff;
  }
  vailidateStaff = {
    name: '',
    dob: '',
    address: '',
    phone: '',
    gender: '',
    email: '',
    role: '',
  }
  isSubmitted: boolean = false;


  listDisplaySpe: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['staffEdit'] && this.staffEdit) {
      this.getFacilityList();
      this.staffId = this.staffEdit.staffId;
      this.staff.username = this.staffEdit.staffUserName;
      this.staff.name = this.staffEdit.staffName;
      this.staff.address = this.staffEdit.address;
      this.staff.description = this.staffEdit.note;
      this.staff.role = this.staffEdit.roleId;
      this.staff.phone = this.staffEdit.phoneNumber;
      this.staff.gender = this.staffEdit.gender;
      this.staff.email = this.staffEdit.email;
      this.staff.zoneinfo = this.staffEdit.zoneInfor;
      this.staff.DOB = this.staffEdit.dob;
      this.staff.locale = this.getFacilityName(this.staffEdit.locale);
      if (this.staffEdit.image != '') {
        this.imageURL = this.staffEdit.image;
      }
      console.log("staff", this.staffEdit)
      this.onChangeRole(this.staff.role);
      if (this.staffEdit.zoneInfor != null) {
        const zone = this.staff.zoneinfo.split(',');
        for (let i = 0; i < zone.length; i++) {
          this.listDisplaySpe.push(zone[i]);
        }
        console.log(this.listDisplaySpe.length);
      }
    }
  }
  getFacilityList(){
    this.facilityService.getFacilityList().subscribe(data=>{
      this.facilityList = data.data;
      console.log(this.facilityList)
    },error => {
      ResponseHandler.HANDLE_HTTP_STATUS(this.facilityService.url, error);
    })
  }
  getFacilityName(id:string):any{
    const facility = this.facilityList.find((s:any) => s.facility_id === id);
    if (facility){
      return facility.name;
    }
  }
  ngOnInit(): void {
  }

  saveEditedStaff(userName: string, roleId: string) {
    let zoneinfo = '';
    this.selectedServiceGroupIds.forEach((item: any) => {
      zoneinfo += item + ",";
    })
    this.cognitoService.putStaff(userName, roleId, zoneinfo).subscribe(
      (res) => {
        this.disable = true;
        this.showSuccessToast("Cập nhật thông tin nhân viên thành công!");
        window.location.reload();
      },
      () => {
        this.showErrorToast("Cập nhật thông tin nhân viên thất bại!");
        this.disable = false;
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
  // serviceGroups: any[] = [];
  // onChangeRole(role: any) {
  //   if (role == 2) {
  //     this.serviceGroup.getMedicalProcedureGroupList().subscribe(data => {
  //       this.serviceGroups = data.data.map((s: any) => ({ ...s, checked: false }));
  //     })
  //   }
  //   else {
  //     this.serviceGroups = [];
  //   }
  // }


  onFileSelected(event: any) {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Data = e.target.result;
        alert("đã vô nha")
        this.resizeImage(base64Data, 150, 200)
          .then(resizedBase64 => {
            this.imageURL = resizedBase64;
            alert(this.imageURL);
          })
          .catch(error => {
            console.error('Error resizing image:', error);
          });
      };
      reader.readAsDataURL(file);
    }
  }
  resizeImage(base64Data: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        let newWidth, newHeight;
        if (width > height) {
          newWidth = maxWidth;
          newHeight = Math.round(height * (maxWidth / width));
        } else {
          newHeight = maxHeight;
          newWidth = Math.round(width * (maxHeight / height));
        }

        if (newWidth * newHeight > 2048) {
          reject(new Error('The output image size exceeds 2048 characters.'));
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Cannot get 2D context.'));
          return;
        }

        context.drawImage(img, 0, 0, newWidth, newHeight);
        const resizedBase64 = canvas.toDataURL();
        resolve(resizedBase64);
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = base64Data;
    });
  }
  normalizePhoneNumber(phoneNumber: string) {
    if (phoneNumber.startsWith('(+84)')) {
      return '0' + phoneNumber.slice(5);
    } else if (phoneNumber.startsWith('+84')) {
      return '0' + phoneNumber.slice(3);
    } else {
      return phoneNumber;
    }
  }
  serviceGroups: any[] = [];
  onChangeRole(role: any) {
    if (role == 2) {
      this.serviceGroup.getMedicalProcedureGroupList().subscribe(data => {
        this.serviceGroups = data.data.map((s: any) => ({ ...s, checked: false }));
        this.serviceGroups.forEach((item: any) => {
          this.listDisplaySpe.forEach((a: any) => {
            if (item.medical_procedure_group_id == a) {
              this.selectedServiceGroupIds.push(item.medical_procedure_group_id);
              item.checked = true;
            }
          })
        })
      })
    }
    else {
      this.serviceGroups = [];
    }
  }
  selectedServiceGroupIds: string[] = [];
  onCheckboxChange(serviceGroup: any) {
    if (serviceGroup.checked) {
      // Thêm ID vào mảng nếu checkbox được tích
      this.selectedServiceGroupIds.push(serviceGroup.medical_procedure_group_id);
    } else {
      // Loại bỏ ID khỏi mảng nếu checkbox bị bỏ tích
      const index = this.selectedServiceGroupIds.indexOf(serviceGroup.medical_procedure_group_id);
      if (index > -1) {
        this.selectedServiceGroupIds.splice(index, 1);
      }
    }
  }
}
