import { NextRequest, NextResponse } from 'next/server';

function envPositiveInt(value: string | undefined, fallback: number): number {
    if (value == null || value.trim() === '') {
        return fallback;
    }
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function envOptionalMb(value: string | undefined): number | null {
    if (value == null || value.trim() === '' || value === '0') {
        return null;
    }
    const mb = Number(value);
    if (!Number.isFinite(mb) || mb <= 0) {
        return null;
    }
    return Math.round(mb * 1024 * 1024);
}

export const MAX_FILES = envPositiveInt(process.env.NEXT_PUBLIC_MAX_FILES, 100);
export const MAX_FILE_SIZE_BYTES = envOptionalMb(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB);
export const MAX_BATCH_BYTES = envOptionalMb(process.env.NEXT_PUBLIC_MAX_BATCH_SIZE_MB);
export const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
]);

const hits = new Map<string, number[]>();

export type OutputFormat = 'webp' | 'avif' | 'both';

export function clientKey(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0]?.trim() || 'unknown';
    }
    return request.headers.get('x-real-ip') || 'unknown';
}

function rateLimitHits(key: string, limit: number, windowMs = 60_000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    const timestamps = (hits.get(key) ?? []).filter((stamp) => stamp > windowStart);

    if (timestamps.length >= limit) {
        hits.set(key, timestamps);
        return false;
    }

    timestamps.push(now);
    hits.set(key, timestamps);
    return true;
}

export function checkRateLimit(request: NextRequest, bucket: string, envName: string): NextResponse | null {
    const limit = envPositiveInt(process.env[envName], 0);
    if (limit <= 0) {
        return null;
    }
    if (rateLimitHits(`${bucket}:${clientKey(request)}`, limit)) {
        return null;
    }
    return rateLimitResponse();
}

export function rateLimitResponse(): NextResponse {
    return NextResponse.json(
        { error: 'Demasiadas solicitudes. Espera un momento e intentalo de nuevo.' },
        { status: 429, headers: { 'Retry-After': '60' } }
    );
}

export function parseOutputFormat(value: FormDataEntryValue | null): OutputFormat {
    const format = typeof value === 'string' ? value : 'webp';
    if (format === 'webp' || format === 'avif' || format === 'both') {
        return format;
    }
    return 'webp';
}

export function clampQuality(value: FormDataEntryValue | null, fallback: number): number {
    const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : fallback;
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.min(100, Math.max(10, parsed));
}

export function isAllowedImage(file: File): boolean {
    return ALLOWED_IMAGE_TYPES.has(file.type);
}

export function safeZipBaseName(filename: string, fallback: string): string {
    const posixName = filename.replace(/\\/g, '/');
    const base = posixName.split('/').pop() || fallback;
    const withoutExt = base.replace(/\.[^/.]+$/, '');
    const cleaned = withoutExt.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
    return cleaned || fallback;
}

export function parseFontFamily(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }
    const family = value.trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9 \-]{0,62}$/.test(family)) {
        return null;
    }
    return family;
}

export function parseFontWeights(value: unknown): number[] {
    if (!Array.isArray(value)) {
        return [400];
    }

    const weights = [...new Set(
        value
            .map((item) => Number(item))
            .filter((weight) => Number.isInteger(weight) && weight >= 100 && weight <= 900 && weight % 100 === 0)
    )].sort((a, b) => a - b);

    return weights.slice(0, 9);
}

export function parseIncludeItalic(value: unknown): boolean {
    return value === true;
}
