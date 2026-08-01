export const verificationEmailTemplate = (name, verifyUrl) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
    <h2 style="color:#4F46E5">Verify your email</h2>
    <p>Hi ${name},</p>
    <p>Thanks for joining the AI-Powered Startup & Innovation Funding Intelligence Platform.
    Please confirm your email address to activate your account.</p>
    <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;
      color:#fff;text-decoration:none;border-radius:8px;margin-top:16px">Verify Email</a>
    <p style="margin-top:24px;color:#666;font-size:12px">This link expires in 24 hours.</p>
  </div>
`;

export const resetPasswordEmailTemplate = (name, resetUrl) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
    <h2 style="color:#4F46E5">Reset your password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click below to choose a new one.</p>
    <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;
      color:#fff;text-decoration:none;border-radius:8px;margin-top:16px">Reset Password</a>
    <p style="margin-top:24px;color:#666;font-size:12px">
      This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
  </div>
`;
