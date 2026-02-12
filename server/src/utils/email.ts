import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendVerificationEmail = async (email: string, token: string) => {
    const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';

    // If credentials are not provided, log it (dev mode)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('---------------------------------------------------');
        console.log(`[DEV MODE] Verification Link for ${email}:`);
        console.log(`${frontendUrl}/verify-email?token=${token}`);
        console.log('---------------------------------------------------');
        return;
    }

    try {
        await transporter.sendMail({
            from: '"AutoKos" <no-reply@autokos.com>',
            to: email,
            subject: 'Verifiko llogarinë tënde në AutoKos',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #2563eb; text-align: center;">Mirësevini në AutoKos!</h2>
                    <p>Përshëndetje,</p>
                    <p>Faleminderit që u regjistruat. Ju lutem klikoni butonin e mëposhtëm për të verifikuar emailin tuaj:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${frontendUrl}/verify-email?token=${token}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verifiko Emailin</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">Nëse butoni nuk punon, klikoni në këtë link:</p>
                    <p><a href="${frontendUrl}/verify-email?token=${token}">${frontendUrl}/verify-email?token=${token}</a></p>
                </div>
            `,
        });
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        // Fallback for dev if delivery fails
        console.log(`[FALLBACK] Verification Link: ${frontendUrl}/verify-email?token=${token}`);
    }
};
