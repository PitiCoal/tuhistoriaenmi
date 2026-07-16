import { NextRequest, NextResponse } from 'next/server';
import { deleteAllUserData } from '@/lib/supabase';

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }
    await deleteAllUserData(userId);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('DELETE /api/usuario error:', err);
    return NextResponse.json({ error: err.message || 'Error al eliminar datos' }, { status: 500 });
  }
}
