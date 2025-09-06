import { z } from 'zod';

export const projectUserPermissionSchema = z.enum(['FULL_ACCESS']);
export type ProjectUserPermission = z.infer<typeof projectUserPermissionSchema>;

export const projectUserModelSchema = z.object({
  projectId: z
    .string()
    .describe('The unique identifier of the project. Partition key'),
  userId: z
    .string()
    .describe(
      'The unique identifier of the user. GSI partition key of userId-index'
    ),
  isOwner: z.boolean().describe('Whether the user is the owner of the project'),
  permissions: z
    .array(projectUserPermissionSchema)
    .describe('The permissions of the user in the project'),
  createdAt: z
    .number()
    .describe('The timestamp(miliseconds) of when the project was created'),
  updatedAt: z
    .number()
    .describe(
      'The timestamp(miliseconds) of when the project was last updated'
    ),
});
