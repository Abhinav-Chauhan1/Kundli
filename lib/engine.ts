import type {
  ChartInput,
  ChartResult,
  PanchangInput,
  PanchangResult,
  TransitInput,
  TransitResult,
  MuhurtaInput,
  MuhurtaResult,
  MilanInput,
  MilanResult,
} from '@/types/engine';

const BASE = process.env.ENGINE_URL!;
const KEY  = process.env.ENGINE_API_KEY!;
const TIMEOUT_MS = 8000;

async function call<T>(path: string, body: object): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-engine-key': KEY,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Engine error: ${res.status}`);
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

export const engine = {
  chart:    (body: ChartInput)    => call<ChartResult>('/calculate/chart', body),
  panchang: (body: PanchangInput) => call<PanchangResult>('/calculate/panchang', body),
  transit:  (body: TransitInput)  => call<TransitResult>('/calculate/transit', body),
  muhurta:  (body: MuhurtaInput)  => call<MuhurtaResult>('/calculate/muhurta', body),
  milan:    (body: MilanInput)    => call<MilanResult>('/calculate/milan', body),
};
