import { Component, OnInit, ViewChild } from '@angular/core';
import { PatientService } from "../../../service/PatientService/patient.service";
import { IPatient } from "../../../model/IPatient";
import { ToastrService } from "ngx-toastr";
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PopupAddPatientComponent } from "../../utils/pop-up/patient/popup-add-patient/popup-add-patient.component";
import { CognitoService } from 'src/app/service/cognito.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ResponseHandler } from '../../utils/libs/ResponseHandler';
import { PopupDeletePatientComponent } from '../../utils/pop-up/patient/popup-delete-patient/popup-delete-patient.component';
import { ConfirmDeleteModalComponent } from '../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component';
import { Normalize } from 'src/app/service/Lib/Normalize';
import { SendMessageSocket } from '../../shared/services/SendMessageSocket.service';
import { Subscription } from 'rxjs';
import { format, parse } from 'date-fns';

@Component({
  selector: 'app-patient-records',
  templateUrl: './patient-records.component.html',
  styleUrls: ['./patient-records.component.css']
})
export class PatientRecordsComponent implements OnInit {
  originPatientList: any[] = [];
  searchPatientsList: any[] = [];
  private subscription: Subscription = new Subscription();
  currentPage: number = 1;
  hasNextPage: boolean = false;
  pagingSearch = {
    paging: 1,
    total: 0
  }
  errorStatus: number = 0;
  count: number = 1;
  clicked: boolean = false;
  lastClickTime: number = 0
  id: any;
  search: string = '';
  isSearching: boolean = false;
  roleId: any;
  constructor(private patientService: PatientService,
    private toastr: ToastrService,
    private router: Router,
    private cognitoService: CognitoService,
    private modalService: NgbModal,
    private sendMessageSocket: SendMessageSocket) { }
  @ViewChild(PopupDeletePatientComponent) popupDeletePatientComponent!: PopupDeletePatientComponent;
  ngOnInit(): void {
    let co = sessionStorage.getItem('role');
    if (co != null) {
      this.roleId = co.split(',');
    }
    this.loadPage(this.pagingSearch.paging);
    this.patientService.data$.subscribe((dataList) => {
      this.searchPatientsList = dataList;
    })
  }
  checkNextPage() {
    this.hasNextPage = this.searchPatientsList.length > 10;
  }

  searchLi: any[] = [];
  loadPage(paging: number) {
    this.currentPage = paging;
    this.patientService.getPatientList(paging).subscribe(patients => {
      this.originPatientList = patients.data;
      this.searchPatientsList = patients.data;
      this.searchPatientsList.forEach((p: any) => {
        p.phone_number = this.normalizePhoneNumber(p.phone_number);
      })
      this.checkNextPage();
      if (this.searchPatientsList.length > 10) {
        this.searchPatientsList.pop();
      }
      if (this.search.trim() !== "") {
      }
      this.patientService.updateData(this.searchPatientsList)
    },
      error => {
        ResponseHandler.HANDLE_HTTP_STATUS(this.patientService.test + "/patient/name/" + paging, error);
      }
    )
  }

  searchPatient() {
    if (this.search != null && this.search != "" && this.search != undefined) {
      setTimeout(() => {
      }, 1000);

      if (/\d/.test(this.search)) {
        console.log("Date: ", this.search);
        this.applyDateFilter();
        if (this.searchPatientsList.length === 0) {
          this.loadNextPages(this.pagingSearch.paging + 1);
        }
      } else {
        const searchLowercased = this.search.toLowerCase();

        // Loại bỏ khoảng trắng thừa ở đầu và cuối chuỗi
        const trimmedSearch = searchLowercased.trim();

        // Thay thế tất cả chuỗi khoảng trắng (bao gồm cả khoảng trắng kép trở lên) bằng dấu "-"
        const normalizedSearch = trimmedSearch.replace(/\s+/g, '-');
        console.log("Searc: ", normalizedSearch);
        this.patientService.getPatientByName(Normalize.normalizeDiacritics(normalizedSearch), 1).subscribe(
          patients => {
            console.log("Patient: ", patients);
            this.searchPatientsList = patients.data.filter((sP: any) =>
              Normalize.normalizeDiacritics(sP.patient_name.toLowerCase()).includes(Normalize.normalizeDiacritics(this.search.toLowerCase()))
            );
            console.log("Ptient search: ", this.searchPatientsList);
            this.searchPatientsList.forEach((p: any) => {
              p.phone_number = this.normalizePhoneNumber(p.phone_number);
            })

            // this.checkNextPage();

            // if (this.searchPatientsList.length > 10) {
            //   this.searchPatientsList.pop();
            // }
          },
          error => {
            ResponseHandler.HANDLE_HTTP_STATUS(this.patientService.test + "/patient/name/" + this.search + "/" + this.pagingSearch.paging, error)
          }
        );
      }
    } else {
      this.currentPage = 1;
      this.loadPage(this.currentPage);
    }
  }

  applyDateFilter() {
    console.log(this.searchPatientsList);
    this.searchPatientsList = this.originPatientList.filter(sP => {
      // Chuyển đổi chuỗi ngày tháng từ API thành đối tượng Date
      const apiDate = parse(sP.created_date, 'yyyy-MM-dd HH:mm:ss', new Date());
      // Định dạng lại đối tượng Date thành chuỗi 'dd/MM/yyyy'
      const formattedDate = format(apiDate, 'dd/MM/yyyy');

      // Phân tách this.search thành ngày, tháng và năm, nếu có
      const searchParts = this.search.trim().split('/');
      const searchDay = searchParts.length > 0 ? searchParts[0].padStart(2, '0') : '';
      const searchMonth = searchParts.length > 1 ? searchParts[1].padStart(2, '0') : '';
      const searchYear = searchParts.length > 2 ? searchParts[2] : '';

      // So sánh chính xác ngày, tháng và năm
      // Chỉ trả về true khi tất cả ba thành phần khớp với ngày tháng năm trong dữ liệu
      return formattedDate === `${searchDay}/${searchMonth}/${searchYear}`;
    });
  }


  async loadNextPages(startPage: number) {
    for (let nextPage = startPage; nextPage <= 6; nextPage++) {
      await this.loadPage(nextPage);
      this.applyDateFilter();
      if (this.searchPatientsList.length > 0 || nextPage === 6) {
        this.currentPage = 1;
        break;
      }
    }
  }

  ngAfterViewInit() {
    this.popupDeletePatientComponent.patientDeleted.subscribe(() => {
      this.loadPage(this.pagingSearch.paging);
    });
  }
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

  private isDate(date: string): boolean {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(date);
  }

  onNewPatientAdded(newPatient: any) {
    this.searchPatientsList.unshift(newPatient);
  }

  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }

  openDeletePatient(id: any, patientName: string, event: Event) {
    event.stopPropagation();
    this.openConfirmationModal(`Bạn có muốn xóa bệnh nhân ${patientName} không?`).then((result) => {
      if (result === true) {
        this.id = id;
        this.patientService.deletePatient(id).subscribe((res) => {
          // this.patientService.updatePatientListAfterDeletion(id);
          const index = this.searchPatientsList.findIndex((item: any) => item.patient_id == id);
          if (index != -1) {
            this.toastr.success("Xóa bệnh nhân thành công");
            this.searchPatientsList.splice(index, 1);
          }
        })
      }
    });
  }

  detail(id: any, patient:any) {
    sessionStorage.setItem("patient", JSON.stringify(patient));
    this.router.navigate(['/benhnhan/danhsach/tab/hosobenhnhan', id])
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  signOut() {
    this.cognitoService.signOut().then(() => {
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
