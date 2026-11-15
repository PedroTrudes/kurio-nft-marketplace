import type {
  AuthSession,
  LoginInput,
  RegisterInput,
  User,
} from "@/features/auth/types/auth.types";

const USERS_STORAGE_KEY = "kurio-users";
const SESSION_STORAGE_KEY = "kurio-auth-session";

const PASSWORD_ITERATIONS = 120_000;
const PASSWORD_HASH = "SHA-256";
const PASSWORD_KEY_LENGTH = 256;

interface StoredUser extends User {
  passwordHash: string;
  passwordSalt: string;
}

interface LegacyStoredUser extends User {
  password: string;
}

export class AuthStoreError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);

    this.name = "AuthStoreError";
    this.status = status;
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) {
    throw new Error("Salt inválido.");
  }

  const bytes = new Uint8Array(hex.length / 2);

  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(
      hex.slice(index * 2, index * 2 + 2),
      16,
    );
  }

  return bytes;
}

function createSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  return bytesToHex(bytes);
}

async function hashPassword(
  password: string,
  salt: string,
): Promise<string> {
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(salt),
      iterations: PASSWORD_ITERATIONS,
      hash: PASSWORD_HASH,
    },
    keyMaterial,
    PASSWORD_KEY_LENGTH,
  );

  return bytesToHex(new Uint8Array(derivedBits));
}

function isStoredUser(value: unknown): value is StoredUser {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    typeof user.id === "string" &&
    typeof user.username === "string" &&
    typeof user.email === "string" &&
    typeof user.createdAt === "string" &&
    typeof user.passwordHash === "string" &&
    typeof user.passwordSalt === "string"
  );
}

function isLegacyStoredUser(
  value: unknown,
): value is LegacyStoredUser {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    typeof user.id === "string" &&
    typeof user.username === "string" &&
    typeof user.email === "string" &&
    typeof user.createdAt === "string" &&
    typeof user.password === "string"
  );
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify(users),
  );
}

async function readUsers(): Promise<StoredUser[]> {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(stored);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const users: StoredUser[] = [];
  let needsMigration = false;

  for (const item of parsed) {
    if (isStoredUser(item)) {
      users.push({
        id: item.id,
        username: item.username,
        email: item.email,
        createdAt: item.createdAt,
        passwordHash: item.passwordHash,
        passwordSalt: item.passwordSalt,
      });

      continue;
    }

    if (isLegacyStoredUser(item)) {
      needsMigration = true;

      const salt = createSalt();

      users.push({
        id: item.id,
        username: item.username,
        email: item.email,
        createdAt: item.createdAt,
        passwordHash: await hashPassword(item.password, salt),
        passwordSalt: salt,
      });
    }
  }

  if (needsMigration) {
    saveUsers(users);
  }

  return users;
}

function readSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(
      SESSION_STORAGE_KEY,
    );

    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as AuthSession;
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession): void {
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );
}

function createSession(user: StoredUser): AuthSession {
  const publicUser: User = {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };

  const session: AuthSession = {
    user: publicUser,
    token: crypto.randomUUID(),
  };

  saveSession(session);

  return session;
}

export async function registerUser(
  input: RegisterInput,
): Promise<AuthSession> {
  const username = input.username?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (!username || username.length < 3) {
    throw new AuthStoreError(
      "O nome de usuário deve ter pelo menos 3 caracteres.",
      400,
    );
  }

  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new AuthStoreError(
      "Informe um e-mail válido.",
      400,
    );
  }

  if (
    typeof password !== "string" ||
    password.length < 8
  ) {
    throw new AuthStoreError(
      "A senha deve ter pelo menos 8 caracteres.",
      400,
    );
  }

  if (password !== confirmPassword) {
    throw new AuthStoreError(
      "As senhas não coincidem.",
      400,
    );
  }

  const users = await readUsers();

  const emailExists = users.some(
    (user) => user.email === email,
  );

  if (emailExists) {
    throw new AuthStoreError(
      "Este e-mail já está cadastrado.",
      409,
    );
  }

  const usernameExists = users.some(
    (user) =>
      user.username.toLowerCase() ===
      username.toLowerCase(),
  );

  if (usernameExists) {
    throw new AuthStoreError(
      "Este nome de usuário já está em uso.",
      409,
    );
  }

  const salt = createSalt();
  const passwordHash = await hashPassword(password, salt);

  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash,
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, newUser]);

  return createSession(newUser);
}

export async function loginUser(
  input: LoginInput,
): Promise<AuthSession> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password;

  if (
    !email ||
    typeof password !== "string" ||
    !password
  ) {
    throw new AuthStoreError(
      "Informe seu e-mail e senha.",
      400,
    );
  }

  const users = await readUsers();

  const user = users.find(
    (storedUser) => storedUser.email === email,
  );

  if (!user) {
    throw new AuthStoreError(
      "E-mail ou senha incorretos.",
      401,
    );
  }

  const passwordHash = await hashPassword(
    password,
    user.passwordSalt,
  );

  if (passwordHash !== user.passwordHash) {
    throw new AuthStoreError(
      "E-mail ou senha incorretos.",
      401,
    );
  }

  return createSession(user);
}

export async function getCurrentUser(
  token: string | null,
): Promise<User> {
  if (!token) {
    throw new AuthStoreError(
      "Usuário não autenticado.",
      401,
    );
  }

  const session = readSession();

  if (!session || session.token !== token) {
    throw new AuthStoreError(
      "Sessão inválida ou expirada.",
      401,
    );
  }

  const users = await readUsers();

  const user = users.find(
    (storedUser) => storedUser.id === session.user.id,
  );

  if (!user) {
    throw new AuthStoreError(
      "Usuário não encontrado.",
      404,
    );
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}