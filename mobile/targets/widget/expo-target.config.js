/* eslint-env node */
/** Worldly home-screen widget target (WidgetKit).
 *  @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'WorldlyWidget',
  displayName: 'Worldly',
  bundleIdentifier: '.widget',
  deploymentTarget: '17.0',
  colors: {
    $accent: '#FF6B9A',
    $widgetBackground: '#14213D',
  },
  entitlements: {
    // Share the app group with the main app so the widget can read the
    // stats JSON the app writes via ExtensionStorage.
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },
});
