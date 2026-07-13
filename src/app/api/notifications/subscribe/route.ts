import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { endpoint, keys, user_id } = await req.json();
    if (!endpoint || !keys) {
      return NextResponse.json({ error: 'endpoint y keys son requeridos' }, { status: 400 });
    }
    await supabase.from('push_subscriptions').upsert(
      { endpoint, keys, user_id: user_id || null },
      { onConflict: 'endpoint' }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Error al guardar suscripción' }, { status: 500 });
  }
}
