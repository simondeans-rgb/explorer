// Worldly home-screen + Lock Screen widgets.
//
// A configurable, Passport-Cover-themed widget family. Each widget has ONE
// clear focus — Exploration, Next Trip, Explorer Level, World Progress, Next
// Achievement or Travel Memory — chosen by the user (AppIntent configuration),
// or "Smart" which rotates the most relevant focus across the day's timeline.
// There is no internal branding: the Home Screen already names the widget, so
// the space goes to content. Colours follow the active Passport Cover. Data
// arrives via the shared app group (see WidgetSync.tsx / widgetPayload.ts).
import WidgetKit
import SwiftUI
import UIKit
import AppIntents

private let APP_GROUP = "group.com.simmyd23.worldly"
private let ADD_URL = URL(string: "mobile://add")!

// MARK: - Colour

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

// MARK: - Focus (configuration)

enum WidgetFocus: String, AppEnum, CaseIterable {
  case smart, exploration, nextTrip, level, world, achievement, memory

  static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Widget focus")
  static var caseDisplayRepresentations: [WidgetFocus: DisplayRepresentation] = [
    .smart: "Smart (rotates)",
    .exploration: "Exploration Progress",
    .nextTrip: "Next Trip",
    .level: "Explorer Level",
    .world: "World Progress",
    .achievement: "Next Achievement",
    .memory: "Travel Memory",
  ]
}

struct WorldlyFocusIntent: WidgetConfigurationIntent {
  static var title: LocalizedStringResource = "Worldly"
  static var description = IntentDescription("Choose what this widget shows, or let it adapt with Smart.")

  @Parameter(title: "Show", default: .smart)
  var focus: WidgetFocus
}

// MARK: - Data

enum TripStatus: String { case upcoming, today, underway }

struct WTrip {
  var title: String
  var country: String
  var code: String
  var status: TripStatus
  var days: Int
  var dateLabel: String?
}

struct WAch {
  var title: String
  var value: Int
  var target: Int
  var unit: String?
  var progress: Double
}

struct WMemory {
  var label: String
  var year: Int?
  var code: String?
}

struct WidgetData {
  var countries = 0
  var cities = 0
  var continents = 0
  var level = 0
  var levelTitle = ""
  var levelProgress = 0.0
  var nextTitle: String? = nil
  var xp = 0
  var xpToNext: Int? = nil
  var worldTotal = 195
  var worldPercent = 0.0
  var trip: WTrip? = nil
  var ach: WAch? = nil
  var memory: WMemory? = nil
  var accent = Color(hex: "#FF6B9A")
  var accentText = Color(hex: "#FF9EBB")
  var gradient: [Color] = [Color(hex: "#14213D"), Color(hex: "#0E1837")]
  var heroImage: UIImage? = nil
  var tripImage: UIImage? = nil
  var memoryImage: UIImage? = nil
  var synced = false
}

private func daysUntil(_ iso: String, from: Date) -> Int? {
  let fmt = DateFormatter()
  fmt.dateFormat = "yyyy-MM-dd"
  fmt.timeZone = .current
  guard let when = fmt.date(from: String(iso.prefix(10))) else { return nil }
  let cal = Calendar.current
  return cal.dateComponents([.day], from: cal.startOfDay(for: from), to: cal.startOfDay(for: when)).day
}

private func prettyDate(_ iso: String) -> String? {
  let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"; f.timeZone = .current
  guard let d = f.date(from: String(iso.prefix(10))) else { return nil }
  let o = DateFormatter(); o.dateFormat = "d MMM yyyy"; o.timeZone = .current
  return o.string(from: d)
}

