import type { Metadata } from "next";
import { ProfileClient } from "@/components/account/profile-client";

export const metadata: Metadata = {
  title: "Meu Perfil — Leaf E-commerce",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
