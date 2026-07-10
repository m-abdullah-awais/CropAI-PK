import { z } from "zod";

export const yieldSchema = z.object({
  crop: z.string().min(1, "Select a crop"),
  year: z.number().int().min(1990).max(2035),
});

export type YieldForm = z.infer<typeof yieldSchema>;

export const yieldDefaults: YieldForm = {
  crop: "wheat",
  year: 2026,
};
