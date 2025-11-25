import * as z from "zod";

export const LoomValidation=z.object({
  loom: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
  accountId: z.string(),
   
});
export const CommentValidation = z.object({
  loom: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
});