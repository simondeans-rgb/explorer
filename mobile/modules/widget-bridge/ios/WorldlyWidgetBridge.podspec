Pod::Spec.new do |s|
  s.name           = 'WorldlyWidgetBridge'
  s.version        = '1.0.0'
  s.summary        = 'Writes widget data into the shared app group'
  s.description    = 'Local Expo module used by Worldly to push headline stats into the app group UserDefaults and reload WidgetKit timelines.'
  s.author         = 'Worldly'
  s.homepage       = 'https://www.worldly-explorer.com'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }
  s.source_files = '**/*.{h,m,mm,swift}'
end
