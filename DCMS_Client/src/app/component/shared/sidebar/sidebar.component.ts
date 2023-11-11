import { Component, OnInit } from '@angular/core';
import {CognitoService} from "../../../service/cognito.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private cognitoService: CognitoService,
              private router:Router) { }

  ngOnInit(): void {
  }

  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['/dangnhap']);
    })
  }
}
