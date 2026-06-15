import { NextResponse } from "next/server";
import { getWordPressSettings } from "@/lib/settings";
import { testWordPressConnection } from "@/lib/wordpress";

/**
 * Tests a WordPress connection. If baseUrl/username/appPassword are supplied
 * in the request body, those (unsaved) values are tested - otherwise the
 * saved connection is used.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const settings =
    body?.baseUrl && body?.username && body?.appPassword
      ? {
          baseUrl: String(body.baseUrl).replace(/\/+$/, ""),
          username: String(body.username),
          appPassword: String(body.appPassword),
        }
      : await getWordPressSettings();

  if (!settings) {
    return NextResponse.json(
      { success: false, message: "Keine WordPress-Zugangsdaten vorhanden." },
      { status: 400 }
    );
  }

  const result = await testWordPressConnection(settings);
  return NextResponse.json(result);
}
