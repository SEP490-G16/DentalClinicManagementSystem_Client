import { Router } from '@angular/router';
import { SpecimensService } from '../../../../../service/SpecimensService/SpecimensService.service';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PutSpecimen } from 'src/app/model/ISpecimens';
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-popup-edit-specimens',
  templateUrl: './popup-edit-specimens.component.html',
  styleUrls: ['./popup-edit-specimens.component.css']
})
export class PopupEditSpecimensComponent implements OnInit {
  @Input() PutSpecimen: any;
  @Input() AllLabos: any;
  loading: boolean = false;
  IPutSpecimens: PutSpecimen;
  Labos: any;
  id: string = "";
  status: string = "0";
  total: number = 0;
  constructor(
    private toastr: ToastrService,
    private cognitoService: CognitoService,
    private SpecimensService: SpecimensService,

    private router: Router

  ) {
    this.IPutSpecimens = {
      ms_type: "",
      ms_name: "",
      ms_quantity: 0,
      ms_unit_price: 0,
      ms_order_date: "",
      ms_orderer: "",
      ms_received_date: "",
      ms_receiver: "",
      ms_warranty: "",
      ms_description: "",
      ms_status: 0,
      facility_id: "",
      lb_id: null,
      p_patient_id: "",
      p_patient_name: ""
    } as PutSpecimen;
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['PutSpecimen'].currentValue) {
      console.log(changes['PutSpecimen']);
      this.IPutSpecimens = this.PutSpecimen;
      this.IPutSpecimens.ms_order_date = this.IPutSpecimens.ms_order_date?.split(" ")[0];
      this.IPutSpecimens.ms_received_date = this.IPutSpecimens.ms_received_date?.split(" ")[0];
      if (this.IPutSpecimens.ms_quantity !== undefined && this.IPutSpecimens.ms_unit_price !== undefined) {
        this.total = this.IPutSpecimens.ms_quantity * this.IPutSpecimens.ms_unit_price;
      }
      this.id = this.PutSpecimen.ms_id;
      console.log(this.IPutSpecimens);
    }
    if (changes['AllLabos']) {
      this.Labos = this.AllLabos;
      console.log("Labos:", this.Labos);
    }
  }

  EditSpecimen() {
    this.loading = true;
    console.log("id", this.id);
    console.log("specimens", this.IPutSpecimens);
    this.SpecimensService.putSpecimens(this.id, this.IPutSpecimens)
      .subscribe((res) => {
        this.loading = false;
        this.showSuccessToast('Chỉnh sửa mẫu vật thành công!');
        window.location.reload();
      },

        (err) => {
          // console.log(err.err.message)
          this.loading = false;
          // this.showErrorToast(err.err.message)
          this.showSuccessToast('Chỉnh sửa mẫu vật thành công!');
        }
      )
  }

  showSuccessToast(message: string) {
    this.toastr.success(message, 'Thành công', {
      timeOut: 3000, // Adjust the duration as needed
    },
    );
  }

  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000, // Adjust the duration as needed
    });
  }
}
