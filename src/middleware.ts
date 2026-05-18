import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  const [scheme, encoded] = authHeader.split(" ");

  if (scheme !== "Basic" || !encoded) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  let decoded = "";
  try {
    decoded = atob(encoded);
  } catch {
    return new NextResponse("Invalid authorization encoding", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  const separatorIndex = decoded.indexOf(":");

  if (separatorIndex === -1) {
    return new NextResponse("Invalid authorization format", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  const expectedUser = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (
    !expectedUser ||
    !expectedPassword ||
    username !== expectedUser ||
    password !== expectedPassword
  ) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};