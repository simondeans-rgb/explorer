// Worldly home-screen + Lock Screen widgets.
//
// WidgetKit frames are static, so "dynamic" comes from a rotating timeline:
// across the day the widget cycles through a few delightful moments — your
// countries, an "on this day" memory, the countdown to your next trip, and
// your progress toward the next Explorer level. Colours follow the active
// Passport Cover. Data arrives via the shared app group (see WidgetSync.tsx).
import WidgetKit
import SwiftUI
import UIKit

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
  var featured: String? = nil
  var heroImage: UIImage? = nil
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

private func loadData(asOf: Date, loadImage: Bool = true) -> WidgetData {
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
  if let f = obj["featured"] as? String, !f.isEmpty { d.featured = f }
  if let a = obj["accent"] as? String { d.accent = Color(hex: a) }
  if let top = obj["gradientTop"] as? String, let bot = obj["gradientBottom"] as? String {
    d.gradient = [Color(hex: top), Color(hex: bot)]
  }
  // The featured destination photo, if the app has written one.
  if loadImage, let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: APP_GROUP) {
    d.heroImage = UIImage(contentsOfFile: container.appendingPathComponent("widget-hero.jpg").path)
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
    // widget quietly changes what it shows through the day. The hero photo is
    // decoded once and shared across entries to stay within the memory budget.
    for i in 0..<8 {
      let date = cal.date(byAdding: .hour, value: i * 3, to: now) ?? now
      var d = loadData(asOf: date, loadImage: false)
      d.heroImage = base.heroImage
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

private struct AddBadge: View {
  var tint: Color
  var size: CGFloat = 28
  var body: some View {
    Image(systemName: "plus")
      .font(.system(size: size * 0.48, weight: .bold))
      .foregroundColor(.white)
      .frame(width: size, height: size)
      .background(Circle().fill(tint))
      .shadow(color: tint.opacity(0.5), radius: 6, y: 2)
  }
}

/// The Worldly logo mark — the five coloured map-pins joined by the route line,
/// exactly the app icon geometry, rendered small for the widget header.
private struct BrandMark: View {
  var height: CGFloat = 22
  private let pts: [(CGFloat, CGFloat)] = [(0.09, 0.30), (0.30, 0.80), (0.50, 0.42), (0.70, 0.80), (0.91, 0.30)]
  private let cols = [Color(hex: "#FF6B9A"), Color(hex: "#24D1C3"), Color(hex: "#FFB84D"), Color(hex: "#9B7CFF"), Color(hex: "#4DA6FF")]
  var body: some View {
    GeometryReader { geo in
      let w = geo.size.width, h = geo.size.height
      let p = pts.map { CGPoint(x: $0.0 * w, y: $0.1 * h) }
      ZStack {
        Path { path in
          path.move(to: p[0])
          for pt in p.dropFirst() { path.addLine(to: pt) }
        }
        .stroke(Color.white, style: StrokeStyle(lineWidth: h * 0.15, lineCap: .round, lineJoin: .round))
        ForEach(0..<p.count, id: \.self) { i in
          Circle().fill(cols[i]).frame(width: h * 0.30, height: h * 0.30).position(p[i])
        }
      }
    }
    .frame(width: height * 1.4, height: height)
  }
}

/// Logo lockup for the widget header: the mark + "Worldly". Sized down on the
/// small widget so the wordmark never wraps beside the add button.
private struct BrandLockup: View {
  var markHeight: CGFloat = 20
  var fontSize: CGFloat = 15
  var body: some View {
    HStack(spacing: 6) {
      BrandMark(height: markHeight)
      Text("Worldly").font(.system(size: fontSize, weight: .heavy)).foregroundColor(.white)
        .lineLimit(1).minimumScaleFactor(0.8).fixedSize(horizontal: true, vertical: false)
        .shadow(color: .black.opacity(0.35), radius: 3, y: 1)
    }
  }
}

private extension View {
  /// A frosted-glass pill behind text for legibility over busy photography.
  /// A real material blur (glass) tinted a touch darker so white text stays
  /// crisp. A no-op on gradient covers, where contrast is already clean and a
  /// box would only clutter the airy look.
  @ViewBuilder func glassPill(_ on: Bool, padH: CGFloat = 11, padV: CGFloat = 8, radius: CGFloat = 15) -> some View {
    if on {
      self
        .padding(.horizontal, padH)
        .padding(.vertical, padV)
        .background(
          RoundedRectangle(cornerRadius: radius, style: .continuous)
            .fill(.ultraThinMaterial)
            .overlay(RoundedRectangle(cornerRadius: radius, style: .continuous).fill(Color.black.opacity(0.1)))
            .overlay(RoundedRectangle(cornerRadius: radius, style: .continuous).stroke(Color.white.opacity(0.14), lineWidth: 0.5))
        )
        .environment(\.colorScheme, .dark)
    } else {
      self
    }
  }
}

/// The protected Worldly mark (route line + 5 pins), drawn as a faint
/// background watermark so the widget carries brand identity and the empty
/// space reads as intentional. Normalised from the app icon geometry.
private struct WMark: View {
  var color: Color
  private let pts: [(CGFloat, CGFloat)] = [(0.174, 0.295), (0.332, 0.672), (0.500, 0.405), (0.669, 0.679), (0.832, 0.293)]
  var body: some View {
    GeometryReader { geo in
      let w = geo.size.width, h = geo.size.height
      let p = pts.map { CGPoint(x: $0.0 * w, y: $0.1 * h) }
      ZStack {
        Path { path in
          path.move(to: p[0])
          for pt in p.dropFirst() { path.addLine(to: pt) }
        }
        .stroke(color, style: StrokeStyle(lineWidth: w * 0.055, lineCap: .round, lineJoin: .round))
        ForEach(0..<p.count, id: \.self) { i in
          Circle().fill(color).frame(width: w * 0.1, height: w * 0.1).position(p[i])
        }
      }
    }
  }
}

/// Glossy gradient number — the app's vibrant hero-figure look (white shining
/// down into the cover accent).
private func heroNumber(_ value: String, accent: Color, size: CGFloat) -> some View {
  Text(value)
    .font(.system(size: size, weight: .bold, design: .serif))
    .foregroundStyle(LinearGradient(colors: [.white, accent], startPoint: .top, endPoint: .bottom))
}

private struct ProgressRing: View {
  let progress: Double
  let tint: Color
  let center: String
  var lineWidth: CGFloat = 7
  var centerSize: CGFloat = 22
  var body: some View {
    ZStack {
      Circle().stroke(Color.white.opacity(0.16), lineWidth: lineWidth)
      Circle()
        .trim(from: 0, to: max(0.02, min(1, progress)))
        .stroke(
          AngularGradient(gradient: Gradient(colors: [tint.opacity(0.7), tint, .white, tint]), center: .center),
          style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
        )
        .rotationEffect(.degrees(-90))
        .shadow(color: tint.opacity(0.6), radius: 4)
      Text(center)
        .font(.system(size: centerSize, weight: .bold, design: .serif))
        .minimumScaleFactor(0.6).lineLimit(1)
        .foregroundStyle(LinearGradient(colors: [.white, tint], startPoint: .top, endPoint: .bottom))
    }
  }
}

/// A ticker-tape row of country flags along the bottom. On medium/large each
/// flag is a Link that opens that country's card; small widgets allow only one
/// tap target, so there the flags are display-only.
private struct FlagRow: View {
  let flags: [String]
  let maxCount: Int
  var clickable: Bool = false
  var size: CGFloat = 32
  var showOverflow: Bool = true

  private func chip(_ code: String) -> some View {
    Text(flagEmoji(code))
      .font(.system(size: size * 0.6))
      .frame(width: size, height: size)
      .background(RoundedRectangle(cornerRadius: size * 0.26, style: .continuous).fill(Color.white.opacity(0.15)))
      .overlay(RoundedRectangle(cornerRadius: size * 0.26, style: .continuous).stroke(Color.white.opacity(0.12), lineWidth: 0.5))
  }

  var body: some View {
    HStack(spacing: 5) {
      ForEach(Array(flags.prefix(maxCount).enumerated()), id: \.offset) { _, code in
        if clickable, let url = URL(string: "mobile://country/\(code)") {
          Link(destination: url) { chip(code) }
        } else {
          chip(code)
        }
      }
      if showOverflow && flags.count > maxCount {
        Text("+\(flags.count - maxCount)")
          .font(.system(size: 12, weight: .heavy))
          .foregroundColor(.white.opacity(0.75))
          .padding(.leading, 1)
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
        BrandLockup(markHeight: 17, fontSize: 13.5)
        Spacer(minLength: 6)
        AddBadge(tint: d.accent, size: 34)
      }
      Spacer()
      content.glassPill(d.heroImage != nil)
      Spacer()
    }
  }

  @ViewBuilder private var content: some View {
    let d = entry.data
    switch d.synced ? entry.moment : .stats {
    case .stats:
      VStack(alignment: .leading, spacing: 1) {
        heroNumber("\(d.countries)", accent: d.accent, size: 46)
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
        heroNumber(d.nextTripDays == 0 ? "Today" : "\(d.nextTripDays ?? 0)", accent: d.accent, size: 42)
        Text((d.nextTripDays == 1 ? "day · " : "days · ") + (d.nextTripTitle ?? ""))
          .font(.system(size: 11, weight: .semibold)).foregroundColor(d.accent).lineLimit(1).minimumScaleFactor(0.8)
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
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .top) {
        BrandLockup()
        Spacer()
        Link(destination: ADD_URL) { AddBadge(tint: d.accent, size: 40) }
      }
      Spacer()
      HStack(alignment: .bottom, spacing: 12) {
        VStack(alignment: .leading, spacing: 1) {
          heroNumber("\(d.countries)", accent: d.accent, size: 52)
          Text(d.synced ? (d.countries == 1 ? "country explored" : "countries explored") : "Open Worldly to sync")
            .font(.system(size: 12, weight: .medium)).foregroundColor(.white.opacity(0.75)).lineLimit(1)
          if d.cities > 0 || d.continents > 0 {
            Text("\(d.cities) cities · \(d.continents) continents")
              .font(.system(size: 11.5, weight: .semibold)).foregroundColor(d.accent)
              .lineLimit(1).minimumScaleFactor(0.75).padding(.top, 2)
          }
        }
        .glassPill(d.heroImage != nil)
        Spacer(minLength: 0)
        rightPanel.glassPill(d.heroImage != nil).frame(maxWidth: 126, alignment: .trailing)
      }
    }
  }

  @ViewBuilder private var rightPanel: some View {
    let d = entry.data
    if let title = d.nextTripTitle, let days = d.nextTripDays {
      VStack(alignment: .trailing, spacing: 0) {
        Text("NEXT TRIP").font(.system(size: 10, weight: .heavy)).kerning(1.4).foregroundColor(d.accent)
        Text(title).font(.system(size: 15, weight: .bold)).foregroundColor(.white).lineLimit(1).minimumScaleFactor(0.7).padding(.bottom, 1)
        if days == 0 {
          Text("Today!").font(.system(size: 32, weight: .bold, design: .serif)).foregroundColor(.white)
        } else {
          heroNumber("\(days)", accent: d.accent, size: 44)
          Text(days == 1 ? "day away" : "days away").font(.system(size: 11, weight: .semibold)).foregroundColor(.white.opacity(0.75)).padding(.top, -2)
        }
      }
    } else if let mem = d.memoryLabel {
      VStack(alignment: .trailing, spacing: 1) {
        Text("ON THIS DAY").font(.system(size: 10, weight: .heavy)).kerning(1.4).foregroundColor(d.accent)
        Text(mem).font(.system(size: 26, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(1).minimumScaleFactor(0.7)
        if let y = d.memoryYearsAgo { Text(y == 1 ? "a year ago today" : "\(y) years ago today").font(.system(size: 11)).foregroundColor(.white.opacity(0.75)) }
      }
    } else {
      VStack(alignment: .trailing, spacing: 4) {
        ProgressRing(progress: d.levelProgress, tint: d.accent, center: "\(d.level)").frame(width: 66, height: 66)
        Text(d.levelTitle).font(.system(size: 12, weight: .bold)).foregroundColor(.white).lineLimit(1)
      }
    }
  }
}

// MARK: - Large

private struct LargeView: View {
  let entry: WorldlyEntry
  var body: some View {
    let d = entry.data
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .center) {
        BrandLockup()
        Spacer()
        Link(destination: ADD_URL) { AddBadge(tint: d.accent, size: 42) }
      }
      Spacer(minLength: 8)
      // Hero: a compact progress ring beside the headline, the stat trio below.
      VStack(alignment: .leading, spacing: 14) {
        HStack(alignment: .center, spacing: 14) {
          ProgressRing(progress: d.levelProgress, tint: d.accent, center: "\(d.countries)", lineWidth: 6, centerSize: 21).frame(width: 60, height: 60)
          Text(d.synced ? "countries explored" : "Open Worldly to sync")
            .font(.system(size: 20, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(2)
          Spacer(minLength: 0)
        }
        HStack(spacing: 24) {
          bigStat("\(d.cities)", "cities", color: d.accent)
          bigStat("\(d.continents)", "continents")
          if d.level > 0 { bigStat("\(d.level)", "level") }
          Spacer()
        }
      }
      .glassPill(d.heroImage != nil, padH: 14, padV: 12, radius: 20)
      Spacer(minLength: 12)
      // Prominent next-trip / memory band.
      band
      Spacer(minLength: 12)
      if !d.recentFlags.isEmpty {
        VStack(alignment: .leading, spacing: 6) {
          Text("RECENTLY VISITED").font(.system(size: 10, weight: .heavy)).kerning(1.6).foregroundColor(.white.opacity(0.72))
          FlagRow(flags: d.recentFlags, maxCount: 8, clickable: true, size: 30, showOverflow: false)
        }
        .glassPill(d.heroImage != nil, padH: 12, padV: 9, radius: 18)
      }
    }
  }

  @ViewBuilder private var band: some View {
    let d = entry.data
    if let title = d.nextTripTitle, let days = d.nextTripDays {
      HStack(alignment: .center, spacing: 12) {
        Image(systemName: "airplane.departure").font(.system(size: 22, weight: .semibold)).foregroundColor(d.accent)
        VStack(alignment: .leading, spacing: 0) {
          Text("NEXT TRIP").font(.system(size: 10, weight: .heavy)).kerning(1.4).foregroundColor(.white.opacity(0.7))
          Text(title).font(.system(size: 22, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(1).minimumScaleFactor(0.7)
        }
        Spacer()
        VStack(alignment: .trailing, spacing: -2) {
          heroNumber(days == 0 ? "Today" : "\(days)", accent: d.accent, size: 38)
          if days != 0 { Text(days == 1 ? "day away" : "days away").font(.system(size: 11, weight: .semibold)).foregroundColor(.white.opacity(0.75)) }
        }
      }
      .padding(.horizontal, 14).padding(.vertical, 12)
      .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(Color.white.opacity(0.1)))
    } else if let mem = d.memoryLabel, let y = d.memoryYearsAgo {
      HStack(alignment: .center, spacing: 12) {
        Image(systemName: "sparkles").font(.system(size: 22)).foregroundColor(d.accent)
        VStack(alignment: .leading, spacing: 0) {
          Text("ON THIS DAY").font(.system(size: 10, weight: .heavy)).kerning(1.4).foregroundColor(.white.opacity(0.7))
          Text(mem).font(.system(size: 22, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(1).minimumScaleFactor(0.7)
        }
        Spacer()
        Text(y == 1 ? "1 year ago" : "\(y) years ago").font(.system(size: 12, weight: .semibold)).foregroundColor(.white.opacity(0.8))
      }
      .padding(.horizontal, 14).padding(.vertical, 12)
      .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(Color.white.opacity(0.1)))
    } else if d.level > 0, let n = d.nextTitle {
      HStack(alignment: .center, spacing: 12) {
        Image(systemName: "trophy.fill").font(.system(size: 20)).foregroundColor(d.accent)
        VStack(alignment: .leading, spacing: 0) {
          Text("EXPLORER LEVEL \(d.level)").font(.system(size: 10, weight: .heavy)).kerning(1.4).foregroundColor(.white.opacity(0.7))
          Text(d.levelTitle).font(.system(size: 22, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(1)
        }
        Spacer()
        Text("Next: \(n)").font(.system(size: 12, weight: .semibold)).foregroundColor(.white.opacity(0.8))
      }
      .padding(.horizontal, 14).padding(.vertical, 12)
      .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(Color.white.opacity(0.1)))
    }
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
    let d = entry.data
    content().containerBackground(for: .widget) {
      ZStack {
        if let img = d.heroImage {
          // Full-bleed destination photography — the Airbnb/Spotify move.
          Image(uiImage: img).resizable().scaledToFill()
          // Legibility: darken overall a touch, deepen toward the bottom where
          // the stats sit, and keep a whisper of the cover accent up top.
          Color.black.opacity(0.28)
          LinearGradient(colors: [.black.opacity(0.35), .clear, .black.opacity(0.68)], startPoint: .top, endPoint: .bottom)
          RadialGradient(colors: [d.accent.opacity(0.22), .clear], center: .topTrailing, startRadius: 2, endRadius: 220)
        } else {
          LinearGradient(colors: d.gradient, startPoint: .topLeading, endPoint: .bottomTrailing)
          // Accent glows give the deep base depth and vibrancy.
          RadialGradient(colors: [d.accent.opacity(0.5), .clear], center: .topLeading, startRadius: 2, endRadius: 300)
          RadialGradient(colors: [d.accent.opacity(0.22), .clear], center: .bottomTrailing, startRadius: 2, endRadius: 240)
          // Faint brand watermark bleeding off the lower-right corner.
          WMark(color: .white.opacity(0.06))
            .frame(width: 260, height: 260)
            .rotationEffect(.degrees(-8))
            .offset(x: 78, y: 66)
        }
      }
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
