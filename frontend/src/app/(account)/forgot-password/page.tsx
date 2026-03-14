import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Esqueci minha senha — Leaf E-commerce",
  description: "Redefina sua senha na Leaf E-commerce.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
