import { validateRequest } from "@/auth";
import { streamServerClient } from "@/lib/stream";
import { headers } from "next/headers";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate token expiration (24 hours)
    const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    // Generate token with longer expiration
    const token = streamServerClient.createToken(user.id, expirationTime, issuedAt);

    // Set cache headers
    const response = Response.json({ token });
    response.headers.set('Cache-Control', 'private, max-age=82800'); // 23 hours

    return response;
  } catch (error) {
    console.error("Error generating token:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}