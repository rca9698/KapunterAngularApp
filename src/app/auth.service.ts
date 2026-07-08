import { Injectable } from '@angular/core';
import { login } from './Shared/Modals/login';
import { apiService } from './api.service';
import { BehaviorSubject, tap } from 'rxjs';
import { Iusermodal, usermodal } from './Shared/Modals/user-modal';
import { Iusers, users } from './Shared/Modals/users';
import { normalizeUserDetail, resolveWalletBalance } from './Shared/utils/user-detail.util';
import { environment } from 'src/environments/environment';
import { VisitorCountService } from './visitor-count.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  returnType: any;
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggenIn = this._isLoggedIn.asObservable();
  private readonly TOKEN_NAME = 'bearer_token';
  user: Iusermodal = new usermodal();
  userDetailQuery: {} | undefined;
  private _userdetail: Iusers = new users();

  /** Always non-null — templates must not read profile fields from a nullable object. */
  get userdetail(): Iusers {
    return this._userdetail ?? new users();
  }

  /** Wallet balance safe for any template (sidebar, coin modals, etc.). */
  get walletBalance(): string | number {
    return resolveWalletBalance(this._userdetail);
  }

  get displayUserNumber(): string {
    return this.userdetail.userNumber?.trim() || '—';
  }
  /** Last login debug snapshot — inspect in DevTools when login fails. */
  lastLoginDebug: Record<string, unknown> | null = null;

  get token(): string | null {
    const stored = localStorage.getItem(this.TOKEN_NAME);
    if (!stored || stored === 'undefined' || stored === 'null' || stored.trim() === '') {
      return null;
    }
    return stored;
  }

  get isLoggedIn(): boolean {
    return this._isLoggedIn.value;
  }

  constructor(private apiservice: apiService, private visitorCountService: VisitorCountService) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const token = this.token;
    const loggedIn = !!token;
    this._isLoggedIn.next(loggedIn);
    this.user = this.getUser(token ?? '');
  }

  login(obj: login) {
    const requestBody = this.buildLoginRequestBody(obj);
    this.logLoginDebug('AuthService.login — request body', requestBody);

    return this.apiservice.login(requestBody).pipe(tap((response: any) => {
      this.returnType = response;
      const token = this.extractToken(response);
      const debug = this.buildLoginDebugSnapshot(response, token, 'login() after API response');
      this.lastLoginDebug = debug;
      this.logLoginDebug('AuthService.login', debug);

      if (!token) {
        return;
      }
      localStorage.setItem(this.TOKEN_NAME, token);
      this._isLoggedIn.next(true);
      this.user = this.getUser(token);
      this.visitorCountService.refreshAfterLogin();
      this.getUserDetails();

      const afterSave = this.buildLoginDebugSnapshot(response, token, 'login() after token saved');
      this.lastLoginDebug = afterSave;
      this.logLoginDebug('AuthService.login (saved)', afterSave);
    }));
  }

  /** API contract (swagger LoginCommand): userNumber, otp, password (camelCase). */
  private buildLoginRequestBody(obj: login): { userNumber: string; otp: string; password: string } {
    const hasPassword = !!(obj.Password && String(obj.Password).trim());
    return {
      userNumber: String(obj.UserNumber ?? '').trim(),
      otp: hasPassword ? '' : String(obj.OTP ?? '').trim(),
      password: hasPassword ? String(obj.Password).trim() : String(obj.Password ?? '').trim(),
    };
  }

  isLoginApiSuccess(response: any): boolean {
    if (response?.status === 'Failure') {
      return false;
    }
    return response?.returnStatus === 1;
  }

  getLoginApiMessage(response: any): string {
    return (
      response?.returnMessage ??
      response?.reason ??
      'Login failed. Please try again.'
    );
  }

  logLoginDebug(label: string, details: Record<string, unknown>): void {
    if (environment.production) {
      return;
    }
    console.group(`[Kapunter Login Debug] ${label}`);
    console.log(details);
    console.groupEnd();
  }

  private buildLoginDebugSnapshot(
    response: any,
    extractedToken: string | null,
    step: string
  ): Record<string, unknown> {
    const returnVal = response?.returnVal;
    return {
      step,
      returnStatus: response?.returnStatus,
      returnMessage: response?.returnMessage,
      responseTopLevelKeys: response ? Object.keys(response) : [],
      returnValKeys: returnVal ? Object.keys(returnVal) : [],
      returnValType: typeof returnVal,
      returnValIsJwtString: typeof returnVal === 'string' && this.looksLikeJwt(returnVal),
      tokenCandidates: {
        'response.token': response?.token ?? null,
        'response.Token': response?.Token ?? null,
        'response.returnVal (string JWT)': typeof returnVal === 'string' ? returnVal : null,
        'response.returnVal?.token': returnVal && typeof returnVal === 'object' ? returnVal?.token ?? null : null,
        'response.returnVal?.Token': returnVal && typeof returnVal === 'object' ? returnVal?.Token ?? null : null,
      },
      extractedToken: extractedToken
        ? `${extractedToken.substring(0, 24)}... (len ${extractedToken.length})`
        : null,
      isLoggedIn: this._isLoggedIn.value,
      localStorageBearerToken: localStorage.getItem(this.TOKEN_NAME),
      parsedUser: {
        userId: this.user?.userId,
        role: this.user?.role,
        hasAdminRole: this.hasRole('admin'),
      },
    };
  }

  logout() {
    localStorage.removeItem(this.TOKEN_NAME);
    this._isLoggedIn.next(false);
    this.user = new usermodal();
    this._userdetail = new users();
    location.reload();
  }

  private extractToken(response: any): string | null {
    if (response?.status === 'Failure') {
      this.logLoginDebug('AuthService.extractToken — API failure', {
        reason: response?.reason,
        fullResponse: response,
      });
      return null;
    }

    const returnVal = response?.returnVal;

    // Login_GetToken returns StringReturnType: returnVal is the JWT string itself.
    if (typeof returnVal === 'string') {
      const trimmed = returnVal.trim();
      if (this.looksLikeJwt(trimmed)) {
        return trimmed;
      }
    }

    if (returnVal && typeof returnVal === 'object') {
      const nested =
        returnVal.token ??
        returnVal.Token ??
        returnVal.accessToken ??
        returnVal.jwt;
      if (nested && nested !== 'undefined' && nested !== 'null') {
        return String(nested);
      }
    }

    const topLevel = response?.token ?? response?.Token;
    if (topLevel && topLevel !== 'undefined' && topLevel !== 'null') {
      return String(topLevel);
    }

    this.logLoginDebug('AuthService.extractToken — no token found', {
      returnStatus: response?.returnStatus,
      returnMessage: response?.returnMessage,
      returnValType: typeof returnVal,
      hint: 'Login_GetToken should return JWT in returnVal (string). Check tokenCandidates in lastLoginDebug.',
      fullResponse: response,
    });
    return null;
  }

  private looksLikeJwt(value: string): boolean {
    return !!value && value !== 'undefined' && value !== 'null' && value.split('.').length === 3;
  }

  private getUser(token: string = ''): Iusermodal {
    if (!token) {
      return new usermodal();
    }

    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return new usermodal();
      }

      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
      const userDetailobj: Record<string, unknown> = JSON.parse(atob(padded));

      const userId = (userDetailobj['userid'] ??
        userDetailobj['userId'] ??
        userDetailobj['UserId'] ??
        userDetailobj['sub'] ??
        0) as bigint;

      const otp = String(userDetailobj['otp'] ?? userDetailobj['OTP'] ?? '');
      const role = this.extractRole(userDetailobj);

      return new usermodal(userId, otp, role);
    } catch {
      return new usermodal();
    }
  }

  private extractRole(payload: Record<string, unknown>): string {
    const role =
      payload['role'] ??
      payload['Role'] ??
      payload['roles'] ??
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (Array.isArray(role)) {
      return role.map((value) => String(value)).join(',');
    }

    return role ? String(role) : '';
  }

  public hasRole(role: string): boolean {
    if (!role || !this.user?.role) {
      return false;
    }
    return this.user.role.toLowerCase().includes(role.toLowerCase());
  }

  public isadminview(): boolean {
    return this.isLoggedIn && this.hasRole('admin');
  }

  public isbenview(): boolean {
    return this.isLoggedIn && !this.hasRole('admin');
  }

  setUserDetail(raw: unknown): void {
    this._userdetail = normalizeUserDetail(raw);
  }

  getUserDetails() {
    if (!this.isLoggedIn || !this.user?.userId) {
      return;
    }

    this.userDetailQuery = {
      sessionUser: this.user.userId,
      userId: this.user.userId
    };

    return this.apiservice.GetUserById(this.userDetailQuery).subscribe({
      next: (resp: any) => {
        this.returnType = resp;
        const payload =
          resp?.returnVal ??
          resp?.ReturnVal ??
          resp?.returnList?.[0] ??
          resp?.ReturnList?.[0];
        this.setUserDetail(payload);
      },
      error: () => {
        // Keep last known profile; never assign null.
        if (!this._userdetail) {
          this._userdetail = new users();
        }
      }
    });
  }

}
