import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-patient-management',
  templateUrl: './patient-management.component.html',
  styleUrls: ['./patient-management.component.css']
})
export class PatientManagementComponent implements OnInit {
  showDropDown: boolean = false;
  list: any[] = [];

  time = { hour: 13, minute: 30 };

  newMedicine: Medicine = this.createNewMedicine();
  createNewMedicine(): Medicine {
    return {
      medicineId: '',
      medicineName: '',
      quantity: 0,
      notes: '',
      checked: false,
    };
  }
  constructor() { }
  ngOnInit(): void {
    this.list = [
      {
        groupId: 'group1',
        groupName: 'Nhóm Thuốc A',
        checked: false,
        isExpand: false,
        medicines: [
          {
            medicineId: 'med1',
            medicineName: 'Augmentin 1g',
            quantity: 10,
            notes: 'Ngày uống 1 viên sau ăn',
            checked: true,
          },
          {
            medicineId: 'med2',
            medicineName: 'Augmentin 2g',
            quantity: 10,
            notes: 'Ngày uống 1 viên sau ăn',
            checked: true,
          },
        ],
      },
      {
        groupId: 'group2',
        groupName: 'Nhóm Thuốc B',
        checked: false,
        isExpand: false,
        medicines: [
          {
            medicineId: 'med3',
            medicineName: 'ZXCZXZCZ 1g',
            quantity: 10,
            notes: 'Ngày uống 1 viên sau ăn',
            checked: true,
          },
          {
            medicineId: 'med4',
            medicineName: 'adasdsad 1g',
            quantity: 10,
            notes: 'Ngày uống 1 viên sau ăn',
            checked: true,
          },
        ],
      },
    ];
  }

  addNewMedicine(group: MedicineGroup): void {
    this.newMedicine.medicineId = this.generateUniqueId();
    group.medicines.push({ ...this.newMedicine });
    this.newMedicine = this.createNewMedicine();
  }

  generateUniqueId(): string {
    return Date.now().toString();
  }

  getSelectedValue(group: MedicineGroup): void {
    group.checked = !group.checked;
    group.medicines.forEach(med => med.checked = group.checked);
  }


  toggleExpand(group: MedicineGroup): void {
    group.isExpand = !group.isExpand;
  }

  checkMedicineUse(medicine: Medicine): void {
    medicine.checked = !medicine.checked;
  }

  changeQuantity(medicine: Medicine, event: any): void {
    medicine.quantity = +event.target.value;
  }

}

interface Medicine {
  medicineId: string;
  medicineName: string;
  quantity: number;
  notes: string;
  checked: boolean;
}

interface MedicineGroup {
  groupId: string;
  groupName: string;
  medicines: Medicine[];
  checked: boolean;
  isExpand: boolean;
}
