import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const check = rateLimit(ip, 5, 60_000);
    if (!check.ok) {
      return NextResponse.json({ ok: false, error: 'Demasiadas solicitudes. Intenta en un minuto.' }, { status: 429 });
    }

    const body = await req.json();
    const { email, userName, projectName, projectDate } = body;

    if (!email || !projectName) {
      return NextResponse.json({ ok: false, error: 'Email y nombre del proyecto son requeridos' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const displayName = userName || 'amigo/a';
    const dateText = projectDate || 'Por coordinar';

    await transporter.sendMail({
      from: `"Tu Historia En Mí" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: `¡Inscripción Confirmada: ${projectName}!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #eef2f5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #ffffff;">
          <!-- Header Banner -->
          <div style="background-color: #1A3A5C; padding: 32px 24px; text-align: center; color: #ffffff;">
            <img src="https://tuhistoriaenmi.vercel.app/images/logo.png" alt="Tu Historia En Mí Logo" style="height: 64px; width: 64px; filter: brightness(0) invert(1); margin-bottom: 12px;" />
            <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">Inscripción a Actividad</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px 24px; color: #333333; line-height: 1.6;">
            <p style="font-size: 16px; font-weight: 600; color: #1A3A5C; margin-top: 0;">¡Hola, ${displayName}!</p>
            
            <p>Te confirmamos que te has inscrito con éxito en la siguiente actividad de nuestra comunidad:</p>
            
            <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-left: 4px solid #1A3A5C; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; font-size: 15px;">🌟 <strong>Actividad / Proyecto:</strong> ${projectName}</p>
              <p style="margin: 0; font-size: 13px; color: #6B6358;">📅 <strong>Fecha / Detalle:</strong> ${dateText}</p>
            </div>
            
            <p><strong>¿Qué sigue ahora?</strong></p>
            <p>El equipo del ministerio revisará tu inscripción y nos pondremos en contacto contigo a la brevedad para entregarte los detalles del encuentro, coordinar la participación o compartir el material necesario.</p>
            
            <p style="margin-bottom: 24px;">¡Muchas gracias por sumarte y ser parte activa de esta comunidad! Tu presencia y compromiso son de gran bendición.</p>
            
            <!-- Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://tuhistoriaenmi.vercel.app/perfil" style="background-color: #1A3A5C; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(26,58,92,0.15);">
                Ver mis actividades
              </a>
            </div>
            
            <p style="margin-bottom: 0;">Con mucho cariño y en oración,</p>
            <p style="margin-top: 4px; font-weight: 700; color: #1A3A5C;">M. Piedad Correa</p>
            <p style="margin: 0; font-size: 13px; color: #6B6358;">Creadora y Host &mdash; Tu Historia En Mí</p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #6B6358; border-top: 1px solid #eef2f5;">
            <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} Tu Historia En Mí. Todos los derechos reservados.</p>
            <p style="margin: 0;">Recibes este correo tras inscribirte a un proyecto en nuestra web. Si no realizaste esta acción, por favor ignora este mensaje.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Project join email error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
