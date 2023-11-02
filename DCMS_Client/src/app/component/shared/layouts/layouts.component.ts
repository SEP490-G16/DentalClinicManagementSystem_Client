import { Component, OnInit } from '@angular/core';
import {CognitoService} from "../../../service/cognito.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-layouts',
  templateUrl: './layouts.component.html',
  styleUrls: ['./layouts.component.css']
})
export class LayoutsComponent implements OnInit {

  constructor(private cognitoService: CognitoService, private router: Router,) { }

  ngOnInit(): void {
  }
  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['/login']);
    })
  }
}
