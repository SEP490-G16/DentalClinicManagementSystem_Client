import { LaboService } from './../../../service/LaboService/Labo.service';
import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ILabos } from 'src/app/model/ILabo';
import { CognitoService } from 'src/app/service/cognito.service';
import {ResponseHandler} from "../../utils/libs/ResponseHandler";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteModalComponent } from '../../utils/pop-up/common/confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-labo',
  templateUrl: './labo.component.html',
  styleUrls: ['./labo.component.css']
})
export class LaboComponent implements OnInit {

  Labos: ILabos[] = [];
  loading:boolean=false;
  LaboId: string = '';
  constructor(
    private LaboService: LaboService,
    private cognitoService: CognitoService,
    private router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.LaboEdit = {
      labo_id:'',
      name:'',
      address:'',
      phone_number:'',
      email:'',
      description:'',
      active: 1
    } as ILabos

  }

  ngOnInit(): void {

    this.getLabos();
    // this.seedLabos();
  }

  // ngOnChanges(changes: SimpleChanges): void {

  // }

  getLabos() {
    this.loading=true;
    this.LaboService.getLabos()
      .subscribe((res) => {
        this.Labos = res.data;
          this.Labos.forEach((labo) => {
            labo.phone_number = this.normalizePhoneNumber(labo.phone_number);
          });
        this.loading=false;
      },
        (error) => {
        this.loading=false;
          //this.showErrorToast('Lỗi khi lấy dữ liệu cho Labo')
          ResponseHandler.HANDLE_HTTP_STATUS(this.LaboService.apiUrl+"/labo", error);
        }
      )
  }

  openConfirmationModal(message: string): Promise<any> {
    const modalRef = this.modalService.open(ConfirmDeleteModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }


  deleteLabo(labo:any) {
    this.LaboId = labo.labo_id;
    this.openConfirmationModal(`Bạn có chắc chắn muốn xóa Labo ${labo.name} không?`).then((result) => {
      if (result) {
      //this.loading=true;
      this.LaboService.deleteLabo(this.LaboId).subscribe((res) => {
        this.showSuccessToast("Xóa Labo thành công!");
          //window.location.reload();
        const index = this.Labos.findIndex((item:any) => item.labo_id == this.LaboId);
        if (index != -1) {
          this.Labos.splice(index, 1);
        }
      },
        (error) => {
          ResponseHandler.HANDLE_HTTP_STATUS(this.LaboService.apiUrl+"/labo/"+this.LaboId, error);
        }
      )
    }
  });
  }

  LaboEdit: ILabos;
  openEditModal(labo: ILabos) {
    this.LaboEdit = labo;
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

  signOut() {
    this.cognitoService.signOut().then(() => {
      this.router.navigate(['/login']);
      localStorage.clear();
      sessionStorage.clear();
    })
  }

  normalizePhoneNumber(phoneNumber: string): string {
    if(phoneNumber.startsWith('(+84)')){
      return '0'+phoneNumber.slice(5);
    }else if(phoneNumber.startsWith('+84')){
      return '0'+phoneNumber.slice(3);
    }else
    return phoneNumber;
  }
}
