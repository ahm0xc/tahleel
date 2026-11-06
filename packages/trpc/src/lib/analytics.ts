import { db, schema } from "@repo/db";
import { count, eq, sql } from "drizzle-orm";

import {
  type UserProfile,
  getClerkClient,
  getUsersProfiles,
} from "./clerk-users.js";
import { addDays, todayInUTC } from "./days.js";

const { dailyProgress, userStreaks, friendships, invites, pushTokens } = schema;

export interface DailyReaderLeaderboardEntry {
  userId: string;
  displayName: string;
  imageUrl: string | null;
  versesRead: number;
  hasanatEarned: number;
  timeSpentSeconds: number;
  completed: boolean;
}

export interface DailyEngagementSummary {
  date: string;
  generatedAt: string;
  activity: {
    activeUsers: number;
    versesRead: number;
    hasanatEarned: number;
    timeSpentSeconds: number;
    goalsCompleted: number;
    goalsInProgress: number;
    completionRatePercentage: number;
  };
  streaks: {
    totalTrackedStreaks: number;
    activeStreaksCount: number;
    streaksMaintainedOnDate: number;
    longestActiveStreak: number;
  };
  social: {
    newFriendshipsOnDate: number;
    totalFriendships: number;
    newInvitesOnDate: number;
    totalInvites: number;
  };
  devices: {
    totalPushTokens: number;
    iosCount: number;
    androidCount: number;
    updatedOnDate: number;
  };
  users: {
    totalRegisteredUsers: number | null;
    newSignupsOnDate: number | null;
  };
  topReaders: DailyReaderLeaderboardEntry[];
}

