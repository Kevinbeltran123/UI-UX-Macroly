"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoIsotipo } from "@/components/layout/logo";
import { Mail, Lock, User } from "lucide-react";
import Link from "next/link";

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/callback?next=/onboarding`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError("Cuenta creada. " + loginError.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/callback?next=/onboarding` },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-card">
      <div className="bg-gradient-to-br from-primary-dark via-primary to-primary-mid rounded-b-[40px] px-8 pt-16 pb-10 flex flex-col items-center gap-3">
        <LogoIsotipo size={56} />
        <h1 className="font-display font-black text-3xl text-white">
          Macro<span className="text-primary-border">ly</span>
        </h1>
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
          <div className="flex-1 text-center pb-3 text-sm font-semibold text-primary border-b-[3px] border-primary -mb-[2px]">
            Registrarse
          </div>
        </div>

        {error && (
          <p className="text-error text-sm font-semibold mb-4 text-center">{error}</p>
        )}

        <label className="text-xs font-semibold text-sub mb-1.5">Nombre completo</label>
        <div className="flex items-center gap-3 border-2 border-border rounded-xl px-4 py-3.5 mb-4 focus-within:border-primary transition-colors">
          <User size={16} className="text-muted" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
            className="flex-1 outline-none text-sm text-text bg-transparent placeholder:text-muted"
          />
        </div>

        <label className="text-xs font-semibold text-sub mb-1.5">Correo electrónico</label>
        <div className="flex items-center gap-3 border-2 border-border rounded-xl px-4 py-3.5 mb-4 focus-within:border-primary transition-colors">
          <Mail size={16} className="text-muted" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="flex-1 outline-none text-sm text-text bg-transparent placeholder:text-muted"
          />
        </div>

        <label className="text-xs font-semibold text-sub mb-1.5">Contraseña</label>
        <div className="flex items-center gap-3 border-2 border-border rounded-xl px-4 py-3.5 mb-6 focus-within:border-primary transition-colors">
          <Lock size={16} className="text-muted" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            className="flex-1 outline-none text-sm text-text bg-transparent placeholder:text-muted"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
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
