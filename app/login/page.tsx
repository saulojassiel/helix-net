"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: "http://localhost:3000/projects",
        },
      });

      if (error) throw error;

      alert("Revisa tu correo. Te enviamos un enlace para iniciar sesión.");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error al iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md rounded-xl border border-cyan-500 p-8 bg-zinc-900">

        <h1 className="text-3xl font-bold text-cyan-300">
          Iniciar sesión
        </h1>

        <p className="mt-2 text-zinc-400">
          Entra a tu universo creativo.
        </p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-6 w-full rounded-lg bg-zinc-800 p-3 outline-none"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-cyan-300 py-3 font-bold text-black"
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>

      </div>
    </main>
  );
}