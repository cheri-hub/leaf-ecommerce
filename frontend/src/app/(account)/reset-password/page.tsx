import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Redefinir senha — Leaf E-commerce",
  description: "Crie uma nova senha para sua conta.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
