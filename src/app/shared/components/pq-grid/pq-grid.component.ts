import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  NgZone,
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
export class PqGridComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() gridId = 'myGrid';
  @Input() gridData: any[] = [];
  @Input() columns: any[] = [];
  @Input() groupBy: string[] = [];
  @Input() gridOptions: any = {};
  @Input() height: number | string = 500;
  @Input() width: number | string = 'auto';
  @Input() showHeader = true;
  @Input() stripeRows = true;
  @Input() freezeCols = 0;
  @Input() wrap = true;
  @Input() numberCell: any = true;
  @Input() selectionMode: 'single' | 'multiple' = 'single';
  @Input() showTitle = true;
  @Input() showToolbar = false;
  @Input() showPager = false;
  @Input() pageModel: any = null;
  @Input() showExportButtons = true;
  @Input() exportFilename = 'export';
  @Input() enableFullscreenToggle = false;

  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowDblClick = new EventEmitter<any>();
  @Output() cellClick = new EventEmitter<any>();

  private initialized = false;
  private pendingRebuild: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private pqGridService: PqGridService,
    private zone: NgZone,
  ) {}

  get cssWidth(): string {
    return typeof this.width === 'number' ? `${this.width}px` : this.width;
  }

  get cssHeight(): string {
    return typeof this.height === 'number' ? `${this.height}px` : this.height;
  }

  ngAfterViewInit(): void {
    this.createGrid();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.initialized) {
      return;
    }

    if (changes['columns'] && !changes['columns'].firstChange) {
      this.pqGridService.destroyGrid(this.gridId);

      if (this.pendingRebuild) {
        clearTimeout(this.pendingRebuild);
      }
      this.pendingRebuild = setTimeout(() => {
        this.createGrid();
        this.pendingRebuild = null;
      }, 100);

      return;
    }

    if (changes['gridData'] && !changes['gridData'].firstChange) {
      this.pqGridService.updateData(this.gridId, this.gridData);
    }
  }

  ngOnDestroy(): void {
    if (this.pendingRebuild) {
      clearTimeout(this.pendingRebuild);
    }
    this.pqGridService.destroyGrid(this.gridId);
  }

  private createGrid(): void {
    const userOptions = this.gridOptions || {};

    const gridOptions: any = {
      ...userOptions,
      width: this.width,
      height: this.height,
      editable: true,
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
        userOptions.rowSelect?.(evt, ui);
        this.zone.run(() => this.rowSelect.emit(ui.rowData));
      },

      rowDblClick: (evt: any, ui: any) => {
        userOptions.rowDblClick?.(evt, ui);
        this.zone.run(() => this.rowDblClick.emit(ui.rowData));
      },

      cellClick: (evt: any, ui: any) => {
        userOptions.cellClick?.(evt, ui);
        this.zone.run(() =>
          this.cellClick.emit({
            rowData: ui.rowData,
            column: ui.column,
            dataIndx: ui.dataIndx,
            value: ui.rowData?.[ui.dataIndx],
            rowIndx: ui.rowIndx,
          }),
        );
      },

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

    if (!gridOptions.collapsible && this.enableFullscreenToggle) {
      gridOptions.collapsible = {
        on: true,
        toggle: true,
        collapsed: false,
        css: { zIndex: 2000 },
      };
    }

    gridOptions.toggle = (evt: any, ui: any) => {
      userOptions.toggle?.(evt, ui);

      if (!this.enableFullscreenToggle) {
        return;
      }

      const grid = this.pqGridService.getGridInstance(this.gridId);
      if (!grid) {
        return;
      }

      if (ui.state === 'max') {
        grid.option({ height: '100%', width: '100%' });
      } else {
        grid.option({ height: this.height, width: this.width });
      }

      grid.refresh();
    };

    this.pqGridService.createGrid(this.gridId, gridOptions);
    this.initialized = true;
  }

  resizeGrid(): void {
    this.pqGridService.resizeGrid(this.gridId);
  }

  getGridInstance(): any {
    return this.pqGridService.getGridInstance(this.gridId);
  }

  getGridData(): any[] {
    return this.pqGridService.getGridData(this.gridId);
  }

  saveEditCell(): boolean {
    return this.pqGridService.saveEditCell(this.gridId);
  }

  validateGrid(): boolean {
    return this.pqGridService.validateGrid(this.gridId);
  }

  updateData(data: any[]): void {
    this.gridData = data;
    this.pqGridService.updateData(this.gridId, data);
  }

  refreshGrid(): void {
    this.pqGridService.refreshGrid(this.gridId);
  }

  exportToExcel(filename?: string): void {
    this.pqGridService.exportToExcel(this.gridId, filename || this.exportFilename);
  }

  exportToCsv(filename?: string): void {
    this.pqGridService.exportToCsv(this.gridId, filename || this.exportFilename);
  }

  printGrid(): void {
    this.pqGridService.printGrid(this.gridId);
  }
}
