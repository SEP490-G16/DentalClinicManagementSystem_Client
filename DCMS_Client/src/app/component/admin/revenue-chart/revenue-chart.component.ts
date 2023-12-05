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
import { FacilityService } from 'src/app/service/FacilityService/facility.service';
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
import { MaterialUsageService } from 'src/app/service/MaterialUsage/MaterialUsageService.component';
@Component({
  selector: 'app-revenue-chart',
  templateUrl: './revenue-chart.component.html',
  styleUrls: ['./revenue-chart.component.css']
})
export class RevenueChartComponent implements OnInit {
  private revenueChart?: Chart;
  startDate: string = "";
  endDate: string = "";
  facility: string = "0";
  startTimestamp: number = 0;
  endTimestamp: number = 0;
  listFacility: any[] = [];
  MaterialUsage: any;
  Expenses: any;
  constructor(
    private facilityService: FacilityService,
    private materialUsageService: MaterialUsageService,
    private expensesService: ExpenseService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getListFacility();
    this.setDefaultDates();

    this.getMaterialUsage(); //Tổng thu
    this.paidMaterialUsage(); // Thực thu
  }
  getListFacility() {
    this.facilityService.getFacilityList().subscribe((res) => {
      console.log("Danh sach cơ sơ", res);
      this.listFacility = res.data;
    },
      (err) => {
        this.showErrorToast('Lỗi khi lấy dữ liệu cho Labo')
      }
    )
  }
  setDefaultDates(): void {
    this.startDate = moment().startOf('month').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.endDate = moment().endOf('month').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.startTimestamp = moment(this.startDate).unix();
    this.endTimestamp = moment(this.endDate).unix();
  }

  getMaterialUsage() {
    this.materialUsageService.getMaterialUsageReport(this.startTimestamp, this.endTimestamp)
      .subscribe((res: any) => {
        this.MaterialUsage = res.data;
        console.log(this.MaterialUsage);
        this.getExpenses(); // Chi phí
      },
        (err) => {
          this.toastr.error(err.error.message, "Lấy danh sách Vật liệu sử dụng thấy bại");
        })
  }

  paidMaterialUsage() {
  }

  getExpenses() {
    this.expensesService.getExpense(this.startTimestamp, this.endTimestamp)
      .subscribe((res) => {
        this.Expenses = res.data;
        console.log(this.Expenses);
        this.Expenses.dynamo = this.transformDynamoData(this.Expenses.dynamo);
        this.createRevenueChart();
        console.log(this.Expenses);
      },
        (err) => {
          this.toastr.error(err.error.message, "Lấy doanh thu thất bại");
        });
  }

  createRevenueChart(): void {
    // Generate an array of dates between startDate and endDate
    let currentDate = moment(this.startDate);
    const lastDate = moment(this.endDate);

    let labels: string[] = [];
    while (currentDate <= lastDate) {
      labels.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'days');
    }

    interface TempAggregateStructure {
      [key: string]: {
        mu_total: number;
        mu_total_paid: number;
        total_price: number;
      };
    }

    let tempAggregate = labels.reduce<TempAggregateStructure>((acc, label) => {
      acc[label] = { mu_total: 0, mu_total_paid: 0, total_price: 0 };
      return acc;
    }, {});


    let combinedData = [...this.MaterialUsage, ...this.Expenses.medical_supply, ...this.Expenses.import_material, ...this.Expenses.dynamo];
    combinedData.forEach(item => {
      let date = item.created_date || item.received_date || (item.mu_data && item.mu_data.length > 0 && item.mu_data[0].mu_created_date);
      if (date) {
        let simpleDate = moment(date).format('YYYY-MM-DD');
        if (tempAggregate[simpleDate]) {
          tempAggregate[simpleDate].mu_total += item.mu_data ? item.mu_data.reduce((acc: any, muItem: any) => acc + (muItem.mu_total || 0), 0) : 0;
          tempAggregate[simpleDate].mu_total_paid += item.mu_data ? item.mu_data.reduce((acc: any, muItem: any) => acc + (muItem.mu_total_paid || 0), 0) : 0;
          tempAggregate[simpleDate].total_price += item.total_price || 0;
        }
      }
    });

    let MaterialUsageData = labels.map(label => tempAggregate[label].mu_total);
    let PaidMaterialUsageData = labels.map(label => tempAggregate[label].mu_total_paid);
    let ExpenseData = labels.map(label => tempAggregate[label].total_price);

    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    console.log("MaterialUsageData: ", MaterialUsageData);
    console.log("PaidMaterialData: ", PaidMaterialUsageData);
    console.log("ExpenseData: ", ExpenseData);
    const canvas = (document.getElementById('revenueChart') as HTMLCanvasElement);
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Cập nhật cấu hình biểu đồ
         this.revenueChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels, // Cập nhật labels
            datasets: [
              // Các datasets khác...
              {
                label: 'Tổng thu',
                data: MaterialUsageData, // Dữ liệu chi phí
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Thực thu',
                data: PaidMaterialUsageData, // Dữ liệu thực thu
                fill: false,
                tension: 0.4,
                borderColor: 'rgba(40, 167, 69, 1)'
              },
              {
                label: 'Chi phí',
                data: ExpenseData, // Cập nhật data
                backgroundColor: '#EF01187F',
                borderColor: 'rgba(220, 53, 69, 1)',
                fill: true,
                tension: 0.4
              },
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
    this.getMaterialUsage();
  }

  resetExpense(): void {
    this.setDefaultDates();
    this.getExpenses();
  }
  showErrorToast(message: string) {
    this.toastr.error(message, 'Lỗi', {
      timeOut: 3000, // Adjust the duration as needed
    });
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
