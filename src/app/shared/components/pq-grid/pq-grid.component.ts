import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';

import { PqGridService } from '../../services/pq-grid.service';

@Component({
  selector: 'app-pq-grid',
  templateUrl: './pq-grid.component.html',
  styleUrls: ['./pq-grid.component.css'],
})
export class PqGridComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() gridId = 'myGrid';
  @Input() gridData: any[] = [];
  @Input() columns: any[] = [];

  @Input() groupBy: string[] = [];

  @Input() height: number | string = 500;
  @Input() width: number | string = 'auto';

  @Input() showHeader = true;
  @Input() stripeRows = true;
  @Input() freezeCols = 0;
  @Input() wrap = true;
  @Input() numberCell = true;

  @Input() selectionMode: 'single' | 'multiple' = 'single';

  @Input() showTitle = true;
  @Input() showToolbar = false;
  @Input() showPager = false;
  @Input() pageModel: any = null;

  @Input() showExportButtons = true;
  @Input() exportFilename = 'export';

  @Input() gridOptions: any = {};

  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowDblClick = new EventEmitter<any>();
  @Output() cellClick = new EventEmitter<any>();

  private initialized = false;

  constructor(private pqGridService: PqGridService) {}

  ngAfterViewInit(): void {
    this.createGrid();
  }

  private createGrid(): void {
    const gridOptions: any = {
      width: this.width,
      height: this.height,

      editable: false,

      showHeader: this.showHeader,
      stripeRows: this.stripeRows,
      freezeCols: this.freezeCols,
      wrap: this.wrap,
      numberCell: this.numberCell,

      showTitle: this.showTitle,
      showToolbar: this.showToolbar,

      selectionModel: {
        type: 'row',
        mode: this.selectionMode,
      },

      rowSelect: (evt: any, ui: any) => {
        this.rowSelect.emit(ui.rowData);
      },

      rowDblClick: (evt: any, ui: any) => {
        this.rowDblClick.emit(ui.rowData);
      },

      cellClick: (evt: any, ui: any) => {
        this.cellClick.emit({
          rowData: ui.rowData,
          column: ui.column,
          dataIndx: ui.dataIndx,
          value: ui.rowData?.[ui.dataIndx],
          rowIndx: ui.rowIndx,
        });
      },

      ...this.gridOptions,

      dataModel: {
        data: this.gridData,
      },

      colModel: this.columns.map((col) => ({
        ...col,
        groupable: this.groupBy.length > 0,
      })),
    };

    if (this.groupBy.length > 0) {
      gridOptions.groupModel = {
        on: true,
        dataIndx: this.groupBy,
        merge: [true],
        collapsed: false,
      };
    }

    if (this.showPager && this.pageModel) {
      gridOptions.pageModel = this.pageModel;
    }

    this.pqGridService.createGrid(this.gridId, gridOptions);

    this.initialized = true;
  }

  getGridInstance(): any {
    if (!this.initialized) {
      return null;
    }

    return this.pqGridService.getGridInstance(this.gridId);
  }

  addRow(rowData: any, rowIndxPage = 0): number {
    return this.pqGridService.addRow(this.gridId, rowData, rowIndxPage);
  }

  getRowData(rowIndx: number): any {
    return this.pqGridService.getRowData(this.gridId, rowIndx);
  }

  editRow(rowIndx: number): void {
    this.pqGridService.editRow(this.gridId, rowIndx);
  }

  isEditing(): boolean {
    return this.pqGridService.isEditing(this.gridId);
  }

  saveEditCell(): boolean {
    return this.pqGridService.saveEditCell(this.gridId);
  }

  isValid(rowIndx: number): boolean {
    return this.pqGridService.isValid(this.gridId, rowIndx);
  }

  isDirty(): boolean {
    return this.pqGridService.isDirty(this.gridId);
  }

  commit(type: 'add' | 'update' | 'delete', rows: any[]): void {
    this.pqGridService.commit(this.gridId, type, rows);
  }

  cancelEdit(rowIndx: number): void {
    this.pqGridService.cancelEdit(this.gridId, rowIndx);
  }

  refreshGrid(): void {
    if (this.initialized) {
      this.pqGridService.refreshGrid(this.gridId);
    }
  }

  updateData(data: any[]): void {
    this.gridData = data;

    if (this.initialized) {
      this.pqGridService.updateData(this.gridId, data);
    }
  }

  exportToExcel(filename?: string): void {
    if (this.initialized) {
      this.pqGridService.exportToExcel(
        this.gridId,
        filename || this.exportFilename,
      );
    }
  }

  exportToCsv(filename?: string): void {
    if (this.initialized) {
      this.pqGridService.exportToCsv(
        this.gridId,
        filename || this.exportFilename,
      );
    }
  }

  printGrid(): void {
    if (this.initialized) {
      this.pqGridService.printGrid(this.gridId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.initialized) {
      return;
    }

    if (changes['gridData'] && !changes['gridData'].firstChange) {
      this.pqGridService.updateData(this.gridId, this.gridData);
    }

    if (changes['columns'] && !changes['columns'].firstChange) {
      this.pqGridService.destroyGrid(this.gridId);

      setTimeout(() => {
        this.createGrid();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.pqGridService.destroyGrid(this.gridId);

    this.initialized = false;
  }
}
