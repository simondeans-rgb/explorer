import ExpoModulesCore
import UIKit

// Alternate-app-icon runtime. UIApplication's icon APIs are main-thread-only,
// and Expo module functions run on background queues — every access below
// hops to main explicitly. (The expo-alternate-app-icons package reads
// UIApplication state during module creation on the calling queue, which
// hard-crashes; its config plugin is still used at build time for the icon
// catalog, but its native runtime is excluded from the build.)
public class WorldlyAppIconModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WorldlyAppIcon")

    AsyncFunction("getState") { (promise: Promise) in
      DispatchQueue.main.async {
        var state: [String: Any] = [
          "supported": UIApplication.shared.supportsAlternateIcons,
        ]
        if let current = UIApplication.shared.alternateIconName {
          state["current"] = current
        }
        promise.resolve(state)
      }
    }

    AsyncFunction("setIcon") { (name: String?, promise: Promise) in
      DispatchQueue.main.async {
        UIApplication.shared.setAlternateIconName(name) { error in
          if let error = error {
            promise.reject("SET_ICON_FAILED", error.localizedDescription)
          } else {
            promise.resolve(name)
          }
        }
      }
    }
  }
}
