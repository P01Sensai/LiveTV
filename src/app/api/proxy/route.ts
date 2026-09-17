import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const targetUrl = new URL(url);
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return new NextResponse('Invalid protocol', { status: 400 });
    }
    
    // Basic SSRF protection (prevent querying local metadata/services)
    const hostname = targetUrl.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.startsWith('169.254.')) {
      return new NextResponse('Forbidden hostname', { status: 403 });
    }

    const response = await fetch(url, {
      headers: {
        // Many IPTV providers block default fetch user agents, mimic VLC or standard browser
        'User-Agent': 'VLC/3.0.20 LibVLC/3.0.20',
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch from upstream', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || '';
    
    // If it's an M3U8 playlist, we must rewrite the URIs to pass through our proxy
    if (url.includes('.m3u8') || contentType.includes('mpegurl') || contentType.toLowerCase().includes('application/x-mpegurl')) {
      const text = await response.text();
      const baseUrl = new URL(url);
      
      const lines = text.split('\n');
      const rewrittenLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        
        // Handle encryption keys
        if (trimmed.startsWith('#EXT-X-KEY') && trimmed.includes('URI=')) {
           const uriMatch = trimmed.match(/URI="([^"]+)"/);
           if (uriMatch) {
             const uri = uriMatch[1];
             const absoluteUri = new URL(uri, baseUrl.href).href;
             const proxyUri = `/api/proxy?url=${encodeURIComponent(absoluteUri)}`;
             return trimmed.replace(uri, proxyUri);
           }
        }

        // Directives and comments remain unchanged
        if (trimmed.startsWith('#')) return line;
        
        // Line is a URI (segment or variant playlist)
        try {
          const absoluteUri = new URL(trimmed, baseUrl.href).href;
          return `/api/proxy?url=${encodeURIComponent(absoluteUri)}`;
        } catch(e) {
          return line;
        }
      });

      return new NextResponse(rewrittenLines.join('\n'), {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
    }

    // Security: Only allow video, audio, and specific playlist formats
    const isSafeType = contentType.startsWith('video/') || 
                       contentType.startsWith('audio/') || 
                       contentType.startsWith('application/vnd.apple.mpegurl') ||
                       contentType.startsWith('application/x-mpegurl') ||
                       contentType.startsWith('application/octet-stream'); // Some streams use generic binary
                       
    if (!isSafeType) {
      return new NextResponse('Invalid content type requested', { status: 403 });
    }

    // For video segments (.ts), stream them back directly
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      }
    });

  } catch (error: any) {
    console.error("Proxy error:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}
