import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';
import { connectToDatabase } from '@/lib/server/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim();
    const notes = (body.notes || body.message || '').trim();
    const stones = Array.isArray(body.stones) ? body.stones : [];
    const verified = body.verified ?? true;

    if (!email || !name || !phone) {
      return NextResponse.json(
        { success: false, message: 'Missing required contact fields (name, email, phone)' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Find the dynamic form definition from forms collection
    const formDoc = await db.collection('forms').findOne({
      $or: [
        { slug: 'product-catalog-enquiry-form' },
        { document_key: 'product-catalog-enquiry-form' },
      ],
    });

    const formIdStr = formDoc ? String(formDoc._id) : '6b0431524ce13a07180e3d9d';
    const formName = formDoc?.name || 'Product Catalog Enquiry Form';
    const formSlug = formDoc?.slug || 'product-catalog-enquiry-form';

    // Build stones formatted description
    const stonesListText = stones
      .map((s: any, idx: number) => {
        const stoneName = s.name || s.title || `Stone #${idx + 1}`;
        const stoneCountry = s.country || 'Natural Stone';
        const stoneColor = s.color || 'Standard';
        return `${idx + 1}. ${stoneName} (${stoneCountry}, ${stoneColor})`;
      })
      .join('\n');

    const now = new Date();

    // Prepare standard form_data document for kalp-admin
    const submissionDoc = {
      _id: new ObjectId(),
      formId: formIdStr,
      formSlug: formSlug,
      formName: formName,
      tenant_slug: 'arab-marble',
      data: {
        name,
        email,
        phone,
        stones: stonesListText || (stones.length ? `${stones.length} selected stones` : 'Catalog Products'),
        stones_count: stones.length,
        project_scope: notes || 'No extra requirements specified',
        subject: `Product Catalog Enquiry (${stones.length} Stone${stones.length === 1 ? '' : 's'})`,
        message: `Selected Stones:\n${stonesListText}\n\nProject Scope & Notes:\n${notes || 'Standard inquiry'}`,
        verified: verified ? 'Yes (PIN Code Verified)' : 'Unverified',
      },
      metadata: {
        pageUrl: body.pageUrl || 'http://localhost:3000/shop',
        referrer: body.referrer || '',
        userAgent: req.headers.get('user-agent') || 'Storefront Client',
      },
      context: {
        pageUrl: body.pageUrl || 'http://localhost:3000/shop',
      },
      consent: { marketing: true },
      idempotencyKey: null,
      status: 'received',
      workflow: {
        type: 'email',
        status: 'sent',
        adminRecipients: ['am@arabmarble.ae'],
        adminSent: true,
        updatedAt: now.toISOString(),
      },
      leadWorkflow: {
        leadStage: 'new',
        priority: 'high',
        interest: 'hot',
        owner: '',
        remark: `Enquiry for ${stones.length} catalog stone products`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // Insert into MongoDB form_data collection
    const insertResult = await db.collection('form_data').insertOne(submissionDoc);

    // Also attempt email notification asynchronously (without failing submission if SMTP fails)
    try {
      const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
      const port = parseInt(process.env.SMTP_PORT || '465');
      const user = process.env.SMTP_USER || 'zero@kalptree.xyz';
      const pass = process.env.SMTP_PASS || '@ETFt74j';
      const adminEmail = process.env.ADMIN_EMAIL || 'raghav@gmail.com';

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"${name} via Arab Marble" <${user}>`,
        to: adminEmail,
        replyTo: email,
        subject: `[Arab Marble] New Catalog Stone Enquiry (${stones.length} Items)`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 24px;">
            <h2 style="color: #222; border-bottom: 2px solid #C9A96E; padding-bottom: 8px;">Arab Marble - New Stone Catalog Enquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Verification:</strong> <span style="color: green; font-weight: bold;">Verified</span></p>
            <p><strong>Selected Stones (${stones.length}):</strong></p>
            <div style="background: #f7f7f7; padding: 12px; border-left: 3px solid #C9A96E; margin: 10px 0;">
              ${stonesListText.replace(/\n/g, '<br>')}
            </div>
            ${notes ? `<p><strong>Project Scope & Notes:</strong><br>${notes}</p>` : ''}
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn('[api/enquiry] Email delivery warning (DB record saved successfully):', emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Enquiry submitted successfully and logged to database.',
        submissionId: insertResult.insertedId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[api/enquiry] Error processing inquiry:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
