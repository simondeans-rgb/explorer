// The live-flight Live Activity: what shows on the Lock Screen and in the
// Dynamic Island while you have a flight today. The app starts and updates it
// (modules/live-activity); this file only draws it.
//
// Countdowns and the in-air progress bar are driven by the system clock
// (timerInterval), so they keep moving with the app closed — no push needed.
// Gate / delay changes arrive when the app next refreshes the flight.

import ActivityKit
import WidgetKit
import SwiftUI

// KEEP IDENTICAL to the copy in
// modules/live-activity/ios/WorldlyLiveActivityModule.swift.
struct WorldlyFlightAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var phase: String
    var departAt: Double
    var arriveAt: Double
    var departLabel: String
    var arriveLabel: String
    var gate: String?
    var terminal: String?
    var delayMin: Int?
  }

  var flightKey: String
  var flightNumber: String
  var fromCode: String
  var toCode: String
  var fromCity: String
  var toCity: String
}

private let wlNavy = Color(red: 0.078, green: 0.129, blue: 0.239)
private let wlCoral = Color(red: 1.0, green: 0.42, blue: 0.604)
private let wlAqua = Color(red: 0.141, green: 0.82, blue: 0.765)
private let wlAmber = Color(red: 1.0, green: 0.722, blue: 0.302)

private func flightStatusText(_ s: WorldlyFlightAttributes.ContentState) -> String {
  switch s.phase {
  case "enroute": return "In the air"
  case "landed": return "Landed"
  case "boarding": return "Boarding"
  default:
    if let d = s.delayMin, d >= 5 { return "Delayed \(d)m" }
    return "On time"
  }
}

private func flightStatusColor(_ s: WorldlyFlightAttributes.ContentState) -> Color {
  switch s.phase {
  case "enroute", "landed": return wlAqua
  case "boarding": return wlCoral
  default:
    if let d = s.delayMin, d >= 5 { return wlAmber }
    return wlAqua
  }
}

/// A live countdown to an epoch time; falls back to "now" once it has passed
/// (a timer range must never run backwards).
private struct FlightCountdown: View {
  let to: Double
  var body: some View {
    let target = Date(timeIntervalSince1970: to)
    if target > Date() {
      Text(timerInterval: Date()...target, countsDown: true)
        .monospacedDigit()
    } else {
      Text("now")
    }
  }
}

/// The route progress bar: fills on its own while in the air.
private struct FlightProgressBar: View {
  let state: WorldlyFlightAttributes.ContentState
  var body: some View {
    let dep = Date(timeIntervalSince1970: state.departAt)
    let arr = Date(timeIntervalSince1970: state.arriveAt)
    if state.phase == "enroute" && arr > dep && arr > Date() {
      ProgressView(timerInterval: dep...arr, countsDown: false, label: { EmptyView() }, currentValueLabel: { EmptyView() })
        .progressViewStyle(.linear)
        .tint(wlCoral)
    } else {
      ProgressView(value: state.phase == "landed" ? 1.0 : 0.0)
        .progressViewStyle(.linear)
        .tint(wlCoral)
    }
  }
}

/// "Departs in 1:24:10 · Gate B32" / "Lands in 3:10:02" / "Welcome to Lisbon".
private struct FlightFooter: View {
  let attributes: WorldlyFlightAttributes
  let state: WorldlyFlightAttributes.ContentState
  var body: some View {
    HStack(spacing: 5) {
      if state.phase == "landed" {
        Text("Welcome to \(attributes.toCity)")
      } else if state.phase == "enroute" {
        Text("Lands in")
        FlightCountdown(to: state.arriveAt)
        Spacer(minLength: 6)
        Text(attributes.toCity).lineLimit(1)
      } else {
        Text("Departs in")
        FlightCountdown(to: state.departAt)
        Spacer(minLength: 6)
        if let gate = state.gate, !gate.isEmpty {
          Text("Gate \(gate)").lineLimit(1)
        } else if let terminal = state.terminal, !terminal.isEmpty {
          Text("Terminal \(terminal)").lineLimit(1)
        }
      }
    }
    .font(.system(size: 13, weight: .semibold))
  }
}

