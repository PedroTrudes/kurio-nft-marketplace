import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type AuthMode = "login" | "register";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({
  open,
  onOpenChange,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [socialMessage, setSocialMessage] = useState<string | null>(null);

  function handleClose() {
    onOpenChange(false);
  }

  function handleChangeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setSocialMessage(null);
  }

  function handleSocialLogin(provider: "Google" | "Facebook") {
    setSocialMessage(
      `O login com ${provider} não está disponível nesta demonstração.`,
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/65" />

        <div className="pointer-events-none fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-4 sm:py-8">
            <Dialog.Popup className="pointer-events-auto relative w-full max-w-[420px] shrink-0 border-b-[6px] border-kurio-primary bg-kurio-surface text-kurio-text shadow-2xl outline-none">
              <div className="relative px-6 pb-5 pt-9 sm:px-10 sm:pb-6">
                <Dialog.Close
                  aria-label="Fechar"
                  onClick={handleClose}
                  className="absolute right-4 top-4 text-kurio-primary transition-opacity hover:opacity-70"
                >
                  <X size={20} />
                </Dialog.Close>

                <Dialog.Title className="sr-only">
                  {mode === "login" ? "Entrar" : "Criar conta"}
                </Dialog.Title>

                <div className="mb-5 flex items-center justify-center gap-2 text-lg font-semibold">
                  <button
                    type="button"
                    onClick={() => handleChangeMode("login")}
                    className={
                      mode === "login"
                        ? "text-kurio-primary"
                        : "text-kurio-text"
                    }
                  >
                    Entrar
                  </button>

                  <span className="text-kurio-text-muted">|</span>

                  <button
                    type="button"
                    onClick={() => handleChangeMode("register")}
                    className={
                      mode === "register"
                        ? "text-kurio-primary"
                        : "text-kurio-text"
                    }
                  >
                    Criar conta
                  </button>
                </div>

                <Dialog.Description className="mb-5 text-center text-xs leading-relaxed text-kurio-text">
                  {mode === "login"
                    ? "Entre para gerenciar sua carteira, coleção e perfil de criador."
                    : "Crie seu perfil de colecionador e conecte uma carteira quando quiser."}
                </Dialog.Description>

                {mode === "login" ? (
                  <LoginForm onSuccess={handleClose} />
                ) : (
                  <RegisterForm onSuccess={handleClose} />
                )}
              </div>

              <div className="relative border-t border-kurio-border px-6 pb-7 pt-5 sm:px-10">
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-kurio-surface px-3 text-xs">
                  Ou continue com
                </span>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Google")}
                    className="flex h-10 w-full items-center justify-center gap-3 rounded-md border border-kurio-border text-xs text-kurio-text-muted transition-colors hover:border-kurio-primary"
                  >
                    <span className="text-lg font-bold text-blue-400">
                      G
                    </span>
                    Continuar com Google
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Facebook")}
                    className="flex h-10 w-full items-center justify-center gap-3 rounded-md border border-kurio-border text-xs text-kurio-text-muted transition-colors hover:border-kurio-primary"
                  >
                    <span className="text-lg font-bold text-blue-500">
                      f
                    </span>
                    Continuar com Facebook
                  </button>
                </div>

                {socialMessage && (
                  <p
                    role="status"
                    className="mt-3 text-center text-xs leading-relaxed text-kurio-text-muted"
                  >
                    {socialMessage}
                  </p>
                )}
              </div>
            </Dialog.Popup>
          </div>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}