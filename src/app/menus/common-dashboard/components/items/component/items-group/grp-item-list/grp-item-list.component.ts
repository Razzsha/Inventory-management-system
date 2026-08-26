import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CreateItemGrpComponent } from '../create-item-grp/create-item-grp.component';
import { DynamicDrawerService } from 'src/app/shared/services/dynamic-drawer.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { ConformationService } from 'src/app/shared/services/conformation.service';
import { ItemGroup } from 'src/app/menus/common-dashboard/models/ItemGroup';
import { Product } from 'src/app/menus/common-dashboard/models/product';
@Component({
  selector: 'app-grp-item-list',
  templateUrl: './grp-item-list.component.html',
  styleUrls: ['./grp-item-list.component.css']
})
export class GrpItemListComponent implements OnInit {

    filterFormStructure!: FormGroup;

  private nextGroupId = 4;

  groups: ItemGroup[] = [
    { id: 1, name: 'Cold Drinks', description: 'Beverages served cold', status: true },
    { id: 2, name: 'Snacks', description: 'Packaged snack items', status: true },
    { id: 3, name: 'Dairy', description: 'Milk and dairy products', status: true },
  ];

  filteredGroups: ItemGroup[] = [];

  // Same mock product data used elsewhere — in a real app this comes from a shared ProductService.
  private allProducts: Product[] = [
    {
      id: 1,
      name: 'Coca Cola 250ml',
      sku: 'cd-001',
      categoryId: 1,
      type: 'unit',
      description: 'Coca Cola 250ml bottle',
      price: 100,
      status: true,
    },
    {
      id: 2,
      name: 'Coca Cola 500ml',
      sku: 'cd-002',
      categoryId: 1,
      type: 'unit',
      description: 'Coca Cola 500ml bottle',
      price: 200,
      status: true,
    },
    {
      id: 3,
      name: 'Lays Classic',
      sku: 'sn-001',
      categoryId: 2,
      type: 'unit',
      description: 'Lays classic salted 50g',
      price: 30,
      status: true,
    },
    {
      id: 4,
      name: 'Amul Milk 500ml',
      sku: 'dy-001',
      categoryId: 3,
      type: 'unit',
      description: 'Amul toned milk 500ml',
      price: 35,
      status: true,
    },
  ];

  /** Tracks which group rows are expanded, keyed by group id. */
  expandedGroupIds = new Set<number>();

  constructor(
    private fb: FormBuilder,
    private _dds: DynamicDrawerService,
    private alert: AlertifyService,
    private _confirmSrv: ConformationService,
  ) {}

  ngOnInit(): void {
    this.filterFormStructure = this.fb.group({
      search: [''],
    });

    this.filterFormStructure.get('search')!.valueChanges.subscribe(() => {
      this.applyFilter();
    });

    this.applyFilter();
  }

  private applyFilter(): void {
    const search = (this.filterFormStructure.get('search')!.value || '')
      .toString()
      .toLowerCase()
      .trim();

    this.filteredGroups = search
      ? this.groups.filter((g) => g.name.toLowerCase().includes(search))
      : this.groups;
  }

  productsFor(groupId: number): Product[] {
    return this.allProducts.filter((p) => p.categoryId === groupId);
  }

  toggleExpand(groupId: number): void {
    if (this.expandedGroupIds.has(groupId)) {
      this.expandedGroupIds.delete(groupId);
    } else {
      this.expandedGroupIds.add(groupId);
    }
  }

  isExpanded(groupId: number): boolean {
    return this.expandedGroupIds.has(groupId);
  }

  openCreateDrawer(): void {
    const drawerRef = this._dds.openDrawer(
      CreateItemGrpComponent,
      { mode: 'create' },
      { nzTitle: 'Create Item Group', nzWidth: '480px' },
    );

    drawerRef.afterClose.subscribe((result: any) => {
      if (result?.['success']) {
        const newGroup: ItemGroup = {
          id: this.nextGroupId++,
          name: result['data'].name,
          description: result['data'].description,
          status: result['data'].status,
        };
        this.groups.unshift(newGroup);
        this.alert.showSuccess('Item group created successfully');
        this.applyFilter();
      }
    });
  }

  openEditDrawer(row: ItemGroup): void {
    const drawerRef = this._dds.openDrawer(
      CreateItemGrpComponent,
      { mode: 'edit', group: row },
      { nzTitle: 'Edit Item Group', nzWidth: '480px' },
    );

    drawerRef.afterClose.subscribe((result: any) => {
      if (result?.['success']) {
        const idx = this.groups.findIndex((g) => g.id === row.id);
        if (idx > -1) {
          this.groups[idx] = { ...this.groups[idx], ...result['data'] };
        }
        this.alert.showSuccess('Item group updated successfully');
        this.applyFilter();
      }
    });
  }

  deleteGroup(row: ItemGroup): void {
    const hasProducts = this.productsFor(row.id).length > 0;

    if (hasProducts) {
      this.alert.showError(
        'This group still has products assigned to it. Move or delete them first.',
      );
      return;
    }

    this._confirmSrv.deleteConfirm(() => {
      this.groups = this.groups.filter((g) => g.id !== row.id);
      this.expandedGroupIds.delete(row.id);
      this.alert.showSuccess('Item group deleted successfully');
      this.applyFilter();
    });
  }

}
