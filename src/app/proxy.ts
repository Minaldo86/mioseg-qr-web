import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vorübergehend offline</title>
        <style>
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #0f1115;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
          }
          .box {
            padding: 32px;
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 18px;
            background: rgba(255,255,255,0.04);
            max-width: 520px;
            margin: 20px;
          }
          h1 {
            margin: 0 0 12px 0;
            font-size: 32px;
          }
          p {
            margin: 0;
            font-size: 16px;
            line-height: 1.5;
            color: rgba(255,255,255,0.82);
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>Website vorübergehend offline</h1>
          <p>Diese Website ist aktuell nicht öffentlich erreichbar und kommt bald wieder online.</p>
        </div>
      </body>
    </html>
    `,
    {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}

export const config = {
  matcher: "/:path*",
};