import SwiftUI
import WidgetKit

struct StreaksWidgetEntryView: View {
  var entry: StreaksEntry

  var body: some View {
    StreaksWidgetContent(value: entry.currentStreak)
      .containerBackground(for: .widget) {
        StreaksWidgetBackground()
      }
  }
}

struct StreaksWidget: Widget {
  let kind = "StreaksWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: StreaksProvider()) { entry in
      StreaksWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Streaks")
    .description("Your current Quran reading streak.")
    .supportedFamilies([.systemSmall])
  }
}

#Preview(as: .systemSmall) {
  StreaksWidget()
} timeline: {
  StreaksEntry(date: .now, currentStreak: 7)
  StreaksEntry(date: .now, currentStreak: 0)
}
