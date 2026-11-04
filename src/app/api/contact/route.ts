import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name || [body.firstName, body.lastName].filter(Boolean).join(' ') || 'Prospective Client';
    const email = body.email;
    const phone = body.phone || '';
    const subject = body.subject || 'New Inquiry from Arab Marble Storefront';
    const message = body.message;

    if (!email || !message) {
      return NextResponse.json({ message: 'Missing required fields (email, message)' }, { status: 400 });
    }

    const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const port = parseInt(process.env.SMTP_PORT || '465');
    const user = process.env.SMTP_USER || 'zero@kalptree.xyz';
    const pass = process.env.SMTP_PASS || '@ETFt74j';
    const adminEmail = process.env.ADMIN_EMAIL || 'raghav@gmail.com';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"${name} via Arab Marble" <${user}>`,
      to: adminEmail,
      replyTo: email,
      subject: `[Arab Marble] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #222; border-bottom: 2px solid #505050; padding-bottom: 8px;">Arab Marble - New Website Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #505050; margin: 15px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Message sent successfully.' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error in contact POST:', error);
    return NextResponse.json({ message: 'Failed to process inquiry. Please try again later.' }, { status: 500 });
  }
}
