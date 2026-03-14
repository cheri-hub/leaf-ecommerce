import { z } from "zod/v4";
import { isValidTaxId } from "./utils";

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.email("E-mail inválido"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirme sua senha"),
    phone: z.string().optional(),
    taxId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const checkoutSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
  taxId: z
    .string()
    .min(1, "CPF/CNPJ é obrigatório")
    .refine(
      (val) => isValidTaxId(val),
      { message: "CPF ou CNPJ inválido" }
    ),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  description: z.string().optional().or(z.literal("")),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional().or(z.literal("")),
  priceInCents: z.number().min(1, "Preço deve ser maior que zero"),
  stock: z.number().min(0, "Estoque não pode ser negativo"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  isActive: z.boolean(),
});

export type ProductFormData = z.infer<typeof productSchema>;
