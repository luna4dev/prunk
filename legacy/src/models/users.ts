import { z } from 'zod';

export const userStatusSchema = z.enum(['ACTIVE', 'SUSPENDED']);

export const userModelSchema = z.object({
  userId: z
    .string()
    .describe('The unique identifier of the user. Partition key'),
  email: z
    .string()
    .email()
    .describe('The email of the user, GSI partition key of email-index'),
  status: userStatusSchema.describe('The status of the user'),
  preferences: z
    .any()
    .transform(val => {
      if (typeof val === 'object') {
        return val;
      }
      return null;
    })
    .pipe(
      z
        .object({
          // TODO: add preference schema
        })
        .nullable()
    )
    .describe('The preferences of the user'),
  createdAt: z
    .number()
    .describe('The timestamp(miliseconds) of when the user was created'),
  updatedAt: z
    .number()
    .describe('The timestamp(miliseconds) of when the user was last updated'),
  lastLoginAt: z
    .any()
    .transform(val => {
      if (typeof val === 'number') {
        return val;
      }
      return null;
    })
    .pipe(z.number().nullable())
    .describe('The timestamp(miliseconds) of when the user was last logged in'),
  emailAuth: z
    .any()
    .transform(val => {
      if (typeof val === 'object') {
        return val;
      }
      return null;
    })
    .pipe(
      z
        .object({
          token: z.string().describe('The token for email authentication'),
          sentAt: z
            .number()
            .describe(
              'The timestamp(miliseconds) of when the email authentication token was sent'
            ),
          completed: z
            .boolean()
            .describe('Whether the email authentication is completed'),
        })
        .nullable()
    )
    .describe('The email authentication of the user'),
});
export type UserModel = z.infer<typeof userModelSchema>;
