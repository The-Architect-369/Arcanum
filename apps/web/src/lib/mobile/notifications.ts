"use client";

import { getPersistentValue, listReceipts, setPersistentValue } from "@/lib/mobile/persistence";

export type AppNotification = {
  id: string;
  kind: string;
  title: string;
  body: string;
  createdAt: string;
  level: "info" | "success" | "warning";
};

const LAST_SEEN_KEY = "notifications:last-seen-at";

function levelFromStatus(status: string): AppNotification["level"] {
  if (status === "confirmed") return "success";
  if (status === "error") return "warning";
  return "info";
}

function mapReceiptToNotification(receipt: Awaited<ReturnType<typeof listReceipts>>[number]): AppNotification {
  return {
    id: `receipt:${receipt.id}`,
    kind: receipt.kind,
    title: receipt.title,
    body: receipt.summary ?? "Recorded on this device.",
    createdAt: receipt.createdAt,
    level: levelFromStatus(receipt.status),
  };
}

export async function listAppNotifications(): Promise<AppNotification[]> {
  const receipts = await listReceipts(100);
  return receipts.map(mapReceiptToNotification);
}

export async function getNotificationsLastSeenAt(): Promise<string | null> {
  return getPersistentValue<string>(LAST_SEEN_KEY);
}

export async function markNotificationsSeen(at = new Date().toISOString()) {
  await setPersistentValue(LAST_SEEN_KEY, at);
  return at;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const [notifications, lastSeenAt] = await Promise.all([
    listAppNotifications(),
    getNotificationsLastSeenAt(),
  ]);

  if (!lastSeenAt) return notifications.length;
  return notifications.filter((item) => item.createdAt > lastSeenAt).length;
}
