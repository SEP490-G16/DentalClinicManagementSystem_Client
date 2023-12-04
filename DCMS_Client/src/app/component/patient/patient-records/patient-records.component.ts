import { Component, OnInit, ViewChild } from '@angular/core';
import { PatientService } from "../../../service/PatientService/patient.service";
import { IPatient } from "../../../model/IPatient";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PopupAddPatientComponent } from "../../utils/pop-up/patient/popup-add-patient/popup-add-patient.component";
import { CognitoService } from 'src/app/service/cognito.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ResponseHandler } from '../../utils/libs/ResponseHandler';
import { PopupDeletePatientComponent } from '../../utils/pop-up/patient/popup-delete-patient/popup-delete-patient.component';
import { ConfirmDeleteModalComponent } from '../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component';
@Component({
  selector: 'app-patient-records',
  templateUrl: './patient-records.component.html',
  styleUrls: ['./patient-records.component.css']
})
export class PatientRecordsComponent implements OnInit {
  searchPatientsList: any[] = [];
  currentPage: number = 1;
  hasNextPage: boolean = false;
  pagingSearch = {
    paging: 1,
    total: 0
  }
  count: number = 1;
  id: any;
  search: string = '';
  constructor(private patientService: PatientService,
    private toastr: ToastrService,
    private router: Router,
    private cognitoService: CognitoService,
    private modalService: NgbModal) { }
  @ViewChild(PopupDeletePatientComponent) popupDeletePatientComponent!: PopupDeletePatientComponent;
  ngOnInit(): void {
    this.loadPage(this.pagingSearch.paging);
  }
  checkNextPage() {
    this.hasNextPage = this.searchPatientsList.length > 10;
  }
  loadPage(paging: number) {
    this.currentPage = paging;
    this.pagingSearch.paging = paging;
    this.patientService.getPatientList(paging).subscribe(patients => {
      this.searchPatientsList = [];
      this.searchPatientsList = patients.data;
      this.searchPatientsList.forEach((p: any) => {
        p.phone_number = this.normalizePhoneNumber(p.phone_number);
      })
      this.checkNextPage();
      if (this.searchPatientsList.length > 10) {
        this.searchPatientsList.pop();
      }
      if (this.search.trim() !== "") {
        this.searchPatient();
      }
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.patientService.test + "/patient/name/" + paging, error);
      }
    )
  }

  errorStatus: number = 0;
  searchPatient() {
    if(this.search != null && this.search != "" && this.search != undefined){
      this.patientService.getPatientByName(this.search, this.pagingSearch.paging).subscribe(patients => {
        this.searchPatientsList = [];
        this.searchPatientsList = patients.data;
        this.searchPatientsList.forEach((p: any) => {
          p.phone_number = this.normalizePhoneNumber(p.phone_number);
        })
        this.checkNextPage();
        if (this.searchPatientsList.length > 10) {
          this.searchPatientsList.pop();
        }
      }, error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.patientService.test + "/patient/name/" + this.search + "/" + this.pagingSearch.paging, error)
      }
      ) 
    }else{
      this.loadPage(this.currentPage);
    }
  }
  ngAfterViewInit() {
    this.popupDeletePatientComponent.patientDeleted.subscribe(() => {
      this.loadPage(this.pagingSearch.paging);
    });
  }
  clicked: boolean = false;
  lastClickTime: number = 0
  pageChanged(event: number) {
    const currentTime = new Date().getTime();
    if (!this.clicked || (currentTime - this.lastClickTime >= 600)) {
      this.clicked = true;
      this.lastClickTime = currentTime;

      if (event >= 1) {
        this.loadPage(event);
      }
    }
  }
  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }

  openDeletePatient(id: any, patientName:string,event: Event) {
    event.stopPropagation();
    this.openConfirmationModal(`Bạn có muốn xóa bệnh nhân ${patientName} không?`).then((result) => {
      console.log(result);
      if (result === true) {
        this.id = id;
        this.patientService.deletePatient(id).subscribe((res) => {
          const index = this.searchPatientsList.findIndex((item: any) => item.patient_id == id);
          if (index != -1) {
            this.toastr.success("Xóa bệnh nhân thành công");
            this.searchPatientsList.splice(index, 1);
          }
        })
      }
    });
  }

  detail(id: any) {
    this.router.navigate(['/benhnhan/danhsach/tab/hosobenhnhan', id])
  }

  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['dangnhap']);
    })
  }
  normalizePhoneNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('(+84)')) {
      return '0' + phoneNumber.slice(5);
    } else if (phoneNumber.startsWith('+84')) {
      return '0' + phoneNumber.slice(3);
    } else
      return phoneNumber;
  }
}
