// Worldly home-screen widget: countries explored + next-trip countdown.
// Reads the JSON the app writes into the shared app group (see
// components/WidgetSync.tsx); shows gracefully empty states before first sync.
import WidgetKit
import SwiftUI

private let APP_GROUP = "group.com.simmyd23.worldly"

// Brand palette (mirrors src/lib/theme.ts).
private let NAVY = Color(red: 0.078, green: 0.129, blue: 0.239)
private let NAVY_DEEP = Color(red: 0.051, green: 0.086, blue: 0.169)
private let CORAL = Color(red: 1.0, green: 0.42, blue: 0.604)
private let AQUA = Color(red: 0.141, green: 0.82, blue: 0.765)
private let LAVENDER = Color(red: 0.608, green: 0.486, blue: 1.0)

struct WorldlyEntry: TimelineEntry {
  let date: Date
  let countries: Int
  let cities: Int
  let level: Int
  let tripTitle: String?
  let tripDays: Int?
}

private func loadEntry() -> WorldlyEntry {
  var countries = 0
  var cities = 0
  var level = 0
  var tripTitle: String? = nil
  var tripDays: Int? = nil

  if let defaults = UserDefaults(suiteName: APP_GROUP),
     let json = defaults.string(forKey: "widgetData"),
     let data = json.data(using: .utf8),
     let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
    countries = (obj["countries"] as? NSNumber)?.intValue ?? 0
    cities = (obj["cities"] as? NSNumber)?.intValue ?? 0
    level = (obj["level"] as? NSNumber)?.intValue ?? 0
    if let title = obj["nextTripTitle"] as? String, !title.isEmpty {
      tripTitle = title
    }
    if let iso = obj["nextTripDate"] as? String {
      let fmt = DateFormatter()
      fmt.dateFormat = "yyyy-MM-dd"
      fmt.timeZone = TimeZone.current
      if let when = fmt.date(from: iso) {
        let days = Calendar.current.dateComponents(
          [.day],
          from: Calendar.current.startOfDay(for: Date()),
          to: Calendar.current.startOfDay(for: when)
        ).day ?? 0
        if days >= 0 { tripDays = days } else { tripTitle = nil }
      }
    }
  }
  return WorldlyEntry(date: Date(), countries: countries, cities: cities, level: level, tripTitle: tripTitle, tripDays: tripDays)
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> WorldlyEntry {
    WorldlyEntry(date: Date(), countries: 23, cities: 61, level: 6, tripTitle: "Japan", tripDays: 12)
  }

  func getSnapshot(in context: Context, completion: @escaping (WorldlyEntry) -> Void) {
    completion(context.isPreview ? placeholder(in: context) : loadEntry())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<WorldlyEntry>) -> Void) {
    let entry = loadEntry()
    // Refresh after midnight so "in N days" stays right even without app opens.
    let midnight = Calendar.current.startOfDay(for: Date()).addingTimeInterval(24 * 3600 + 60)
    completion(Timeline(entries: [entry], policy: .after(midnight)))
  }
}

private struct Eyebrow: View {
  var body: some View {
    Text("WORLDLY")
      .font(.system(size: 10, weight: .heavy))
      .kerning(2)
      .foregroundColor(CORAL)
  }
}

private struct TripLine: View {
  let title: String
  let days: Int?
  var body: some View {
    HStack(spacing: 4) {
      Image(systemName: "airplane.departure")
        .font(.system(size: 10, weight: .bold))
        .foregroundColor(AQUA)
      Text(days == 0 ? "\(title) · today!" : days == 1 ? "\(title) · tomorrow" : days != nil ? "\(title) · \(days!) days" : title)
        .font(.system(size: 11, weight: .semibold))
        .foregroundColor(.white.opacity(0.92))
        .lineLimit(1)
    }
  }
}

struct SmallView: View {
  let entry: WorldlyEntry
  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      Eyebrow()
      Spacer()
      Text("\(entry.countries)")
        .font(.system(size: 44, weight: .bold, design: .serif))
        .foregroundColor(.white)
      Text(entry.countries == 1 ? "country explored" : "countries explored")
        .font(.system(size: 11, weight: .medium))
        .foregroundColor(.white.opacity(0.72))
      Spacer()
      if let title = entry.tripTitle {
        TripLine(title: title, days: entry.tripDays)
      } else if entry.level > 0 {
        Text("Level \(entry.level) explorer")
          .font(.system(size: 11, weight: .semibold))
          .foregroundColor(LAVENDER)
      } else {
        Text("Open Worldly to sync")
          .font(.system(size: 11))
          .foregroundColor(.white.opacity(0.55))
      }
    }
  }
}

struct MediumView: View {
  let entry: WorldlyEntry
  var body: some View {
    HStack(alignment: .center, spacing: 16) {
      VStack(alignment: .leading, spacing: 0) {
        Eyebrow()
        Spacer()
        HStack(alignment: .firstTextBaseline, spacing: 14) {
          VStack(alignment: .leading, spacing: 1) {
            Text("\(entry.countries)")
              .font(.system(size: 34, weight: .bold, design: .serif))
              .foregroundColor(.white)
            Text("countries")
              .font(.system(size: 10, weight: .medium))
              .foregroundColor(.white.opacity(0.72))
          }
          VStack(alignment: .leading, spacing: 1) {
            Text("\(entry.cities)")
              .font(.system(size: 34, weight: .bold, design: .serif))
              .foregroundColor(AQUA)
            Text("cities")
              .font(.system(size: 10, weight: .medium))
              .foregroundColor(.white.opacity(0.72))
          }
        }
        Spacer()
        if entry.level > 0 {
          Text("Level \(entry.level) explorer")
            .font(.system(size: 11, weight: .semibold))
            .foregroundColor(LAVENDER)
        }
      }
      Spacer()
      if let title = entry.tripTitle, let days = entry.tripDays {
        VStack(alignment: .trailing, spacing: 2) {
          Text("NEXT TRIP")
            .font(.system(size: 9, weight: .heavy))
            .kerning(1.5)
            .foregroundColor(.white.opacity(0.6))
          Text(days == 0 ? "Today" : "\(days)")
            .font(.system(size: days == 0 ? 24 : 38, weight: .bold, design: .serif))
            .foregroundColor(CORAL)
          Text(days == 0 ? title : days == 1 ? "day · \(title)" : "days · \(title)")
            .font(.system(size: 11, weight: .semibold))
            .foregroundColor(.white.opacity(0.9))
            .lineLimit(1)
        }
        .frame(maxWidth: 130, alignment: .trailing)
      } else {
        VStack(alignment: .trailing, spacing: 4) {
          Image(systemName: "globe.europe.africa.fill")
            .font(.system(size: 34))
            .foregroundColor(.white.opacity(0.28))
          Text("Where next?")
            .font(.system(size: 11, weight: .semibold))
            .foregroundColor(.white.opacity(0.6))
        }
      }
    }
  }
}

struct WorldlyWidgetView: View {
  @Environment(\.widgetFamily) var family
  let entry: WorldlyEntry
  var body: some View {
    Group {
      switch family {
      case .systemMedium:
        MediumView(entry: entry)
      default:
        SmallView(entry: entry)
      }
    }
    .containerBackground(for: .widget) {
      LinearGradient(colors: [NAVY, NAVY_DEEP], startPoint: .topLeading, endPoint: .bottomTrailing)
    }
  }
}

@main
struct WorldlyWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "WorldlyWidget", provider: Provider()) { entry in
      WorldlyWidgetView(entry: entry)
    }
    .configurationDisplayName("Your world")
    .description("Countries explored and the countdown to your next trip.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
