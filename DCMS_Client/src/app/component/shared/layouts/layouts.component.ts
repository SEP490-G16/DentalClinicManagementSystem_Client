import {AfterViewInit, Component, OnInit} from '@angular/core';
import {CognitoService} from "../../../service/cognito.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-layouts',
  templateUrl: './layouts.component.html',
  styleUrls: ['./layouts.component.css']
})
export class LayoutsComponent implements OnInit,AfterViewInit {
  userName:string='';
  roleName:string='';
  ngAfterViewInit(): void {
    const menuToggle = document.querySelector('.sep-menuToggle') as HTMLElement;
    const navigation = document.querySelector('.sep-navigation') as HTMLElement;
    const sepMain = document.querySelector('.sep-main') as HTMLElement;
    menuToggle.onclick = function () {
      navigation.classList.toggle('active');
      if (navigation.classList.contains('active')) {
        sepMain.classList.toggle('active');
      } else {
        sepMain.classList.toggle('active');
      }
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
  roleId: string[] = [];
  ngOnInit(): void {
    let user = sessionStorage.getItem('username');
    if (user != null){
      this.userName = user;
    }
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

    let ro = sessionStorage.getItem('role');
    if (ro != null) {
      this.roleId = ro.split(',') ;
      if (this.roleId.includes('1')){
        this.roleName = 'Admin';
        console.log("role",this.roleName)
      }
      else if (this.roleId.includes('2')){
        this.roleName = 'Bác sĩ'
      }
      else if (this.roleId.includes('3')){
        this.roleName = 'Lễ tân';
      }
      else if (this.roleId.includes('4')){
        this.roleName = 'Y tá';
      }
      else if (this.roleId.includes('5')){
        this.roleName = 'Y tá trưởng';
      }
    }
  }
  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['dangnhap']);
    })
  }
}
