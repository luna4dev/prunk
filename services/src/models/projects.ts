import { z } from "zod";

export const projectStatusSchema = z.enum(["ACTIVE", "SUSPENDED"]);

export const projectModelSchema = z.object({
  projectId: z.string().describe("The unique identifier of the project. Partition key"),
  name: z.string().describe("The name of the project"),
  description: z.string().describe("The description of the project"),
  status: projectStatusSchema.describe("The status of the project"),
  preferences: z.any().transform((val) => {
    if (typeof val === "object") {
      return val;
    }
    return {};
  }).pipe(z.object({
    // TODO: add preference schema
  })).describe("The preferences of the project"),
  createdAt: z.number().describe("The timestamp(miliseconds) of when the project was created"),
  updatedAt: z.number().describe("The timestamp(miliseconds) of when the project was last updated"),
});