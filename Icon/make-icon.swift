// Draws the Download Sorter app icon (1024x1024 PNG).
// Usage: swift make-icon.swift <output.png>
import AppKit

let size: CGFloat = 1024
let out = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "icon_1024.png"

func color(_ hex: UInt32, _ a: CGFloat = 1) -> NSColor {
    NSColor(srgbRed: CGFloat((hex >> 16) & 0xff) / 255, green: CGFloat((hex >> 8) & 0xff) / 255,
            blue: CGFloat(hex & 0xff) / 255, alpha: a)
}

let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(size), pixelsHigh: Int(size),
                           bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                           colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)

// --- Body: macOS-style rounded square with a soft drop shadow (y axis points up) ---
let body = NSRect(x: 100, y: 100, width: 824, height: 824)
let bodyPath = NSBezierPath(roundedRect: body, xRadius: 185, yRadius: 185)
NSGraphicsContext.saveGraphicsState()
let shadow = NSShadow()
shadow.shadowColor = color(0x000000, 0.35)
shadow.shadowBlurRadius = 28
shadow.shadowOffset = NSSize(width: 0, height: -12)
shadow.set()
color(0x5a26e0).setFill()
bodyPath.fill()
NSGraphicsContext.restoreGraphicsState()

NSGraphicsContext.saveGraphicsState()
bodyPath.addClip()
NSGradient(colors: [color(0x9a6bff), color(0x6c33f5), color(0x3a12a8)],
           atLocations: [0, 0.5, 1], colorSpace: .sRGB)!.draw(in: body, angle: -90)
// soft top glow
NSGradient(colors: [color(0xffffff, 0.22), color(0xffffff, 0)])!
    .draw(in: NSRect(x: 100, y: 560, width: 824, height: 364), angle: -90)
NSGraphicsContext.restoreGraphicsState()

// --- Tray (white U shape) ---
let white = color(0xffffff)
// Tray outline with the opening cut out (even-odd), clipped to the tray so the
// background gradient shows through the open top.
NSGraphicsContext.saveGraphicsState()
let trayRect = NSRect(x: 250, y: 230, width: 524, height: 250)
NSBezierPath(roundedRect: trayRect, xRadius: 64, yRadius: 64).addClip()
let tray = NSBezierPath(rect: trayRect)
tray.append(NSBezierPath(roundedRect: NSRect(x: 312, y: 360, width: 400, height: 300), xRadius: 34, yRadius: 34))
tray.windingRule = .evenOdd
white.setFill()
tray.fill()
NSGraphicsContext.restoreGraphicsState()

// --- Three coloured "folders" on the front of the tray ---
let tabs: [(CGFloat, UInt32)] = [(318, 0xffd23f), (462, 0x3df2ff), (606, 0xff3d81)]
for (x, c) in tabs {
    color(c).setFill()
    NSBezierPath(roundedRect: NSRect(x: x, y: 272, width: 100, height: 44), xRadius: 14, yRadius: 14).fill()
}

// --- Down arrow dropping into the tray ---
white.setFill()
NSBezierPath(roundedRect: NSRect(x: 470, y: 560, width: 84, height: 250), xRadius: 42, yRadius: 42).fill()
let head = NSBezierPath()
head.move(to: NSPoint(x: 362, y: 600))
head.line(to: NSPoint(x: 662, y: 600))
head.line(to: NSPoint(x: 512, y: 400))
head.close()
head.lineJoinStyle = .round
head.lineWidth = 36
white.setStroke()
head.fill()
head.stroke()

NSGraphicsContext.restoreGraphicsState()
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
print("wrote \(out)")
