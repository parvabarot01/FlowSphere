import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
});

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
});
