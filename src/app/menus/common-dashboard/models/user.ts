export type UserRole = 'Admin' | 'Staff';

export interface User {
  username: string;
  role: UserRole;
  displayName: string;
}
