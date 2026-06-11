import { NextResponse, type NextRequest } from "next/server"

const LOGIN_PATH = "/login"
const SIGNUP_PATH = "/signup"

// 🔐 OPTIONAL: backend auth check endpoint
const AUTH_CHECK_URL = process.env.AUTH_CHECK_URL || "https://your-api.com/auth/check"

/** Prevent caching (VERY IMPORTANT for auth) */
function setNoStore(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store")
  return res
}

/** Check if route is public */
function isPublicRoute(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith(LOGIN_PATH) ||
    pathname.startsWith(SIGNUP_PATH) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  )
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ Allow public routes
  if (isPublicRoute(pathname)) {
    return setNoStore(NextResponse.next())
  }

  // 🔥 STEP 1: Fast cookie check (frontend cookie)
  const userId = req.cookies.get("user_id")?.value
  const authToken = req.cookies.get("auth_token")?.value

  // ❌ If nothing exists → redirect immediately
  if (!userId && !authToken) {
    const loginUrl = new URL(LOGIN_PATH, req.url)
    loginUrl.searchParams.set("next", pathname) // optional redirect back
    return setNoStore(NextResponse.redirect(loginUrl))
  }

  // 🔐 STEP 2: Optional backend validation (recommended for production)
  try {
    const response = await fetch(AUTH_CHECK_URL, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    })

    if (response.status === 401) {
      const loginUrl = new URL(LOGIN_PATH, req.url)
      loginUrl.searchParams.set("next", pathname)

      const res = NextResponse.redirect(loginUrl)

      // 🧹 Cleanup invalid cookies
      res.cookies.delete("user_id")
      res.cookies.delete("auth_token")

      return setNoStore(res)
    }
  } catch (error) {
    // ⚠️ If API fails → fail safe (logout)
    const loginUrl = new URL(LOGIN_PATH, req.url)
    return setNoStore(NextResponse.redirect(loginUrl))
  }

  // ✅ All good → continue
  return setNoStore(NextResponse.next())
}

/** Apply middleware only to protected routes */
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/profile",
    "/settings",
    // add more protected routes here
  ],
}