import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent } from 'angular-calendar';

@Component({
  selector: 'app-confirm-delete-modal',
  template: `
    <div class="modal-header close-modal">
      <h4 class="modal-title">Xác nhận</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body close-modal">
      Bạn có chắc chắn muốn xóa lịch làm việc này không?
    </div>
    <div class="modal-footer close-modal">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Hủy</button>
      <button type="button" class="btn btn-danger" (click)="confirmDelete()">Xóa</button>
    </div>
  `,
  styleUrls: ['./ConfirmDeleteModal.component.css']
})
export class ConfirmDeleteModalComponent {
  @Input() event!: CalendarEvent;

  constructor(public activeModal: NgbActiveModal) {}

  confirmDelete() {
    this.activeModal.close('delete');
  }
}
