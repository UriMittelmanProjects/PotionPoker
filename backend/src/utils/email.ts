import nodemailer from 'nodemailer';

/**
 * Email utility functions for sending emails
 */

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  firstName: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Reset Your PotionPoker Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007AFF;">Reset Your Password</h2>
          <p>Hi ${firstName},</p>
          <p>You requested to reset your password for your PotionPoker account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            This email was sent by PotionPoker. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Welcome to PotionPoker!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007AFF;">Welcome to PotionPoker! 🃏</h2>
          <p>Hi ${firstName},</p>
          <p>Welcome to PotionPoker! We're excited to help you track your poker sessions and improve your game.</p>
          <p>Here's what you can do with your new account:</p>
          <ul>
            <li>📊 Track your poker sessions with detailed statistics</li>
            <li>🗺️ View your sessions on an interactive map</li>
            <li>👥 Connect with friends and join home games</li>
            <li>🃏 Build opponent ranges with our range creator</li>
          </ul>
          <p>Get started by logging your first poker session!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background-color: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Tracking
            </a>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Good luck at the tables!</p>
          <p>The PotionPoker Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to: ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw error for welcome email as it's not critical
  }
};