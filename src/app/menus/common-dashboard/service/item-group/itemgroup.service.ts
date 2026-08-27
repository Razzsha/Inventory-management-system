import { Injectable } from '@angular/core';
import { ItemGroup } from '../../models/ItemGroup';
import { DatastoreService } from '../data-store/datastore.service';

@Injectable({
  providedIn: 'root',
})
export class ItemgroupService {
  groups$ = this.store.groups$;

  constructor(private store: DatastoreService) {}

  load() {
    return this.store.load();
  }

  getById(id: number): ItemGroup | undefined {
    return this.store.getGroupsSnapshot().find((g) => g.id === id);
  }

  create(group: Omit<ItemGroup, 'id'>): ItemGroup {
    return this.store.addGroup(group);
  }

  update(id: number, changes: Partial<ItemGroup>): void {
    this.store.updateGroup(id, changes);
  }

  delete(id: number): void {
    this.store.deleteGroup(id);
  }
}
