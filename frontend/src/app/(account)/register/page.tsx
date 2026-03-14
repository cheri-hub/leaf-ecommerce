import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Criar Conta — Leaf E-commerce",
  description: "Crie sua conta na Leaf E-commerce e aproveite nossas ofertas.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
