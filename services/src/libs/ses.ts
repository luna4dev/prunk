import { SendEmailCommand } from "@aws-sdk/client-ses";
import { ISESContext } from "../contexts";
import { logError } from "./log";
import { PrunkError } from "./error";

/**
 * Send an email.
 * @param from - The email address of the sender
 * @param to - The email address of the recipient
 * @param subject - The subject of the email
 * @param htmlBody - The HTML body of the email
 * @param context - The context of the email
 */
export async function sendEmail(from: string, to: string, subject: string, htmlBody: string, context: ISESContext) {
    context.startCallStack("sendEmail");
    try {
        const { sesClient } = context;
        const command = new SendEmailCommand({
            Source: from,
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Subject: {
                    Data: subject,
                },
                Body: {
                    Html: {
                        Data: htmlBody,
                    },
                },
            },
        });
        const result = await sesClient.send(command);
        return result;
    } catch (error) {
        if (error instanceof PrunkError) {
            throw error;
        }
        logError("sendEmail error", error, context);
        throw new PrunkError("Failed to send email", 500);
    } finally {
        context.endCallStack();
    }
}
