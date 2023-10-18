import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-specimens',
  templateUrl: './specimens.component.html',
  styleUrls: ['./specimens.component.css']
})
export class SpecimensComponent implements OnInit {

  constructor() { }

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

}
