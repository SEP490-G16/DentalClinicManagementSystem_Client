import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'DCMS_Client';

  constructor(private cookieService: CookieService) { }
  saveConfigToCookie() {
    const config = {
      userPoolId: 'ap-southeast-1_PSTdva5of',
      userPoolWebClientId: '3pngqk8top46uiogeth8ke323v'
    };

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 365);
    this.cookieService.set('config', JSON.stringify(config), expirationDate, '/', '', false, 'Lax');

  }

  getConfigFromCookie() {
    const configString = this.cookieService.get('config');
    const config = configString ? JSON.parse(configString) : null;
    console.log('Config:', config);
  }

  ngOnInit(): void {
    this.saveConfigToCookie();
    this.getConfigFromCookie();
  }
}
