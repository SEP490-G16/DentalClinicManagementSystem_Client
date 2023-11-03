import { LaboService } from './../../../service/LaboService/Labo.service';
import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ILabos } from 'src/app/model/ILabo';
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-labo',
  templateUrl: './labo.component.html',
  styleUrls: ['./labo.component.css']
})
export class LaboComponent implements OnInit {

  Labos: ILabos[] = [];

  LaboId: string = '';
  constructor(
    private LaboService: LaboService,
    private cognitoService: CognitoService,
    private router: Router,
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

    this.getLabos();
  }

  ngOnInit(): void {

    // this.seedLabos();
  }

  // ngOnChanges(changes: SimpleChanges): void {

  // }

  getLabos() {
    this.LaboService.getLabos()
      .subscribe((res) => {
        this.Labos = res.data;
        console.log("Labos", res.data);
      },
        (err) => {
          this.showErrorToast('Lỗi khi lấy dữ liệu cho Labo')
        }
      )
    console.log(this.Labos);
  }


  deleteLabo(laboId: string) {
    this.LaboId = laboId;
    console.log(this.LaboId);
    const conf = confirm("Bạn có chắc chắn xóa Labo số " + laboId + " không?");
    if(conf == true) {
      this.LaboService.deleteLabo(laboId).subscribe((res) => {
        this.showSuccessToast("Xóa Labo thành công!");
        setTimeout(() => {
          window.location.reload();
        }, 3000)
      },
        (err) => {
          console.log(err);
          if (err.status === 0) {
            this.showSuccessToast("Xóa Labo thành công!");
            setTimeout(() => {
              window.location.reload();
            }, 3000)
          }
            if(err.status === 404) {
              this.showErrorToast("Không tìm thấy Labo có Id: " + laboId);
            }

        }
      )
    }
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
      console.log("Logged out!");
      this.router.navigate(['/login']);
    })
  }
}
