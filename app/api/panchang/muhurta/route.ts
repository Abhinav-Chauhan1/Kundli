import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { engine } from '@/lib/engine';

const muhurtaSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  activity:  z.enum(['MARRIAGE','GRIHA_PRAVESH','NAMKARAN','MUNDAN','VEHICLE','BUSINESS']),
  lat:       z.number().min(-90).max(90),
  lng:       z.number().min(-180).max(180),
  tz:        z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = muhurtaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const result = await engine.muhurta(parsed.data);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Muhurta calculation failed' }, { status: 502 });
  }
}
