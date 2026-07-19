// Worldly home-screen + Lock Screen widgets.
//
// WidgetKit frames are static, so "dynamic" comes from a rotating timeline:
// across the day the widget cycles through a few delightful moments — your
// countries, an "on this day" memory, the countdown to your next trip, and
// your progress toward the next Explorer level. Colours follow the active
// Passport Cover. Data arrives via the shared app group (see WidgetSync.tsx).
import WidgetKit
import SwiftUI

private let APP_GROUP = "group.com.simmyd23.worldly"
private let ADD_URL = URL(string: "mobile://add")!

// MARK: - Colour + flag helpers

extension Color {
  init(hex: String) {
    let h = hex.hasPrefix("#") ? String(hex.dropFirst()) : hex
    var int: UInt64 = 0
    Scanner(string: h).scanHexInt64(&int)
    let r = Double((int >> 16) & 0xFF) / 255
    let g = Double((int >> 8) & 0xFF) / 255
    let b = Double(int & 0xFF) / 255
    self.init(red: r, green: g, blue: b)
  }
}

/// ISO 3166-1 alpha-2 → regional-indicator emoji flag ("JP" → 🇯🇵).
private func flagEmoji(_ code: String) -> String {
  let base: UInt32 = 127397
  var s = ""
  for scalar in code.uppercased().unicodeScalars {
    if scalar.value >= 65, scalar.value <= 90, let u = UnicodeScalar(base + scalar.value) {
      s.unicodeScalars.append(u)
    }
  }
  return s.isEmpty ? "🏳️" : s
}

// MARK: - Data

struct WidgetData {
  var countries = 0
  var cities = 0
  var continents = 0
  var level = 0
  var levelTitle = ""
  var levelProgress = 0.0
  var nextTitle: String? = nil
  var nextTripTitle: String? = nil
  var nextTripDays: Int? = nil
  var recentFlags: [String] = []
  var memoryLabel: String? = nil
  var memoryYearsAgo: Int? = nil
  var accent = Color(hex: "#FF6B9A")
  var gradient: [Color] = [Color(hex: "#14213D"), Color(hex: "#0E1837")]
  var synced = false
}

private func daysUntil(_ iso: String, from: Date) -> Int? {
  let fmt = DateFormatter()
  fmt.dateFormat = "yyyy-MM-dd"
  fmt.timeZone = .current
  guard let when = fmt.date(from: iso) else { return nil }
  let cal = Calendar.current
  let days = cal.dateComponents([.day], from: cal.startOfDay(for: from), to: cal.startOfDay(for: when)).day ?? 0
  return days >= 0 ? days : nil
}

private func loadData(asOf: Date) -> WidgetData {
  var d = WidgetData()
  guard
    let defaults = UserDefaults(suiteName: APP_GROUP),
    let json = defaults.string(forKey: "widgetData"),
    let raw = json.data(using: .utf8),
    let obj = try? JSONSerialization.jsonObject(with: raw) as? [String: Any]
  else { return d }
  d.synced = true
  d.countries = (obj["countries"] as? NSNumber)?.intValue ?? 0
  d.cities = (obj["cities"] as? NSNumber)?.intValue ?? 0
  d.continents = (obj["continents"] as? NSNumber)?.intValue ?? 0
  d.level = (obj["level"] as? NSNumber)?.intValue ?? 0
  d.levelTitle = (obj["levelTitle"] as? String) ?? ""
  d.levelProgress = (obj["levelProgress"] as? NSNumber)?.doubleValue ?? 0
  d.nextTitle = obj["nextTitle"] as? String
  if let t = obj["nextTripTitle"] as? String, !t.isEmpty { d.nextTripTitle = t }
  if let iso = obj["nextTripDate"] as? String, let days = daysUntil(iso, from: asOf) {
    d.nextTripDays = days
  } else {
    d.nextTripTitle = nil
  }
  d.recentFlags = (obj["recentFlags"] as? [String]) ?? []
  if let m = obj["memoryLabel"] as? String, !m.isEmpty {
    d.memoryLabel = m
    d.memoryYearsAgo = (obj["memoryYearsAgo"] as? NSNumber)?.intValue
  }
  if let a = obj["accent"] as? String { d.accent = Color(hex: a) }
  if let top = obj["gradientTop"] as? String, let bot = obj["gradientBottom"] as? String {
    d.gradient = [Color(hex: top), Color(hex: bot)]
  }
  return d
}

