import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PatientService } from 'src/app/service/PatientService/patient.service';
import { PaidMaterialUsageService } from 'src/app/service/PatientService/patientPayment.service';
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-patient-payment-tab',
  templateUrl: './patient-payment-tab.component.html',
  styleUrls: ['./patient-payment-tab.component.css']
})
export class PatientPaymentTabComponent implements OnInit {
  id: string = "";
  PaidMaterialUsage: any;
  facility: any;

  TotalPaid: number = 0;

  PMU: any;

  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute,
    private cognitoService: CognitoService,
    private router: Router,
    private paidMaterialUsage: PaidMaterialUsageService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    const fa = sessionStorage.getItem("locale");
    if (sessionStorage.getItem("locale")) {
      this.facility = fa;
    }
    this.getPaidMaterialUsage();
  }

  navigateHref(href: string) {
    const userGroupsString = sessionStorage.getItem('userGroups');

    if (userGroupsString) {
      const userGroups = JSON.parse(userGroupsString) as string[];

      if (userGroups.includes('dev-dcms-doctor')) {
        this.router.navigate([href + this.id]);
      } else if (userGroups.includes('dev-dcms-nurse')) {
        this.router.navigate([href + this.id]);
      } else if (userGroups.includes('dev-dcms-receptionist')) {
        this.router.navigate([href + this.id]);
      } else if (userGroups.includes('dev-dcms-admin')) {
        this.router.navigate([href + this.id]);
      }
    } else {
      console.error('Không có thông tin về nhóm người dùng.');
      this.router.navigate(['/default-route']);
    }
  }

  getPaidMaterialUsage() {
    this.paidMaterialUsage.getPaidMaterialUsageExamination("E-0000000001")
      .subscribe((datas) => {
        console.log("Datas", datas);
        this.PaidMaterialUsage = datas.data;

        //Tổng chi phí
        let totalPaidSum = 0;
        datas.data.forEach((data: any) => {
          if (data && data.total_paid) {
            totalPaidSum += data.total_paid;
          }
        });

        console.log("Total Paid Sum:", totalPaidSum);

        this.TotalPaid = totalPaidSum;

      },
        (err) => {
          this.toastr.error(err.error.message, "Nhận dữ liệu Thanh toán thất bại");
        }
      )
  }

  thanhtoan(pmu:any) {
      this.PMU = pmu;
  }
}
