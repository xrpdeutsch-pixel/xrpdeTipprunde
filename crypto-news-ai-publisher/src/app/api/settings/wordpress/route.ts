import { NextResponse } from "next/server";
import { getWordPressSettingsPublic, saveWordPressSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getWordPressSettingsPublic();
  if (!settings) return NextResponse.json({ configured: false });
  return NextResponse.json({ configured: true, ...settings });
}

export async function PUT(request: Request) {
  const body = await request.json();

  if (!body.baseUrl || !body.username) {
    return NextResponse.json(
      { error: "WordPress-URL und Benutzername sind erforderlich." },
      { status: 400 }
    );
  }

  try {
    await saveWordPressSettings({
      baseUrl: body.baseUrl,
      username: body.username,
      appPassword: body.appPassword || undefined,
      defaultCategory: body.defaultCategory || undefined,
      defaultTags: Array.isArray(body.defaultTags) ? body.defaultTags : [],
      uploadStatus: body.uploadStatus,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
