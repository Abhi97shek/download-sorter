import AppKit
import SwiftUI
import ServiceManagement

final class AppDelegate: NSObject, NSApplicationDelegate, NSMenuDelegate {
    private var statusItem: NSStatusItem!
    private var sorter: Sorter!
    private var rulesWindow: NSWindow?
    private var recent: [String] = []

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Folder to watch. Defaults to ~/Downloads; can be overridden with
        // `defaults write com.local.DownloadSorter watchFolder /some/path` (handy for testing).
        let path = UserDefaults.standard.string(forKey: "watchFolder")
            ?? FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask)[0].path
        let folder = URL(fileURLWithPath: (path as NSString).expandingTildeInPath, isDirectory: true)

        sorter = Sorter(folder: folder)
        sorter.onMove = { [weak self] file, dest in
            self?.recent.insert("\(file)  →  \(dest)", at: 0)
            self?.recent = Array(self?.recent.prefix(10) ?? [])
        }
        sorter.start()

        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusItem.button?.image = NSImage(systemSymbolName: "tray.and.arrow.down.fill",
                                           accessibilityDescription: "Download Sorter")
        let menu = NSMenu()
        menu.delegate = self
        statusItem.menu = menu
    }

    // Rebuild the menu every time it opens so it's always current.
    func menuNeedsUpdate(_ menu: NSMenu) {
        menu.removeAllItems()

        let title = NSMenuItem(title: sorter.paused ? "Paused" : "Watching \(sorter.folder.lastPathComponent)", action: nil, keyEquivalent: "")
        title.isEnabled = false
        menu.addItem(title)
        menu.addItem(.separator())

        menu.addItem(item(sorter.paused ? "Resume Sorting" : "Pause Sorting", #selector(togglePause)))
        menu.addItem(item("Sort Files Already in Folder Now", #selector(sortNow)))

        let recentItem = NSMenuItem(title: "Recently Moved", action: nil, keyEquivalent: "")
        let sub = NSMenu()
        if recent.isEmpty {
            let none = NSMenuItem(title: "Nothing yet", action: nil, keyEquivalent: ""); none.isEnabled = false
            sub.addItem(none)
        } else {
            for r in recent { let i = NSMenuItem(title: r, action: nil, keyEquivalent: ""); i.isEnabled = false; sub.addItem(i) }
        }
        recentItem.submenu = sub
        menu.addItem(recentItem)

        menu.addItem(.separator())
        menu.addItem(item("Manage Rules…", #selector(showRules), key: ","))
        menu.addItem(item("Open Downloads Folder", #selector(openFolder)))
        let login = item("Launch at Login", #selector(toggleLogin))
        login.state = SMAppService.mainApp.status == .enabled ? .on : .off
        menu.addItem(login)
        menu.addItem(.separator())
        menu.addItem(item("Quit Download Sorter", #selector(quit), key: "q"))
    }

    private func item(_ title: String, _ action: Selector, key: String = "") -> NSMenuItem {
        let i = NSMenuItem(title: title, action: action, keyEquivalent: key)
        i.target = self
        return i
    }

    @objc private func togglePause() { sorter.paused.toggle() }
    @objc private func sortNow() { sorter.sortExistingNow() }
    @objc private func openFolder() { NSWorkspace.shared.open(sorter.folder) }
    @objc private func quit() { NSApp.terminate(nil) }

    @objc private func toggleLogin() {
        do {
            if SMAppService.mainApp.status == .enabled { try SMAppService.mainApp.unregister() }
            else { try SMAppService.mainApp.register() }
        } catch {
            let a = NSAlert()
            a.messageText = "Couldn't change Launch at Login"
            a.informativeText = "\(error.localizedDescription)\n\nTip: move Download Sorter into your Applications folder first."
            a.runModal()
        }
    }

    @objc private func showRules() {
        if rulesWindow == nil {
            let w = NSWindow(contentViewController: NSHostingController(rootView: RulesView()))
            w.title = "Download Sorter — Rules"
            w.setContentSize(NSSize(width: 520, height: 560))
            w.isReleasedWhenClosed = false
            w.center()
            rulesWindow = w
        }
        NSApp.activate(ignoringOtherApps: true)
        rulesWindow?.makeKeyAndOrderFront(nil)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)   // menu bar only, no Dock icon
app.run()
