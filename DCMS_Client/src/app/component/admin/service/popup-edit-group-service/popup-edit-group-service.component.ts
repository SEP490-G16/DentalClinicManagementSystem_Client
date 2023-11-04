import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {
  MedicalProcedureGroupService
} from "../../../../service/MedicalProcedureService/medical-procedure-group.service";
import {ToastrService} from "ngx-toastr";
import {HttpResponse} from "@angular/common/http";
import {tap} from "rxjs";

@Component({
  selector: 'app-popup-edit-group-service',
  templateUrl: './popup-edit-group-service.component.html',
  styleUrls: ['./popup-edit-group-service.component.css']
})
export class PopupEditGroupServiceComponent implements OnChanges {
  @Input() id:any;
  @Input() name:any;
  @Input() description:any;
  serviceGroup={
    serviceGroupName: '',
    description: ''
  }
  isCheckName:boolean=false;
  constructor(private medicalProcedureGroupService: MedicalProcedureGroupService,
              private toastr:ToastrService) {
  }

  serviceGroupBody={
    name:'',
    description:''
  }
  ngOnInit(): void {
    this.serviceGroup={
      serviceGroupName: this.name,
      description: this.description
    }
  }

  updateServiceGroup(){
    if (!this.serviceGroup.serviceGroupName) {
      this.isCheckName = true;
      return;
    }
    this.serviceGroupBody={
      name: this.serviceGroup.serviceGroupName,
      description: this.serviceGroup.description
    }
    /*this.medicalProcedureGroupService.updateMedicalProcedureGroup(this.serviceGroupBody, this.id).pipe(
      tap(data => {
        console.log('Phản hồi:', data);
      })
    ).subscribe(
      (response) => {
        console.log("response0", response);

        if (response.status === 200) {
          this.toastr.success('Cập nhật nhóm thủ thuật thành công!');
        } else {
          this.toastr.error('1 Cập nhật nhóm thủ thuật thất bại!');
        }
      },
      (error) => {
        console.log("error", error);
        if (error instanceof HttpResponse) {
          // Xử lý phản hồi có HTTP status code 200 trong trường hợp lỗi
          if (error.status === 200) {
            this.toastr.success('Cập nhật nhóm thủ thuật thành công trong trường hợp lỗi!');
          } else {
            // Xử lý các trường hợp lỗi khác
            this.toastr.error(' 2 Cập nhật nhóm thủ thuật thất bại!');
          }
        } else {
          // Xử lý các trường hợp lỗi không phải là HTTP response
          this.toastr.error(' 3Cập nhật nhóm thủ thuật thất bại!');
        }
      })*/
     this.medicalProcedureGroupService.updateMedicalProcedureGroup(this.serviceGroupBody, this.id).subscribe(data=>{
       console.log(data);
       this.toastr.success('Cập nhật nhóm thủ thuật thành công!');
        let ref = document.getElementById('cancel');
         ref?.click();
        window.location.reload();
     },
       error => {

           this.toastr.error('Cập nhật nhóm thủ thuật thất bại!');

       })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes["description"]){
      this.serviceGroup.description = this.description;
    }
    if(changes["name"]){
      this.serviceGroup.serviceGroupName = this.name;
    }
  }

}
