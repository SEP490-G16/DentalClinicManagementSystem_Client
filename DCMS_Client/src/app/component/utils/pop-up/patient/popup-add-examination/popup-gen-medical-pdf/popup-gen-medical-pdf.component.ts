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

  // MedicalInput = [{ value: '' }, { value: '' }, { value: '' }, { value: '' }];
  // MedicalValue:string = "";
  constructor(public activeModal: NgbActiveModal) { }
  public Medical: any;
  public Patient: any;
  public Disagnosis: any;
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
    const contentClone = this.pdfContent.nativeElement.cloneNode(true);
    document.body.appendChild(contentClone);

    const inputs = contentClone.querySelectorAll('input');
    inputs.forEach((input:any) => {
      const span = document.createElement('span');
      span.style.display = 'inline-block';
      span.style.minWidth = `${input.offsetWidth}px`;
      span.style.paddingLeft = '10px';
      span.style.paddingRight = '10px';
      span.textContent = input.value;
      input.parentNode.replaceChild(span, input);
    });

    html2canvas(contentClone, { scale: 1 }).then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = imgProps.height * pdfWidth / imgProps.width;
      const imgWidth = pdfWidth;
      const x = 0;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      window.open(pdf.output('bloburl'), '_blank');

      document.body.removeChild(contentClone);
    }).catch(error => {
      console.error('Có lỗi xảy ra trong quá trình tạo PDF:', error);
      document.body.removeChild(contentClone);
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
