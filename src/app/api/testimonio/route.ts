import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Tu Historia En Mí" <${process.env.GMAIL_EMAIL}>`,
      to: 'contacto.tuhistoriaenmi@gmail.com',
      subject: `Nuevo testimonio de ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1A3A5C;">🙏 Nuevo testimonio recibido</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #6B6358;">Nombre</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">${name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #6B6358;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #6B6358;">Teléfono</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${phone || 'No indicado'}</td></tr>
          </table>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; color: #1A3A5C; font-weight: 600; margin-bottom: 8px;">Mensaje:</p>
            <p style="margin: 0; color: #333; line-height: 1.6;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #6B6358; font-size: 12px;">Enviado desde tuhistoriaenmi.cl</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
