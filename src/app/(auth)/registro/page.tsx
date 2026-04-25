"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogoIsotipo } from "@/components/layout/logo";
import { Mail, Lock, User, MailCheck } from "lucide-react";
import Link from "next/link";
import { Field } from "@/components/a11y/field";

const mapSignupError = (raw: string): string => {
  const msg = raw.toLowerCase();
  if (msg.includes("password") && msg.includes("6")) return "La contraseña debe tener al menos 6 caracteres.";
  if (msg.includes("password")) return "La contraseña no cumple con los requisitos mínimos.";
  if (msg.includes("invalid") && msg.includes("email")) return "El correo no tiene un formato válido.";
  if (msg.includes("rate limit") || msg.includes("security purposes")) return "Demasiados intentos. Espera unos segundos e inténtalo de nuevo.";
  if (msg.includes("network") || msg.includes("fetch")) return "Error de conexión. Verifica tu internet e inténtalo de nuevo.";
  return "No pudimos crear tu cuenta. Inténtalo de nuevo en unos momentos.";
};

export default function RegistroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/callback?next=/onboarding`,
      },
    });

    if (signUpError) {
      setError(mapSignupError(signUpError.message));
      setLoading(false);
      return;
    }

    // When email confirmation is enabled, Supabase returns a user with an empty
    // identities array if the email was already registered (soft failure — avoids email enumeration).
    const alreadyRegistered = data.user && data.user.identities?.length === 0;
    if (alreadyRegistered) {
      setError("Este correo ya está registrado. Intenta iniciar sesión.");
      setLoading(false);
      return;
    }

    setVerificationSent(true);
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback?next=/onboarding`,
      },
    });
    if (resendError) setError(resendError.message);
    setLoading(false);
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/callback?next=/onboarding` },
    });
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen flex flex-col bg-card">
        <div className="bg-gradient-to-br from-primary-dark via-primary to-primary-mid rounded-b-[40px] px-8 pt-16 pb-10 flex flex-col items-center gap-3">
          <LogoIsotipo size={56} decorative />
          <h1 className="font-display font-black text-3xl text-white">
            Macro<span className="text-primary-border">ly</span>
          </h1>
          <p className="text-white/60 text-xs tracking-[3px] uppercase">
            Nutrición inteligente
          </p>
        </div>

        <div className="flex-1 px-7 pt-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <MailCheck size={40} className="text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl text-text mb-3">
            Revisa tu correo
          </h1>
          <p className="text-sm text-sub leading-relaxed mb-2">
            Enviamos un enlace de confirmación a
          </p>
          <p className="text-sm font-semibold text-text mb-8 break-all">{email}</p>
          <p className="text-xs text-muted leading-relaxed mb-8 max-w-sm">
            Abre el correo desde este mismo dispositivo y haz clic en el enlace para activar tu cuenta.
            Si no lo ves, revisa tu carpeta de spam.
          </p>

          {error && (
            <p className="text-error text-sm font-semibold mb-4">{error}</p>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            aria-busy={loading}
            className="text-primary font-semibold text-sm mb-4 disabled:opacity-50"
          >
            {loading ? "Reenviando..." : "Reenviar correo"}
          </button>

          <Link href="/login" className="text-muted text-sm no-underline">
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-card">
      <div className="bg-gradient-to-br from-primary-dark via-primary to-primary-mid rounded-b-[40px] px-8 pt-16 pb-10 flex flex-col items-center gap-3">
        <LogoIsotipo size={56} decorative />
        <p className="font-display font-black text-3xl text-white" aria-hidden="true">
          Macro<span className="text-primary-border">ly</span>
        </p>
        <p className="text-white/60 text-xs tracking-[3px] uppercase">
          Nutrición inteligente
        </p>
      </div>

      <form onSubmit={handleSignup} className="flex-1 px-7 pt-8 flex flex-col">
        <div className="flex border-b-2 border-border-l mb-7">
          <Link
            href="/login"
            className="flex-1 text-center pb-3 text-sm font-semibold text-muted no-underline"
          >
            Iniciar sesión
          </Link>
          <h1 className="flex-1 text-center pb-3 text-sm font-semibold text-primary border-b-[3px] border-primary -mb-[2px] m-0">
            Registrarse
          </h1>
        </div>

        {error && !error.includes("correo") && !error.includes("registrado") && !error.includes("contraseña") && (
          <p role="alert" className="text-error text-sm font-semibold mb-4 text-center">{error}</p>
        )}

        <Field
          label="Nombre completo"
          required
          className="mb-4"
          labelClassName="text-xs font-semibold text-sub"
        >
          {(props) => (
            <div className="flex items-center gap-3 border-2 border-border rounded-xl px-4 py-3.5 focus-within:border-primary transition-colors">
              <User size={16} className="text-muted" aria-hidden="true" />
              <input
                {...props}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                autoComplete="name"
                className="flex-1 outline-none text-sm text-text bg-transparent placeholder:text-muted"
              />
            </div>
          )}
        </Field>

        <Field
          label="Correo electrónico"
          required
          className="mb-4"
          labelClassName="text-xs font-semibold text-sub"
          error={error && (error.includes("correo") || error.includes("registrado")) ? error : undefined}
        >
          {(props) => (
            <div className="flex items-center gap-3 border-2 border-border rounded-xl px-4 py-3.5 focus-within:border-primary transition-colors">
              <Mail size={16} className="text-muted" aria-hidden="true" />
              <input
                {...props}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                className="flex-1 outline-none text-sm text-text bg-transparent placeholder:text-muted"
              />
            </div>
          )}
        </Field>

        <Field
          label="Contraseña"
          required
          className="mb-6"
          labelClassName="text-xs font-semibold text-sub"
          error={error && error.includes("contraseña") ? error : undefined}
        >
          {(props) => (
            <div className="flex items-center gap-3 border-2 border-border rounded-xl px-4 py-3.5 focus-within:border-primary transition-colors">
              <Lock size={16} className="text-muted" aria-hidden="true" />
              <input
                {...props}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                minLength={6}
                className="flex-1 outline-none text-sm text-text bg-transparent placeholder:text-muted"
              />
            </div>
          )}
        </Field>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-display font-bold text-[15px] rounded-xl shadow-[0_4px_16px_rgba(46,125,50,.3)] disabled:opacity-50"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted">o continua con</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full py-3.5 border-2 border-border rounded-xl font-semibold text-sm text-text flex items-center justify-center gap-2.5 bg-card"
        >
          <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white flex items-center justify-center text-xs font-extrabold">
            G
          </span>
          Continuar con Google
        </button>
      </form>
    </div>
  );
}
