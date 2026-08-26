import { ItemGroup } from "./ItemGroup";

export interface ItemGroupFormResult {
  success: boolean;
  data?: Omit<ItemGroup, 'id'>;
}
