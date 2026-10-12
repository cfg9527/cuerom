export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/today/:path*",
    "/habits/:path*",
    "/environments/:path*",
    "/settings/:path*",
    "/review/:path*",
    "/templates/:path*",
    "/onboarding/:path*",
  ],
};
