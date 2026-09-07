import { Component, ViewChild } from '@angular/core';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { PqGridComponent } from 'src/app/shared/components/pq-grid/pq-grid.component';
declare var $: any;
import { NzModalService } from 'ng-zorro-antd/modal';

interface Task {
  id: number | null;
  title: string;
  date: string;
  time: string;
  priority: string;
  completed: boolean;
  fruits: string;
}

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent {
  @ViewChild('taskGrid')
  taskGrid!: PqGridComponent;

  tasks: Task[] = [
    {
      id: 1,
      title: 'Prepare stock report',
      date: '2026-09-05',
      time: '09:30',
      priority: 'High',
      completed: false,
      fruits: 'Apple',
    },

    {
      id: 2,
      title: 'Call supplier',
      date: '2026-09-03',
      time: '14:00',
      priority: 'Medium',
      completed: true,
      fruits: 'Orange',
    },

    {
      id: 3,
      title: 'Review purchase orders',
      date: '2026-09-06',
      time: '11:15',
      priority: 'Low',
      completed: false,
      fruits: 'Kiwi',
    },

    {
      id: 4,
      title: 'Update inventory counts',
      date: '2026-09-04',
      time: '16:45',
      priority: 'High',
      completed: false,
      fruits: 'Guava',
    },
  ];

  dateEditor = (ui: any): void => {
    const $input = ui.$cell.find('input');

    $input.datepicker({
      changeMonth: true,
      changeYear: true,
      dateFormat: 'yy-mm-dd',
      showAnim: '',

      beforeShow: () => {
        setTimeout(() => {
          $('.ui-datepicker').css('z-index', 999999999);
        });
      },

      onSelect: (dateText: string) => {
        $input.val(dateText);

        setTimeout(() => {
          ui.$editor.focus();
        }, 0);
      },
    });
  };

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

    editModel: {
      clicksToEdit: 1,
      pressToEdit: true,
      keyUpDown: false,
      filterKeys: true,
      saveKey: $.ui.keyCode.ENTER,
      onSave: 'nextFocus',
      onTab: 'nextFocus',
      onBlur: 'validate',
      allowInvalid: false,

    },
    numberCell: {
        show: false
    },   
    resizable: true
  };

  columns: any[] = [
    {
      title: 'Title',
      dataIndx: 'title',
      width: 220,
      dataType: 'string',

      editable: true,

      editor: {
        type: 'textbox',
        attr: 'autocomplete="off" is="clear-text"',
      },

      validations: [
        {
          type: 'nonEmpty',
          msg: 'Title is required',
        },
        {
          type: 'maxLen',
          value: 60,
          msg: 'Title cannot exceed 60 characters',
        },
      ],
    },

    {
      title: 'Date',
      dataIndx: 'date',
      width: 140,
      dataType: 'date',

      format: 'yy-mm-dd',
      fmtDateEdit: 'yy-mm-dd',

      cls: 'pq-calendar pq-side-icon',

      editable: true,

      editor: {
        type: 'textbox',
        attr: 'is="clear-text"',
        init: this.dateEditor,
      },

      validations: [
        {
          type: 'nonEmpty',
          msg: 'Date is required',
        },
      ],
    },

    {
  title: 'Time',
  dataIndx: 'time',
  width: 130,
  dataType: 'string',
  editable: true,

  editor: {
    type: 'textbox',

    attr: 'type="time" step="60"',

    init: function (ui: any) {
      const $input = ui.$cell.find('input');

      $input.attr({
        type: 'time',
        step: '60',
      });
    },
  },

  validations: [
    {
      type: 'nonEmpty',
      msg: 'Time is required',
    },
    {
      type: 'regexp',
      value: '^([01]\\d|2[0-3]):([0-5]\\d)$',
      msg: 'Use HH:mm format',
    },
  ],
},

    {
      title: 'Priority',
      dataIndx: 'priority',
      width: 130,
      dataType: 'string',

      editable: true,

      editor: {
        type: 'select',
        valueIndx: 'value',
        labelIndx: 'text',

        options: [
          {
            value: 'High',
            text: 'High',
          },
          {
            value: 'Medium',
            text: 'Medium',
          },
          {
            value: 'Low',
            text: 'Low',
          },
        ],
      },

      render: function (ui: any) {
        const options = ui.column.editor.options;

        const option = options.find((item: any) => item.value === ui.cellData);

        return option ? option.text : '';
      },

      validations: [
        {
          type: 'nonEmpty',
          msg: 'Priority is required',
        },
      ],
    },

    {
      title: 'Fruits',
      dataIndx: 'fruits',
      width: 140,
      dataType: 'string',
      editable: true,

      editor: {
        type: 'div',

        options: ['Apple', 'Orange', 'Kiwi', 'Guava', 'Grapes'],

        init: function (ui: any) {
          const options = ui.column.editor.options;
          const radioName = 'fruit_' + ui.rowIndx;

          const html = options
            .map((option: string) => {
              const checked = option === ui.cellData ? 'checked="checked"' : '';

              return `
            <label
              class="fruit-radio-option"
              style="
                display: inline-flex;
                align-items: center;
                white-space: nowrap;
                margin-right: 8px;
                cursor: pointer;
              "
            >
              <input
                type="radio"
                name="${radioName}"
                value="${option}"
                ${checked}
                style="margin-right: 3px;"
              />

              <span>${option}</span>
            </label>
          `;
            })
            .join('');

          let $container = ui.$cell.children('div');

          if (!$container.length) {
            $container = $('<div></div>');
            ui.$cell.append($container);
          }

          $container
            .css({
              padding: '4px',
              display: 'flex',
              'flex-wrap': 'wrap',
              'align-items': 'center',
              gap: '3px',
            })
            .html(html);

          $container
            .find('input[type="radio"]')
            .on('change', function (this: HTMLInputElement) {
              const selectedValue = $(this).val();

              ui.cellData = selectedValue;

              $container.find('.fruit-radio-option').hide();
              $(this).closest('.fruit-radio-option').show();

              setTimeout(() => {
                ui.$cell.trigger('blur');
              }, 50);
            });
        },

        getData: function (ui: any) {
          return ui.$cell.find('input[type="radio"]:checked').val();
        },
      },

      validations: [
        {
          type: 'nonEmpty',
          msg: 'Fruit is required',
        },
      ],
    },
  ];

  constructor(
    private alertify: AlertifyService,
    private modal: NzModalService,
  ) {}

  saveTasks(): void {
    if (!this.taskGrid) {
      console.warn(
        'taskGrid ViewChild is undefined — check that the template ' +
          'has a matching #taskGrid reference on the pq-grid element.',
      );
      return;
    }

    const saved = this.taskGrid.saveEditCell();

    if (!saved) {
      this.alertify.showError('Please fix the current cell before saving.');
      return;
    }

    const valid = this.taskGrid.validateGrid();

    if (!valid) {
      this.alertify.showError('Please fix the highlighted validation errors.');
      return;
    }

    const updatedTasks = this.taskGrid.getGridData() as Task[];

    this.tasks = updatedTasks.map((task) => ({
      ...task,
    }));

    console.log('Tasks updated:', this.tasks);

    this.showUpdatedDataPopup(this.tasks);
  }

  showUpdatedDataPopup(tasks: Task[]): void {
    const html = tasks
      .map(
        (task, index) => `
        <div style="
          border-bottom: 1px solid #ddd;
          padding: 10px 0;
        ">
          <strong>Row ${index + 1}</strong>

          <p>
            <strong>Title:</strong>
            ${this.escapeHtml(task.title)}
          </p>

          <p>
            <strong>Date:</strong>
            ${this.escapeHtml(task.date)}
          </p>

          <p>
            <strong>Time:</strong>
            ${this.escapeHtml(task.time)}
          </p>

          <p>
            <strong>Priority:</strong>
            ${this.escapeHtml(task.priority)}
          </p>

          <p>
            <strong>Fruits:</strong>
            ${this.escapeHtml(task.fruits)}
          </p>
        </div>
      `,
      )
      .join('');

    this.modal.info({
      nzTitle: 'Updated Tasks',
      nzContent: html,
      nzOkText: 'OK',
      nzWidth: '600px',
    });
  }

  private escapeHtml(value: unknown): string {
    return String(value ?? '').replace(
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
  }
}
