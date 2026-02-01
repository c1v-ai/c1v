import { resend, EMAIL_FROM } from './resend';
import { PasswordResetEmail } from './templates/password-reset';

interface SendPasswordResetEmailParams {
  to: string;
  resetToken: string;
}

interface SendPasswordResetEmailResult {
  success: boolean;
  error?: string;
}

export async function sendPasswordResetEmail({
  to,
  resetToken,
}: SendPasswordResetEmailParams): Promise<SendPasswordResetEmailResult> {
  const baseUrl = process.env.BASE_URL;

  if (!baseUrl) {
    console.error('BASE_URL environment variable is not set');
    return {
      success: false,
      error: 'Email configuration error',
    };
  }

  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject: 'Reset Your Password - Product Helper',
      react: PasswordResetEmail({ resetLink, userEmail: to }),
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return {
        success: false,
        error: 'Failed to send email',
      };
    }

    console.log('Password reset email sent successfully:', data?.id);
    return { success: true };
  } catch (err) {
    console.error('Error sending password reset email:', err);
    return {
      success: false,
      error: 'Failed to send email',
    };
  }
}
