import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, of, throwError } from 'rxjs';

import { User } from '../../models/user';

interface SessionData {
  user: User;
  token: string;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class CommonLoginService {
  private readonly SESSION_KEY = 'spx_session';

  private readonly SESSION_DURATION = 30 * 60 * 1000;

  private readonly MOCK_USERS = [
    {
      username: 'admin',
      password: 'admin123',
      role: 'Admin' as const,
      displayName: 'Admin',
    },
  ];

  private currentUserSubject = new BehaviorSubject<User | null>(
    this.restoreSession(),
  );

  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.checkSessionExpiry();
  }

  login(username: string, password: string): Observable<User> {
    const match = this.MOCK_USERS.find(
      (user) => user.username === username && user.password === password,
    );

    if (!match) {
      return throwError(() => new Error('Invalid username or password'));
    }

    if (match.role !== 'Admin') {
      return throwError(() => new Error('Access restricted to admin users'));
    }

    const user: User = {
      username: match.username,
      role: match.role,
      displayName: match.displayName,
    };

    const token = this.generateToken();

    const expiresAt = Date.now() + this.SESSION_DURATION;

    const session: SessionData = {
      user,
      token,
      expiresAt,
    };

    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

    this.currentUserSubject.next(user);

    return of(user).pipe(delay(400));
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);

    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    const session = this.getSession();

    if (!session) {
      return false;
    }

    if (Date.now() >= session.expiresAt) {
      this.logout();

      return false;
    }

    return !!session.token;
  }

  getToken(): string | null {
    const session = this.getSession();

    if (!session) {
      return null;
    }

    if (Date.now() >= session.expiresAt) {
      this.logout();

      return null;
    }

    return session.token;
  }

  getCurrentUser(): User | null {
    const session = this.getSession();

    if (!session) {
      return null;
    }

    if (Date.now() >= session.expiresAt) {
      this.logout();

      return null;
    }

    return session.user;
  }

  private getSession(): SessionData | null {
    const raw = sessionStorage.getItem(this.SESSION_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as SessionData;
    } catch {
      this.logout();

      return null;
    }
  }

  private restoreSession(): User | null {
    const session = this.getSession();

    if (!session) {
      return null;
    }

    if (Date.now() >= session.expiresAt) {
      sessionStorage.removeItem(this.SESSION_KEY);

      return null;
    }

    return session.user;
  }

  private generateToken(): string {
    return crypto.randomUUID() + '-' + Date.now();
  }

  private checkSessionExpiry(): void {
    const session = this.getSession();

    if (!session) {
      return;
    }

    const remainingTime = session.expiresAt - Date.now();

    if (remainingTime <= 0) {
      this.logout();

      return;
    }

    setTimeout(() => {
      this.logout();
    }, remainingTime);
  }
}
