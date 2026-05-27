import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const ADMIN_EMAIL = 'talent@geonixa.com';

export async function POST(request: NextRequest) {
  try {
    let sessionToken;
    try {
      const body = await request.json();
      sessionToken = body?.sessionToken;
    } catch (e) {
      console.error('Failed to parse request body', e);
      return NextResponse.json(
        { error: 'Invalid request: Failed to parse JSON body', details: String(e) },
        { status: 400 }
      );
    }

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Missing session token in request body' },
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
        { error: 'Invalid token format - could not decode or parse', details: String(e) },
        { status: 400 }
      );
    }

    // Verify token contains correct credentials
    if (decodedToken.email !== ADMIN_EMAIL || !decodedToken.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid credentials', details: `email=${decodedToken.email}, isAdmin=${decodedToken.isAdmin}` },
        { status: 401 }
      );
    }

    // Verify token not expired
    if (Date.now() > decodedToken.expiresAt) {
      return NextResponse.json(
        { error: 'Token expired', details: `expiresAt=${decodedToken.expiresAt}, now=${Date.now()}` },
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
      const cookieErrorMsg = e instanceof Error ? e.message : String(e);
      console.error('Failed to set cookie on response headers', cookieErrorMsg);
      try {
        const logDir = path.resolve(process.cwd(), '.logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const logFile = path.join(logDir, 'admin-session-errors.log');
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Cookie set failed: ${cookieErrorMsg}\n`);
      } catch (writeErr) {
        console.error('Failed to write admin-session error log', writeErr);
      }
      return NextResponse.json({ error: 'Failed to create session cookie', details: cookieErrorMsg }, { status: 500 });
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Session creation error:', errorMsg, { stack: error instanceof Error ? error.stack : 'N/A' });
    try {
      const logDir = path.resolve(process.cwd(), '.logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const logFile = path.join(logDir, 'admin-session-errors.log');
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Session creation exception: ${errorMsg}\n`);
    } catch (writeErr) {
      console.error('Failed to write admin-session error log', writeErr);
    }

    return NextResponse.json(
      { error: 'Internal server error during session creation', details: errorMsg },
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Session verification error:', errorMsg);
    try {
      const logDir = path.resolve(process.cwd(), '.logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const logFile = path.join(logDir, 'admin-session-errors.log');
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Session verification exception: ${errorMsg}\n`);
    } catch (writeErr) {
      console.error('Failed to write admin-session error log', writeErr);
    }
    return NextResponse.json(
      { authenticated: false, error: 'Session verification failed', details: errorMsg },
      { status: 500 }
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
