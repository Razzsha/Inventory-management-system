import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { CreateItemGrpComponent } from '../create-item-grp/create-item-grp.component';
import { DynamicDrawerService } from 'src/app/shared/services/dynamic-drawer.service';
import { AlertifyService } from 'src/app/shared/services/alertify.service';
import { ConformationService } from 'src/app/shared/services/conformation.service';
import { ItemGroup } from 'src/app/menus/common-dashboard/models/ItemGroup';
import { Product } from 'src/app/menus/common-dashboard/models/product';
import { ProductService } from 'src/app/menus/common-dashboard/service/product/product.service';
import { ItemgroupService } from 'src/app/menus/common-dashboard/service/item-group/itemgroup.service';

@Component({
  selector: 'app-grp-item-list',
  templateUrl: './grp-item-list.component.html',
  styleUrls: ['./grp-item-list.component.css'],
})
export class GrpItemListComponent implements OnInit {
  filterFormStructure!: FormGroup;

  filteredGroups: ItemGroup[] = [];
  private allProducts: Product[] = [];
  expandedGroupIds = new Set<number>();

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private _dds: DynamicDrawerService,
    private alert: AlertifyService,
    private _confirmSrv: ConformationService,
    private productService: ProductService,
    private groupService: ItemgroupService,
  ) {}

  ngOnInit(): void {
    this.filterFormStructure = this.fb.group({ search: [''] });

    this.groupService.load().pipe(takeUntil(this.destroy$)).subscribe();

    combineLatest([
      this.groupService.groups$,
      this.productService.products$,
      this.filterFormStructure.get('search')!.valueChanges.pipe(startWith('')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([groups, products, searchValue]) => {
        this.allProducts = products;

        const search = (searchValue || '').toLowerCase().trim();
        this.filteredGroups = search
          ? groups.filter((g) => g.name.toLowerCase().includes(search))
          : groups;
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  productsFor(groupId: number): Product[] {
    return this.allProducts.filter((p) => p.categoryId === groupId);
  }

  toggleExpand(groupId: number): void {
    this.expandedGroupIds.has(groupId)
      ? this.expandedGroupIds.delete(groupId)
      : this.expandedGroupIds.add(groupId);
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
        this.groupService.create(result['data']);
        this.alert.showSuccess('Item group created successfully');
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
        this.groupService.update(row.id, result['data']);
        this.alert.showSuccess('Item group updated successfully');
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
      this.groupService.delete(row.id);
      this.expandedGroupIds.delete(row.id);
      this.alert.showSuccess('Item group deleted successfully');
    });
  }
}
