import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import { CognitoService } from 'src/app/service/cognito.service';

@Component({
  selector: 'app-specimens',
  templateUrl: './specimens.component.html',
  styleUrls: ['./specimens.component.css']
})
export class SpecimensComponent implements OnInit {
  model: NgbDateStruct | undefined;
  model2: NgbDateStruct | undefined;
  model3: NgbDateStruct | undefined;
  constructor(

    private cognitoService:CognitoService,
    private router:Router
  ) { }

  ngOnInit(): void {
  }
  columns:any = {
    raham: true,
    tenmau: true,
    tenbenhnhan: true,
    chatlieu: true,
    // Thêm các cột khác ở đây và đặt giá trị ban đầu cho mỗi cột.
  };

  showColumnSelector = false; // Biến để kiểm soát việc hiển thị radio buttons

  columnList = [
    { name: 'raham', label: 'Răng/Hàm' },
    { name: 'tenmau', label: 'Tên mẫu' },
    { name: 'tenbenhnhan', label: 'Tên bệnh nhân' },
    { name: 'chatlieu', label: 'Chất liệu' },
    // Thêm các cột khác tương tự
  ];

  signOut() {
    this.cognitoService.signOut().then(() => {
      console.log("Logged out!");
      this.router.navigate(['/login']);
    })
  }

}
