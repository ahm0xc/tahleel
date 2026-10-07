import SwiftUI
import WidgetKit

enum StreaksStore {
  static let appGroupIdentifier = "group.io.somossa.tahleel"
  static let currentStreakKey = "currentStreak"
  static let lastCompletedDayKey = "lastCompletedDay"

  static func currentStreak() -> Int {
    guard
      let defaults = UserDefaults(suiteName: appGroupIdentifier),
      let lastCompletedDay = defaults.string(forKey: lastCompletedDayKey),
      let completedDate = date(from: lastCompletedDay)
    else {
      return 0
    }

    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = TimeZone(identifier: "UTC")!
    let daysSinceCompletion =
      calendar.dateComponents([.day], from: completedDate, to: .now).day ?? Int.max

    guard (0...1).contains(daysSinceCompletion) else {
      return 0
    }

    return defaults.integer(forKey: currentStreakKey)
  }

  private static func date(from day: String) -> Date? {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = TimeZone(identifier: "UTC")
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.date(from: day)
  }
}

struct StreaksEntry: TimelineEntry {
  let date: Date
  let currentStreak: Int
}

struct StreaksProvider: TimelineProvider {
  func placeholder(in context: Context) -> StreaksEntry {
    StreaksEntry(date: .now, currentStreak: 7)
  }

  func getSnapshot(
    in context: Context,
    completion: @escaping (StreaksEntry) -> Void
  ) {
    completion(loadEntry())
  }

  func getTimeline(
    in context: Context,
    completion: @escaping (Timeline<StreaksEntry>) -> Void
  ) {
    let nextUpdate =
      Calendar.current.date(byAdding: .hour, value: 1, to: .now)
      ?? Date().addingTimeInterval(3600)

    completion(Timeline(entries: [loadEntry()], policy: .after(nextUpdate)))
  }

  private func loadEntry() -> StreaksEntry {
    StreaksEntry(date: .now, currentStreak: StreaksStore.currentStreak())
  }
}

struct StreaksWidgetContent: View {
  let value: Int

  var body: some View {
    HStack(spacing: 8) {
      Image("fire")
        .resizable()
        .scaledToFit()
        .frame(width: 44, height: 44)

      Text("\(value)")
        .font(.system(size: 46, weight: .bold, design: .rounded))
        .foregroundStyle(.white)
        .minimumScaleFactor(0.5)
        .lineLimit(1)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
}

struct StreaksWidgetBackground: View {
  var body: some View {
    Image("streaks-widget-background")
      .resizable()
      .scaledToFill()
  }
}
