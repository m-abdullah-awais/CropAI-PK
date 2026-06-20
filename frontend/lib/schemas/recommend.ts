import { z } from "zod";

// Ranges carry a little headroom beyond the dataset so real soil tests pass.
// Inputs use valueAsNumber, so fields are plain numbers (no coercion needed).
export const recommendSchema = z.object({
  N: z.number().min(0).max(200),
  P: z.number().min(0).max(150),
  K: z.number().min(0).max(200),
  ph: z.number().min(3).max(10),
  temperature: z.number().min(-10).max(60),
  humidity: z.number().min(0).max(100),
  rainfall: z.number().min(0).max(600),
});

export type RecommendForm = z.infer<typeof recommendSchema>;

export const recommendDefaults: RecommendForm = {
  N: 80,
  P: 45,
  K: 40,
  ph: 6.5,
  temperature: 25,
  humidity: 70,
  rainfall: 120,
};
