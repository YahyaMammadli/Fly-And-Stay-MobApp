import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const signUpSchema = signInSchema
  .extend({
    name: z.string().trim().min(1, "Name is required").max(60, "Name is too long"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from the e-mail"),
    newPassword: z.string().min(8, "Password must be at least 8 characters long").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60, "Name is too long"),
});

export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ProfileSchema = z.infer<typeof profileSchema>;
