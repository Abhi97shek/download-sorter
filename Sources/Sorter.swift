import AppKit

/// Watches the Downloads folder and moves finished downloads into folders by type.
final class Sorter {
    let folder: URL
    var paused = false { didSet { if !paused { lastStamp = nil } } }
    var onMove: ((String, String) -> Void)?   // (file name, folder name)

    private let store = RuleStore.shared
    private let fm = FileManager.default
    private var timer: Timer?
    /// Files that were already in Downloads when the app started (left alone).
    private var baseline: Set<String> = []
    /// file name -> (size, how many scans it has stayed the same)
    private var watching: [String: (size: Int64, stable: Int)] = [:]
    /// extensions skipped "this time" — don't ask again until next launch
    private var skippedThisSession: Set<String> = []
    private var prompting = false
    /// The folder's modified time at the last full scan. The folder is only re-read when it changes
    /// (or while a file is still settling), so a huge Downloads folder costs nothing while idle.
    private var lastStamp: Date?
    /// True during "Sort Files Already in Folder Now": the type dialog offers to skip all the rest at once.
    private var bulk = false
    private var skipRest = false

    /// Extensions browsers use while a download is still in progress.
    private let partialExts: Set<String> = ["crdownload", "download", "part", "partial", "tmp", "opdownload", "temp"]

    init(folder: URL) {
        self.folder = folder
        baseline = Set(currentFiles().map { $0.lastPathComponent })
    }

    func start() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.5, repeats: true) { [weak self] _ in self?.scan() }
    }

    /// Sort every file currently in the folder (including ones from before launch).
    func sortExistingNow() {
        baseline.removeAll()
        skippedThisSession.removeAll()
        bulk = true; skipRest = false; lastStamp = nil
        for f in currentFiles() { watching[f.lastPathComponent] = (fileSize(f), 2) }
        scan()
    }

    // MARK: - Scanning

    private func currentFiles() -> [URL] {
        let items = (try? fm.contentsOfDirectory(at: folder,
                                                 includingPropertiesForKeys: [.isRegularFileKey, .fileSizeKey],
                                                 options: [.skipsHiddenFiles])) ?? []
        return items.filter { url in
            let isFile = (try? url.resourceValues(forKeys: [.isRegularFileKey]).isRegularFile) ?? false
            return isFile && !partialExts.contains(url.pathExtension.lowercased())
        }
    }

    private func fileSize(_ url: URL) -> Int64 {
        Int64((try? url.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? -1)
    }

    private func scan() {
        guard !paused, !prompting else { return }
        let stamp = try? folder.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate
        if stamp != nil, stamp == lastStamp, watching.isEmpty { return }
        lastStamp = stamp
        let files = currentFiles()
        let names = Set(files.map { $0.lastPathComponent })
        baseline = baseline.intersection(names)          // forget files that are gone
        watching = watching.filter { names.contains($0.key) }

        var ready: [URL] = []
        for url in files {
            let name = url.lastPathComponent
            if baseline.contains(name) { continue }
            // Wait until the file size stops changing (download really finished).
            let size = fileSize(url)
            if let prev = watching[name], prev.size == size {
                watching[name] = (size, prev.stable + 1)
            } else {
                watching[name] = (size, 0)
            }
            if let w = watching[name], w.stable >= 1 { ready.append(url) }
        }
        // Move files of known types first, then ask about at most one new type.
        let known = ready.filter { store.folder(for: $0.pathExtension) != nil }
        let unknown = ready.filter { store.folder(for: $0.pathExtension) == nil }
        for url in known { handle(url) }
        for url in unknown {
            handle(url)
            if prompting { return }
        }
        if unknown.isEmpty { bulk = false }
    }

    /// Leave this file where it is, and stop watching it.
    private func ignore(_ name: String) {
        baseline.insert(name)
        watching.removeValue(forKey: name)
    }

    // MARK: - Moving

    private func handle(_ url: URL) {
        let ext = url.pathExtension.lowercased()
        if store.ignored.contains(ext) || skippedThisSession.contains(ext) {
            ignore(url.lastPathComponent)
            return
        }
        if let target = store.folder(for: ext) {
            move(url, to: target)
        } else {
            askAboutNewType(url, ext: ext)
        }
    }

    private func move(_ url: URL, to folderName: String) {
        let destDir = folder.appendingPathComponent(folderName, isDirectory: true)
        do {
            try fm.createDirectory(at: destDir, withIntermediateDirectories: true)
            let dest = destDir.appendingPathComponent(uniqueFileName(url.lastPathComponent) {
                fm.fileExists(atPath: destDir.appendingPathComponent($0).path)
            })
            try fm.moveItem(at: url, to: dest)
            watching.removeValue(forKey: url.lastPathComponent)
            onMove?(dest.lastPathComponent, folderName)
        } catch {
            NSLog("DownloadSorter: could not move \(url.path): \(error)")
            ignore(url.lastPathComponent)   // don't retry forever
        }
    }

    // MARK: - New file type dialog

    private func askAboutNewType(_ url: URL, ext: String) {
        if skipRest { skippedThisSession.insert(ext); ignore(url.lastPathComponent); return }
        prompting = true
        defer { prompting = false }

        let label = ext.isEmpty ? "files without an extension" : ".\(ext) files"
        let alert = NSAlert()
        alert.messageText = "New file type: \(ext.isEmpty ? "(no extension)" : "." + ext)"
        alert.informativeText = "\"\(url.lastPathComponent)\" was downloaded, and there is no folder for \(label) yet.\n\nType a name for a new folder (or pick an existing one). All future \(label) will go there too."
        alert.addButton(withTitle: "Create Folder & Move")
        alert.addButton(withTitle: "Skip for Now")
        alert.addButton(withTitle: "Never Sort \(ext.isEmpty ? "These" : "." + ext)")
        if bulk { alert.addButton(withTitle: "Skip the Rest") }

        let box = NSComboBox(frame: NSRect(x: 0, y: 0, width: 280, height: 26))
        box.addItems(withObjectValues: store.folderNames)
        box.stringValue = ext.isEmpty ? "Others" : "\(ext.uppercased()) Files"
        box.completes = true
        alert.accessoryView = box
        alert.window.initialFirstResponder = box

        NSApp.activate(ignoringOtherApps: true)
        let response = alert.runModal()

        let skipAll = NSApplication.ModalResponse(rawValue: NSApplication.ModalResponse.alertFirstButtonReturn.rawValue + 3)
        if bulk, response == skipAll {
            skipRest = true; skippedThisSession.insert(ext); ignore(url.lastPathComponent)
            return
        }

        switch response {
        case .alertFirstButtonReturn:
            let name = cleanFolderName(box.stringValue)
            guard !name.isEmpty else { skippedThisSession.insert(ext); return }
            guard store.setRule(ext: ext, folder: name) else { skippedThisSession.insert(ext); return }
            if fm.fileExists(atPath: url.path) { move(url, to: name) }
        case .alertThirdButtonReturn:
            store.ignored.insert(ext)
            ignore(url.lastPathComponent)
        default:
            skippedThisSession.insert(ext)
            ignore(url.lastPathComponent)
        }
    }
}
