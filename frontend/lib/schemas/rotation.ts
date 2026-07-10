import { z } from "zod";

// Soil/climate are optional: left blank, the backend seeds them from the current
// crop's real average profile. Ranges mirror the recommendation schema (with a
// little headroom) so real soil-test values pass.
const optionalNum = (min: number, max: number) =>
  z.number().min(min).max(max).optional();

export const rotationSchema = z.object({
  current_crop: z.string().min(1),
  N: optionalNum(0, 200),
  P: optionalNum(0, 150),
  K: optionalNum(0, 200),
  ph: optionalNum(3, 10),
  temperature: optionalNum(-10, 60),
  humidity: optionalNum(0, 100),
  rainfall: optionalNum(0, 600),
});

export type RotationForm = z.infer<typeof rotationSchema>;
