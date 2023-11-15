import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModelSerivceService {
  private modals: any[] = [];

  add(modal: any) {
    this.modals.push(modal);
  }

  remove(id: string) {
    this.modals = this.modals.filter(x => x.id !== id);
  }

  open(id: string) {
    let modal: any = this.modals.find(x => x.id === id);
    modal.open();
  }

  close(id: string) {
    let modal: any = this.modals.find(x => x.id === id);
    modal.close();
  }
  constructor() { }
}
