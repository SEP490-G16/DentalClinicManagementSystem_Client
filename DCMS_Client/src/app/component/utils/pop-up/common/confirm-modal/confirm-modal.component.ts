import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: '../confirm-modal/confirm-modal.component.html',
  styleUrls: ['../confirm-modal/confirm-modal.component.css']
})
export class ConfirmationModalComponent {
  @Input() message: string = "";
  @Input() confirmButtonText: string = "Xác nhận";
  @Input() cancelButtonText: string = "Hủy";
  constructor(public activeModal: NgbActiveModal) {}

  dismiss() {
    this.activeModal.dismiss('cancel');
  }

  confirm() {
    this.activeModal.close('confirm');
  }
}
