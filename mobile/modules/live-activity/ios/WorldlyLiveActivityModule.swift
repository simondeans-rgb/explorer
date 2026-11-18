import ExpoModulesCore
import ActivityKit

// The flight Live Activity's data model. This struct is declared twice — here
// (the app, which starts/updates the activity) and in the widget target
// (targets/widget/LiveActivity.swift, which draws it). ActivityKit matches the
// two by type name and Codable shape, so KEEP THEM IDENTICAL.
@available(iOS 16.2, *)
struct WorldlyFlightAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    /// "scheduled" | "boarding" | "enroute" | "landed"
    var phase: String
    /// Epoch seconds (best known: actual, else scheduled).
    var departAt: Double
    var arriveAt: Double
    /// Airport-local clock times, preformatted "HH:MM".
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

@available(iOS 16.2, *)
enum FlightActivityController {
  static func makeState(_ d: [String: Any]) -> WorldlyFlightAttributes.ContentState? {
    guard let phase = d["phase"] as? String,
          let departAt = d["departAt"] as? Double,
          let arriveAt = d["arriveAt"] as? Double else { return nil }
    return WorldlyFlightAttributes.ContentState(
      phase: phase,
      departAt: departAt,
      arriveAt: arriveAt,
      departLabel: d["departLabel"] as? String ?? "",
      arriveLabel: d["arriveLabel"] as? String ?? "",
      gate: d["gate"] as? String,
      terminal: d["terminal"] as? String,
      delayMin: d["delayMin"] as? Int
    )
  }

  /// Start the activity for this flight, or update it if it's already running.
  /// Idempotent: JS calls this whenever the flight's state changes.
  static func sync(attrs: [String: Any], state: [String: Any]) async -> Bool {
    guard ActivityAuthorizationInfo().areActivitiesEnabled else { return false }
    guard let st = makeState(state) else { return false }
    let key = attrs["flightKey"] as? String ?? ""
    // Goes stale a few hours after landing if the app never gets to end it.
    let stale = Date(timeIntervalSince1970: st.arriveAt + 3 * 3600)
    let content = ActivityContent(state: st, staleDate: stale)

    // Only one flight at a time: clear any activity left over from another.
    for other in Activity<WorldlyFlightAttributes>.activities where other.attributes.flightKey != key {
      await other.end(nil, dismissalPolicy: .immediate)
    }

    if let existing = Activity<WorldlyFlightAttributes>.activities.first(where: { $0.attributes.flightKey == key }) {
      if st.phase == "landed" {
        // Show "Landed" for a while, then clear itself from the Lock Screen.
        await existing.end(content, dismissalPolicy: .after(Date().addingTimeInterval(20 * 60)))
      } else {
        await existing.update(content)
      }
      return true
    }

    if st.phase == "landed" { return false } // nothing to start once it's over
    let attributes = WorldlyFlightAttributes(
      flightKey: key,
      flightNumber: attrs["flightNumber"] as? String ?? "",
      fromCode: attrs["fromCode"] as? String ?? "",
      toCode: attrs["toCode"] as? String ?? "",
      fromCity: attrs["fromCity"] as? String ?? "",
      toCity: attrs["toCity"] as? String ?? ""
    )
    do {
      _ = try Activity<WorldlyFlightAttributes>.request(attributes: attributes, content: content, pushType: nil)
      return true
    } catch {
      return false
    }
  }

  static func endAll() async {
    for activity in Activity<WorldlyFlightAttributes>.activities {
      await activity.end(nil, dismissalPolicy: .immediate)
    }
  }
}

/// JS bridge for the flight Live Activity. Every call is a safe no-op on
/// systems without Live Activities (iOS < 16.2, or switched off in Settings).
public class WorldlyLiveActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WorldlyLiveActivity")

    Function("isSupported") { () -> Bool in
      if #available(iOS 16.2, *) {
        return ActivityAuthorizationInfo().areActivitiesEnabled
      }
      return false
    }

    AsyncFunction("sync") { (attrs: [String: Any], state: [String: Any], promise: Promise) in
      if #available(iOS 16.2, *) {
        Task {
          let ok = await FlightActivityController.sync(attrs: attrs, state: state)
          promise.resolve(ok)
        }
      } else {
        promise.resolve(false)
      }
    }

    AsyncFunction("endAll") { (promise: Promise) in
      if #available(iOS 16.2, *) {
        Task {
          await FlightActivityController.endAll()
          promise.resolve(true)
        }
      } else {
        promise.resolve(false)
      }
    }
  }
}
