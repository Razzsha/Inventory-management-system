export interface CategoryFormResult {
   success: boolean;
  data?: {
    name: string;
    description: string;
    isActive: boolean;
  };
}
