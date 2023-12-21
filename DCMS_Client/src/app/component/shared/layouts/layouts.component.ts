import { AfterViewInit, Component, ElementRef, HostListener, OnInit } from '@angular/core';
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
  showPopup: boolean = false;
  currentLogo: string = '../../../../assets/img/logo-main.png';
  constructor(private cognitoService: CognitoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private _eref: ElementRef,
    private waitingRoomService: ReceptionistWaitingRoomService,
    private appointmentService: ReceptionistAppointmentService,
    private patientService: PatientService
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
    const newNotification = {
      id: this.notificationCount + 1, userImage: './assets/images/avatar-mark-webber.webp',
      message: 'Mark Webber reacted to your recent post My first tournament today!',
      time: '1m ago',
      unread: true,
    };
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
    total_patient_examinate: 0,
    total_patient_examinated: 0
  }

  ngOnInit(): void {
    let cognitoUserString = localStorage.getItem("cognitoUser");
    if (cognitoUserString !== null) {
      let cognitoUser = JSON.parse(cognitoUserString);

      if (cognitoUser) {
        sessionStorage.setItem('role', cognitoUser.role);
        sessionStorage.setItem('id_Token', cognitoUser.idToken);
        sessionStorage.setItem('locale', cognitoUser.locale);
        sessionStorage.setItem('sub', cognitoUser.sub);
        sessionStorage.setItem('sub-id', cognitoUser.sub);
        sessionStorage.setItem('username', cognitoUser.Username);

        var UserObj = {
          role: cognitoUser?.role,
          subId: cognitoUser?.sub,
          username: cognitoUser?.Username,
          locale: cognitoUser.locale
        };

        var userJsonString = JSON.stringify(UserObj);
        sessionStorage.setItem('UserObj', userJsonString);

      }
    }

    let user = sessionStorage.getItem('username');
    if (user != null) {
      this.userName = user;
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url;
        this.updateLogo(event.urlAfterRedirects);
      }
    });

    this.activatedRoute.url.subscribe(urlSegments => {
      this.currentRoute = urlSegments.map(segment => segment.path).join('/');
    });

    let userGroups = sessionStorage.getItem('userGroups');
    this.userGroupString = userGroups || '';

    let ro = sessionStorage.getItem('role');
    if (ro != null) {
      this.roleId = ro.split(',');
      if (this.roleId.includes('1')) {
        this.roleName = 'Admin';
      }
      else if (this.roleId.includes('2')) {
        this.roleName = 'Bác sĩ'
      }
      else if (this.roleId.includes('3')) {
        this.roleName = 'Lễ tân';
      }
      else if (this.roleId.includes('4')) {
        this.roleName = 'Điều dưỡng';
      }
      else if (this.roleId.includes('5')) {
        this.roleName = 'Điều dưỡng trưởng';
      }
    }

    this.getDataAnalysis();
    this.dataService.dataAn$.subscribe((data) => {
      this.analyses = data;
    })
  }

  updateLogo(url: string) {
    if (url in this.logoMapping) {
      this.currentLogo = this.logoMapping[url];
    }
  }

  logoMapping: LogoMapping = {
    '/thu-thuat': '../../../../assets/img/rangban.png',
    '/phong-cho': '../../../../assets/img/logo-phong-cho.png',
    '/benh-nhan-dang-kham': '../../../../assets/img/logo-benh-nhan.png',
  };

  searchTimeout: any;
  getDataAnalysis() {
    const now = new Date();
    const currentDate = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    this.waitingRoomService.getWaitingRooms().subscribe((data) => {
      const listWatingRoom = data;
      var count = 0;
      var count1 = 0;
      var count3 = 0;
      listWatingRoom.forEach((item: any) => {
        if (item.status == 1) {
          count3++;
        }
        if (item.status == 2) {
          count++;
        }
        if (item.status == 3) {
          count1++;
        }
      })
      this.analyses.total_waiting_room = count3;
      this.analyses.total_patient_examinate = count;
      this.analyses.total_patient_examinated = count1;
    })

    const currentDateGMT7 = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    this.startDate = currentDateGMT7;
    this.appointmentService.getAppointmentListNew(1, this.dateToTimestamp(this.startDate)).subscribe((data) => {
      this.appointmentList = ConvertJson.processApiResponse(data);
      console.log("check layout: ", this.appointmentList);
      this.analyses.total_appointment = 0;
      this.appointmentList.forEach((item: any) => {
        if (item.migrated_attr.BOOL == false) {
          this.analyses.total_appointment++;
        }
      })
    })
  }

  togglePopup(event: MouseEvent): void {
    event.stopPropagation();
    this.showPopup = !this.showPopup;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this._eref.nativeElement.contains(event.target) && this.showPopup) {
      this.showPopup = false;
    }
  }

  signOut() {
    this.cognitoService.signOut().then(() => {
      localStorage.removeItem("role");
      localStorage.removeItem("lastLoginTime");
      localStorage.removeItem("cognitoUser");
      sessionStorage.clear();
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

interface LogoMapping {
  [key: string]: string;
}
