import { Component, OnInit } from '@angular/core';
import {MaterialService} from "../../../service/MaterialService/material.service";

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css']
})
export class MaterialComponent implements OnInit {

  constructor(private materialService:MaterialService) { }

  ngOnInit(): void {
  }

}
