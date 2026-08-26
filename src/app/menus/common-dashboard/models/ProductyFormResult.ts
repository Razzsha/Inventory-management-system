import { Product } from './product';

export interface ProductyFormResult {
  success: boolean;
  data?: Omit<Product, 'id'>;
}
