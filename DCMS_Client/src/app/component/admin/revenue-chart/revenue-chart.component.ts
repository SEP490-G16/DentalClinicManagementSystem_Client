import { Component, OnInit } from '@angular/core';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
);
@Component({
  selector: 'app-revenue-chart',
  templateUrl: './revenue-chart.component.html',
  styleUrls: ['./revenue-chart.component.css']
})
export class RevenueChartComponent implements OnInit {
  // public barChartConfiguration: ChartConfiguration<'bar'> = {
  //   type: 'bar',
  //   data: {
  //     labels: ['Cơ sở 1', 'Cơ sở 2'],
  //     datasets: [
  //       { data: [65000000, 80000000], label: 'Tổng thu', backgroundColor: 'blue' },
  //       { data: [55000000, 70000000], label: 'Thực thu', backgroundColor: 'green' },
  //       { data: [20000000, 25000000], label: 'Nợ', backgroundColor: 'yellow' },
  //       { data: [30000000, 40000000], label: 'Chi', backgroundColor: 'red' },
  //       { data: [40000000, 45000000], label: 'Lợi nhuận', backgroundColor: 'green' },
  //     ],
  //   },
  //   options: {
  //     responsive: true,
  //     // ... thêm các tùy chọn khác ở đây
  //   },
  // };

  constructor() { }

  ngOnInit(): void {
    this.createRevenueChart();
  }
  createRevenueChart(): void {
    const canvas = (document.getElementById('revenueChart') as HTMLCanvasElement);
    if (canvas){
      const ctx = canvas.getContext('2d');
      if (ctx){
        const revenueChart = new Chart(ctx, {
          type: 'line', // Sử dụng biểu đồ cột
          data: {
            labels: ['Mốc 1', 'Mốc 2', 'Mốc 3', 'Mốc 4', 'Mốc 5'], // Nhãn theo trục hoành
            datasets: [{
              label: 'Tổng thu',
              data: [65000000, 70000000, 80000000, 75000000, 72000000], // Dữ liệu tổng thu
              // backgroundColor: 'rgba(0, 123, 255, 0.5)',
              borderColor: 'rgba(0, 123, 255, 1)',
              fill: false,
              tension: 0.4
            }, {
              label: 'Thực thu',
              data: [60000000, 65000000, 70000000, 65000000, 62000000], // Dữ liệu thực thu
              // Biểu đồ đường
              fill: false,
              tension: 0.4,
              borderColor: 'rgba(40, 167, 69, 1)'
            }, {
              label: 'Chi phí',
              data: [35000000, 40000000, 45000000, 50000000, 55000000], // Dữ liệu chi phí
              backgroundColor: '#EF01187F',
              borderColor: 'rgba(220, 53, 69, 1)',
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                type: 'linear'
              }
            },
            elements: {
              line: {
                borderWidth: 3
              },
              point: {
                radius: 5
              }
            }
          }
        });

      }

    }

  }
}
