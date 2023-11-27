import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LaboService } from 'src/app/service/LaboService/Labo.service';
import { MedicalSupplyService } from 'src/app/service/MedicalSupplyService/medical-supply.service';
import { SpecimensService } from 'src/app/service/SpecimensService/SpecimensService.service';
import { CommonService } from 'src/app/service/commonMethod/common.service';
import * as moment from 'moment-timezone';
@Component({
  selector: 'app-patient-specimens',
  templateUrl: './patient-specimens.component.html',
  styleUrls: ['./patient-specimens.component.css']
})
export class PatientSpecimensComponent implements OnInit {
  Patient_Id:string = "";
  pagingSearch = {
    paging:1,
    total:0
  }
  PatientSpecimens:any [] = [];
  paging: any;
  count:number=1;

  approveSpecimensList:any;

  labos:any;
  AllLabos:any;
  PutSpecimen:any;

  status:any;
  specimen:any;
  roleId: string[] = [];

  constructor(
    private commonService: CommonService,
    private SpecimensService: SpecimensService,
    private medicalSupplyService: MedicalSupplyService,
    private laboService:LaboService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
  ) {
    this.status = 1;
    this.paging = 1;
   }

  ngOnInit(): void {
    this.Patient_Id = this.route.snapshot.params['id'];
    this.getAllSpecimens(this.pagingSearch.paging);
    this.getAllLabo();
    this.getApproveSpecimensList(this.status, this.paging);

    let ro = sessionStorage.getItem('role');
    if (ro != null) {
      this.roleId = ro.split(',');
    }
  }

  getAllSpecimens(paging:number) {
    this.SpecimensService.getSpecimens(paging)
    .subscribe((res) => {
        console.log("Specimens Response: ", res);
        this.PatientSpecimens = res.data.filter((p:any) => p.p_patient_id === this.Patient_Id);
        console.log("Specimens by Patient: ", this.PatientSpecimens);
    },
    (err) => {
      this.toastr.error(err.error.message,"Lấy dữ liệu Mẫu vật thất bại!");
    })
  }

  getAllLabo() {
    this.laboService.getLabos().subscribe((data) => {
      this.labos = data.data;
      console.log("Get all Labo: ", this.labos);
    })
  }

  getApproveSpecimensList(status:any, paging:any){
    this.medicalSupplyService.getApproveSpecimensList(status, paging).subscribe(data=>{
      this.approveSpecimensList = data.data;
      console.log(this.approveSpecimensList);
    })
  }

  pageChanged(event: number) {
    this.pagingSearch.paging = event;
    console.log(this.pagingSearch.paging)
    this.getAllSpecimens(this.pagingSearch.paging);
  }

  openEditSpecimen(specimens:any) {
    this.PutSpecimen = specimens;
    this.AllLabos = this.labos;
  }

  deleteSpecimens(id:string) {
    const cf = confirm("Bạn có muốn xóa mẫu vật này không?");
    if(cf) {
      this.SpecimensService.deleteSpecimens(id)
      .subscribe((res) => {
        this.toastr.success(res.message, 'Xóa mẫu vật thành công');
        window.location.reload();
      },
      (err) => {
        this.toastr.error(err.error.message, 'Xóa mẫu vật thất bại');
      }
      )
    }
  }

  navigateHref(href: string) {
    this.commonService.navigateHref(href, this.Patient_Id);
  }

  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
  }

}
