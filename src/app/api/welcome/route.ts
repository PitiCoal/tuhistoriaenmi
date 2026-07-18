import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email requerido' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const displayName = name || 'amigo/a';

    await transporter.sendMail({
      from: `"Tu Historia En Mí" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: `¡Te doy la bienvenida a Tu Historia En Mí, ${displayName}!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #eef2f5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #ffffff;">
          <!-- Header Banner -->
          <div style="background-color: #1A3A5C; padding: 32px 24px; text-align: center; color: #ffffff;">
            <img src="https://tuhistoriaenmi.vercel.app/images/logo.png" alt="Tu Historia En Mí Logo" style="height: 64px; width: 64px; filter: brightness(0) invert(1); margin-bottom: 12px;" />
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Tu Historia En Mí</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px; color: #333333; line-height: 1.6;">
            <p style="font-size: 16px; font-weight: 600; color: #1A3A5C; margin-top: 0;">¡Hola, ${displayName}!</p>
            
            <p>Es una gran alegría para mí darte la bienvenida a nuestra comunidad. <strong>Tu Historia En Mí</strong> nace del profundo deseo de ser un puente de unión y comunicación de fe; un espacio donde cada testimonio de vida nos recuerda que Dios está actuando, y que en nuestras dificultades, desafíos y esperanzas nunca estamos solos.</p>
            
            <p>Queremos acompañarte día a día en tu caminar espiritual. Por eso, en esta plataforma encontrarás:</p>
            
            <div style="margin: 20px 0; padding-left: 12px; border-left: 3px solid #1A3A5C;">
              <p style="margin: 8px 0;">🎙️ <strong>El Podcast:</strong> Conversaciones sinceras e íntimas con personas que se atreven a contar cómo Dios ha transformado sus vidas.</p>
              <p style="margin: 8px 0;">📖 <strong>El Versículo del Día:</strong> Una pequeña semilla de fe y reflexión diaria para empezar tu mañana.</p>
              <p style="margin: 8px 0;">🙏 <strong>Muro de Oración y Comunidad:</strong> Un espacio seguro para dejar tus intenciones y rezar unos por otros.</p>
            </div>
            
            <p style="margin-bottom: 24px;">Te animo a explorar la web, participar activamente y, si sientes el llamado de Dios, también a <strong>compartir tu propia historia</strong>. Recuerda: <em>"Cuando alguien se atreve a decirlo, otro se atreve a sentirlo"</em>.</p>
            
            <!-- Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://tuhistoriaenmi.vercel.app" style="background-color: #1A3A5C; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(26,58,92,0.15);">
                Ir a la plataforma
              </a>
            </div>
            
            <p style="margin-bottom: 0;">Con mucho cariño y en oración,</p>
            <p style="margin-top: 4px; font-weight: 700; color: #1A3A5C;">M. Piedad Correa</p>
            <p style="margin: 0; font-size: 13px; color: #6B6358;">Creadora y Host &mdash; Tu Historia En Mí</p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #6B6358; border-top: 1px solid #eef2f5;">
            <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} Tu Historia En Mí. Todos los derechos reservados.</p>
            <p style="margin: 0;">Recibes este correo porque te registraste en nuestra plataforma. Si deseas dejar de recibir correos, puedes cambiar tus preferencias en tu perfil.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
