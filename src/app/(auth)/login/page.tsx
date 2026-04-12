"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoIsotipo } from "@/components/layout/logo";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Login error:", error.message, error.status);
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/inicio");
    router.refresh();
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/callback` },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-card">
      {/* Green header curve */}
      <div className="bg-gradient-to-br from-primary-dark via-primary to-primary-mid rounded-b-[40px] px-8 pt-16 pb-10 flex flex-col items-center gap-3">
        <LogoIsotipo size={56} />
        <h1 className="font-display font-black text-3xl text-white">
          Macro<span className="text-primary-border">ly</span>
        </h1>
        <p className="text-white/60 text-xs tracking-[3px] uppercase">
          Nutricion inteligente
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="flex-1 px-7 pt-8 flex flex-col">
        <div className="flex border-b-2 border-border-l mb-7">
          <div className="flex-1 text-center pb-3 text-sm font-semibold text-primary border-b-[3px] border-primary -mb-[2px]">
            Iniciar sesion
          </div>
          <Link
            href="/registro"
            className="flex-1 text-center pb-3 text-sm font-semibold text-muted no-underline"
          >
            Registrarse
          </Link>
        </div>

        {error && (
          <p role="alert" className="text-error text-sm font-semibold mb-4 text-center">{error}</p>
        )}

        <label htmlFor="login-email" className="text-xs font-semibold text-sub mb-1.5">Correo electronico</label>
        <div className="flex items-center gap-3 border-2 border-border rounded-xl px-4 py-3.5 mb-4 focus-within:border-primary transition-colors">
          <Mail size={16} className="text-muted" aria-hidden="true" />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="flex-1 outline-none text-sm text-text bg-transparent placeholder:text-muted"
          />
        </div>

        <label htmlFor="login-password" className="text-xs font-semibold text-sub mb-1.5">Contrasena</label>
        <div className="flex items-center gap-3 border-2 border-border rounded-xl px-4 py-3.5 mb-6 focus-within:border-primary transition-colors">
          <Lock size={16} className="text-muted" aria-hidden="true" />
          <input
            id="login-password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            className="flex-1 outline-none text-sm text-text bg-transparent placeholder:text-muted"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="text-muted focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label={showPw ? "Ocultar contrasena" : "Mostrar contrasena"}
          >
            {showPw ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-display font-bold text-[15px] rounded-xl shadow-[0_4px_16px_rgba(46,125,50,.3)] disabled:opacity-50 transition-opacity"
        >
          {loading ? "Ingresando..." : "Iniciar sesion"}
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

        <p className="text-center mt-5 text-sm text-primary-mid font-semibold">
          Olvidaste tu contrasena?
        </p>
      </form>
    </div>
  );
}
