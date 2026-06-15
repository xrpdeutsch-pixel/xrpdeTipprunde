import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { decrypt, encrypt } from "@/lib/crypto";

export interface WordPressSettings {
  baseUrl: string;
  username: string;
  appPassword: string;
  defaultCategory?: string;
  defaultTags: string[];
  uploadStatus: "draft" | "private" | "publish";
}

/**
 * Returns the WordPress connection configured via the Settings UI (DB,
 * encrypted) or, if none has been saved yet, falls back to the legacy
 * WORDPRESS_* environment variables. Returns null if neither is configured.
 */
export async function getWordPressSettings(): Promise<WordPressSettings | null> {
  const row = await prisma.wordpressConnection.findUnique({ where: { id: "singleton" } });
  if (row) {
    return {
      baseUrl: row.baseUrl.replace(/\/+$/, ""),
      username: row.username,
      appPassword: decrypt(row.appPasswordEnc),
      defaultCategory: row.defaultCategory ?? undefined,
      defaultTags: (row.defaultTags as unknown as string[]) ?? [],
      uploadStatus: (row.uploadStatus as WordPressSettings["uploadStatus"]) ?? "draft",
    };
  }

  const baseUrl = process.env.WORDPRESS_URL;
  const username = process.env.WORDPRESS_USERNAME;
  const appPassword = process.env.WORDPRESS_APP_PASSWORD;
  if (!baseUrl || !username || !appPassword) return null;

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    username,
    appPassword,
    defaultTags: [],
    uploadStatus: "draft",
  };
}

/**
 * Returns the saved WordPress connection without the decrypted application
 * password - safe to send to the frontend.
 */
export async function getWordPressSettingsPublic() {
  const row = await prisma.wordpressConnection.findUnique({ where: { id: "singleton" } });
  if (!row) return null;
  return {
    baseUrl: row.baseUrl,
    username: row.username,
    defaultCategory: row.defaultCategory ?? "",
    defaultTags: (row.defaultTags as unknown as string[]) ?? [],
    uploadStatus: row.uploadStatus,
  };
}

export interface WordPressSettingsInput {
  baseUrl: string;
  username: string;
  /** Optional on update - if omitted, the previously stored password is kept. */
  appPassword?: string;
  defaultCategory?: string;
  defaultTags?: string[];
  uploadStatus?: "draft" | "private" | "publish";
}

export async function saveWordPressSettings(input: WordPressSettingsInput) {
  const existing = await prisma.wordpressConnection.findUnique({ where: { id: "singleton" } });

  const appPasswordEnc = input.appPassword ? encrypt(input.appPassword) : existing?.appPasswordEnc;
  if (!appPasswordEnc) {
    throw new Error("Anwendungspasswort ist erforderlich.");
  }

  const data = {
    baseUrl: input.baseUrl.replace(/\/+$/, ""),
    username: input.username,
    appPasswordEnc,
    defaultCategory: input.defaultCategory || null,
    defaultTags: (input.defaultTags ?? []) as unknown as Prisma.InputJsonValue,
    uploadStatus: input.uploadStatus ?? "draft",
  };

  return prisma.wordpressConnection.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });
}

export interface YoutubeChannelSettings {
  channelName: string;
  handle: string;
  channelUrl: string;
  channelId: string | null;
  active: boolean;
}

const DEFAULT_YOUTUBE_CHANNEL: YoutubeChannelSettings = {
  channelName: "XRP Deutschland",
  handle: "@xrpdeutschland",
  channelUrl: "https://youtube.com/@xrpdeutschland",
  channelId: null,
  active: true,
};

export async function getYoutubeChannelSettings(): Promise<YoutubeChannelSettings> {
  const row = await prisma.youtubeChannel.findUnique({ where: { id: "singleton" } });
  if (!row) return DEFAULT_YOUTUBE_CHANNEL;
  return {
    channelName: row.channelName,
    handle: row.handle,
    channelUrl: row.channelUrl,
    channelId: row.channelId,
    active: row.active,
  };
}

export async function saveYoutubeChannelSettings(
  input: Partial<YoutubeChannelSettings>
): Promise<YoutubeChannelSettings> {
  const current = await getYoutubeChannelSettings();
  const merged = { ...current, ...input };

  const row = await prisma.youtubeChannel.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...merged },
    update: merged,
  });

  return {
    channelName: row.channelName,
    handle: row.handle,
    channelUrl: row.channelUrl,
    channelId: row.channelId,
    active: row.active,
  };
}
