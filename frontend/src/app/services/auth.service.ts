import { HttpClient } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { map, Observable, switchMap, tap, timeout } from "rxjs";
import { environment } from "../../environments/environment";

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  full_name: string;
  role: string;
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

const TOKEN_KEY = "runared_token";
const USER_KEY = "runared_user";

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(user["id"]) &&
    Number(user["id"]) > 0 &&
    typeof user["full_name"] === "string" &&
    typeof user["email"] === "string" &&
    typeof user["role"] === "string" &&
    typeof user["created_at"] === "string"
  );
}

function parseSession(value: unknown): AuthSession {
  if (!value || typeof value !== "object")
    throw new Error("Respuesta de autenticación inválida.");
  const session = value as Record<string, unknown>;
  if (
    typeof session["access_token"] !== "string" ||
    !session["access_token"].trim() ||
    typeof session["token_type"] !== "string" ||
    !isAuthUser(session["user"])
  )
    throw new Error("La respuesta de autenticación no coincide con el contrato.");
  return {
    access_token: session["access_token"],
    token_type: session["token_type"],
    user: session["user"],
  };
}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function readUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    return isAuthUser(value) ? value : null;
  } catch {
    return null;
  }
}

function expiration(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      "=",
    );
    const claims: unknown = JSON.parse(atob(padded));
    if (!claims || typeof claims !== "object") return null;
    const exp = (claims as Record<string, unknown>)["exp"];
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private readonly base =
    environment.apiBaseUrl.replace(/\/$/, "") + "/auth";
  private readonly _token = signal<string | null>(readToken());
  private readonly _currentUser = signal<AuthUser | null>(readUser());

  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(
    () => this._token() !== null && this._currentUser() !== null,
  );

  constructor() {
    if (this.tokenVencido()) this.limpiarSesion();
  }

  login(credentials: LoginRequest): Observable<AuthSession> {
    return this.http
      .post<unknown>(this.base + "/login", credentials)
      .pipe(
        timeout(15000),
        map(parseSession),
        tap((session) => this.guardarSesion(session)),
      );
  }

  register(data: RegisterRequest): Observable<AuthSession> {
    return this.http
      .post<unknown>(this.base + "/registro", data)
      .pipe(
        timeout(15000),
        switchMap(() =>
          this.login({ email: data.email, password: data.password }),
        ),
      );
  }

  logout(): void {
    this.limpiarSesion();
  }

  limpiarSesion(): void {
    this._token.set(null);
    this._currentUser.set(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Almacenamiento no disponible: la sesión en memoria ya fue limpiada.
    }
  }

  tokenVencido(): boolean {
    const token = this._token();
    if (!token) return false;
    const expiresAt = expiration(token);
    return expiresAt !== null && expiresAt <= Date.now();
  }

  private guardarSesion(session: AuthSession): void {
    this._token.set(session.access_token);
    this._currentUser.set(session.user);
    try {
      localStorage.setItem(TOKEN_KEY, session.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    } catch {
      // La sesión sigue activa en memoria aunque el almacenamiento falle.
    }
  }
}
