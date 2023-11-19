import { Component, OnInit } from '@angular/core';
import {PatientService} from "../../../../service/PatientService/patient.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import { CognitoService } from 'src/app/service/cognito.service';
import { CommonService } from 'src/app/service/commonMethod/common.service';

@Component({
  selector: 'app-patient-profile-tab',
  templateUrl: './patient-profile-tab.component.html',
  styleUrls: ['./patient-profile-tab.component.css']
})
export class PatientProfileTabComponent implements OnInit {
  protected readonly window = window;
  constructor(private patientService:PatientService,
              private route:ActivatedRoute,
              private cognitoService:CognitoService,
              private router:Router,
              private commonService:CommonService,
              private toastr: ToastrService) { }
  patient:any;
  id:any;
  patientBody:any={
    patient_id: '',
    date_of_birth: '',
    created_date: '',
    patient_name:'',
    gender:0,
    phone_number:'',
    email:'',
    address:'',
    dental_medical_history:'',
    description:''
  }
  validatePatient = {
    name:'',
    gender:'',
    phone:'',
    address:'',
    dob:'',
    email:'',
    createDate:''
  }
  isSubmitted:boolean = false;
  isEditing: boolean = false;



  ngOnInit(): void {
    this.id=this.route.snapshot.params['id'];
    this.getPatient(this.id);
  }

  navigateHref(href: string) {
   this.commonService.navigateHref(href, this.id);
  }

  imageURL: string | ArrayBuffer = '';

  onFileSelected(event: any) {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imageURL = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }

  setPatientId(){
    this.router.navigate(['/benhnhan/danhsach/tab/lichtrinhdieutri', this.id])
  }

  clickCount: number = 0;
  toggleEditing() {
    this.clickCount++;
    if (this.clickCount % 2 !== 0){
      console.log(this.isEditing)
      this.isEditing = true;
      this.resetValidate();
      if (!this.patient.patient_name){
        this.validatePatient.name = "Vui lòng nhập tên bệnh nhân!";
        this.isSubmitted = true;
      }
      if (!this.patient.dob){
        this.validatePatient.dob = "Vui lòng nhập ngày sinh!";
        this.isSubmitted = true;
      }
      if (this.patient.email && !this.isValidEmail(this.patient.email)){
        this.validatePatient.email = "Email không hợp lệ!";
        this.isSubmitted = true;
      }
      if (!this.patient.gender){
        this.validatePatient.gender = "Vui lòng chọn giới tính!";
        this.isSubmitted = true;
      }
      if (!this.patient.phone_number){
        this.validatePatient.phone = "Vui lòng nhập số điện thoại!";
        this.isSubmitted = true;
      }
      else if (!this.isVietnamesePhoneNumber(this.patient.phone_number)){
        this.validatePatient.phone = "Số điện thoại không hợp lệ!";
        this.isSubmitted = true;
      }
      if (!this.patient.address){
        this.validatePatient.address = "Vui lòng nhập địa chỉ!";
        this.isSubmitted = true;
      }
      if (this.isSubmitted){
        return;
      }
    }else {
        this.patientBody = {
          patient_id: this.patient.patient_id,
          dob: this.patient.dob,
          patient_name: this.patient.patient_name,
          gender: this.patient.gender,
          phone_number: this.patient.phone_number,
          email: this.patient.email,
          address: this.patient.address,
          dental_medical_history: this.patient.dental_medical_history,
          description: this.patient.description
        }
        this.isEditing = false;
        this.patientService.updatePatient(this.patientBody, this.id).subscribe(data=>{
          this.toastr.success("",'Cập nhật bệnh nhân thành công !');
        },(error) => {
          this.toastr.error(error.error.message,'Cập nhật bệnh nhân thất bại!')
        })
    }

  }
  getPatient(id:string){
    this.patientService.getPatientById(id).subscribe(data=>{
      this.patient = data;
      console.log(data);
    })
  }
  private resetValidate(){
    this.validatePatient = {
      name:'',
      gender:'',
      phone:'',
      address:'',
      dob:'',
      email: '',
      createDate:''
    }
    this.isSubmitted = false;
  }
  private isVietnamesePhoneNumber(number:string):boolean {
    return /^(\+84|84|0)?[1-9]\d{8}$/
      .test(number);
  }
  private isValidEmail(email: string): boolean {
    // Thực hiện kiểm tra địa chỉ email ở đây, có thể sử dụng biểu thức chính quy
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
  }
}
