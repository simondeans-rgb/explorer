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
  }
}
