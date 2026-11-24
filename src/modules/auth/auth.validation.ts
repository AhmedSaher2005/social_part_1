import * as z from "zod";
import { GenderEnum } from "../../common/Enum/user.enum.js";

export const signUpSchema = {
  body: z
    .strictObject({
      fName: z.string().min(3).max(20).trim(),
      lName: z.string().min(3).max(20).trim(),
      email: z.string().email(),
      password: z.string().regex(/^[A-Z](?=.*\d)[A-Za-z\d]+$/),
      cPassword: z.string(),
      gender: z.enum(GenderEnum).optional(),
      phone: z.string(),
    })
    .superRefine((val, ctx) => {
      if (val.password !== val.cPassword) {
        ctx.addIssue({
          code: "custom",
          message: "password and confirm password must be the same",
          origin: ["cPassword"],
        });
      }
    }),
};
export const signInSchema = {
  body: z
    .strictObject({
      email: z.string().email(),
      password: z.string().regex(/^[A-Z](?=.*\d)[A-Za-z\d]+$/),
    }),
};
