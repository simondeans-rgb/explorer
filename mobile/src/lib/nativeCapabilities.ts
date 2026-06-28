import { requireOptionalNativeModule } from 'expo';

// Whether the running binary actually links these native modules. They're only
// present in a build made after they were added (eas build) — NOT in a binary
// that merely received this JS via an OTA update. Gating the camera/contacts
// entry points on these flags means an OTA can ship this code to an older
// binary safely: the buttons stay hidden, so nothing ever routes into a screen
// whose native module is missing (which would crash).
export const HAS_CAMERA = requireOptionalNativeModule('ExpoCamera') != null;
export const HAS_CONTACTS = requireOptionalNativeModule('ExpoContacts') != null;
