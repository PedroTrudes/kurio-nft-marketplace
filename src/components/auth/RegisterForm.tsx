import { useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import { useRegister } from "@/features/auth/hooks/useAuthMutations";

import type { AuthError } from "@/features/auth/types/auth.types";

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({
  onSuccess,
}: RegisterFormProps) {
  const register = useRegister();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (username.trim().length < 3) {
      setErrorMessage("O nome de usuário deve ter pelo menos 3 caracteres.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    try {
      await register.mutateAsync({
        username: username.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });

      onSuccess();
    } catch (error) {
      if (error instanceof AxiosError) {
        const response = error.response?.data as AuthError | undefined;

        setErrorMessage(
          response?.message ?? "Não foi possível criar sua conta.",
        );
      } else {
        setErrorMessage("Ocorreu um erro inesperado. Tente novamente.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="register-username" className="sr-only">
          Nome de usuário
        </label>

        <input
          id="register-username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Nome de usuário"
          className="h-10 w-full rounded-md border border-kurio-border bg-transparent px-4 text-sm text-kurio-text outline-none placeholder:text-kurio-text-muted focus:border-kurio-primary"
        />
      </div>

      <div>
        <label htmlFor="register-email" className="sr-only">
          E-mail
        </label>

        <input
          id="register-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Digite seu e-mail"
          className="h-10 w-full rounded-md border border-kurio-border bg-transparent px-4 text-sm text-kurio-text outline-none placeholder:text-kurio-text-muted focus:border-kurio-primary"
        />
      </div>

      <div className="relative">
        <label htmlFor="register-password" className="sr-only">
          Senha
        </label>

        <input
          id="register-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Senha"
          className="h-10 w-full rounded-md border border-kurio-border bg-transparent px-4 pr-12 text-sm text-kurio-text outline-none placeholder:text-kurio-text-muted focus:border-kurio-primary"
        />

        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          className="absolute inset-y-0 right-3 flex items-center text-kurio-text-muted transition-colors hover:text-kurio-primary"
        >
          {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      <div>
        <label htmlFor="register-confirm-password" className="sr-only">
          Confirmar senha
        </label>

        <input
          id="register-confirm-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirmar senha"
          className="h-10 w-full rounded-md border border-kurio-border bg-transparent px-4 text-sm text-kurio-text outline-none placeholder:text-kurio-text-muted focus:border-kurio-primary"
        />
      </div>

      {errorMessage && (
        <p role="alert" className="text-xs leading-relaxed text-red-400">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={register.isPending}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-kurio-primary text-sm font-bold text-kurio-background transition-colors hover:bg-kurio-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {register.isPending ? (
          <>
            <LoaderCircle size={17} className="animate-spin" />
            Criando conta...
          </>
        ) : (
          "Criar conta"
        )}
      </button>
    </form>
  );
}