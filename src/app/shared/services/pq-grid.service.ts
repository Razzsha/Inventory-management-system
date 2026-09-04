import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
declare var $: any;
// import * as $ from 'jquery';
@Injectable({
  providedIn: 'root',
})
export class PqGridService {
  createGrid(containerId: string, options: any) {
    return $(`#${containerId}`).pqGrid(options);
  }

  updateData(containerId: string, newData: any[]) {
    $(`#${containerId}`).pqGrid('option', 'dataModel.data', newData);
    $(`#${containerId}`).pqGrid('refreshDataAndView');
  }

  destroyGrid(containerId: string) {
    if ($(`#${containerId}`).pqGrid('instance')) {
      $(`#${containerId}`).pqGrid('destroy');
    }
  }

  refreshGrid(containerId: string) {
    $(`#${containerId}`).pqGrid('refresh');
  }

  private getGridData(containerId: string): any[] {
    try {
      return $(`#${containerId}`).pqGrid('option', 'dataModel').data || [];
    } catch {
      return [];
    }
  }

  private getGridColumns(
    containerId: string,
  ): { dataIndx: string; title: string }[] {
    try {
      const colModel = $(`#${containerId}`).pqGrid('option', 'colModel') || [];

      return this.flattenColumns(colModel).filter(
        (col) => col.dataIndx !== 'buttons',
      );
    } catch {
      return [];
    }
  }

  private flattenColumns(
    columns: any[],
  ): { dataIndx: string; title: string }[] {
    const result: { dataIndx: string; title: string }[] = [];

    columns.forEach((col) => {
      if (col.colModel && col.colModel.length > 0) {
        col.colModel.forEach((child: any) => {
          result.push({
            dataIndx: child.dataIndx,
            title: `${col.title} - ${child.title}`,
          });
        });
      } else if (col.dataIndx) {
        result.push({
          dataIndx: col.dataIndx,
          title: col.title || col.dataIndx,
        });
      }
    });

    return result;
  }

  exportToExcel(containerId: string, filename: string = 'export'): void {
    const data = this.getGridData(containerId);
    const columns = this.getGridColumns(containerId);
    if (!data?.length) return;

    const exportData = data.map((row) => {
      const mapped: any = {};
      columns.forEach((col) => {
        mapped[col.title || col.dataIndx] = row[col.dataIndx] ?? '';
      });
      return mapped;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = {
      Sheets: { Sheet1: ws },
      SheetNames: ['Sheet1'],
    };
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    saveAs(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `${filename}_${Date.now()}.xlsx`,
    );
  }

  exportToCsv(containerId: string, filename: string = 'export'): void {
    const data = this.getGridData(containerId);
    const columns = this.getGridColumns(containerId);
    if (!data?.length) return;

    const headers = columns.map((col) => col.title || col.dataIndx);
    const rows = data.map((row) =>
      columns.map((col) => JSON.stringify(row[col.dataIndx] ?? '')).join(','),
    );
    rows.unshift(headers.join(','));

    saveAs(
      new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' }),
      `${filename}_${Date.now()}.csv`,
    );
  }
  getGridInstance(containerId: string): any {
    try {
      return $(`#${containerId}`).pqGrid('instance');
    } catch {
      return null;
    }
  }

  addRow(containerId: string, rowData: any, rowIndxPage = 0): number {
    const grid = this.getGridInstance(containerId);

    if (!grid) {
      return -1;
    }

    return grid.addRow({
      rowIndxPage,
      rowData,
      checkEditable: false,
    });
  }

  getRowData(containerId: string, rowIndx: number): any {
    const grid = this.getGridInstance(containerId);

    if (!grid) {
      return null;
    }

    return grid.getRowData({
      rowIndx,
    });
  }

  editRow(
  containerId: string,
  rowIndx: number
): void {

  const grid = this.getGridInstance(containerId);

  if (!grid) {
    return;
  }

  grid.addClass({
    rowIndx,
    cls: 'pq-row-edit',
  });

  grid.goToPage({
    rowIndx,
  });

  setTimeout(() => {
    grid.editFirstCellInRow({
      rowIndx,
    });
  }, 0);
}

  isEditing(containerId: string): boolean {
    const grid = this.getGridInstance(containerId);

    if (!grid) {
      return false;
    }

    const rows = grid.getRowsByClass({
      cls: 'pq-row-edit',
    });

    if (rows.length > 0) {
      const rowIndx = rows[0].rowIndx;

      grid.goToPage({
        rowIndx,
      });

      grid.editFirstCellInRow({
        rowIndx,
      });

      return true;
    }

    return false;
  }

  saveEditCell(containerId: string): boolean {
    const grid = this.getGridInstance(containerId);

    if (!grid) {
      return false;
    }

    return grid.saveEditCell() !== false;
  }

  isValid(containerId: string, rowIndx: number): boolean {
    const grid = this.getGridInstance(containerId);

    if (!grid) {
      return false;
    }

    return grid.isValid({
      rowIndx,
      focusInvalid: true,
    }).valid;
  }

  isDirty(containerId: string): boolean {
    const grid = this.getGridInstance(containerId);

    if (!grid) {
      return false;
    }

    return grid.isDirty();
  }

  commit(
    containerId: string,
    type: 'add' | 'update' | 'delete',
    rows: any[],
  ): void {
    const grid = this.getGridInstance(containerId);

    if (!grid) {
      return;
    }

    grid.commit({
      type,
      rows,
    });
  }

  cancelEdit(containerId: string, rowIndx: number): void {
    const grid = this.getGridInstance(containerId);

    if (!grid) {
      return;
    }

    grid.quitEditMode();

    grid.removeClass({
      rowIndx,
      cls: 'pq-row-edit',
    });

    grid.rollback();

    grid.refreshRow({
      rowIndx,
    });
  }

  deleteRow(containerId: string, rowIndx: number): void {
    const grid = this.getGridInstance(containerId);

    const rowData = grid.getRowData({
      rowIndx,
    });

    grid.deleteRow({
      rowIndx,
    });

    return rowData;
  }

  printGrid(containerId: string): void {
    const data = this.getGridData(containerId);
    const columns = this.getGridColumns(containerId);
    if (!data?.length) return;

    const headerRow = columns
      .map(
        (col) =>
          `<th style="padding:6px 10px; background:#f0f0f0;">${col.title || col.dataIndx}</th>`,
      )
      .join('');

    const bodyRows = data
      .map(
        (row) =>
          `<tr>${columns
            .map(
              (col) =>
                `<td style="padding:6px 10px;">${row[col.dataIndx] ?? ''}</td>`,
            )
            .join('')}</tr>`,
      )
      .join('');

    const html = `
      <html>
        <head>
          <title>Print</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; text-align: left; }
            tr:nth-child(even) { background: #f9f9f9; }
          </style>
        </head>
        <body>
          <table>
            <thead><tr>${headerRow}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </body>
      </html>`;

    const win = window.open('', '', 'width=900,height=700');
    win!.document.write(html);
    win!.document.close();
    win!.focus();
    win!.print();
    win!.close();
  }
}