private func loadData(asOf: Date, loadImages: Bool = true) -> WidgetData {
  var d = WidgetData()
  guard
    let defaults = UserDefaults(suiteName: APP_GROUP),
    let json = defaults.string(forKey: "widgetData"),
    let raw = json.data(using: .utf8),
    let obj = try? JSONSerialization.jsonObject(with: raw) as? [String: Any]
  else { return d }
  d.synced = true
  let i = { (k: String) -> Int in (obj[k] as? NSNumber)?.intValue ?? 0 }
  let dbl = { (k: String) -> Double in (obj[k] as? NSNumber)?.doubleValue ?? 0 }
  let str = { (k: String) -> String? in (obj[k] as? String).flatMap { $0.isEmpty ? nil : $0 } }

  d.countries = i("countries"); d.cities = i("cities"); d.continents = i("continents")
  d.level = i("level"); d.levelTitle = obj["levelTitle"] as? String ?? ""
  d.levelProgress = dbl("levelProgress"); d.nextTitle = str("nextTitle")
  d.xp = i("xp"); d.xpToNext = obj["xpToNext"] is NSNumber ? i("xpToNext") : nil
  d.worldTotal = obj["worldTotal"] is NSNumber ? i("worldTotal") : 195
  d.worldPercent = dbl("worldPercent")

  // Next trip — trust the status the app resolved (upcoming / today / underway),
  // but refresh the upcoming countdown as-of this timeline entry so the number
  // stays live through the day without another app sync.
  if let title = str("tripTitle") ?? str("tripCountry"), let startISO = str("tripDate"), let statusStr = str("tripStatus") {
    let country = str("tripCountry") ?? title
    let code = str("tripCountryCode") ?? ""
    var status = TripStatus(rawValue: statusStr) ?? .upcoming
    var days = (obj["tripDays"] as? NSNumber)?.intValue ?? 0
    if status == .upcoming {
      let fresh = daysUntil(startISO, from: asOf) ?? days
      days = max(0, fresh)
      if fresh <= 0 { status = .today } // rolled over into the departure day
    }
    d.trip = WTrip(title: title, country: country, code: code, status: status, days: days, dateLabel: prettyDate(startISO))
  }

  if let at = str("achTitle"), obj["achTarget"] is NSNumber {
    d.ach = WAch(title: at, value: i("achValue"), target: i("achTarget"),
                 unit: str("achUnit"), progress: dbl("achProgress"))
  }
  if let ml = str("memoryLabel") {
    d.memory = WMemory(label: ml, year: obj["memoryYear"] is NSNumber ? i("memoryYear") : nil, code: str("memoryCountry"))
  }

  if let a = str("accent") { d.accent = Color(hex: a) }
  d.accentText = Color(hex: str("accentText") ?? str("accent") ?? "#FF9EBB")
  if let top = str("gradientTop"), let bot = str("gradientBottom") {
    d.gradient = [Color(hex: top), Color(hex: bot)]
  }
  if loadImages, let c = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: APP_GROUP) {
    d.heroImage = UIImage(contentsOfFile: c.appendingPathComponent("widget-hero.jpg").path)
    d.tripImage = UIImage(contentsOfFile: c.appendingPathComponent("widget-trip.jpg").path)
    d.memoryImage = UIImage(contentsOfFile: c.appendingPathComponent("widget-memory.jpg").path)
  }
  return d
}

// MARK: - Timeline

struct WorldlyEntry: TimelineEntry {
  let date: Date
  let data: WidgetData
  let focus: WidgetFocus
}

/// Which focuses Smart mode should cycle, most-relevant first: a trip that's
/// underway or close leads; otherwise exploration opens, and only focuses with
/// real data are included.
private func smartRotation(_ d: WidgetData) -> [WidgetFocus] {
  var f: [WidgetFocus] = [.exploration]
  if d.trip != nil { f.append(.nextTrip) }
  if d.ach != nil { f.append(.achievement) }
  if d.level > 0 { f.append(.level) }
  f.append(.world)
  if d.memory != nil { f.append(.memory) }
  if let t = d.trip, t.status != .upcoming || t.days <= 14 {
    f.removeAll { $0 == .nextTrip }
    f.insert(.nextTrip, at: 0)
  }
  return f
}

private var sampleData: WidgetData {
  var d = WidgetData()
  d.countries = 19; d.cities = 30; d.continents = 3
  d.level = 10; d.levelTitle = "Citizen of the World"; d.levelProgress = 0.48; d.nextTitle = "Legend"
  d.xp = 4260; d.xpToNext = 740
  d.worldTotal = 195; d.worldPercent = 9.7
  d.trip = WTrip(title: "Iceland", country: "Iceland", code: "IS", status: .upcoming, days: 683, dateLabel: "3 Jun 2028")
  d.ach = WAch(title: "Globetrotter", value: 9, target: 10, unit: "countries", progress: 0.9)
  d.memory = WMemory(label: "Barcelona", year: 2024, code: "ES")
  d.accent = Color(hex: "#FF6B9A"); d.accentText = Color(hex: "#FF9EBB")
  d.synced = true
  return d
}

struct Provider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> WorldlyEntry {
    WorldlyEntry(date: Date(), data: sampleData, focus: .exploration)
  }

  func snapshot(for configuration: WorldlyFocusIntent, in context: Context) async -> WorldlyEntry {
    let d = context.isPreview ? sampleData : loadData(asOf: Date())
    let f = configuration.focus == .smart ? smartRotation(d).first ?? .exploration : configuration.focus
    return WorldlyEntry(date: Date(), data: d, focus: f)
  }

  func timeline(for configuration: WorldlyFocusIntent, in context: Context) async -> Timeline<WorldlyEntry> {
    let now = Date()
    let base = loadData(asOf: now)
    let smart = configuration.focus == .smart
    let sequence = smart ? smartRotation(base) : [configuration.focus]
    let cal = Calendar.current
    let count = smart ? 8 : 5
    let stepHours = smart ? 3 : 6
    var entries: [WorldlyEntry] = []
    for k in 0..<count {
      let date = cal.date(byAdding: .hour, value: k * stepHours, to: now) ?? now
      var d = loadData(asOf: date, loadImages: false)
      d.heroImage = base.heroImage; d.tripImage = base.tripImage; d.memoryImage = base.memoryImage
      entries.append(WorldlyEntry(date: date, data: d, focus: sequence[k % sequence.count]))
    }
    return Timeline(entries: entries, policy: .atEnd)
  }
}

// MARK: - Atoms

/// Glossy gradient number — the app's vibrant hero-figure look (white shining
/// down into the cover accent).
private func heroNumber(_ value: String, _ accent: Color, size: CGFloat) -> some View {
  Text(value)
    .font(.system(size: size, weight: .bold, design: .serif))
    .minimumScaleFactor(0.5).lineLimit(1)
    .foregroundStyle(LinearGradient(colors: [.white, accent], startPoint: .top, endPoint: .bottom))
}

