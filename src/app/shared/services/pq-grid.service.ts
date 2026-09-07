import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

declare var $: any;

export interface PqGridColumnMeta {
  dataIndx: string;
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class PqGridService {
  private resizeTimers = new Map<string, ReturnType<typeof setTimeout>>();

  createGrid(containerId: string, options: any): any {
    return $(`#${containerId}`).pqGrid(options);
  }

  resizeGrid(containerId: string, delay = 100): void {
    const grid = this.getGridInstance(containerId);

    if (!grid) {
      return;
    }

    const existing = this.resizeTimers.get(containerId);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      grid.refresh();
      this.resizeTimers.delete(containerId);
    }, delay);

    this.resizeTimers.set(containerId, timer);
  }

  getGridInstance(containerId: string): any {
    try {
      return $(`#${containerId}`).pqGrid('instance') || null;
    } catch {
      return null;
    }
  }

  destroyGrid(containerId: string): void {
    const timer = this.resizeTimers.get(containerId);
    if (timer) {
      clearTimeout(timer);
      this.resizeTimers.delete(containerId);
    }

    try {
      const grid = this.getGridInstance(containerId);

      if (grid) {
        grid.destroy();
      }
    } catch {
      // Grid may already be destroyed - safe to ignore
    }
  }

  updateData(containerId: string, newData: any[]): void {
    const grid = this.getGridInstance(containerId);

    if (!grid) {
      return;
    }

    grid.option('dataModel.data', newData);
    grid.refreshDataAndView();
  }

  getGridData(containerId: string): any[] {
    const grid = this.getGridInstance(containerId);

    if (!grid) {
      return [];
    }

    return grid.option('dataModel').data || [];
  }

  saveEditCell(containerId: string): boolean {
    const grid = this.getGridInstance(containerId);

    if (!grid) {
      return false;
    }

    return grid.saveEditCell() !== false;
  }

  validateGrid(containerId: string): boolean {
    const grid = this.getGridInstance(containerId);

    if (!grid) {
      return false;
    }

    // Guard against isValid() returning undefined instead of throwing.
    const result = grid.isValid({ focusInvalid: true });
    return !!result?.valid;
  }

  refreshGrid(containerId: string): void {
    this.getGridInstance(containerId)?.refresh();
  }

  private getGridColumns(containerId: string): PqGridColumnMeta[] {
    try {
      const grid = this.getGridInstance(containerId);

      if (!grid) {
        return [];
      }

      return this.flattenColumns(grid.option('colModel') || []);
    } catch {
      return [];
    }
  }

  private flattenColumns(columns: any[], parentTitle = ''): PqGridColumnMeta[] {
    const result: PqGridColumnMeta[] = [];

    for (const col of columns) {
      const title = parentTitle ? `${parentTitle} - ${col.title}` : col.title;

      if (col.colModel?.length) {
        result.push(...this.flattenColumns(col.colModel, title));
      } else if (col.dataIndx) {
        result.push({
          dataIndx: col.dataIndx,
          title: title || col.dataIndx,
        });
      }
    }

    return result;
  }

  private getExportPayload(containerId: string): {
    data: any[];
    columns: PqGridColumnMeta[];
  } {
    const data = this.getGridData(containerId);
    const columns = this.getGridColumns(containerId).filter(
      (col) => col.dataIndx !== 'buttons',
    );

    return { data, columns };
  }

  exportToExcel(containerId: string, filename = 'export'): void {
    const { data, columns } = this.getExportPayload(containerId);

    if (!data.length || !columns.length) {
      return;
    }

    const exportData = data.map((row) => {
      const mapped: Record<string, any> = {};

      columns.forEach((col) => {
        mapped[col.title] = row[col.dataIndx] ?? '';
      });

      return mapped;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);

    const wb: XLSX.WorkBook = {
      Sheets: { Sheet1: ws },
      SheetNames: ['Sheet1'],
    };

    const buffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    saveAs(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `${filename}_${Date.now()}.xlsx`,
    );
  }

  exportToCsv(containerId: string, filename = 'export'): void {
    const { data, columns } = this.getExportPayload(containerId);

    if (!data.length || !columns.length) {
      return;
    }

    const escapeCsvValue = (value: any): string => {
      const str = String(value ?? '');
      return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const headers = columns.map((col) => escapeCsvValue(col.title || col.dataIndx));
    const rows = data.map((row) =>
      columns.map((col) => escapeCsvValue(row[col.dataIndx])).join(','),
    );

    rows.unshift(headers.join(','));

    saveAs(
      new Blob(['\ufeff' + rows.join('\r\n')], {
        type: 'text/csv;charset=utf-8;',
      }),
      `${filename}_${Date.now()}.csv`,
    );
  }

  printGrid(containerId: string): void {
    const { data, columns } = this.getExportPayload(containerId);

    if (!data.length || !columns.length) {
      return;
    }

    const escapeHtml = (value: any): string =>
      String(value ?? '').replace(
        /[&<>"']/g,
        (ch) =>
          ((
            {
              '&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&#39;',
            } as Record<string, string>
          )[ch]),
      );

    const headerRow = columns
      .map(
        (col) =>
          `<th style="padding:6px 10px;background:#f0f0f0;">${escapeHtml(
            col.title || col.dataIndx,
          )}</th>`,
      )
      .join('');

    const bodyRows = data
      .map(
        (row) =>
          `<tr>${columns
            .map(
              (col) =>
                `<td style="padding:6px 10px;">${escapeHtml(row[col.dataIndx])}</td>`,
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
      </html>
    `;

    const win = window.open('', '', 'width=900,height=700');

    if (!win) {
      return;
    }

    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }
}