// MARK: - Rotating moments

enum Moment {
  case stats, memory, nextTrip, progress
}

/// Which moments are worth showing given today's data (stats always; the rest
/// only when there's something to say).
private func availableMoments(_ d: WidgetData) -> [Moment] {
  var m: [Moment] = [.stats]
  if d.nextTripTitle != nil { m.append(.nextTrip) }
  if d.memoryLabel != nil { m.append(.memory) }
  if !d.nextTitle.isNilOrEmpty && d.level > 0 { m.append(.progress) }
  return m
}

private extension Optional where Wrapped == String {
  var isNilOrEmpty: Bool { self?.isEmpty ?? true }
}

// MARK: - Timeline

struct WorldlyEntry: TimelineEntry {
  let date: Date
  let data: WidgetData
  let moment: Moment
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> WorldlyEntry {
    WorldlyEntry(date: Date(), data: sample, moment: .stats)
  }

  func getSnapshot(in context: Context, completion: @escaping (WorldlyEntry) -> Void) {
    let d = context.isPreview ? sample : loadData(asOf: Date())
    completion(WorldlyEntry(date: Date(), data: d, moment: .stats))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<WorldlyEntry>) -> Void) {
    let now = Date()
    let base = loadData(asOf: now)
    let moments = availableMoments(base)
    let cal = Calendar.current
    var entries: [WorldlyEntry] = []
    // One frame every 3 hours over the next day, cycling the moments so the
    // widget quietly changes what it shows through the day. Reload after the
    // last entry (which also refreshes the countdown for the new day).
    for i in 0..<8 {
      let date = cal.date(byAdding: .hour, value: i * 3, to: now) ?? now
      let d = loadData(asOf: date)
      entries.append(WorldlyEntry(date: date, data: d, moment: moments[i % moments.count]))
    }
    completion(Timeline(entries: entries, policy: .atEnd))
  }

  private var sample: WidgetData {
    var d = WidgetData()
    d.countries = 23; d.cities = 61; d.continents = 4
    d.level = 6; d.levelTitle = "Voyager"; d.levelProgress = 0.62; d.nextTitle = "Globetrotter"
    d.nextTripTitle = "Japan"; d.nextTripDays = 12
    d.recentFlags = ["JP", "FR", "IT", "ES", "US", "TH", "GR", "PT"]
    d.memoryLabel = "Tokyo"; d.memoryYearsAgo = 3
    d.synced = true
    return d
  }
}

// MARK: - Building blocks

private struct Eyebrow: View {
  let text: String
  var color: Color
  var body: some View {
    Text(text.uppercased())
      .font(.system(size: 10, weight: .heavy)).kerning(1.8)
      .foregroundColor(color)
  }
}

private struct AddBadge: View {
  var tint: Color
  var body: some View {
    Image(systemName: "plus")
      .font(.system(size: 14, weight: .bold))
      .foregroundColor(.white)
      .frame(width: 28, height: 28)
      .background(Circle().fill(tint))
  }
}

private struct ProgressRing: View {
  let progress: Double
  let tint: Color
  let center: String
  var body: some View {
    ZStack {
      Circle().stroke(Color.white.opacity(0.18), lineWidth: 6)
      Circle()
        .trim(from: 0, to: max(0.02, min(1, progress)))
        .stroke(tint, style: StrokeStyle(lineWidth: 6, lineCap: .round))
        .rotationEffect(.degrees(-90))
      Text(center).font(.system(size: 20, weight: .bold, design: .serif)).foregroundColor(.white)
    }
  }
}

private struct FlagStrip: View {
  let flags: [String]
  let max: Int
  var body: some View {
    HStack(spacing: 2) {
      ForEach(Array(flags.prefix(max).enumerated()), id: \.offset) { _, code in
        Text(flagEmoji(code)).font(.system(size: 18))
      }
      if flags.count > max {
        Text("+\(flags.count - max)")
          .font(.system(size: 11, weight: .bold))
          .foregroundColor(.white.opacity(0.7))
      }
    }
  }
}

