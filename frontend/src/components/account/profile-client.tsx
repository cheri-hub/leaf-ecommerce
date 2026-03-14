"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Package, LogOut, Pencil, X, Check, Lock, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import type { User as UserType } from "@/types";

export function ProfileClient() {
  const { user, isLoading, logout } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const isAuthenticated = !!user;

  const [editingField, setEditingField] = useState<"name" | "email" | "phone" | null>(null);
  const [fieldValue, setFieldValue] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [saving, setSaving] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  function startEditing(field: "name" | "email" | "phone") {
    if (!user) return;
    setEditingField(field);
    setFieldError("");
    if (field === "name") setFieldValue(user.fullName);
    else if (field === "email") setFieldValue(user.email);
    else setFieldValue(user.phone ?? "");
  }

  function cancelEditing() {
    setEditingField(null);
    setFieldValue("");
    setFieldError("");
  }

  async function saveField() {
    if (!user) return;
    setSaving(true);
    setFieldError("");

    const payload = {
      fullName: editingField === "name" ? fieldValue.trim() : user.fullName,
      email: editingField === "email" ? fieldValue.trim() : user.email,
      phone: editingField === "phone" ? (fieldValue.trim() || null) : user.phone,
    };

    try {
      const updated = await api<UserType>("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setUser(updated);
      setEditingField(null);
      setFieldValue("");
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldError(err.message);
      } else {
        setFieldError("Erro ao salvar alterações");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return;
    }

    setSavingPassword(true);
    try {
      await api("/api/auth/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      setPasswordSuccess("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setPasswordError(err.message);
      } else {
        setPasswordError("Erro ao alterar senha");
      }
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-pulse">
        <div className="h-6 w-32 bg-secondary/40 rounded mb-8 mx-auto" />
        <div className="bg-white rounded-lg border border-border p-6 space-y-4">
          <div className="h-4 w-48 bg-secondary/40 rounded" />
          <div className="h-4 w-36 bg-secondary/40 rounded" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <User className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-2">
          Acesse sua conta
        </h1>
        <p className="text-text-secondary mb-6">
          Faça login para ver seu perfil e pedidos.
        </p>
        <Link
          href="/login"
          className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
        >
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 md:py-16">
      <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-8 text-center">
        Meu Perfil
      </h1>

      {/* Avatar + Name */}
      <div className="bg-white rounded-lg border border-border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-text-main">{user.fullName}</p>
            <p className="text-sm text-text-secondary">{user.email}</p>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-0 divide-y divide-border">
          {/* Name */}
          <div className="py-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-text-muted uppercase tracking-wide">Nome completo</p>
              {editingField !== "name" && (
                <button onClick={() => startEditing("name")} className="text-primary hover:text-primary-hover transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            {editingField === "name" ? (
              <EditField
                value={fieldValue}
                onChange={setFieldValue}
                onSave={saveField}
                onCancel={cancelEditing}
                error={fieldError}
                saving={saving}
                type="text"
              />
            ) : (
              <p className="text-sm text-text-main">{user.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="py-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-text-muted uppercase tracking-wide">E-mail</p>
              {editingField !== "email" && (
                <button onClick={() => startEditing("email")} className="text-primary hover:text-primary-hover transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            {editingField === "email" ? (
              <EditField
                value={fieldValue}
                onChange={setFieldValue}
                onSave={saveField}
                onCancel={cancelEditing}
                error={fieldError}
                saving={saving}
                type="email"
              />
            ) : (
              <p className="text-sm text-text-main">{user.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="py-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-text-muted uppercase tracking-wide">Telefone</p>
              {editingField !== "phone" && (
                <button onClick={() => startEditing("phone")} className="text-primary hover:text-primary-hover transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            {editingField === "phone" ? (
              <EditField
                value={fieldValue}
                onChange={setFieldValue}
                onSave={saveField}
                onCancel={cancelEditing}
                error={fieldError}
                saving={saving}
                type="tel"
              />
            ) : (
              <p className="text-sm text-text-main">{user.phone || "Não informado"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-border p-6 mb-6">
        {!showPasswordForm ? (
          <button
            onClick={() => {
              setShowPasswordForm(true);
              setPasswordError("");
              setPasswordSuccess("");
            }}
            className="flex items-center gap-3 w-full text-left"
          >
            <Lock className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-text-main">Alterar senha</span>
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-main flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Alterar senha
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                className="text-text-muted hover:text-text-main transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-text-main block mb-1">Senha atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-text-muted"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-main block mb-1">Nova senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-text-muted"
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-main block mb-1">Confirmar nova senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-text-muted"
                required
                minLength={8}
              />
            </div>

            {passwordError && (
              <p className="text-sm text-error">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-success">{passwordSuccess}</p>
            )}

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {savingPassword ? "Salvando..." : "Alterar senha"}
            </button>
          </form>
        )}
      </div>

      {/* Links */}
      <div className="space-y-3">
        <Link
          href="/wishlist"
          className="flex items-center justify-between bg-white rounded-lg border border-border p-4 hover:shadow-card-hover transition-shadow"
        >
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-text-main">Meus Favoritos</span>
          </div>
          <span className="text-text-muted text-sm">→</span>
        </Link>

        <Link
          href="/orders"
          className="flex items-center justify-between bg-white rounded-lg border border-border p-4 hover:shadow-card-hover transition-shadow"
        >
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-text-main">Meus Pedidos</span>
          </div>
          <span className="text-text-muted text-sm">→</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full bg-white rounded-lg border border-border p-4 hover:shadow-card-hover transition-shadow text-left"
        >
          <LogOut className="w-5 h-5 text-error" />
          <span className="text-sm font-medium text-error">Sair da conta</span>
        </button>
      </div>
    </div>
  );
}

function EditField({
  value,
  onChange,
  onSave,
  onCancel,
  error,
  saving,
  type,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  error: string;
  saving: boolean;
  type: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-white border border-border-strong rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") onCancel();
          }}
        />
        <button
          onClick={onSave}
          disabled={saving}
          className="p-2 rounded-full hover:bg-primary/5 text-success transition-colors disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-primary/5 text-text-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}
