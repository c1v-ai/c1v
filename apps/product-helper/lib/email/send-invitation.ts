import { resend, EMAIL_FROM } from './resend';

interface SendInvitationEmailParams {
  to: string;
  teamName: string;
  inviterName: string;
  role: string;
  inviteId: string;
}

interface SendInvitationEmailResult {
  success: boolean;
  error?: string;
}

export async function sendInvitationEmail({
  to,
  teamName,
  inviterName,
  role,
  inviteId,
}: SendInvitationEmailParams): Promise<SendInvitationEmailResult> {
  const baseUrl = process.env.BASE_URL;

  if (!baseUrl) {
    console.error('BASE_URL environment variable is not set');
    return {
      success: false,
      error: 'Email configuration error',
    };
  }

  const inviteLink = `${baseUrl}/invite?id=${inviteId}`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject: `You've been invited to join ${teamName} on Product Helper`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">You're invited!</h1>
          <p style="color: #4a4a4a; line-height: 1.6;">
            <strong>${inviterName}</strong> has invited you to join <strong>${teamName}</strong>
            as a <strong>${role}</strong> on Product Helper.
          </p>
          <p style="margin: 24px 0;">
            <a href="${inviteLink}"
               style="background-color: #0066cc; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </p>
          <p style="color: #6a6a6a; font-size: 14px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #9a9a9a; font-size: 12px;">
            Product Helper - AI-Powered PRD Generation
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send invitation email:', error);
      return {
        success: false,
        error: 'Failed to send email',
      };
    }

    console.log('Invitation email sent successfully:', data?.id);
    return { success: true };
  } catch (err) {
    console.error('Error sending invitation email:', err);
    return {
      success: false,
      error: 'Failed to send email',
    };
  }
}
