import { Component, OnInit } from '@angular/core';
import {ChartConfiguration, ChartData, ChartOptions, ChartType} from "chart.js";
@Component({
  selector: 'app-revenue-chart',
  templateUrl: './revenue-chart.component.html',
  styleUrls: ['./revenue-chart.component.css']
})
export class RevenueChartComponent implements OnInit {
  public barChartConfiguration: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: ['Cơ sở 1', 'Cơ sở 2'],
      datasets: [
        { data: [65000000, 80000000], label: 'Tổng thu', backgroundColor: 'blue' },
        { data: [55000000, 70000000], label: 'Thực thu', backgroundColor: 'green' },
        { data: [20000000, 25000000], label: 'Nợ', backgroundColor: 'yellow' },
        { data: [30000000, 40000000], label: 'Chi', backgroundColor: 'red' },
        { data: [40000000, 45000000], label: 'Lợi nhuận', backgroundColor: 'green' },
      ],
    },
    options: {
      responsive: true,
      // ... thêm các tùy chọn khác ở đây
    },
  };
  constructor() { }

  ngOnInit(): void {
  }

}
