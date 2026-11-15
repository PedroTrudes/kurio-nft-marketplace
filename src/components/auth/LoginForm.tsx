import { useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import { useLogin } from "@/features/auth/hooks/useAuthMutations";

import type { AuthError } from "@/features/auth/types/auth.types";

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({
  onSuccess,
}: LoginFormProps) {
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Informe seu e-mail e senha.");
      return;
    }

    try {
      await login.mutateAsync({
        email: email.trim(),
        password,
      });

      onSuccess();
    } catch (error) {
      if (error instanceof AxiosError) {
        const response = error.response?.data as AuthError | undefined;

        setErrorMessage(
          response?.message ?? "Não foi possível entrar na sua conta.",
        );
      } else {
        setErrorMessage("Ocorreu um erro inesperado. Tente novamente.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="login-email" className="sr-only">
          E-mail
        </label>

        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="contato@email.com"
          className="h-10 w-full rounded-md border border-kurio-border bg-transparent px-4 text-sm text-kurio-text outline-none placeholder:text-kurio-text-muted focus:border-kurio-primary"
        />
      </div>

      <div className="relative">
        <label htmlFor="login-password" className="sr-only">
          Senha
        </label>

        <input
          id="login-password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
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

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            setErrorMessage(
              "A recuperação de senha não está disponível nesta demonstração.",
            )
          }
          className="text-xs text-kurio-primary hover:underline"
        >
          Esqueceu a senha?
        </button>
      </div>

      {errorMessage && (
        <p role="alert" className="text-xs leading-relaxed text-red-400">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={login.isPending}
        className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-kurio-primary text-sm font-bold text-kurio-background transition-colors hover:bg-kurio-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {login.isPending ? (
          <>
            <LoaderCircle size={17} className="animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </button>
    </form>
  );
}