private struct FlightLockScreenView: View {
  let context: ActivityViewContext<WorldlyFlightAttributes>
  var body: some View {
    let a = context.attributes
    let s = context.state
    VStack(alignment: .leading, spacing: 10) {
      HStack(spacing: 6) {
        Image(systemName: "airplane")
          .font(.system(size: 12, weight: .bold))
          .foregroundStyle(wlCoral)
        Text(a.flightNumber)
          .font(.system(size: 13, weight: .bold))
        Spacer()
        Text(flightStatusText(s))
          .font(.system(size: 11, weight: .bold))
          .foregroundStyle(wlNavy)
          .padding(.horizontal, 9)
          .padding(.vertical, 4)
          .background(Capsule().fill(flightStatusColor(s)))
      }
      HStack(alignment: .center) {
        VStack(alignment: .leading, spacing: 1) {
          Text(a.fromCode)
            .font(.system(size: 30, weight: .bold, design: .serif))
          Text(s.departLabel)
            .font(.system(size: 12, weight: .semibold))
            .opacity(0.8)
        }
        Spacer()
        Image(systemName: "airplane")
          .font(.system(size: 15))
          .opacity(0.7)
        Spacer()
        VStack(alignment: .trailing, spacing: 1) {
          Text(a.toCode)
            .font(.system(size: 30, weight: .bold, design: .serif))
          Text(s.arriveLabel)
            .font(.system(size: 12, weight: .semibold))
            .opacity(0.8)
        }
      }
      FlightProgressBar(state: s)
      FlightFooter(attributes: a, state: s)
    }
    .padding(16)
    .foregroundStyle(.white)
    .activityBackgroundTint(wlNavy)
    .activitySystemActionForegroundColor(.white)
  }
}

struct WorldlyFlightLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: WorldlyFlightAttributes.self) { context in
      FlightLockScreenView(context: context)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          VStack(alignment: .leading, spacing: 0) {
            Text(context.attributes.fromCode)
              .font(.system(size: 24, weight: .bold, design: .serif))
            Text(context.state.departLabel)
              .font(.system(size: 11, weight: .semibold))
              .opacity(0.75)
          }
          .padding(.leading, 4)
        }
        DynamicIslandExpandedRegion(.trailing) {
          VStack(alignment: .trailing, spacing: 0) {
            Text(context.attributes.toCode)
              .font(.system(size: 24, weight: .bold, design: .serif))
            Text(context.state.arriveLabel)
              .font(.system(size: 11, weight: .semibold))
              .opacity(0.75)
          }
          .padding(.trailing, 4)
        }
        DynamicIslandExpandedRegion(.center) {
          VStack(spacing: 2) {
            Text(context.attributes.flightNumber)
              .font(.system(size: 12, weight: .bold))
            Text(flightStatusText(context.state))
              .font(.system(size: 11, weight: .semibold))
              .foregroundStyle(flightStatusColor(context.state))
          }
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(spacing: 8) {
            FlightProgressBar(state: context.state)
            FlightFooter(attributes: context.attributes, state: context.state)
          }
          .padding(.horizontal, 4)
        }
      } compactLeading: {
        HStack(spacing: 4) {
          Image(systemName: "airplane")
            .font(.system(size: 11, weight: .bold))
            .foregroundStyle(wlCoral)
          Text(context.attributes.toCode)
            .font(.system(size: 13, weight: .bold))
        }
      } compactTrailing: {
        if context.state.phase == "landed" {
          Image(systemName: "checkmark.circle.fill")
            .foregroundStyle(wlAqua)
        } else {
          FlightCountdown(to: context.state.phase == "enroute" ? context.state.arriveAt : context.state.departAt)
            .font(.system(size: 13, weight: .semibold))
            .multilineTextAlignment(.trailing)
            .frame(maxWidth: 58)
        }
      } minimal: {
        Image(systemName: "airplane")
          .font(.system(size: 12, weight: .bold))
          .foregroundStyle(wlCoral)
      }
      .keylineTint(wlCoral)
    }
  }
}

// The extension's entry point: the home-screen widget plus the Live Activity.
@main
struct WorldlyWidgetBundle: WidgetBundle {
  var body: some Widget {
    WorldlyWidget()
    WorldlyFlightLiveActivity()
  }
}
