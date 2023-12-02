import { ToastrService } from 'ngx-toastr';
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
import { ExpenseService } from 'src/app/service/Expenses/expenses.service';
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
import * as moment from 'moment-timezone';
@Component({
  selector: 'app-revenue-chart',
  templateUrl: './revenue-chart.component.html',
  styleUrls: ['./revenue-chart.component.css']
})
export class RevenueChartComponent implements OnInit {

  startDate: string = "";
  endDate: string = "";
  startTimestamp: number = 0;
  endTimestamp: number = 0;

  Expenses: any;
  constructor(private expensesService: ExpenseService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.setDefaultDates();
    this.getExpenses();
  }

  setDefaultDates(): void {
    this.startDate = moment().startOf('year').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.endDate = moment().endOf('year').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.startTimestamp = moment(this.startDate).unix();
    this.endTimestamp = moment(this.endDate).unix();
  }
  getExpenses() {
    this.expensesService.getExpense(this.startTimestamp, this.endTimestamp)
      .subscribe((res) => {
        this.Expenses = res.data;
        this.Expenses.dynamo = this.transformDynamoData(this.Expenses.dynamo);
        this.createRevenueChart();
        console.log(this.Expenses);
      },
        (err) => {
          this.toastr.error(err.error.message, "Lấy doanh thu thất bại");
        });
  }

  createRevenueChart(): void {
    let combinedData = [...this.Expenses.medical_supply, ...this.Expenses.import_material, ...this.Expenses.dynamo];
    combinedData.sort((a, b) => {
      const dateA = a.created_date || a.received_date;
      const dateB = b.created_date || b.received_date;

      const parsedDateA = dateA ? new Date(dateA) : new Date();
      const parsedDateB = dateB ? new Date(dateB) : new Date();

      return parsedDateA.getTime() - parsedDateB.getTime();
    });

    let labels = combinedData.map(item => item.created_date || item.received_date);
    let data = combinedData.map(item => item.total_price);

    const canvas = (document.getElementById('revenueChart') as HTMLCanvasElement);
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Cập nhật cấu hình biểu đồ
        const revenueChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels, // Cập nhật labels
            datasets: [
              // Các datasets khác...
              {
                label: 'Chi phí',
                data: data, // Cập nhật data
                backgroundColor: '#EF01187F',
                borderColor: 'rgba(220, 53, 69, 1)',
                fill: true,
                tension: 0.4
              }
            ]
          },
          options: {

          }
        });
      }
    }
  }


  private transformDynamoData(dynamoData: string): any[] {
    try {
      let normalizedData = dynamoData
        .replace(/'/g, "\"")
        .replace(/Decimal\("\d+"\)/g, "0")
        .replace(/"({.*?})"/g, "$1")
        .replace(/\\\"/g, '"');

      console.log("Normalized Data:", normalizedData);

      let parsedDynamoArray = JSON.parse(normalizedData);

      return parsedDynamoArray.map((entry: any) => {
        let keyToTransform = null;

        // Find the key that matches the criteria for transformation
        Object.keys(entry).forEach((key) => {
          const isUUID = /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(key);

          // Check if the UUID is associated with "admin"
          if (isUUID && entry[key].createBy === "admin") {
            keyToTransform = key;
          }
        });

        // Perform the transformation
        if (keyToTransform) {
          entry.expenses = entry[keyToTransform];
          delete entry[keyToTransform];
        }

        try {
          let expenseData = entry.expenses ? JSON.parse(JSON.stringify(entry.expenses)) : null;

          if (expenseData) {
            const date = new Date(expenseData.createDate * 1000).toISOString().split('T')[0];

            return {
              createBy: expenseData.createBy,
              typeExpense: expenseData.typeExpense,
              created_date: date,
              total_price: parseFloat(expenseData.totalAmount),
              note: expenseData.note
            };
          }
        } catch (error) {
          console.error('Error parsing individual expense data:', error, 'Entry:', entry);
        }

        return null;
      }).filter((item: any) => item !== null);
    } catch (error) {
      console.error('Error parsing dynamo data:', error);
      return [];
    }
  }

  onDateChange(): void {
    this.startTimestamp = this.dateToTimestamp(this.startDate);
    this.endTimestamp = this.dateToTimestamp(this.endDate);
    this.getExpenses();
  }

  resetExpense(): void {
    this.setDefaultDates();
    this.getExpenses();
  }


  //Convert Date
  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

  timestampToDate(timestamp: number): string {
    const date = moment.unix(timestamp);
    const dateStr = date.format('YYYY-MM-DD');
    return dateStr;
  }


  timestampToTime(timestamp: number): string {
    const time = moment.unix(timestamp);
    const timeStr = time.format('HH:mm');
    return timeStr;
  }

  timeAndDateToTimestamp(timeStr: string, dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm';
    const timeZone = 'Asia/Ho_Chi_Minh';
    const dateTimeStr = `${dateStr} ${timeStr}`;
    const timestamp = moment.tz(dateTimeStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }

}
