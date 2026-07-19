import ExpoModulesCore
import WidgetKit

// Pushes the widget's data JSON into the shared app group and asks WidgetKit
// to rebuild timelines. A local module (rather than a third-party wrapper) so
// a missing native registration fails loudly in JS instead of no-op'ing.
public class WorldlyWidgetBridgeModule: Module {
  private static let appGroup = "group.com.simmyd23.worldly"

  public func definition() -> ModuleDefinition {
    Name("WorldlyWidgetBridge")

    AsyncFunction("setWidgetData") { (json: String, promise: Promise) in
      guard let defaults = UserDefaults(suiteName: WorldlyWidgetBridgeModule.appGroup) else {
        promise.reject("NO_APP_GROUP", "App group \(WorldlyWidgetBridgeModule.appGroup) is unavailable")
        return
      }
      defaults.set(json, forKey: "widgetData")
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
      promise.resolve(true)
    }

    // Writes the featured destination photo into the shared container so the
    // widget can use it as a full-bleed background. Empty string clears it.
    AsyncFunction("setWidgetImage") { (base64: String, promise: Promise) in
      guard let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: WorldlyWidgetBridgeModule.appGroup) else {
        promise.reject("NO_APP_GROUP", "App group unavailable")
        return
      }
      let url = container.appendingPathComponent("widget-hero.jpg")
      if base64.isEmpty {
        try? FileManager.default.removeItem(at: url)
      } else if let data = Data(base64Encoded: base64) {
        try? data.write(to: url, options: .atomic)
      }
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
      promise.resolve(true)
    }
  }
}
