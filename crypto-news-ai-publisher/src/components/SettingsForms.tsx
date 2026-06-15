"use client";

import { FormEvent, useEffect, useState } from "react";

interface WpForm {
  baseUrl: string;
  username: string;
  appPassword: string;
  defaultCategory: string;
  defaultTags: string;
  uploadStatus: "draft" | "private" | "publish";
}

interface YtForm {
  channelName: string;
  handle: string;
  channelUrl: string;
  active: boolean;
}

const EMPTY_WP: WpForm = {
  baseUrl: "",
  username: "",
  appPassword: "",
  defaultCategory: "",
  defaultTags: "",
  uploadStatus: "draft",
};

function StatusMessage({ result }: { result: { success: boolean; message: string } | null }) {
  if (!result) return null;
  return (
    <p
      className={`mt-2 text-sm ${
        result.success
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {result.message}
    </p>
  );
}

export default function SettingsForms() {
  const [wp, setWp] = useState<WpForm>(EMPTY_WP);
  const [wpConfigured, setWpConfigured] = useState(false);
  const [wpSaving, setWpSaving] = useState(false);
  const [wpTesting, setWpTesting] = useState(false);
  const [wpSaveResult, setWpSaveResult] = useState<{ success: boolean; message: string } | null>(
    null
  );
  const [wpTestResult, setWpTestResult] = useState<{ success: boolean; message: string } | null>(
    null
  );

  const [yt, setYt] = useState<YtForm>({
    channelName: "XRP Deutschland",
    handle: "@xrpdeutschland",
    channelUrl: "https://youtube.com/@xrpdeutschland",
    active: true,
  });
  const [ytSaving, setYtSaving] = useState(false);
  const [ytTesting, setYtTesting] = useState(false);
  const [ytSaveResult, setYtSaveResult] = useState<{ success: boolean; message: string } | null>(
    null
  );
  const [ytTestResult, setYtTestResult] = useState<{ success: boolean; message: string } | null>(
    null
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings/wordpress").then((r) => r.json()),
      fetch("/api/settings/youtube").then((r) => r.json()),
    ]).then(([wpData, ytData]) => {
      if (wpData.configured) {
        setWpConfigured(true);
        setWp({
          baseUrl: wpData.baseUrl ?? "",
          username: wpData.username ?? "",
          appPassword: "",
          defaultCategory: wpData.defaultCategory ?? "",
          defaultTags: (wpData.defaultTags ?? []).join(", "),
          uploadStatus: wpData.uploadStatus ?? "draft",
        });
      }
      setYt({
        channelName: ytData.channelName ?? "XRP Deutschland",
        handle: ytData.handle ?? "@xrpdeutschland",
        channelUrl: ytData.channelUrl ?? "https://youtube.com/@xrpdeutschland",
        active: ytData.active ?? true,
      });
      setLoaded(true);
    });
  }, []);

  const saveWordPress = async (e: FormEvent) => {
    e.preventDefault();
    setWpSaving(true);
    setWpSaveResult(null);
    try {
      const res = await fetch("/api/settings/wordpress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: wp.baseUrl,
          username: wp.username,
          appPassword: wp.appPassword || undefined,
          defaultCategory: wp.defaultCategory || undefined,
          defaultTags: wp.defaultTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          uploadStatus: wp.uploadStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Speichern fehlgeschlagen.");
      setWpConfigured(true);
      setWp((prev) => ({ ...prev, appPassword: "" }));
      setWpSaveResult({ success: true, message: "WordPress-Verbindung gespeichert." });
    } catch (err) {
      setWpSaveResult({
        success: false,
        message: err instanceof Error ? err.message : "Unbekannter Fehler",
      });
    } finally {
      setWpSaving(false);
    }
  };

  const testWordPress = async () => {
    setWpTesting(true);
    setWpTestResult(null);
    try {
      const body =
        wp.appPassword && wp.baseUrl && wp.username
          ? { baseUrl: wp.baseUrl, username: wp.username, appPassword: wp.appPassword }
          : {};
      const res = await fetch("/api/settings/wordpress/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setWpTestResult(data);
    } catch (err) {
      setWpTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Unbekannter Fehler",
      });
    } finally {
      setWpTesting(false);
    }
  };

  const saveYoutube = async (e: FormEvent) => {
    e.preventDefault();
    setYtSaving(true);
    setYtSaveResult(null);
    setYtTestResult(null);
    try {
      const res = await fetch("/api/settings/youtube", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(yt),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Speichern fehlgeschlagen.");
      setYtSaveResult({ success: true, message: "YouTube-Kanal gespeichert." });
    } catch (err) {
      setYtSaveResult({
        success: false,
        message: err instanceof Error ? err.message : "Unbekannter Fehler",
      });
    } finally {
      setYtSaving(false);
    }
  };

  const testYoutube = async () => {
    setYtTesting(true);
    setYtTestResult(null);
    try {
      const res = await fetch("/api/settings/youtube/test", { method: "POST" });
      const data = await res.json();
      setYtTestResult(data);
    } catch (err) {
      setYtTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Unbekannter Fehler",
      });
    } finally {
      setYtTesting(false);
    }
  };

  if (!loaded) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800">
        Lade Einstellungen...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={saveWordPress}
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-800"
      >
        <div>
          <h2 className="text-base font-semibold">WordPress-Verbindung</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {wpConfigured
              ? "Verbindung ist gespeichert. Anwendungspasswort nur eingeben, um es zu ändern."
              : "Noch keine Verbindung gespeichert."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">WordPress-URL</span>
            <input
              type="url"
              required
              placeholder="https://example.com"
              value={wp.baseUrl}
              onChange={(e) => setWp((p) => ({ ...p, baseUrl: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Benutzername</span>
            <input
              type="text"
              required
              value={wp.username}
              onChange={(e) => setWp((p) => ({ ...p, username: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Anwendungspasswort</span>
            <input
              type="password"
              placeholder={wpConfigured ? "•••••••• (unverändert lassen)" : ""}
              required={!wpConfigured}
              value={wp.appPassword}
              onChange={(e) => setWp((p) => ({ ...p, appPassword: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <span className="mt-1 block text-xs text-zinc-500">
              WordPress → Benutzer → Profil → Anwendungspasswörter
            </span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Standard-Kategorie</span>
            <input
              type="text"
              placeholder="z.B. Kryptowährungen"
              value={wp.defaultCategory}
              onChange={(e) => setWp((p) => ({ ...p, defaultCategory: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Standard-Tags (kommagetrennt)</span>
            <input
              type="text"
              placeholder="z.B. XRP, Ripple, Krypto"
              value={wp.defaultTags}
              onChange={(e) => setWp((p) => ({ ...p, defaultTags: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Upload-Status</span>
            <select
              value={wp.uploadStatus}
              onChange={(e) =>
                setWp((p) => ({ ...p, uploadStatus: e.target.value as WpForm["uploadStatus"] }))
              }
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="draft">Entwurf (empfohlen)</option>
              <option value="private">Privat</option>
              <option value="publish">Veröffentlicht</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={wpSaving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
          >
            {wpSaving ? "Speichern..." : "Speichern"}
          </button>
          <button
            type="button"
            onClick={testWordPress}
            disabled={wpTesting || (!wpConfigured && (!wp.baseUrl || !wp.username || !wp.appPassword))}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:border-emerald-400 disabled:opacity-50 dark:border-zinc-700"
          >
            {wpTesting ? "Teste..." : "Verbindung testen"}
          </button>
        </div>
        <StatusMessage result={wpSaveResult} />
        <StatusMessage result={wpTestResult} />
      </form>

      <form
        onSubmit={saveYoutube}
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-800"
      >
        <div>
          <h2 className="text-base font-semibold">YouTube-Kanal</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Wird täglich auf neue Videos geprüft - daraus wird automatisch ein Artikel erstellt.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Kanalname</span>
            <input
              type="text"
              required
              value={yt.channelName}
              onChange={(e) => setYt((p) => ({ ...p, channelName: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Handle</span>
            <input
              type="text"
              required
              placeholder="@xrpdeutschland"
              value={yt.handle}
              onChange={(e) => setYt((p) => ({ ...p, handle: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Kanal-URL</span>
            <input
              type="url"
              required
              value={yt.channelUrl}
              onChange={(e) => setYt((p) => ({ ...p, channelUrl: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={yt.active}
              onChange={(e) => setYt((p) => ({ ...p, active: e.target.checked }))}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="font-medium">Tägliche Überwachung aktiv</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={ytSaving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
          >
            {ytSaving ? "Speichern..." : "Speichern"}
          </button>
          <button
            type="button"
            onClick={testYoutube}
            disabled={ytTesting}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:border-emerald-400 disabled:opacity-50 dark:border-zinc-700"
          >
            {ytTesting ? "Teste..." : "Verbindung testen"}
          </button>
        </div>
        <StatusMessage result={ytSaveResult} />
        <StatusMessage result={ytTestResult} />
      </form>
    </div>
  );
}
