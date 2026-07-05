Pod::Spec.new do |s|
  s.name           = 'FrameVideo'
  s.version        = '1.0.0'
  s.summary        = 'Encode a sequence of PNG frames into an H.264 MP4'
  s.description    = 'Local Expo module used by Worldly to turn captured share-card frames into a shareable video.'
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
