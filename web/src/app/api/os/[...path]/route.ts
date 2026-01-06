import { NextRequest, NextResponse } from 'next/server';

let cachedCloudUrl: string | null = null;

async function getCloudUrl() {
    if (cachedCloudUrl) return cachedCloudUrl;

    try {
        const res = await fetch('https://raw.githubusercontent.com/Sandeepkasturi/SKAVTECH-OS/main/connection.txt', {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        const text = await res.text();
        const url = text.trim();
        if (url.startsWith('http')) {
            cachedCloudUrl = url;
            return url;
        }
    } catch (e) {
        console.error("Failed to fetch cloud URL", e);
    }
    return null;
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
    const cloudUrl = await getCloudUrl();
    if (!cloudUrl) {
        return NextResponse.json({ error: 'Cloud OS Offline (No URL found)' }, { status: 503 });
    }

    const path = params.path.join('/');
    try {
        const res = await fetch(`${cloudUrl}/os/${path}`, {
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to connect to Cloud OS', details: String(e) }, { status: 502 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
    const cloudUrl = await getCloudUrl();
    if (!cloudUrl) {
        return NextResponse.json({ error: 'Cloud OS Offline (No URL found)' }, { status: 503 });
    }

    const path = params.path.join('/');
    try {
        const body = await req.json();
        const res = await fetch(`${cloudUrl}/os/${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to connect to Cloud OS', details: String(e) }, { status: 502 });
    }
}
