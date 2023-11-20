import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
})
export class TableComponent {
    @Input() columns: string[] = [];
    @Input() items: any[] = [];

    // Trong thành phần gốc (root component)
    tableColumns = ['ID', 'Tên', 'Email'];
    tableData = [
        { ID: 1, Tên: 'Người 1', Email: 'nguoi1@example.com' },
        { ID: 2, Tên: 'Người 2', Email: 'nguoi2@example.com' },
        { ID: 3, Tên: 'Người 3', Email: 'nguoi3@example.com' }
    ];

    constructor() {

    }
}