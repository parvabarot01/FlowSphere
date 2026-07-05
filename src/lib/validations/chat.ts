import { z } from "zod";

export const createThreadSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
});

export const postMessageSchema = z.object({
  body: z.string().trim().min(1, "Message can't be empty").max(4000),
});
