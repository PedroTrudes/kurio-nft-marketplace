import type {
  AuthSession,
  LoginInput,
  RegisterInput,
  User,
} from "@/features/auth/types/auth.types";

const USERS_STORAGE_KEY = "kurio-users";
const SESSION_STORAGE_KEY = "kurio-auth-session";

interface StoredUser extends User {
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

function readUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as StoredUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify(users),
  );
}

function readSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);

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

export function registerUser(
  input: RegisterInput,
): AuthSession {
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

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AuthStoreError(
      "Informe um e-mail válido.",
      400,
    );
  }

  if (typeof password !== "string" || password.length < 8) {
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

  const users = readUsers();

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
      user.username.toLowerCase() === username.toLowerCase(),
  );

  if (usernameExists) {
    throw new AuthStoreError(
      "Este nome de usuário já está em uso.",
      409,
    );
  }

  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    username,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, newUser]);

  return createSession(newUser);
}

export function loginUser(
  input: LoginInput,
): AuthSession {
  const email = input.email?.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    throw new AuthStoreError(
      "Informe seu e-mail e senha.",
      400,
    );
  }

  const users = readUsers();

  const user = users.find(
    (storedUser) =>
      storedUser.email === email &&
      storedUser.password === password,
  );

  if (!user) {
    throw new AuthStoreError(
      "E-mail ou senha incorretos.",
      401,
    );
  }

  return createSession(user);
}

export function getCurrentUser(
  token: string | null,
): User {
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

  const users = readUsers();

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