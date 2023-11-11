import { Component, OnInit } from '@angular/core';
import {CognitoService} from "../../../service/cognito.service";
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-layouts-admin',
  templateUrl: './layouts-admin.component.html',
  styleUrls: ['./layouts-admin.component.css']
})
export class LayoutsAdminComponent implements OnInit {

  constructor(private cognitoService: CognitoService, private router: Router,) { }
  chatContainerVisible = false;
  currentRoute: string='';
  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }
  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['dangnhap']);
    })
  }
}
