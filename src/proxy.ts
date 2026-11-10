import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Renova a sessão do Supabase a cada requisição. */
export async function proxy(request: NextRequest) {
  // Endereço da página, usado pelo modo manutenção no layout
  request.headers.set("x-cc-path", request.nextUrl.pathname);
  request.headers.set("x-cc-search", request.nextUrl.search);
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|img/|raven-questions/|midia/|admin/midia/enviar|icon.png|apple-icon.png|opengraph-image|robots.txt|sitemap.xml).*)",
  ],
};