/// Small all-caps eyebrow label — the only place caps are used.
private struct Eyebrow: View {
  let text: String
  var tint: Color = .white.opacity(0.7)
  var body: some View {
    Text(text).font(.system(size: 10.5, weight: .heavy)).kerning(1.4).foregroundColor(tint).lineLimit(1)
  }
}

private struct ProgressRing: View {
  let progress: Double
  let tint: Color
  let center: String
  var lineWidth: CGFloat = 6
  var centerSize: CGFloat = 20
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
        .minimumScaleFactor(0.5).lineLimit(1)
        .foregroundStyle(LinearGradient(colors: [.white, tint], startPoint: .top, endPoint: .bottom))
    }
  }
}

private struct ProgressBar: View {
  let progress: Double
  let tint: Color
  var height: CGFloat = 6
  var body: some View {
    GeometryReader { geo in
      ZStack(alignment: .leading) {
        Capsule().fill(Color.white.opacity(0.18))
        Capsule()
          .fill(LinearGradient(colors: [tint.opacity(0.85), tint], startPoint: .leading, endPoint: .trailing))
          .frame(width: max(height, geo.size.width * min(1, max(0.02, progress))))
      }
    }
    .frame(height: height)
  }
}

/// A subtle quick-add affordance — a glass circle tinted with the cover accent,
/// far less dominant than a solid button, sitting quietly in the corner.
private struct AddButton: View {
  var tint: Color
  var size: CGFloat = 26
  var body: some View {
    ZStack {
      Circle().fill(.ultraThinMaterial).environment(\.colorScheme, .dark)
      Circle().fill(tint.opacity(0.5))
      Image(systemName: "plus").font(.system(size: size * 0.5, weight: .bold)).foregroundColor(.white)
    }
    .frame(width: size, height: size)
    .overlay(Circle().stroke(.white.opacity(0.22), lineWidth: 0.5))
  }
}

