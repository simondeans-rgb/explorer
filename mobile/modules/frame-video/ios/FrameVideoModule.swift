import AVFoundation
import ExpoModulesCore
import UIKit

enum FrameVideoError: Error, LocalizedError {
  case badFrame(String)
  case writerFailed(String)

  var errorDescription: String? {
    switch self {
    case .badFrame(let path): return "Could not read frame image at \(path)"
    case .writerFailed(let message): return "Video writer failed: \(message)"
    }
  }
}

public class FrameVideoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("FrameVideo")

    // Encodes PNG frames (file paths or file:// URIs) into an H.264 MP4 at the
    // given fps and size. Repeated consecutive paths are cheap (image cached),
    // so callers can hold the final frame by repeating its path.
    AsyncFunction("encodeFrames") { (paths: [String], fps: Int, width: Int, height: Int, promise: Promise) in
      DispatchQueue.global(qos: .userInitiated).async {
        do {
          let url = try FrameVideoModule.encode(
            paths: paths, fps: max(1, fps), width: width, height: height)
          promise.resolve(url.absoluteString)
        } catch {
          promise.reject("ENCODE_FAILED", error.localizedDescription)
        }
      }
    }
  }

  private static func loadImage(_ raw: String) -> CGImage? {
    var path = raw
    if let url = URL(string: raw), url.isFileURL {
      path = url.path
    } else if raw.hasPrefix("file://") {
      path = String(raw.dropFirst("file://".count))
    }
    if let decoded = path.removingPercentEncoding, FileManager.default.fileExists(atPath: decoded) {
      path = decoded
    }
    return UIImage(contentsOfFile: path)?.cgImage
  }

  private static func encode(paths: [String], fps: Int, width: Int, height: Int) throws -> URL {
    let out = FileManager.default.temporaryDirectory
      .appendingPathComponent("wrapped-\(UUID().uuidString).mp4")
    let writer = try AVAssetWriter(outputURL: out, fileType: .mp4)
    let input = AVAssetWriterInput(
      mediaType: .video,
      outputSettings: [
        AVVideoCodecKey: AVVideoCodecType.h264,
        AVVideoWidthKey: width,
        AVVideoHeightKey: height,
      ])
    input.expectsMediaDataInRealTime = false
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(
      assetWriterInput: input,
      sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
        kCVPixelBufferWidthKey as String: width,
        kCVPixelBufferHeightKey as String: height,
      ])
    writer.add(input)
    guard writer.startWriting() else {
      throw FrameVideoError.writerFailed(writer.error?.localizedDescription ?? "startWriting")
    }
    writer.startSession(atSourceTime: .zero)

    // Hold frames repeat the same path, so a one-image cache is all we need.
    var cachedPath: String?
    var cachedImage: CGImage?

    for (index, raw) in paths.enumerated() {
      let image: CGImage
      if raw == cachedPath, let cached = cachedImage {
        image = cached
      } else {
        guard let loaded = loadImage(raw) else { throw FrameVideoError.badFrame(raw) }
        cachedPath = raw
        cachedImage = loaded
        image = loaded
      }

      var pixelBuffer: CVPixelBuffer?
      if let pool = adaptor.pixelBufferPool {
        CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pixelBuffer)
      }
      if pixelBuffer == nil {
        CVPixelBufferCreate(
          kCFAllocatorDefault, width, height, kCVPixelFormatType_32ARGB,
          adaptor.sourcePixelBufferAttributes as CFDictionary?, &pixelBuffer)
      }
      guard let buffer = pixelBuffer else {
        throw FrameVideoError.writerFailed("could not allocate pixel buffer")
      }

      CVPixelBufferLockBaseAddress(buffer, [])
      if let context = CGContext(
        data: CVPixelBufferGetBaseAddress(buffer),
        width: width, height: height,
        bitsPerComponent: 8,
        bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)
      {
        context.setFillColor(CGColor(red: 0.05, green: 0.08, blue: 0.16, alpha: 1))
        context.fill(CGRect(x: 0, y: 0, width: width, height: height))
        context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
      }
      CVPixelBufferUnlockBaseAddress(buffer, [])

      while !input.isReadyForMoreMediaData {
        Thread.sleep(forTimeInterval: 0.01)
      }
      let time = CMTime(value: CMTimeValue(index), timescale: CMTimeScale(fps))
      if !adaptor.append(buffer, withPresentationTime: time) {
        throw FrameVideoError.writerFailed(writer.error?.localizedDescription ?? "append frame \(index)")
      }
    }

    input.markAsFinished()
    let done = DispatchSemaphore(value: 0)
    writer.finishWriting { done.signal() }
    done.wait()
    guard writer.status == .completed else {
      throw FrameVideoError.writerFailed(writer.error?.localizedDescription ?? "finishWriting")
    }
    return out
  }
}
