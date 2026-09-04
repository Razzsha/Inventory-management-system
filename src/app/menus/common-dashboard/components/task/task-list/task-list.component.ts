import { Component, OnInit, ViewChild } from '@angular/core';

import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { PqGridComponent } from 'src/app/shared/components/pq-grid/pq-grid.component';

interface Task {
  id: number | null;
  title: string;
  date: string;
  time: string;
  completed: boolean;
}

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  @ViewChild('taskGrid')
  taskGrid!: PqGridComponent;

  tasks: Task[] = [];

  nextId = 1;

  constructor(private alert: AlertifyService) {}

  ngOnInit(): void {
    this.tasks = [
      {
        id: 1,
        title: 'Prepare stock report',
        date: '2026-09-05',
        time: '09:30',
        completed: true,
      },
      {
        id: 2,
        title: 'Call supplier',
        date: '2026-09-03',
        time: '14:00',
        completed: true,
      },
      {
        id: 3,
        title: 'Review purchase orders',
        date: '2026-09-06',
        time: '11:15',
        completed: false,
      },
      {
        id: 4,
        title: 'Update inventory counts',
        date: '2026-09-04',
        time: '16:45',
        completed: false,
      },
    ];

    this.nextId = Math.max(...this.tasks.map((task) => task.id as number)) + 1;
  }

  gridOptions: any = {
    rowHt: 32,

    wrap: false,

    columnBorders: false,

    trackModel: {
      on: true,
    },

    validation: {
      icon: 'ui-icon-info',
    },

    title: '<b>Tasks</b>',

    postRenderInterval: -1,

    editable: function (this: any, ui: any) {
      return this.hasClass({
        rowIndx: ui.rowIndx,
        cls: 'pq-row-edit',
      });
    },

    dataChange: (evt: any, ui: any) => {
      console.log('Cell changed:', ui.rowData);
    },
  };

  columns: any[] = [
    {
      title: 'Title',
      width: 200,
      dataType: 'string',
      dataIndx: 'title',

      validations: [
        {
          type: 'nonEmpty',
          msg: 'Required',
        },
        {
          type: 'maxLen',
          value: 60,
          msg: 'Length should be <= 60',
        },
      ],
    },

    {
      title: 'Date',
      width: 140,
      dataType: 'string',
      dataIndx: 'date',

      editor: {
        type: 'textbox',
      },

      validations: [
        {
          type: 'nonEmpty',
          msg: 'Required',
        },
      ],
    },
    {
      title: 'Time',
      width: 110,
      dataType: 'string',
      dataIndx: 'time',

      editor: {
        type: 'textbox',
      },

      validations: [
        {
          type: 'regex',
          value: '^([01]\\d|2[0-3]):([0-5]\\d)$',
          msg: 'Use HH:mm format',
        },
      ],
    },

    {
      title: 'Done',
      width: 90,
      align: 'center',
      dataType: 'bool',
      dataIndx: 'completed',

      editor: false,

      type: 'checkbox',
    },

    {
      title: '',
      dataIndx: 'buttons',

      editable: false,

      minWidth: 165,

      sortable: false,

      render: function () {
        return `
          <button
            type="button"
            class="edit_btn"
          >
            Edit
          </button>

          <button
            type="button"
            class="delete_btn"
          >
            Delete
          </button>
        `;
      },

      postRender: (ui: any) => {
        const grid = this.taskGrid?.getGridInstance();

        if (!grid) {
          return;
        }

        const rowIndx = ui.rowIndx;

        const $cell = grid.getCell(ui);

        if (
          grid.hasClass({
            rowData: ui.rowData,
            cls: 'pq-row-edit',
          })
        ) {
          $cell
            .find('.edit_btn')
            .button({
              label: 'Update',
              icon: 'ui-icon-check',
            })
            .off('click')
            .on('click', () => {
              this.updateTask(rowIndx);
            });

          $cell
            .find('.delete_btn')
            .button({
              label: 'Cancel',
              icon: 'ui-icon-close',
            })
            .off('click')
            .on('click', () => {
              this.cancelTask(rowIndx);
            });
        } else {
          $cell
            .find('.edit_btn')
            .button({
              label: 'Edit',
              icon: 'ui-icon-pencil',
            })
            .off('click')
            .on('click', () => {
              if (this.taskGrid.isEditing()) {
                return false;
              }

              this.taskGrid.editRow(rowIndx);

              return false;
            });

          $cell
            .find('.delete_btn')
            .button({
              label: 'Delete',
              icon: 'ui-icon-trash',
            })
            .off('click')
            .on('click', () => {
              this.deleteTask(rowIndx);
            });
        }
      },
    },
  ];

  addTask(): void {
    if (this.taskGrid.isEditing()) {
      return;
    }

    const rowData: Task = {
      id: null,
      title: '',
      date: '',
      time: '',
      completed: false,
    };

    const rowIndx = this.taskGrid.addRow(rowData, 0);

    if (rowIndx >= 0) {
      this.taskGrid.editRow(rowIndx);
    }
  }

  updateTask(rowIndx: number): void {
    if (!this.taskGrid.saveEditCell()) {
      return;
    }

    if (!this.taskGrid.isValid(rowIndx)) {
      return;
    }

    const updatedTask = this.taskGrid.getRowData(rowIndx) as Task;

    if (!updatedTask) {
      return;
    }

    const isNew = updatedTask.id == null;

    if (isNew) {
      updatedTask.id = this.nextId++;
    }

    const index = this.tasks.findIndex((task) => task.id === updatedTask.id);

    if (index > -1) {
      this.tasks[index] = {
        ...updatedTask,
      };
    } else {
      this.tasks.push({
        ...updatedTask,
      });
    }

    this.taskGrid.commit(isNew ? 'add' : 'update', [updatedTask]);

    const grid = this.taskGrid.getGridInstance();

    if (grid) {
      grid.quitEditMode();

      grid.removeClass({
        rowIndx,
        cls: 'pq-row-edit',
      });

      grid.refreshRow({
        rowIndx,
      });
    }

    console.log('Updated Task:', updatedTask);

    this.alert.showSuccess(isNew ? 'Task added' : 'Task updated');
  }

  cancelTask(rowIndx: number): void {
    this.taskGrid.cancelEdit(rowIndx);

    console.log('Task edit cancelled:', rowIndx);
  }

  deleteTask(rowIndx: number): void {
    const rowData = this.taskGrid.getRowData(rowIndx) as Task;

    if (!rowData) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${rowData.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    this.tasks = this.tasks.filter((task) => task.id !== rowData.id);

    this.taskGrid.updateData(this.tasks);

    console.log('Deleted Task:', rowData);

    this.alert.showSuccess('Task deleted');
  }
}