private extension View {
  /// A frosted-glass pill behind text over photography — kept translucent so the
  /// image reads through. A no-op on gradient backgrounds.
  @ViewBuilder func glassPill(_ on: Bool, padH: CGFloat = 12, padV: CGFloat = 9, radius: CGFloat = 16) -> some View {
    if on {
      self
        .padding(.horizontal, padH).padding(.vertical, padV)
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

private struct EmptyState: View {
  let icon: String
  let title: String
  let subtitle: String?
  var accent: Color
  var large: Bool = false
  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      Image(systemName: icon).font(.system(size: large ? 30 : 22, weight: .semibold)).foregroundColor(accent)
      Text(title).font(.system(size: large ? 24 : 19, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(2).minimumScaleFactor(0.7)
      if let s = subtitle {
        Text(s).font(.system(size: large ? 13 : 12, weight: .medium)).foregroundColor(.white.opacity(0.72)).lineLimit(2)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

// MARK: - Panels (shared between families)

/// cities · continents — exploration's concise supporting line.
private func exploreSupport(_ d: WidgetData) -> String {
  "\(d.cities) \(d.cities == 1 ? "city" : "cities") · \(d.continents) \(d.continents == 1 ? "continent" : "continents")"
}

/// Next-trip panel — destination + countdown / status. Used by the medium and
/// large layouts and the two-zone default.
private struct TripPanel: View {
  let trip: WTrip
  let accent: Color
  let accentText: Color
  var align: HorizontalAlignment = .leading
  var big: Bool = false
  var body: some View {
    VStack(alignment: align, spacing: 1) {
      Eyebrow(trip.status == .underway ? "TRIP UNDERWAY" : "NEXT TRIP", tint: accentText)
      Text(trip.country)
        .font(.system(size: big ? 24 : 16, weight: .bold, design: .serif)).foregroundColor(.white)
        .lineLimit(1).minimumScaleFactor(0.6)
      switch trip.status {
      case .upcoming:
        heroNumber("\(trip.days)", accent, size: big ? 46 : 40)
        Text(trip.days == 1 ? "day away" : "days away")
          .font(.system(size: big ? 13 : 11, weight: .semibold)).foregroundColor(.white.opacity(0.78))
        if big, let dl = trip.dateLabel {
          Text(dl).font(.system(size: 11.5, weight: .medium)).foregroundColor(.white.opacity(0.6)).padding(.top, 1)
        }
      case .today:
        Text("Starts today").font(.system(size: big ? 26 : 18, weight: .bold, design: .serif)).foregroundColor(.white)
      case .underway:
        Text("You're there now").font(.system(size: big ? 15 : 12, weight: .semibold)).foregroundColor(accentText)
      }
    }
    .frame(maxWidth: .infinity, alignment: align == .leading ? .leading : .trailing)
  }
}

/// Explorer-level panel — ring + level, XP to next.
private struct LevelPanel: View {
  let d: WidgetData
  var big: Bool = false
  var body: some View {
    HStack(spacing: big ? 16 : 12) {
      ProgressRing(progress: d.levelProgress, tint: d.accent, center: "\(d.level)",
                   lineWidth: big ? 7 : 6, centerSize: big ? 26 : 20)
        .frame(width: big ? 74 : 56, height: big ? 74 : 56)
      VStack(alignment: .leading, spacing: 2) {
        Eyebrow("LEVEL \(d.level)", tint: d.accentText)
        Text(d.levelTitle).font(.system(size: big ? 22 : 17, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(1).minimumScaleFactor(0.6)
        if let x = d.xpToNext, let n = d.nextTitle {
          Text("\(x) XP to \(n)").font(.system(size: big ? 13 : 11, weight: .medium)).foregroundColor(.white.opacity(0.72)).lineLimit(1).minimumScaleFactor(0.7)
        } else {
          Text("Highest level reached").font(.system(size: big ? 13 : 11, weight: .medium)).foregroundColor(.white.opacity(0.72))
        }
      }
      Spacer(minLength: 0)
    }
  }
}

/// World-progress panel — big percentage + "N of 195 countries".
private struct WorldPanel: View {
  let d: WidgetData
  var big: Bool = false
  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      heroNumber(String(format: "%.1f%%", d.worldPercent), d.accent, size: big ? 60 : 46)
      Text("of the world explored").font(.system(size: big ? 14 : 12, weight: .semibold)).foregroundColor(.white.opacity(0.8))
      Text("\(d.countries) of \(d.worldTotal) countries").font(.system(size: big ? 12.5 : 11, weight: .medium)).foregroundColor(d.accentText).padding(.top, 1)
      if big { ProgressBar(progress: Double(d.countries) / Double(max(1, d.worldTotal)), tint: d.accent).padding(.top, 8) }
    }
  }
}

/// Next-achievement panel — title, "X of Y unit" and a progress bar.
private struct AchPanel: View {
  let d: WidgetData
  let ach: WAch
  var big: Bool = false
  var body: some View {
    VStack(alignment: .leading, spacing: big ? 5 : 3) {
      Eyebrow("NEXT ACHIEVEMENT", tint: d.accentText)
      Text(ach.title).font(.system(size: big ? 24 : 18, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(1).minimumScaleFactor(0.6)
      ProgressBar(progress: ach.progress, tint: d.accent).padding(.vertical, big ? 3 : 2)
      Text(remainingCopy).font(.system(size: big ? 13 : 11.5, weight: .semibold)).foregroundColor(.white.opacity(0.78)).lineLimit(1).minimumScaleFactor(0.7)
    }
  }
  private var remainingCopy: String {
    if let u = ach.unit { return "\(ach.value) of \(ach.target) \(u)" }
    return "\(ach.value) of \(ach.target)"
  }
}

// MARK: - Small

private struct SmallView: View {
  let entry: WorldlyEntry
  var body: some View {
    let d = entry.data
    let photo = heroFor(d, entry.focus) != nil
    VStack(alignment: .leading, spacing: 0) {
      Spacer(minLength: 0)
      content(d).glassPill(photo)
      Spacer(minLength: 0)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }

  @ViewBuilder private func content(_ d: WidgetData) -> some View {
    if !d.synced {
      EmptyState(icon: "globe.europe.africa.fill", title: "Open Worldly", subtitle: "to sync your world", accent: d.accent)
    } else {
      switch entry.focus {
      case .nextTrip:
        if let t = d.trip { smallTrip(d, t) } else { EmptyState(icon: "airplane", title: "No trip yet", subtitle: "Plan your next one", accent: d.accent) }
      case .level:
        VStack(alignment: .leading, spacing: 6) {
          Eyebrow("LEVEL", tint: d.accentText)
          heroNumber("\(d.level)", d.accent, size: 46)
          ProgressBar(progress: d.levelProgress, tint: d.accent)
        }
      case .world:
        VStack(alignment: .leading, spacing: 3) {
          heroNumber(String(format: "%.1f%%", d.worldPercent), d.accent, size: 40)
          Text("of the world explored").font(.system(size: 11, weight: .medium)).foregroundColor(.white.opacity(0.75)).lineLimit(2)
        }
      case .achievement:
        if let a = d.ach {
          VStack(alignment: .leading, spacing: 4) {
            Eyebrow("NEXT UP", tint: d.accentText)
            Text(a.title).font(.system(size: 20, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(2).minimumScaleFactor(0.7)
            ProgressBar(progress: a.progress, tint: d.accent)
          }
        } else { exploration(d) }
      case .memory:
        if let m = d.memory { smallMemory(d, m) } else { EmptyState(icon: "sparkles", title: "No memory today", subtitle: nil, accent: d.accent) }
      default:
        exploration(d)
      }
    }
  }

  @ViewBuilder private func exploration(_ d: WidgetData) -> some View {
    if d.countries == 0 {
      EmptyState(icon: "plus.circle.fill", title: "Start your journey", subtitle: "Add your first country", accent: d.accent)
    } else {
      VStack(alignment: .leading, spacing: 2) {
        heroNumber("\(d.countries)", d.accent, size: 48)
        Text(d.countries == 1 ? "country explored" : "countries explored").font(.system(size: 11, weight: .medium)).foregroundColor(.white.opacity(0.75)).lineLimit(1)
        if d.cities > 0 { Text("\(d.cities) \(d.cities == 1 ? "city" : "cities")").font(.system(size: 11, weight: .semibold)).foregroundColor(d.accentText).padding(.top, 1) }
      }
    }
  }

  @ViewBuilder private func smallTrip(_ d: WidgetData, _ t: WTrip) -> some View {
    VStack(alignment: .leading, spacing: 1) {
      Eyebrow(t.status == .underway ? "UNDERWAY" : "NEXT TRIP", tint: d.accentText)
      Text(t.country).font(.system(size: 17, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(1).minimumScaleFactor(0.6)
      if t.status == .upcoming {
        heroNumber("\(t.days)", d.accent, size: 40)
        Text(t.days == 1 ? "day away" : "days away").font(.system(size: 11, weight: .semibold)).foregroundColor(.white.opacity(0.78))
      } else if t.status == .today {
        Text("Today!").font(.system(size: 28, weight: .bold, design: .serif)).foregroundColor(.white)
      } else {
        Text("You're there").font(.system(size: 14, weight: .semibold)).foregroundColor(d.accentText)
      }
    }
  }

  @ViewBuilder private func smallMemory(_ d: WidgetData, _ m: WMemory) -> some View {
    VStack(alignment: .leading, spacing: 3) {
      Eyebrow(m.year != nil ? "THIS DAY IN \(m.year!)" : "ON THIS DAY", tint: d.accentText)
      Text(m.label).font(.system(size: 22, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(2).minimumScaleFactor(0.7)
    }
  }
}

// MARK: - Medium

private struct MediumView: View {
  let entry: WorldlyEntry
  var body: some View {
    let d = entry.data
    Group {
      if !d.synced {
        EmptyState(icon: "globe.europe.africa.fill", title: "Open Worldly to sync", subtitle: "Your world will appear here", accent: d.accent, large: true)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
      } else {
        switch entry.focus {
        case .nextTrip: trip(d)
        case .level: single(d) { LevelPanel(d: d, big: true) }
        case .world: single(d) { WorldPanel(d: d, big: true) }
        case .achievement:
          if let a = d.ach { single(d) { AchPanel(d: d, ach: a, big: true) } } else { exploreZones(d) }
        case .memory: memory(d)
        default: exploreZones(d)
        }
      }
    }
  }

  // Two-zone default: exploration (stronger) on the left, next trip / level on
  // the right. One focal point, one supporting.
  @ViewBuilder private func exploreZones(_ d: WidgetData) -> some View {
    HStack(alignment: .center, spacing: 14) {
      VStack(alignment: .leading, spacing: 1) {
        if d.countries == 0 {
          EmptyState(icon: "plus.circle.fill", title: "Start exploring", subtitle: "Add your first country", accent: d.accent)
        } else {
          heroNumber("\(d.countries)", d.accent, size: 54)
          Text(d.countries == 1 ? "country explored" : "countries explored").font(.system(size: 12.5, weight: .medium)).foregroundColor(.white.opacity(0.78)).lineLimit(1)
          Text(exploreSupport(d)).font(.system(size: 11.5, weight: .semibold)).foregroundColor(d.accentText).lineLimit(1).minimumScaleFactor(0.7).padding(.top, 2)
        }
      }
      .glassPill(d.heroImage != nil)
      Spacer(minLength: 0)
      Group {
        if let t = d.trip { TripPanel(trip: t, accent: d.accent, accentText: d.accentText, align: .trailing) }
        else if d.level > 0 { VStack(alignment: .trailing, spacing: 3) { ProgressRing(progress: d.levelProgress, tint: d.accent, center: "\(d.level)").frame(width: 60, height: 60); Text("Level \(d.level)").font(.system(size: 12, weight: .bold)).foregroundColor(.white) } }
        else { WorldPanel(d: d) }
      }
      .glassPill(d.heroImage != nil)
      .frame(maxWidth: 150, alignment: .trailing)
    }
    .frame(maxHeight: .infinity)
    .overlay(alignment: .topTrailing) { Link(destination: ADD_URL) { AddButton(tint: d.accent) } }
  }

  @ViewBuilder private func trip(_ d: WidgetData) -> some View {
    if let t = d.trip {
      HStack {
        TripPanel(trip: t, accent: d.accent, accentText: d.accentText, align: .leading, big: true)
          .glassPill(heroFor(d, .nextTrip) != nil)
        Spacer(minLength: 0)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
      .overlay(alignment: .topTrailing) { Link(destination: ADD_URL) { AddButton(tint: d.accent) } }
    } else {
      EmptyState(icon: "airplane.departure", title: "No upcoming trip", subtitle: "Plan your next adventure", accent: d.accent, large: true)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .overlay(alignment: .topTrailing) { Link(destination: ADD_URL) { AddButton(tint: d.accent) } }
    }
  }

  @ViewBuilder private func memory(_ d: WidgetData) -> some View {
    if let m = d.memory {
      VStack(alignment: .leading, spacing: 4) {
        Eyebrow(m.year != nil ? "THIS DAY IN \(m.year!)" : "ON THIS DAY", tint: d.accentText)
        Text(m.label).font(.system(size: 34, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(2).minimumScaleFactor(0.6)
        Text("A memory worth returning to").font(.system(size: 12.5, weight: .medium)).foregroundColor(.white.opacity(0.72))
      }
      .glassPill(heroFor(d, .memory) != nil)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    } else {
      EmptyState(icon: "sparkles", title: "No memory today", subtitle: "Anniversaries appear here", accent: d.accent, large: true)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
  }

  // Single-focus medium: one panel, generous space, add button in the corner.
  @ViewBuilder private func single<Content: View>(_ d: WidgetData, @ViewBuilder _ content: () -> Content) -> some View {
    content()
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
      .overlay(alignment: .topTrailing) { Link(destination: ADD_URL) { AddButton(tint: d.accent) } }
  }
}

// MARK: - Large

private struct LargeView: View {
  let entry: WorldlyEntry
  var body: some View {
    let d = entry.data
    Group {
      if !d.synced {
        EmptyState(icon: "globe.europe.africa.fill", title: "Open Worldly to sync", subtitle: "Your world will appear here", accent: d.accent, large: true)
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
      } else {
        switch entry.focus {
        case .nextTrip: tripLarge(d)
        case .level: solo(d) { LevelPanel(d: d, big: true); Spacer(minLength: 10); worldLine(d) }
        case .world: solo(d) { WorldPanel(d: d, big: true); Spacer(minLength: 12); worldSupport(d) }
        case .achievement: if let a = d.ach { solo(d) { AchPanel(d: d, ach: a, big: true); if let t = d.trip { Spacer(minLength: 12); TripPanel(trip: t, accent: d.accent, accentText: d.accentText) } } } else { composite(d) }
        case .memory: memoryLarge(d)
        default: composite(d)
        }
      }
    }
  }

  // Exploration / Smart default — three clear sections.
  @ViewBuilder private func composite(_ d: WidgetData) -> some View {
    VStack(alignment: .leading, spacing: 0) {
      // Top: exploration.
      if d.countries == 0 {
        EmptyState(icon: "plus.circle.fill", title: "Start your journey", subtitle: "Add your first country to begin", accent: d.accent, large: true)
      } else {
        HStack(alignment: .center, spacing: 14) {
          ProgressRing(progress: Double(d.countries) / Double(max(1, d.worldTotal)), tint: d.accent, center: "\(d.countries)", lineWidth: 6, centerSize: 22)
            .frame(width: 62, height: 62)
          VStack(alignment: .leading, spacing: 2) {
            Text("countries explored").font(.system(size: 19, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(1).minimumScaleFactor(0.7)
            Text(exploreSupport(d)).font(.system(size: 13, weight: .semibold)).foregroundColor(d.accentText).lineLimit(1).minimumScaleFactor(0.7)
          }
          Spacer(minLength: 0)
        }
        .glassPill(d.heroImage != nil, padH: 14, padV: 12, radius: 20)
      }
      Spacer(minLength: 12)
      // Middle: next trip.
      if let t = d.trip { tripBand(d, t) } else {
        emptyBand(d, icon: "airplane.departure", title: "No upcoming trip", subtitle: "Plan your next adventure")
      }
      Spacer(minLength: 12)
      // Bottom: one supporting module — next achievement, else level.
      if let a = d.ach { AchPanel(d: d, ach: a).glassPill(d.heroImage != nil, padH: 14, padV: 12, radius: 18) }
      else { LevelPanel(d: d).glassPill(d.heroImage != nil, padH: 14, padV: 12, radius: 18) }
    }
    .overlay(alignment: .topTrailing) { Link(destination: ADD_URL) { AddButton(tint: d.accent) } }
  }

  @ViewBuilder private func tripBand(_ d: WidgetData, _ t: WTrip) -> some View {
    HStack(alignment: .center, spacing: 12) {
      Image(systemName: t.status == .underway ? "location.fill" : "airplane.departure").font(.system(size: 20, weight: .semibold)).foregroundColor(d.accent)
      VStack(alignment: .leading, spacing: 0) {
        Eyebrow(t.status == .underway ? "TRIP UNDERWAY" : "NEXT TRIP", tint: .white.opacity(0.7))
        Text(t.country).font(.system(size: 22, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(1).minimumScaleFactor(0.6)
        if let dl = t.dateLabel, t.status == .upcoming { Text(dl).font(.system(size: 11.5, weight: .medium)).foregroundColor(.white.opacity(0.6)) }
      }
      Spacer()
      VStack(alignment: .trailing, spacing: -2) {
        if t.status == .upcoming {
          heroNumber("\(t.days)", d.accent, size: 38)
          Text(t.days == 1 ? "day away" : "days away").font(.system(size: 11, weight: .semibold)).foregroundColor(.white.opacity(0.78))
        } else {
          Text(t.status == .today ? "Today" : "Now").font(.system(size: 30, weight: .bold, design: .serif)).foregroundColor(.white)
        }
      }
    }
    .padding(.horizontal, 14).padding(.vertical, 12)
    .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(.ultraThinMaterial).opacity(d.heroImage != nil ? 1 : 0)
      .overlay(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(Color.white.opacity(d.heroImage != nil ? 0.06 : 0.1))))
    .environment(\.colorScheme, .dark)
  }

  @ViewBuilder private func emptyBand(_ d: WidgetData, icon: String, title: String, subtitle: String) -> some View {
    HStack(spacing: 12) {
      Image(systemName: icon).font(.system(size: 20, weight: .semibold)).foregroundColor(d.accent)
      VStack(alignment: .leading, spacing: 1) {
        Text(title).font(.system(size: 17, weight: .bold, design: .serif)).foregroundColor(.white)
        Text(subtitle).font(.system(size: 12, weight: .medium)).foregroundColor(.white.opacity(0.7))
      }
      Spacer()
    }
    .padding(.horizontal, 14).padding(.vertical, 12)
    .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(Color.white.opacity(0.08)))
  }

  @ViewBuilder private func worldLine(_ d: WidgetData) -> some View {
    HStack(spacing: 8) {
      Image(systemName: "globe").font(.system(size: 15, weight: .semibold)).foregroundColor(d.accentText)
      Text(String(format: "%.1f%% of the world · %ld of %ld countries", d.worldPercent, d.countries, d.worldTotal))
        .font(.system(size: 12.5, weight: .semibold)).foregroundColor(.white.opacity(0.82)).lineLimit(1).minimumScaleFactor(0.7)
      Spacer()
    }
  }

  // Supporting stat row for the large World view — cities + continents context.
  @ViewBuilder private func worldSupport(_ d: WidgetData) -> some View {
    HStack(spacing: 22) {
      VStack(alignment: .leading, spacing: 1) {
        Text("\(d.continents)").font(.system(size: 30, weight: .bold, design: .serif)).foregroundColor(.white)
        Text(d.continents == 1 ? "continent" : "continents").font(.system(size: 11, weight: .medium)).foregroundColor(.white.opacity(0.7))
      }
      VStack(alignment: .leading, spacing: 1) {
        Text("\(d.cities)").font(.system(size: 30, weight: .bold, design: .serif)).foregroundColor(d.accent)
        Text(d.cities == 1 ? "city" : "cities").font(.system(size: 11, weight: .medium)).foregroundColor(.white.opacity(0.7))
      }
      Spacer()
    }
  }

  @ViewBuilder private func tripLarge(_ d: WidgetData) -> some View {
    if let t = d.trip {
      VStack(alignment: .leading) {
        Spacer()
        TripPanel(trip: t, accent: d.accent, accentText: d.accentText, align: .leading, big: true)
          .glassPill(heroFor(d, .nextTrip) != nil, padH: 16, padV: 14, radius: 22)
        Spacer()
        if let a = d.ach { AchPanel(d: d, ach: a).glassPill(heroFor(d, .nextTrip) != nil, padH: 14, padV: 12, radius: 18) }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .overlay(alignment: .topTrailing) { Link(destination: ADD_URL) { AddButton(tint: d.accent) } }
    } else {
      EmptyState(icon: "airplane.departure", title: "No upcoming trip", subtitle: "Plan your next adventure and count down the days", accent: d.accent, large: true)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .overlay(alignment: .topTrailing) { Link(destination: ADD_URL) { AddButton(tint: d.accent) } }
    }
  }

  @ViewBuilder private func memoryLarge(_ d: WidgetData) -> some View {
    if let m = d.memory {
      VStack(alignment: .leading) {
        Spacer()
        VStack(alignment: .leading, spacing: 5) {
          Eyebrow(m.year != nil ? "THIS DAY IN \(m.year!)" : "ON THIS DAY", tint: d.accentText)
          Text(m.label).font(.system(size: 40, weight: .bold, design: .serif)).foregroundColor(.white).lineLimit(2).minimumScaleFactor(0.5)
          Text("A memory worth returning to").font(.system(size: 13, weight: .medium)).foregroundColor(.white.opacity(0.75))
        }
        .glassPill(heroFor(d, .memory) != nil, padH: 16, padV: 14, radius: 22)
        Spacer()
      }
      .frame(maxWidth: .infinity, alignment: .leading)
    } else {
      EmptyState(icon: "sparkles", title: "No memory today", subtitle: "Your travel anniversaries will appear here", accent: d.accent, large: true)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
  }

  // Single-focus large: one hero panel + optional supporting content stacked.
  @ViewBuilder private func solo<Content: View>(_ d: WidgetData, @ViewBuilder _ content: () -> Content) -> some View {
    VStack(alignment: .leading, spacing: 0) {
      Spacer(minLength: 0)
      content()
      Spacer(minLength: 0)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .overlay(alignment: .topTrailing) { Link(destination: ADD_URL) { AddButton(tint: d.accent) } }
  }
}

// MARK: - Background image per focus

private func heroFor(_ d: WidgetData, _ focus: WidgetFocus) -> UIImage? {
  switch focus {
  case .nextTrip: return d.tripImage ?? d.heroImage
  case .memory: return d.memoryImage ?? d.heroImage
  case .exploration, .world, .smart: return d.heroImage
  case .level, .achievement: return nil // progress reads cleaner on the themed gradient
  }
}

// MARK: - Lock Screen (accessory) widgets

private struct AccessoryCircularView: View {
  let entry: WorldlyEntry
  var body: some View {
    let d = entry.data
    Gauge(value: min(1, Double(d.countries) / Double(max(1, d.worldTotal)))) {
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
      if let t = d.trip, t.status == .upcoming {
        Text("Next trip").font(.system(size: 11, weight: .semibold)).widgetAccentable()
        Text(t.days == 1 ? "\(t.country) tomorrow" : "\(t.country) in \(t.days) days").font(.system(size: 15, weight: .bold)).lineLimit(1)
      } else if let t = d.trip {
        Text(t.status == .today ? "Trip today" : "Trip underway").font(.system(size: 11, weight: .semibold)).widgetAccentable()
        Text(t.country).font(.system(size: 15, weight: .bold)).lineLimit(1)
      } else if let m = d.memory {
        Text(m.year != nil ? "This day in \(m.year!)" : "On this day").font(.system(size: 11, weight: .semibold)).widgetAccentable()
        Text(m.label).font(.system(size: 15, weight: .bold)).lineLimit(1)
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
    if let t = d.trip, t.status == .upcoming {
      Label(t.days == 1 ? "\(t.country) tomorrow" : "\(t.country) in \(t.days)d", systemImage: "airplane")
    } else {
      Label("\(d.countries) countries explored", systemImage: "globe")
    }
  }
}

// MARK: - Entry view

struct WorldlyWidgetEntryView: View {
  @Environment(\.widgetFamily) var family
  let entry: WorldlyEntry

  var body: some View {
    switch family {
    case .systemMedium:
      themed { MediumView(entry: entry) }.accessibilityElement(children: .ignore).accessibilityLabel(a11y)
    case .systemLarge:
      themed { LargeView(entry: entry) }.accessibilityElement(children: .ignore).accessibilityLabel(a11y)
    case .accessoryCircular:
      AccessoryCircularView(entry: entry).containerBackground(.clear, for: .widget)
    case .accessoryRectangular:
      AccessoryRectangularView(entry: entry).containerBackground(.clear, for: .widget)
    case .accessoryInline:
      AccessoryInlineView(entry: entry)
    default:
      themed { SmallView(entry: entry) }.widgetURL(smallURL).accessibilityElement(children: .ignore).accessibilityLabel(a11y)
    }
  }

  /// The whole small widget is one tap target — deep-link to the most relevant
  /// place for its focus (a country card for trip/memory, else quick-add).
  private var smallURL: URL {
    switch entry.focus {
    case .nextTrip:
      if let c = entry.data.trip?.code, !c.isEmpty { return URL(string: "mobile://country/\(c)") ?? ADD_URL }
    case .memory:
      if let c = entry.data.memory?.code, !c.isEmpty { return URL(string: "mobile://country/\(c)") ?? ADD_URL }
    default: break
    }
    return ADD_URL
  }

  /// A VoiceOver summary so information never depends on colour or layout alone.
  private var a11y: String {
    let d = entry.data
    if !d.synced { return "Worldly. Open the app to sync." }
    switch entry.focus {
    case .nextTrip:
      guard let t = d.trip else { return "No upcoming trip." }
      switch t.status {
      case .upcoming: return "Next trip: \(t.country), \(t.days) \(t.days == 1 ? "day" : "days") away."
      case .today: return "Your trip to \(t.country) starts today."
      case .underway: return "You're in \(t.country) now."
      }
    case .level:
      return "Explorer level \(d.level), \(d.levelTitle). " + (d.xpToNext.map { "\($0) XP to the next level." } ?? "Highest level reached.")
    case .world:
      return String(format: "%.1f percent of the world explored. %ld of %ld countries.", d.worldPercent, d.countries, d.worldTotal)
    case .achievement:
      guard let a = d.ach else { return "All achievements earned." }
      return "Next achievement: \(a.title). \(a.value) of \(a.target) \(a.unit ?? "")."
    case .memory:
      guard let m = d.memory else { return "No memory today." }
      return (m.year.map { "This day in \($0): " } ?? "On this day: ") + m.label + "."
    default:
      return "\(d.countries) countries explored, \(d.cities) cities across \(d.continents) continents."
    }
  }

  @ViewBuilder private func themed<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
    let d = entry.data
    let img = heroFor(d, entry.focus)
    content().containerBackground(for: .widget) {
      ZStack {
        if let img {
          // Full-bleed destination photography with an adaptive scrim so text
          // stays legible over dark, bright or busy images alike.
          Image(uiImage: img).resizable().scaledToFill()
          Color.black.opacity(0.28)
          LinearGradient(colors: [.black.opacity(0.34), .clear, .black.opacity(0.66)], startPoint: .top, endPoint: .bottom)
          RadialGradient(colors: [d.accent.opacity(0.20), .clear], center: .topTrailing, startRadius: 2, endRadius: 220)
        } else {
          // The clean themed gradient (progress-led focuses), lit by accent glows.
          LinearGradient(colors: d.gradient, startPoint: .topLeading, endPoint: .bottomTrailing)
          RadialGradient(colors: [d.accent.opacity(0.5), .clear], center: .topLeading, startRadius: 2, endRadius: 300)
          RadialGradient(colors: [d.accent.opacity(0.22), .clear], center: .bottomTrailing, startRadius: 2, endRadius: 240)
        }
      }
    }
  }
}

// MARK: - Widget

@main
struct WorldlyWidget: Widget {
  var body: some WidgetConfiguration {
    AppIntentConfiguration(kind: "WorldlyWidget", intent: WorldlyFocusIntent.self, provider: Provider()) { entry in
      WorldlyWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Your world")
    .description("Your travels — exploration, next trip, level, world progress, achievements and memories. Themed to your Passport Cover.")
    .supportedFamilies([
      .systemSmall, .systemMedium, .systemLarge,
      .accessoryCircular, .accessoryRectangular, .accessoryInline,
    ])
  }
}
