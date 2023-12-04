import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Nha khoa Nguyễn Trần';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url !== '/dangnhap') {
        sessionStorage.setItem('lastRoute', event.url);
      }
    });
  }

  ngOnInit(): void {

  }
}
