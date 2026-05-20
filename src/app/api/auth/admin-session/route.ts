import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const ADMIN_EMAIL = 'talent@geonixa.com';

export async function POST(request: NextRequest) {
  try {
    const { sessionToken } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Missing session token' },
        { status: 400 }
      );
    }

    // Verify token format and content
    let decodedToken;
    try {
      const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
      decodedToken = JSON.parse(decoded);
    } catch (e) {
      console.error('Invalid token format or JSON parse error', e, { sessionToken });
      try {
        const logDir = path.resolve(process.cwd(), '.logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const logFile = path.join(logDir, 'admin-session-errors.log');
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Invalid token parse: ${String(e)} - token: ${String(sessionToken)}\n`);
      } catch (writeErr) {
        console.error('Failed to write admin-session error log', writeErr);
      }

      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Verify token contains correct credentials
    if (decodedToken.email !== ADMIN_EMAIL || !decodedToken.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token not expired
    if (Date.now() > decodedToken.expiresAt) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    // Create secure HTTP-only cookie
    const maxAgeSeconds = Math.floor((decodedToken.expiresAt - Date.now()) / 1000);
    if (isNaN(maxAgeSeconds) || maxAgeSeconds <= 0) {
      console.error('Invalid expiry for session token', { decodedToken });
      return NextResponse.json({ error: 'Token expired or invalid expiry' }, { status: 400 });
    }

    // Set the cookie on the response object using explicit Set-Cookie header
    try {
      const response = new NextResponse(
        JSON.stringify({
          success: true,
          message: 'Admin session created'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const secureFlag = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
      response.headers.append(
        'Set-Cookie',
        `admin_session=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${maxAgeSeconds}`
      );

      return response;
    } catch (e) {
      console.error('Failed to set cookie on response headers', e);
      try {
        const logDir = path.resolve(process.cwd(), '.logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const logFile = path.join(logDir, 'admin-session-errors.log');
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Cookie set failed: ${String(e)} - token: ${String(sessionToken)}\n`);
      } catch (writeErr) {
        console.error('Failed to write admin-session error log', writeErr);
      }
      return NextResponse.json({ error: 'Failed to create session cookie' }, { status: 500 });
    }

  } catch (error) {
    console.error('Session creation error:', error);
    try {
      const logDir = path.resolve(process.cwd(), '.logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const logFile = path.join(logDir, 'admin-session-errors.log');
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Session creation exception: ${String(error)}\n`);
    } catch (writeErr) {
      console.error('Failed to write admin-session error log', writeErr);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to verify admin session
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get('admin_session')?.value;
    const sessionToken = rawToken ? decodeURIComponent(rawToken) : undefined;

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Verify token
    let decodedToken;
    try {
      const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
      decodedToken = JSON.parse(decoded);
    } catch (e) {
      console.error('Invalid session token in cookie', e);
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify not expired
    if (Date.now() > decodedToken.expiresAt) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        authenticated: true,
        email: decodedToken.email
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session verification error:', error);
    try {
      const logDir = path.resolve(process.cwd(), '.logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const logFile = path.join(logDir, 'admin-session-errors.log');
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Session verification exception: ${String(error)}\n`);
    } catch (writeErr) {
      console.error('Failed to write admin-session error log', writeErr);
    }
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}

// DELETE endpoint to logout
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json(
    { success: true, message: 'Logged out' },
    { status: 200 }
  );
  response.cookies.delete('admin_session');
  return response;
}
