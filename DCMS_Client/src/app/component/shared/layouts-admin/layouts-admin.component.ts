import { Component, OnInit } from '@angular/core';
import {CognitoService} from "../../../service/cognito.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-layouts-admin',
  templateUrl: './layouts-admin.component.html',
  styleUrls: ['./layouts-admin.component.css']
})
export class LayoutsAdminComponent implements OnInit {

  constructor(private cognitoService: CognitoService, private router: Router,private activatedRoute: ActivatedRoute) { }
  chatContainerVisible = false;
  currentRoute: string='';
  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url;
      }
    });

    this.activatedRoute.url.subscribe(urlSegments => {
      this.currentRoute = urlSegments.map(segment => segment.path).join('/');
    });
  }
  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['dangnhap']);
    })
  }
}
