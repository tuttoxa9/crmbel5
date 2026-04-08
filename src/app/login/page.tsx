"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FirebaseError } from "firebase/app";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Заполните все поля");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth!, email, password);
      // We also need to set a cookie so middleware can read it.
      // Easiest way is an API route or just getting ID token and setting cookie.
      const token = await auth!.currentUser?.getIdToken();
      if (token) {
        document.cookie = `session=${token}; path=/; max-age=86400; SameSite=Strict`;
      }
      toast.success("Успешный вход");
      router.push("/leads");
    } catch (error) {
      if (error instanceof FirebaseError) {
        toast.error("Неверный email или пароль");
      } else {
        toast.error("Произошла ошибка при входе");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[400px] card-light dark:card-dark p-32 rounded-[16px]"
      >
        <div className="text-center mb-32">
          <h1 className="text-[28px] font-bold text-textPrimary tracking-tight">
            Белавто Центр
          </h1>
          <p className="text-textMuted mt-8">Войдите в систему</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-16">
          <div className="space-y-8">
            <label className="text-caption-bold text-textPrimary block">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-8">
            <label className="text-caption-bold text-textPrimary block">
              Пароль
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Войти
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