private struct TripBadge: View {
  let title: String
  let days: Int
  let tint: Color
  var body: some View {
    HStack(spacing: 5) {
      Image(systemName: "airplane.departure").font(.system(size: 10, weight: .bold)).foregroundColor(tint)
      Text(days == 0 ? "\(title) · today!" : days == 1 ? "\(title) · tomorrow" : "\(title) · \(days) days")
        .font(.system(size: 11, weight: .semibold)).foregroundColor(.white.opacity(0.92)).lineLimit(1)
    }
  }
}

private func bigStat(_ value: String, _ label: String, color: Color = .white) -> some View {
  VStack(alignment: .leading, spacing: 1) {
    Text(value).font(.system(size: 34, weight: .bold, design: .serif)).foregroundColor(color)
    Text(label).font(.system(size: 10, weight: .medium)).foregroundColor(.white.opacity(0.72))
  }
}

// MARK: - The rotating moment (small + shared)

private struct MomentView: View {
  let entry: WorldlyEntry
  var body: some View {
    let d = entry.data
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .top) {
        Eyebrow(text: "Worldly", color: d.accent)
        Spacer()
        AddBadge(tint: d.accent)
      }
      Spacer()
      content
      Spacer()
      if !d.recentFlags.isEmpty { FlagStrip(flags: d.recentFlags, max: 5) }
    }
  }

  @ViewBuilder private var content: some View {
    let d = entry.data
    switch d.synced ? entry.moment : .stats {
    case .stats:
      VStack(alignment: .leading, spacing: 1) {
        Text("\(d.countries)").font(.system(size: 46, weight: .bold, design: .serif)).foregroundColor(.white)
        Text(d.synced ? (d.countries == 1 ? "country explored" : "countries explored") : "Open Worldly to sync")
          .font(.system(size: 11, weight: .medium)).foregroundColor(.white.opacity(0.72)).lineLimit(1)
      }
    case .memory:
      VStack(alignment: .leading, spacing: 3) {
        HStack(spacing: 4) {
          Image(systemName: "sparkles").font(.system(size: 11)).foregroundColor(d.accent)
          Text("ON THIS DAY").font(.system(size: 9, weight: .heavy)).kerning(1.2).foregroundColor(.white.opacity(0.6))
        }
        Text(d.memoryLabel ?? "").font(.system(size: 24, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(1)
        if let y = d.memoryYearsAgo {
          Text(y == 1 ? "a year ago today" : "\(y) years ago today").font(.system(size: 11)).foregroundColor(.white.opacity(0.7))
        }
      }
    case .nextTrip:
      VStack(alignment: .leading, spacing: 1) {
        Text("NEXT TRIP").font(.system(size: 9, weight: .heavy)).kerning(1.2).foregroundColor(.white.opacity(0.6))
        Text(d.nextTripDays == 0 ? "Today" : "\(d.nextTripDays ?? 0)")
          .font(.system(size: 42, weight: .bold, design: .serif)).foregroundColor(.white)
        Text((d.nextTripDays == 1 ? "day · " : "days · ") + (d.nextTripTitle ?? ""))
          .font(.system(size: 11, weight: .semibold)).foregroundColor(d.accent).lineLimit(1)
      }
    case .progress:
      HStack(spacing: 12) {
        ProgressRing(progress: d.levelProgress, tint: d.accent, center: "\(d.level)")
          .frame(width: 56, height: 56)
        VStack(alignment: .leading, spacing: 1) {
          Text(d.levelTitle).font(.system(size: 17, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(1)
          if let n = d.nextTitle {
            Text("Next: \(n)").font(.system(size: 10.5)).foregroundColor(.white.opacity(0.7)).lineLimit(1)
          }
        }
      }
    }
  }
}

// MARK: - Medium

private struct MediumView: View {
  let entry: WorldlyEntry
  var body: some View {
    let d = entry.data
    HStack(alignment: .top, spacing: 12) {
      VStack(alignment: .leading, spacing: 0) {
        Eyebrow(text: "Worldly", color: d.accent)
        Spacer()
        Text("\(d.countries)").font(.system(size: 46, weight: .bold, design: .serif)).foregroundColor(.white)
        Text(d.synced ? (d.countries == 1 ? "country explored" : "countries explored") : "Open to sync")
          .font(.system(size: 11, weight: .medium)).foregroundColor(.white.opacity(0.72)).lineLimit(1)
        if d.cities > 0 || d.continents > 0 {
          Text("\(d.cities) cities · \(d.continents) continents")
            .font(.system(size: 11, weight: .semibold)).foregroundColor(d.accent).lineLimit(1).padding(.top, 3)
        }
        Spacer()
        if !d.recentFlags.isEmpty { FlagStrip(flags: d.recentFlags, max: 7) }
      }
      Spacer(minLength: 0)
      VStack(alignment: .trailing, spacing: 8) {
        Link(destination: ADD_URL) { AddBadge(tint: d.accent) }
        Spacer()
        rightPanel
      }
      .frame(maxWidth: 128, alignment: .trailing)
    }
  }

  @ViewBuilder private var rightPanel: some View {
    let d = entry.data
    if !d.synced {
      VStack(alignment: .trailing, spacing: 4) {
        Image(systemName: "globe.europe.africa.fill").font(.system(size: 30)).foregroundColor(.white.opacity(0.28))
        Text("Open to sync").font(.system(size: 10, weight: .semibold)).foregroundColor(.white.opacity(0.6))
      }
    } else if let title = d.nextTripTitle, let days = d.nextTripDays {
      VStack(alignment: .trailing, spacing: 2) {
        Text("NEXT TRIP").font(.system(size: 9, weight: .heavy)).kerning(1.2).foregroundColor(.white.opacity(0.6))
        Text(days == 0 ? "Today" : "\(days)").font(.system(size: days == 0 ? 24 : 32, weight: .bold, design: .serif)).foregroundColor(d.accent)
        Text((days == 1 ? "day · " : "days · ") + title).font(.system(size: 11, weight: .semibold)).foregroundColor(.white.opacity(0.9)).lineLimit(1)
      }
    } else if let mem = d.memoryLabel {
      VStack(alignment: .trailing, spacing: 2) {
        Text("ON THIS DAY").font(.system(size: 9, weight: .heavy)).kerning(1.2).foregroundColor(.white.opacity(0.6))
        Text(mem).font(.system(size: 20, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(1)
        if let y = d.memoryYearsAgo { Text(y == 1 ? "a year ago" : "\(y) years ago").font(.system(size: 10.5)).foregroundColor(.white.opacity(0.7)) }
      }
    } else {
      ProgressRing(progress: d.levelProgress, tint: d.accent, center: "\(d.level)").frame(width: 58, height: 58)
    }
  }
}

// MARK: - Large

private struct LargeView: View {
  let entry: WorldlyEntry
  var body: some View {
    let d = entry.data
    VStack(alignment: .leading, spacing: 0) {
      HStack {
        Eyebrow(text: "Worldly", color: d.accent)
        Spacer()
        if d.level > 0 {
          Text("\(d.levelTitle) · Lvl \(d.level)").font(.system(size: 11, weight: .semibold)).foregroundColor(.white.opacity(0.7))
        }
        Link(destination: ADD_URL) { AddBadge(tint: d.accent) }
      }
      Spacer(minLength: 10)
      HStack(alignment: .center, spacing: 16) {
        ProgressRing(progress: d.levelProgress, tint: d.accent, center: "\(d.countries)").frame(width: 88, height: 88)
        VStack(alignment: .leading, spacing: 6) {
          Text(d.synced ? "\(d.countries) countries explored" : "Open Worldly to sync")
            .font(.system(size: 18, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(1)
          HStack(spacing: 14) {
            bigStat("\(d.cities)", "cities", color: d.accent)
            bigStat("\(d.continents)", "continents")
          }
        }
        Spacer()
      }
      Spacer(minLength: 12)
      if !d.recentFlags.isEmpty {
        Text("RECENTLY VISITED").font(.system(size: 9, weight: .heavy)).kerning(1.4).foregroundColor(.white.opacity(0.55))
        FlagStrip(flags: d.recentFlags, max: 10).padding(.top, 4)
      }
      Spacer(minLength: 12)
      HStack(spacing: 10) {
        if let title = d.nextTripTitle, let days = d.nextTripDays {
          pill(icon: "airplane.departure", text: days == 0 ? "\(title) today!" : days == 1 ? "\(title) tomorrow" : "\(title) in \(days) days", tint: d.accent)
        }
        if let mem = d.memoryLabel, let y = d.memoryYearsAgo {
          pill(icon: "sparkles", text: "\(mem) · \(y == 1 ? "1 yr" : "\(y) yrs") ago", tint: d.accent)
        }
        Spacer()
      }
    }
  }

  private func pill(icon: String, text: String, tint: Color) -> some View {
    HStack(spacing: 5) {
      Image(systemName: icon).font(.system(size: 10, weight: .bold)).foregroundColor(tint)
      Text(text).font(.system(size: 11.5, weight: .semibold)).foregroundColor(.white.opacity(0.92)).lineLimit(1)
    }
    .padding(.horizontal, 10).padding(.vertical, 7)
    .background(Capsule().fill(Color.white.opacity(0.1)))
  }
}

// MARK: - Lock Screen (accessory) widgets

private struct AccessoryCircularView: View {
  let entry: WorldlyEntry
  var body: some View {
    let d = entry.data
    Gauge(value: min(1, d.levelProgress)) {
      Image(systemName: "globe")
    } currentValueLabel: {
      Text("\(d.countries)")
    }
    .gaugeStyle(.accessoryCircular)
    .widgetAccentable()
  }
}

private struct AccessoryRectangularView: View {
  let entry: WorldlyEntry
  var body: some View {
    let d = entry.data
    VStack(alignment: .leading, spacing: 1) {
      if let title = d.nextTripTitle, let days = d.nextTripDays {
        Text("Next trip").font(.system(size: 11, weight: .semibold)).widgetAccentable()
        Text(days == 0 ? "\(title) — today!" : days == 1 ? "\(title) — tomorrow" : "\(title) in \(days) days")
          .font(.system(size: 15, weight: .bold)).lineLimit(1)
      } else if let mem = d.memoryLabel, let y = d.memoryYearsAgo {
        Text("On this day").font(.system(size: 11, weight: .semibold)).widgetAccentable()
        Text("\(mem) · \(y == 1 ? "1 yr" : "\(y) yrs") ago").font(.system(size: 15, weight: .bold)).lineLimit(1)
      } else {
        Text("Worldly").font(.system(size: 11, weight: .semibold)).widgetAccentable()
        Text("\(d.countries) countries · \(d.cities) cities").font(.system(size: 15, weight: .bold)).lineLimit(1)
      }
    }
  }
}

private struct AccessoryInlineView: View {
  let entry: WorldlyEntry
  var body: some View {
    let d = entry.data
    if let title = d.nextTripTitle, let days = d.nextTripDays {
      Label(days <= 0 ? "\(title) today" : "\(title) in \(days)d", systemImage: "airplane")
    } else {
      Label("\(d.countries) countries explored", systemImage: "globe")
    }
  }
}

// MARK: - Entry view (family switch)

struct WorldlyWidgetEntryView: View {
  @Environment(\.widgetFamily) var family
  let entry: WorldlyEntry

  var body: some View {
    switch family {
    case .systemMedium:
      themed { MediumView(entry: entry) }
    case .systemLarge:
      themed { LargeView(entry: entry) }
    case .accessoryCircular:
      AccessoryCircularView(entry: entry).containerBackground(.clear, for: .widget)
    case .accessoryRectangular:
      AccessoryRectangularView(entry: entry).containerBackground(.clear, for: .widget)
    case .accessoryInline:
      AccessoryInlineView(entry: entry)
    default:
      themed { MomentView(entry: entry) }.widgetURL(ADD_URL)
    }
  }

  @ViewBuilder private func themed<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
    content().containerBackground(for: .widget) {
      LinearGradient(colors: entry.data.gradient, startPoint: .topLeading, endPoint: .bottomTrailing)
    }
  }
}

// MARK: - Widget

@main
struct WorldlyWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "WorldlyWidget", provider: Provider()) { entry in
      WorldlyWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Your world")
    .description("Your countries, memories, next trip and level — themed to your Passport Cover.")
    .supportedFamilies([
      .systemSmall, .systemMedium, .systemLarge,
      .accessoryCircular, .accessoryRectangular, .accessoryInline,
    ])
  }
}
