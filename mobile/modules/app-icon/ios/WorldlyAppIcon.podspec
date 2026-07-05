Pod::Spec.new do |s|
  s.name           = 'WorldlyAppIcon'
  s.version        = '1.0.0'
  s.summary        = 'Alternate app icon switching, main-thread safe'
  s.description    = 'Local Expo module used by Worldly to read and set the alternate app icon. All UIApplication access is dispatched to the main thread.'
  s.author         = 'Worldly'
  s.homepage       = 'https://stickynotes-sand.vercel.app'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }
  s.source_files = '**/*.{h,m,mm,swift}'
end
