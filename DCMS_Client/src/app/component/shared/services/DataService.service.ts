import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

    private LABO_LIST = new BehaviorSubject<any[]>([]);
    dataLabo$ = this.LABO_LIST.asObservable();
    updateLaboData(newData: any[]): void {
        this.LABO_LIST.next(newData);
    }

    //Thống kê
    private ANALYSES = new BehaviorSubject<any>({
        total_appointment: 0,
        total_waiting_room: 0,
        total_patient_examinate: 0,
        total_patient_examinated: 0
    });

    dataAn$ = this.ANALYSES.asObservable();
    updateAnalysesData(newData: any): void {
        this.ANALYSES.next(newData);
    }

    UpdateWaitingRoomTotal(param:any, total:any): void {
        const currentData = this.ANALYSES.getValue();
        if (param == 0) {
            if (currentData.total_waiting_room > 0) {
                const newData = {
                    ...currentData,
                    total_waiting_room: currentData.total_waiting_room - 1
                };
                this.updateAnalysesData(newData);
            }
        } else if (param == 1) {
            const currentData = this.ANALYSES.getValue();
            const newData = {
                ...currentData,
                total_waiting_room: currentData.total_waiting_room + 1
            };
            this.updateAnalysesData(newData);
        } else {
            const newData = {
                ...currentData,
                total_waiting_room: total
            };
            this.updateAnalysesData(newData);
        }
    }

    UpdateAppointmentTotal(param:any, total:any): void {
        const currentData = this.ANALYSES.getValue();
        if (param == 0) {
            if (currentData.total_appointment > 0) {
                const newData = {
                    ...currentData,
                    total_appointment: currentData.total_appointment - 1
                }
                this.updateAnalysesData(newData);
            };
        } else if (param == 1) {
            const currentData = this.ANALYSES.getValue();
            const newData = {
                ...currentData,
                total_appointment: currentData.total_appointment + 1
            };
            this.updateAnalysesData(newData);
        } else {
            //const currentData = this.ANALYSES.getValue();
            const newData = {
                ...currentData,
                total_appointment: total
            };
            this.updateAnalysesData(newData);
        }
    }

    UpdatePatientExaminate(param:any, total:any): void {
        const currentData = this.ANALYSES.getValue();
        if (param == 0) {
            if (currentData.total_patient_examinate > 0) {
                const newData = {
                    ...currentData,
                    total_patient_examinate: currentData.total_patient_examinate - 1
                };
                this.updateAnalysesData(newData);
            }
        } else if (param == 1) {
            const currentData = this.ANALYSES.getValue();
            const newData = {
                ...currentData,
                total_patient_examinate: currentData.total_patient_examinate + 1
            };
            this.updateAnalysesData(newData);
        } else {
            const newData = {
                ...currentData,
                total_patient_examinate: total
            };
            this.updateAnalysesData(newData);
        }
    }

    UpdatePatientExaminated(param: any, total: any): void {
        const currentData = this.ANALYSES.getValue();
        const newData = {
            ...currentData,
            total_patient_examinated: currentData.total_patient_examinated + 1
        };
        this.updateAnalysesData(newData);
    }

    UpdatePatientTotal(param:any, total:any): void {
        const currentData = this.ANALYSES.getValue();
        if (param == 0) {
            const newData = {
                ...currentData,
                total_patient: currentData.total_patient - 1
            };
            this.updateAnalysesData(newData);
        } else if (param == 1) {
            const currentData = this.ANALYSES.getValue();
            const newData = {
                ...currentData,
                total_patient: currentData.total_patient + 1
            };
            this.updateAnalysesData(newData);
        } else {
            const newData = {
                ...currentData,
                total_patient: total
            };
            this.updateAnalysesData(newData);
        }
    }
}
