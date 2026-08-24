import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, of, throwError } from 'rxjs';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root',
})
export class CommonLoginService {
  private readonly MOCK_USERS = [
    {
      username: 'admin',
      password: 'admin123',
      role: 'Admin' as const,
      displayName: 'Admin',
    },
  ];

  private currentUserSubject = new BehaviorSubject<User | null>(
    this.restoreSession()
  );

  currentUser$ = this.currentUserSubject.asObservable();

  login(username: string, password: string): Observable<User> {
    const match = this.MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!match) {
      return throwError(() => new Error('Invalid username & Password'));
    }

    if (match.role !== 'Admin') {
      return throwError(
        () => new Error('Access restricted to admin users')
      );
    }

    const user: User = {
      username: match.username,
      role: match.role,
      displayName: match.displayName,
    };

    sessionStorage.setItem('spx_user', JSON.stringify(user));

    this.currentUserSubject.next(user);

    return of(user).pipe(delay(400));
  }

  logout(): void {
    sessionStorage.removeItem('spx_user');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  private restoreSession(): User | null {
    const raw = sessionStorage.getItem('spx_user');
    return raw ? JSON.parse(raw) : null;
  }
}
