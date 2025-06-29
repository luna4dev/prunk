import { SendEmailCommand } from "@aws-sdk/client-ses";
import { EmailSigninContext } from "../contexts";

export async function sendEmailAuth(email: string, token: string, context: EmailSigninContext) {
  const { sesClient, EMAIL_AUTH_SENDER, SERVICE_DOMAIN, EMAIL_AUTH_PATH } = context;

  const link = `https://${SERVICE_DOMAIN}${EMAIL_AUTH_PATH}?token=${token}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Prunk Signin</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 20px;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background-color:rgb(139, 179, 59);
                color: #ffffff;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 500;
                margin: 20px 0;
            }
            .button:hover {
                background-color: #1d4ed8;
            }
            .link {
                color: #2563eb;
                text-decoration: none;
            }
            .link:hover {
                text-decoration: underline;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 14px;
                color: #6b7280;
                text-align: center;
            }
            .warning {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">Prunk</div>
            </div>
            
            <div class="content">
                <h1 class="title">Sign in to Prunk</h1>
                
                <p>Hello!</p>
                
                <p>We received a request to sign in to your Prunk account. Click the button below to complete your signin:</p>
                
                <div style="text-align: center;">
                    <a href="${link}" class="button">Sign in to Prunk</a>
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p><a href="${link}" class="link">${link}</a></p>
                
                <div class="warning">
                    <strong>Security notice:</strong> This link will expire soon and can only be used once. If you didn't request this signin, you can safely ignore this email.
                </div>
                
                <p>If you have any questions, please don't hesitate to contact our support team.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent to ${email}</p>
                <p>&copy; ${new Date().getFullYear()} Prunk. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const command = new SendEmailCommand({
    Source: EMAIL_AUTH_SENDER,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: "Sign in to Prunk",
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
}