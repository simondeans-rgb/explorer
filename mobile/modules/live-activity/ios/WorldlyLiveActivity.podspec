Pod::Spec.new do |s|
  s.name           = 'WorldlyLiveActivity'
  s.version        = '1.0.0'
  s.summary        = 'Starts and updates the live-flight Live Activity'
  s.description    = 'Local Expo module used by Worldly to drive the flight Live Activity (Lock Screen + Dynamic Island) via ActivityKit.'
  s.author         = 'Worldly'
  s.homepage       = 'https://www.worldly-explorer.com'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  # ActivityKit only exists on iOS 16.1+; link it weakly so older systems launch.
  s.weak_frameworks = 'ActivityKit'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }
  s.source_files = '**/*.{h,m,mm,swift}'
end
