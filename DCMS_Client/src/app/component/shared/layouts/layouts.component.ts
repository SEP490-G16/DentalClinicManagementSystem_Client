import {AfterViewInit, Component, OnInit} from '@angular/core';
import {CognitoService} from "../../../service/cognito.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-layouts',
  templateUrl: './layouts.component.html',
  styleUrls: ['./layouts.component.css']
})
export class LayoutsComponent implements OnInit,AfterViewInit {
  ngAfterViewInit(): void {
    const menuToggle = document.querySelector('.menuToggle') as HTMLElement;
    const navigation = document.querySelector('.navigation') as HTMLElement;
    menuToggle.onclick = function () {
      navigation.classList.toggle('active');
    }

    const list = document.querySelectorAll('.list') as NodeListOf<HTMLElement>;
    function activeLink(this: HTMLElement) {
      list.forEach((item) =>
        item.classList.remove('active'));
        this.classList.add('active');
    }
    list.forEach((item) => item.addEventListener('click', activeLink));
  }
  userGroupString: string = ''; // Declare the variable

  compareUserGroup:string = "";
  constructor(private cognitoService: CognitoService, private router: Router, private activatedRoute: ActivatedRoute) { }
  chatContainerVisible = false;
  currentRoute: string='';
  ngOnInit(): void {
    console.log("oninit");
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url;
      }
    });

    this.activatedRoute.url.subscribe(urlSegments => {
      this.currentRoute = urlSegments.map(segment => segment.path).join('/');
    });

    let userGroups = sessionStorage.getItem('userGroups');
    this.userGroupString = userGroups || '';

    this.compareUserGroup = '["dev-dcms-admin"]';
    console.log("Layout: ", this.userGroupString);
  }
  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['dangnhap']);
    })
  }
}
