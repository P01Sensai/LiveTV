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
      return new NextResponse('Failed to fetch from upstream', { 
        status: response.status,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    const contentType = response.headers.get('content-type') || '';
    
    // If it's an M3U8 playlist, we must rewrite the URIs to pass through our proxy
    if (url.includes('.m3u8') || contentType.includes('mpegurl') || contentType.toLowerCase().includes('application/x-mpegurl') || textLooksLikeM3u8(contentType, url)) {
      const text = await response.text();
      // Use response.url as base to correctly handle any redirects that occurred
      const baseUrl = new URL(response.url);
      
      const lines = text.split('\n');
      const rewrittenLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        
        // Handle ANY directive that contains a URI attribute
        if (trimmed.startsWith('#EXT') && trimmed.includes('URI=')) {
           return trimmed.replace(/URI="([^"]+)"/g, (match, uri) => {
             try {
               if (uri.startsWith('data:')) return match; // skip inline data
               const absoluteUri = new URL(uri, baseUrl.href).href;
               const proxyUri = `/api/proxy?url=${encodeURIComponent(absoluteUri)}`;
               return `URI="${proxyUri}"`;
             } catch(e) {
               return match;
             }
           });
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

    // For video segments (.ts) or any other proxied content, stream it back directly.
    // We removed the strict content-type check because many free IPTV servers 
    // misconfigure their headers and return text/plain or missing types for video chunks.
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      }
    });

  } catch (error: any) {
    console.error("Proxy error:", error);
    return new NextResponse(error.message, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// Helper to guess if content is m3u8 if headers are missing
function textLooksLikeM3u8(contentType: string, url: string) {
  return url.toLowerCase().includes('.m3u8');
}
