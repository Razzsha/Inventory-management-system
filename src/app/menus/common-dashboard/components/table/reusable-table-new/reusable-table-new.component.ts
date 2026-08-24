import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { NzTableQueryParams, NzTableSize } from 'ng-zorro-antd/table';
import * as XLSX from 'xlsx';
// import * as FileSaver from 'file-saver';

export interface TableColumn {
  key: string;
  title: string;
  template?: TemplateRef<any>;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right' | null;
  ellipsis?: boolean;
  tooltip?: string;
  visible?: boolean;
  exportable?: boolean;
  exportFormatter?: (value: any, row: any) => any;
  exportNumberFormat?: string;
}

export type ExportFormat = 'excel' | 'csv';

export interface TableQueryEvent {
  pageIndex: number;
  pageSize: number;
  sortField: string | null;
  sortOrder: 'ascend' | 'descend' | null;
  filters: { [key: string]: any };
}

export interface ExcelExportEvent {
  format: ExportFormat;
  filename: string;
  sheetName: string;
}

@Component({
  selector: 'app-reusable-new-table',
  templateUrl: './reusable-table-new.component.html',
  styleUrls: ['./reusable-table-new.component.css'],
})
export class ReusableTableNewComponent implements OnInit, OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;

  @Input() total = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 1;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100, 500, 999999];
  @Input() showPagination = true;
  @Input() showSizeChanger = true;
  @Input() showQuickJumper = true;
  @Input() showTotal = true;
  @Input() frontPagination = false;

  @Input() size: NzTableSize = 'small';
  @Input() bordered = false;
  @Input() scroll: { x?: string | null; y?: string | null } = {
    x: null,
    y: null,
  };
  @Input() noResultText = 'No data found';
  @Input() rowClassName: (row: any, index: number) => string = () => '';

  @Input() showCheckbox = false;
  @Input() selectedRows: any[] = [];
  @Output() selectedRowsChange = new EventEmitter<any[]>();

  @Input() templates: { [key: string]: TemplateRef<any> } = {};
  @Input() expandTemplate?: TemplateRef<any>;
  @Input() emptyTemplate?: TemplateRef<any>;

  @Output() queryParamsChange = new EventEmitter<TableQueryEvent>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() exportRequest = new EventEmitter<ExcelExportEvent>();

  @Input() showCsvButton = false;
  @Input() csvButtonText = 'CSV';
  @Input() showExportButton = false;
  @Input() exportFilename = 'Export';
  @Input() exportSheetName = 'Sheet1';
  @Input() exportButtonText = 'Export Excel';
  @Input() exporting = false;

  @Input() gridItemTemplate!: TemplateRef<any>;
  @Input() defaultView: 'table' | 'grid' = 'table';
  @Input() enableGridView: boolean = true;

  viewMode: 'table' | 'grid' = 'table';

  exportable?: boolean;
  exportFormatter?: (value: any, row: any) => any;
  exportNumberFormat?: string;

  private isFirstEmit = true;
  setOfCheckedId = new Set<any>();
  checked = false;
  indeterminate = false;
  expandSet = new Set<any>();

  ngOnInit(): void {
    this.viewMode = this.defaultView || 'table';
    this.isFirstEmit = true;
  }

  switchView(mode: 'table' | 'grid') {
    this.viewMode = mode;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.refreshCheckedStatus();
    }
  }

  get visibleColumns(): TableColumn[] {
    return this.columns.filter((c) => c.visible !== false);
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    if (this.isFirstEmit) {
      this.isFirstEmit = false;
      return;
    }

    const sortItem = params.sort.find((item) => item.value !== null);
    this.queryParamsChange.emit({
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      sortField: sortItem?.key ?? null,
      sortOrder: (sortItem?.value as 'ascend' | 'descend') ?? null,
      filters: this.flattenFilters(params.filter),
    });
  }

  private flattenFilters(filters: any[]): { [key: string]: any } {
    const result: { [key: string]: any } = {};
    filters?.forEach((f) => (result[f.key] = f.value));
    return result;
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  emitAction(action: string, row: any): void {
    this.actionClick.emit({ action, row });
  }

  onItemChecked(row: any, checked: boolean): void {
    this.updateCheckedSet(row, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.data.forEach((row) => this.updateCheckedSet(row, checked));
    this.refreshCheckedStatus();
  }

  private updateCheckedSet(row: any, checked: boolean): void {
    const id = this.getRowId(row);
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  private refreshCheckedStatus(): void {
    if (!this.data?.length) {
      this.checked = false;
      this.indeterminate = false;
      return;
    }
    const allChecked = this.data.every((row) =>
      this.setOfCheckedId.has(this.getRowId(row)),
    );
    const someChecked = this.data.some((row) =>
      this.setOfCheckedId.has(this.getRowId(row)),
    );
    this.checked = allChecked;
    this.indeterminate = !allChecked && someChecked;

    const selected = this.data.filter((row) =>
      this.setOfCheckedId.has(this.getRowId(row)),
    );
    this.selectedRowsChange.emit(selected);
  }

  isChecked(row: any): boolean {
    return this.setOfCheckedId.has(this.getRowId(row));
  }

  private getRowId(row: any): any {
    return row?.id ?? row?.Id ?? row;
  }

  onExpandChange(row: any, checked: boolean): void {
    const id = this.getRowId(row);
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  isExpanded(row: any): boolean {
    return this.expandSet.has(this.getRowId(row));
  }

  resolveValue(row: any, path: string): any {
    if (!row || !path) return null;
    return path.split('.').reduce((acc, part) => acc?.[part], row);
  }

  onExportClick(format: ExportFormat): void {
    if (this.exporting) return;

    if (this.exportRequest.observed) {
      this.exportRequest.emit({
        format,
        filename: this.exportFilename,
        sheetName: this.exportSheetName,
      });
    } else {
      if (!this.data?.length) return;
      if (format === 'excel') this.downloadExcel(this.data);
      else this.downloadCsv(this.data);
    }
  }

  public downloadExcel(
    rows: any[],
    filename?: string,
    sheetName?: string,
  ): void {
    if (!rows?.length) return;

    const exportCols = this.columns.filter(
      (c) => c.exportable !== false && c.key !== 'sn' && c.key !== 'actions',
    );

    const exportRows = rows.map((row, i) => {
      const obj: any = { 'S.N.': i + 1 };
      exportCols.forEach((col) => {
        const raw = this.resolveValue(row, col.key);
        const value = col.exportFormatter ? col.exportFormatter(raw, row) : raw;
        obj[col.title] = value ?? '';
      });
      return obj;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportRows);

    worksheet['!cols'] = this.computeColumnWidths(exportRows, exportCols);

    this.applyNumberFormatting(worksheet, exportCols, exportRows.length);

    const workbook: XLSX.WorkBook = {
      Sheets: { [sheetName || this.exportSheetName]: worksheet },
      SheetNames: [sheetName || this.exportSheetName],
      Props: {
        Title: filename || this.exportFilename,
        CreatedDate: new Date(),
      },
    };

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    const finalName = `${filename || this.exportFilename}_${this.getTimestamp()}.xlsx`;
    // FileSaver.saveAs(blob, finalName);
  }

  public downloadCsv(rows: any[], filename?: string): void {
    if (!rows?.length) return;

    const cols = this.getExportableColumns();
    const exportRows = this.shapeRowsForExport(rows, cols);

    const headers = Object.keys(exportRows[0]);

    const csvLines = [
      headers.map((h) => this.escapeCsvCell(h)).join(','),
      ...exportRows.map((row) =>
        headers.map((h) => this.escapeCsvCell(row[h])).join(','),
      ),
    ];

    const csvContent = '\uFEFF' + csvLines.join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const finalName = `${filename || this.exportFilename}_${this.getTimestamp()}.csv`;
    // FileSaver.saveAs(blob, finalName);
  }

  private getExportableColumns(): TableColumn[] {
    return this.columns.filter(
      (c) => c.exportable !== false && c.key !== 'sn' && c.key !== 'actions',
    );
  }

  private shapeRowsForExport(rows: any[], cols: TableColumn[]): any[] {
    return rows.map((row, i) => {
      const obj: any = { 'S.N.': i + 1 };
      cols.forEach((col) => {
        const raw = this.resolveValue(row, col.key);
        const value = col.exportFormatter ? col.exportFormatter(raw, row) : raw;
        obj[col.title] = value ?? '';
      });
      return obj;
    });
  }

  private escapeCsvCell(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);

    if (/[",\n\r]/.test(str) || /^\s|\s$/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private computeColumnWidths(
    rows: any[],
    cols: TableColumn[],
  ): { wch: number }[] {
    const widths = [{ wch: 6 }];
    cols.forEach((col) => {
      const titleLen = col.title.length;
      const maxValLen = Math.max(
        ...rows.map((r) => (r[col.title] ? String(r[col.title]).length : 0)),
        titleLen,
      );

      widths.push({ wch: Math.min(Math.max(maxValLen + 2, 10), 40) });
    });
    return widths;
  }

  private applyNumberFormatting(
    worksheet: XLSX.WorkSheet,
    cols: TableColumn[],
    rowCount: number,
  ): void {
    cols.forEach((col, idx) => {
      if (!col.exportNumberFormat) return;

      const letter = this.columnLetter(idx + 1);
      for (let r = 2; r <= rowCount + 1; r++) {
        const addr = `${letter}${r}`;
        const cell = worksheet[addr];
        if (cell) {
          cell.t = 'n';
          cell.z = col.exportNumberFormat;
        }
      }
    });
  }

  private columnLetter(index: number): string {
    let letter = '';
    let n = index;
    while (n >= 0) {
      letter = String.fromCharCode((n % 26) + 65) + letter;
      n = Math.floor(n / 26) - 1;
    }
    return letter;
  }

  private getTimestamp(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
  }
}