export async function getDailyEngagementSummary(options?: {
  date?: string;
}): Promise<DailyEngagementSummary> {
  const targetDate = options?.date ?? addDays(todayInUTC(), -1);

  const dayStart = new Date(`${targetDate}T00:00:00.000Z`);
  const dayEnd = new Date(`${targetDate}T23:59:59.999Z`);

  // 1. Activity for the day from dailyProgress
  const activityRows = await db
    .select({
      userId: dailyProgress.userId,
      versesRead: dailyProgress.versesRead,
      hasanatEarned: dailyProgress.hasanatEarned,
      timeSpent: dailyProgress.timeSpent,
      completed: dailyProgress.completed,
    })
    .from(dailyProgress)
    .where(eq(dailyProgress.day, targetDate));

  const activeUsers = activityRows.length;
  const versesRead = activityRows.reduce(
    (sum, r) => sum + (r.versesRead ?? 0),
    0
  );
  const hasanatEarned = activityRows.reduce(
    (sum, r) => sum + (r.hasanatEarned ?? 0),
    0
  );
  const timeSpentSeconds = activityRows.reduce(
    (sum, r) => sum + (r.timeSpent ?? 0),
    0
  );
  const goalsCompleted = activityRows.filter((r) => r.completed).length;
  const goalsInProgress = activeUsers - goalsCompleted;
  const completionRatePercentage =
    activeUsers > 0 ? Math.round((goalsCompleted / activeUsers) * 100) : 0;

  // Top readers for the day
  const sortedReaders = [...activityRows].sort(
    (a, b) => b.hasanatEarned - a.hasanatEarned
  );
  const topSlice = sortedReaders.slice(0, 5);
  const topUserIds = topSlice.map((r) => r.userId);
  const profiles = await getUsersProfiles(topUserIds);
  const profileMap = new Map<string, UserProfile>(
    profiles.map((p) => [p.userId, p])
  );

  const topReaders: DailyReaderLeaderboardEntry[] = topSlice.map((r) => {
    const profile = profileMap.get(r.userId);
    return {
      userId: r.userId,
      displayName: profile?.displayName ?? `User ${r.userId.slice(-6)}`,
      imageUrl: profile?.imageUrl ?? null,
      versesRead: r.versesRead,
      hasanatEarned: r.hasanatEarned,
      timeSpentSeconds: r.timeSpent,
      completed: r.completed,
    };
  });

  // 2. Streaks status
  const streakRows = await db
    .select({
      userId: userStreaks.userId,
      currentStreak: userStreaks.currentStreak,
      longestStreak: userStreaks.longestStreak,
      lastCompletedDay: userStreaks.lastCompletedDay,
    })
    .from(userStreaks);

  const totalTrackedStreaks = streakRows.length;
  const streaksMaintainedOnDate = streakRows.filter(
    (r) => r.lastCompletedDay === targetDate && (r.currentStreak ?? 0) > 0
  ).length;

  const yesterdayOfTarget = addDays(targetDate, -1);
  const activeStreaksCount = streakRows.filter(
    (r) =>
      (r.currentStreak ?? 0) > 0 &&
      r.lastCompletedDay &&
      (r.lastCompletedDay === targetDate ||
        r.lastCompletedDay === yesterdayOfTarget)
  ).length;

  const longestActiveStreak = streakRows.reduce(
    (max, r) => Math.max(max, r.currentStreak ?? 0),
    0
  );

  // 3. Social connections
  const [friendshipStats] = await db
    .select({
      total: count(),
      newOnDate: count(
        sql`case when ${friendships.connectedAt} >= ${dayStart} and ${friendships.connectedAt} <= ${dayEnd} then 1 end`
      ),
    })
    .from(friendships);

  // 4. Invites
  const [inviteStats] = await db
    .select({
      total: count(),
      newOnDate: count(
        sql`case when ${invites.createdAt} >= ${dayStart} and ${invites.createdAt} <= ${dayEnd} then 1 end`
      ),
    })
    .from(invites);

  // 5. Push tokens
  const tokenRows = await db
    .select({
      platform: pushTokens.platform,
      updatedAt: pushTokens.updatedAt,
    })
    .from(pushTokens);

  const totalPushTokens = tokenRows.length;
  const iosCount = tokenRows.filter((r) => r.platform === "ios").length;
  const androidCount = tokenRows.filter((r) => r.platform === "android").length;
  const updatedOnDate = tokenRows.filter(
    (r) => r.updatedAt && r.updatedAt >= dayStart && r.updatedAt <= dayEnd
  ).length;

  // 6. Clerk registered users & new signups
  let totalRegisteredUsers: number | null = null;
  let newSignupsOnDate: number | null = null;

  const clerkClient = getClerkClient();
  if (clerkClient) {
    try {
      totalRegisteredUsers = await clerkClient.users.getCount();

      const startMs = dayStart.getTime();
      const endMs = dayEnd.getTime();
      let offset = 0;
      let matchingSignups = 0;
      const pageSize = 100;
      while (true) {
        const page = await clerkClient.users.getUserList({
          limit: pageSize,
          offset,
          orderBy: "-created_at",
        });
        matchingSignups += page.data.filter(
          (u) => u.createdAt >= startMs && u.createdAt <= endMs
        ).length;
        if (page.data.length < pageSize || page.data[page.data.length - 1]!.createdAt < startMs) break;
        offset += pageSize;
      }
      newSignupsOnDate = matchingSignups;
    } catch (err) {
      console.warn("[analytics] Could not fetch Clerk user counts:", err);
    }
  }

  return {
    date: targetDate,
    generatedAt: new Date().toISOString(),
    activity: {
      activeUsers,
      versesRead,
      hasanatEarned,
      timeSpentSeconds,
      goalsCompleted,
      goalsInProgress,
      completionRatePercentage,
    },
    streaks: {
      totalTrackedStreaks,
      activeStreaksCount,
      streaksMaintainedOnDate,
      longestActiveStreak,
    },
    social: {
      newFriendshipsOnDate: Number(friendshipStats?.newOnDate ?? 0),
      totalFriendships: Number(friendshipStats?.total ?? 0),
      newInvitesOnDate: Number(inviteStats?.newOnDate ?? 0),
      totalInvites: Number(inviteStats?.total ?? 0),
    },
    devices: {
      totalPushTokens,
      iosCount,
      androidCount,
      updatedOnDate,
    },
    users: {
      totalRegisteredUsers,
      newSignupsOnDate,
    },
    topReaders,
  };
}

