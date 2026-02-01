import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PasswordResetEmailProps {
  resetLink: string;
  userEmail: string;
}

export function PasswordResetEmail({
  resetLink,
  userEmail,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Product Helper password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logo}>Product Helper</Heading>
          </Section>

          <Heading style={heading}>Reset Your Password</Heading>

          <Text style={paragraph}>
            We received a request to reset the password for the account
            associated with <strong>{userEmail}</strong>.
          </Text>

          <Text style={paragraph}>
            Click the button below to reset your password. This link will expire
            in <strong>1 hour</strong>.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetLink}>
              Reset Password
            </Button>
          </Section>

          <Text style={paragraph}>
            Or copy and paste this URL into your browser:
          </Text>
          <Text style={link}>
            <Link href={resetLink} style={linkStyle}>
              {resetLink}
            </Link>
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you did not request a password reset, you can safely ignore this
            email. Your password will not be changed.
          </Text>

          <Text style={footer}>
            This email was sent by Product Helper. If you have any questions,
            please contact our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '8px',
};

const logoSection = {
  padding: '20px 0',
};

const logo = {
  color: '#f97316',
  fontSize: '24px',
  fontWeight: 700,
  textAlign: 'center' as const,
  margin: '0',
};

const heading = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 600,
  textAlign: 'center' as const,
  margin: '30px 0 20px',
};

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#f97316',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 600,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const link = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  wordBreak: 'break-all' as const,
};

const linkStyle = {
  color: '#f97316',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '12px 0',
};

export default PasswordResetEmail;
