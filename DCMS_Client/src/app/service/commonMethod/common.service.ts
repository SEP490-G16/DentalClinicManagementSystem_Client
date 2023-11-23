import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})

export class CommonService {

  constructor(private router:Router, private route:ActivatedRoute, private toastr:ToastrService) {}

  navigateHref(href: string, id:string) {
    this.router.navigate([href + id]);
    // const userGroupsString = sessionStorage.getItem('userGroups');

    // if (userGroupsString) {
    //   const userGroups = JSON.parse(userGroupsString) as string[];

    //   if (userGroups.includes('dev-dcms-doctor')) {
    //     this.router.navigate([href + id]);
    //   } else if (userGroups.includes('dev-dcms-nurse')) {
    //     this.router.navigate([href + id]);
    //   } else if (userGroups.includes('dev-dcms-receptionist')) {
    //     this.router.navigate([href + id]);
    //   } else if (userGroups.includes('dev-dcms-admin')) {
    //     this.router.navigate([href + id]);
    //   }
    // } else {
    //   console.error('Không có thông tin về nhóm người dùng.');
    //   this.router.navigate(['/default-route']);
    // }
  }

  showToast(message: string, header:string, status:Status) {
    if(status == 1) {
      this.toastr.success(message, header, {
        timeOut: 3000,
      });
    }else {
      this.toastr.error(message, header, {
        timeOut: 3000,
      });
    }

  }
}
type Status = 1|2;
