import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-popup-gen-medical-pdf',
  templateUrl: './popup-gen-medical-pdf.component.html',
  styleUrls: ['./popup-gen-medical-pdf.component.css']
})
export class PopupGenMedicalPdfComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal) { }
  public Medical:any;
  public Patient:any;
  currentDay!: string;
  currentMonth!: string;
  currentYear!: string;
  ngOnInit(): void {
    const now = new Date();
    this.currentDay = now.getDate().toString().padStart(2, '0');
    this.currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    this.currentYear = now.getFullYear().toString();
    console.log("Medical: ", this.Medical);
    console.log("Patient: ", this.Patient);

    this.Patient.date_of_birth = this.calculateAge(this.Patient.date_of_birth);
  }

  @ViewChild('pdfContent') pdfContent!: ElementRef;
  generateExDetailPdf() {
    html2canvas(this.pdfContent.nativeElement, { scale: 2.5 }).then(canvas => {
      const contentDataURL = canvas.toDataURL('image/jpeg', 2.0);
      let pdf = new jsPDF('p', 'mm', 'a4');
      var width = pdf.internal.pageSize.getWidth();
      var maxHeight = 200;
      var height = canvas.height * width / canvas.width;
      height = Math.min(height, maxHeight);
      pdf.addImage(contentDataURL, 'PNG', 0, 0, width, height);

      window.open(pdf.output('bloburl'), '_blank');
      this.activeModal.close('confirm');
    });
  }

  calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }

    return age;
  }
  dismiss() {
    this.activeModal.dismiss('cancel');
  }


}
