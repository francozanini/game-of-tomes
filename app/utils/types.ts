import { z } from "zod";

export const NumericStringSchema = z.string().regex(/^\d+$/).transform(Number);
