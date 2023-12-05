import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CognitoService } from "../../../service/cognito.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { DataService } from '../services/DataService.service';
import { ReceptionistWaitingRoomService } from 'src/app/service/ReceptionistService/receptionist-waitingroom.service';
import { ReceptionistAppointmentService } from 'src/app/service/ReceptionistService/receptionist-appointment.service';
import * as moment from 'moment-timezone';
import { ConvertJson } from 'src/app/service/Lib/ConvertJson';
import { PatientService } from 'src/app/service/PatientService/patient.service';

@Component({
  selector: 'app-layouts',
  templateUrl: './layouts.component.html',
  styleUrls: ['./layouts.component.css']
})
export class LayoutsComponent implements OnInit, AfterViewInit {
  userName: string = '';
  roleName: string = '';

  constructor(private cognitoService: CognitoService, 
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private waitingRoomService: ReceptionistWaitingRoomService,
    private appointmentService: ReceptionistAppointmentService, 
    private patientService:PatientService
    ) { }

  ngAfterViewInit(): void {
    const menuToggle = document.querySelector('.sep-menuToggle') as HTMLElement;
    const navigation = document.querySelector('.sep-navigation') as HTMLElement;
    const sepMain = document.querySelector('.sep-main') as HTMLElement;
    menuToggle.onclick = function () {
      navigation.classList.toggle('active');
      if (navigation.classList.contains('active')) {
        sepMain.classList.toggle('active');
      } else {
        sepMain.classList.toggle('active');
      }
    }

    const list = document.querySelectorAll('.list') as NodeListOf<HTMLElement>;
    function activeLink(this: HTMLElement) {
      list.forEach((item) =>
        item.classList.remove('active'));
      this.classList.add('active');
    }
    list.forEach((item) => item.addEventListener('click', activeLink));
  }

  showNotifications = false;
  notifications = [
    {
      id: 1,
      userImage: './assets/images/avatar-mark-webber.webp',
      message: 'Mark Webber reacted to your recent post My first tournament today!',
      time: '1m ago',
      unread: true,
    },
    {
      id: 2,
      userImage: './assets/images/avatar-mark-webber.webp',
      message: 'Mark Webber reacted to your recent post My first tournament today!',
      time: '1m ago',
      unread: true,
    },
    {
      id: 3,
      userImage: './assets/images/avatar-mark-webber.webp',
      message: 'Mark Webber reacted to your recent post My first tournament today!',
      time: '1m ago',
      unread: true,
    },
  ];

  get notificationCount() {
    return this.notifications.length;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  addNotification() {
    const newNotification = { id: this.notificationCount + 1, userImage: './assets/images/avatar-mark-webber.webp',
    message: 'Mark Webber reacted to your recent post My first tournament today!',
    time: '1m ago',
    unread: true, };
    this.notifications.push(newNotification);
    this.playNotificationSound();
  }

  deleteNotification(notificationId: number) {
    this.notifications = this.notifications.filter(notification => notification.id !== notificationId);
  }

  playNotificationSound() {
    const audio = new Audio();
    audio.src = '../../../../assets/audio/facebook_notification.mp3';
    audio.load();
    audio.play();
  }

  markAll() {
    this.notifications = [];
  }

  userGroupString: string = ''; // Declare the variable

  compareUserGroup: string = "";
  chatContainerVisible = false;
  currentRoute: string = '';
  roleId: string[] = [];
  appointmentList: any[] = [];
  startDate: any;

  analyses = {
    total_appointment: 0,
    total_waiting_room: 0,
    total_patient: 0
  }

  ngOnInit(): void {
    let user = sessionStorage.getItem('username');
    if (user != null) {
      this.userName = user;
    }
    console.log("oninit");
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url;
      }
    });

    this.activatedRoute.url.subscribe(urlSegments => {
      this.currentRoute = urlSegments.map(segment => segment.path).join('/');
    });

    let userGroups = sessionStorage.getItem('userGroups');
    this.userGroupString = userGroups || '';

    this.compareUserGroup = '["dev-dcms-admin"]';
    console.log("Layout: ", this.userGroupString);

    let ro = sessionStorage.getItem('role');
    if (ro != null) {
      this.roleId = ro.split(',');
      if (this.roleId.includes('1')) {
        this.roleName = 'Admin';
        console.log("role", this.roleName)
      }
      else if (this.roleId.includes('2')) {
        this.roleName = 'Bác sĩ'
      }
      else if (this.roleId.includes('3')) {
        this.roleName = 'Lễ tân';
      }
      else if (this.roleId.includes('4')) {
        this.roleName = 'Y tá';
      }
      else if (this.roleId.includes('5')) {
        this.roleName = 'Y tá trưởng';
      }
    }

    this.getDataAnalysis();
    //console.log("check analysis", this.analyses);
    this.dataService.dataAn$.subscribe((data) => {
      this.analyses = data; 
    })
  }

  searchTimeout: any;
  getDataAnalysis() {
    
    this.waitingRoomService.getWaitingRooms().subscribe((data) => {
      const listWatingRoom = data;
      console.log("check waiting", data.length);
      this.analyses.total_waiting_room = parseInt(data.length);
    })

    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.startDate = currentDateGMT7;

    this.appointmentService.getAppointmentList(this.dateToTimestamp(this.startDate + " 00:00:00"), this.dateToTimestamp(this.startDate+" 23:59:59")).subscribe((data) => {
      this.appointmentList = ConvertJson.processApiResponse(data);
      console.log("check appointment", this.appointmentList.length);
      this.analyses.total_appointment = this.appointmentList.length;
    })
    
    this.patientService.getPatientTotal().subscribe((data) => {
      console.log("check patient", data.data[0].total)
      this.analyses.total_patient = data.data[0].total;
    })
  }

  signOut() {
    this.cognitoService.signOut().then(() => {
      sessionStorage.clear();
      console.log("Logged out!");
      this.router.navigate(['dangnhap']);
    })
  }

  dateToTimestamp(dateStr: string): number {
    const format = 'YYYY-MM-DD HH:mm'; // Định dạng của chuỗi ngày
    const timeZone = 'Asia/Ho_Chi_Minh'; // Múi giờ
    const timestamp = moment.tz(dateStr, format, timeZone).valueOf() / 1000;
    return timestamp;
  }
}
