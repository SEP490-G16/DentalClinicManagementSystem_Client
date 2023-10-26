import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isEnterEmail:boolean = false;
  isForgotPassword: boolean = false;
  constructor(private renderer: Renderer2, private el: ElementRef) {
  }


  ngOnInit(): void {
  }

  toggleView(isForgot: boolean) {
    const container = this.el.nativeElement.querySelector('#container');
    if (isForgot) {
      this.renderer.addClass(container, 'active');
    } else {
      this.renderer.removeClass(container, 'active');
    }
  }

  alertChangePassword(mess:string) {
    alert(mess);
  }

}
