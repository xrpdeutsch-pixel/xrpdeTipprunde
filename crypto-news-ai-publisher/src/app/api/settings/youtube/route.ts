import { NextResponse } from "next/server";
import { getYoutubeChannelSettings, saveYoutubeChannelSettings } from "@/lib/settings";

export async function GET() {
  return NextResponse.json(await getYoutubeChannelSettings());
}

export async function PUT(request: Request) {
  const body = await request.json();

  if (!body.handle && !body.channelUrl) {
    return NextResponse.json(
      { error: "Kanal-Handle oder Kanal-URL ist erforderlich." },
      { status: 400 }
    );
  }

  const saved = await saveYoutubeChannelSettings({
    channelName: body.channelName,
    handle: body.handle,
    channelUrl: body.channelUrl,
    active: body.active ?? true,
    // Reset the cached channel ID so the next test/cron run re-resolves it.
    channelId: null,
  });

  return NextResponse.json(saved);
}
