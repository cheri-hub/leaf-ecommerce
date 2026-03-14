import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar — Leaf E-commerce",
  description: "Acesse sua conta na Leaf E-commerce.",
};

export default function LoginPage() {
  return <LoginForm />;
}