export function formatDailySummaryDiscordEmbed(
  summary: DailyEngagementSummary
) {
  const topReadersText =
    summary.topReaders.length > 0
      ? summary.topReaders
          .map(
            (r, i) =>
              `${i + 1}. **${r.displayName}** — ${r.hasanatEarned.toLocaleString()} hasanat (${r.versesRead} verses${r.completed ? " ✅" : ""})`
          )
          .join("\n")
      : "_No reading recorded on this date._";

  const totalMinutes = Math.round(summary.activity.timeSpentSeconds / 60);

  return {
    embeds: [
      {
        title: `📊 Tahleel Daily Engagement — ${summary.date}`,
        description:
          "Daily digest of reading habits, streaks, and community engagement.",
        color: 0x10b981, // Emerald green
        timestamp: new Date().toISOString(),
        fields: [
          {
            name: "📖 Reading Activity",
            value: [
              `• **Active Readers:** ${summary.activity.activeUsers}`,
              `• **Verses Read:** ${summary.activity.versesRead.toLocaleString()}`,
              `• **Hasanat Earned:** ${summary.activity.hasanatEarned.toLocaleString()}`,
              `• **Time Spent:** ${totalMinutes} mins`,
              `• **Goals Completed:** ${summary.activity.goalsCompleted} / ${summary.activity.activeUsers} (${summary.activity.completionRatePercentage}%)`,
            ].join("\n"),
            inline: false,
          },
          {
            name: "🔥 Habit & Streaks",
            value: [
              `• **Maintained on Date:** ${summary.streaks.streaksMaintainedOnDate}`,
              `• **Active Streaks:** ${summary.streaks.activeStreaksCount}`,
              `• **Longest Active:** ${summary.streaks.longestActiveStreak} days`,
              `• **Tracked Streaks:** ${summary.streaks.totalTrackedStreaks}`,
            ].join("\n"),
            inline: true,
          },
          {
            name: "🤝 Social & Growth",
            value: [
              `• **New Friends:** ${summary.social.newFriendshipsOnDate}`,
              `• **Total Friendships:** ${summary.social.totalFriendships}`,
              `• **New Invites:** ${summary.social.newInvitesOnDate}`,
              `• **Push Devices:** ${summary.devices.totalPushTokens} (${summary.devices.iosCount} iOS, ${summary.devices.androidCount} Android)`,
              ...(summary.users.newSignupsOnDate !== null
                ? [`• **New Signups:** ${summary.users.newSignupsOnDate}`]
                : []),
              ...(summary.users.totalRegisteredUsers !== null
                ? [
                    `• **Total Users:** ${summary.users.totalRegisteredUsers.toLocaleString()}`,
                  ]
                : []),
            ].join("\n"),
            inline: true,
          },
          {
            name: "🏆 Top Readers of the Day",
            value: topReadersText,
            inline: false,
          },
        ],
        footer: {
          text: "Tahleel Analytics • Automated via n8n",
        },
      },
    ],
  };
}

export async function sendDailySummaryToDiscord(
  summary: DailyEngagementSummary,
  customWebhookUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl =
    customWebhookUrl ||
    process.env.DISCORD_ANALYTICS_WEBHOOK_URL ||
    process.env.DISCORD_FEEDBACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      success: false,
      error:
        "No Discord webhook configured (set DISCORD_ANALYTICS_WEBHOOK_URL or DISCORD_FEEDBACK_WEBHOOK_URL).",
    };
  }

  const payload = formatDailySummaryDiscordEmbed(summary);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return {
        success: false,
        error: `Discord webhook returned status ${response.status}: ${errText}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
