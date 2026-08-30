import { Category } from './category';

export interface CategoryFormResult {
  success: boolean;
  data?: Omit<Category, 'id'>;
}
