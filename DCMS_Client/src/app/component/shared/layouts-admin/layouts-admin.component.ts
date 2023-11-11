import { Component, OnInit } from '@angular/core';
import {CognitoService} from "../../../service/cognito.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-layouts-admin',
  templateUrl: './layouts-admin.component.html',
  styleUrls: ['./layouts-admin.component.css']
})
export class LayoutsAdminComponent implements OnInit {

  constructor(private cognitoService: CognitoService, private router: Router,) { }
  chatContainerVisible = false;
  ngOnInit(): void {
  }
  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['dangnhap']);
    })
  }
}
