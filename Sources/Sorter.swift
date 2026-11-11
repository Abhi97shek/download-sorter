import AppKit

/// Watches the Downloads folder and moves finished downloads into folders by type.
final class Sorter {
    let folder: URL
    var paused = false
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
    }

    // MARK: - Moving

    private func handle(_ url: URL) {
        let ext = url.pathExtension.lowercased()
        if store.ignored.contains(ext) || skippedThisSession.contains(ext) {
            baseline.insert(url.lastPathComponent)   // leave it alone
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
            let dest = uniqueDestination(for: url.lastPathComponent, in: destDir)
            try fm.moveItem(at: url, to: dest)
            watching.removeValue(forKey: url.lastPathComponent)
            onMove?(dest.lastPathComponent, folderName)
        } catch {
            NSLog("DownloadSorter: could not move \(url.path): \(error)")
            baseline.insert(url.lastPathComponent)   // don't retry forever
        }
    }

    /// "file.pdf" -> "file (1).pdf" if a file with that name already exists.
    private func uniqueDestination(for name: String, in dir: URL) -> URL {
        var dest = dir.appendingPathComponent(name)
        let base = (name as NSString).deletingPathExtension
        let ext = (name as NSString).pathExtension
        var n = 1
        while fm.fileExists(atPath: dest.path) {
            let candidate = ext.isEmpty ? "\(base) (\(n))" : "\(base) (\(n)).\(ext)"
            dest = dir.appendingPathComponent(candidate)
            n += 1
        }
        return dest
    }

    // MARK: - New file type dialog

    private func askAboutNewType(_ url: URL, ext: String) {
        prompting = true
        defer { prompting = false }

        let label = ext.isEmpty ? "files without an extension" : ".\(ext) files"
        let alert = NSAlert()
        alert.messageText = "New file type: \(ext.isEmpty ? "(no extension)" : "." + ext)"
        alert.informativeText = "\"\(url.lastPathComponent)\" was downloaded, and there is no folder for \(label) yet.\n\nType a name for a new folder (or pick an existing one). All future \(label) will go there too."
        alert.addButton(withTitle: "Create Folder & Move")
        alert.addButton(withTitle: "Skip for Now")
        alert.addButton(withTitle: "Never Sort \(ext.isEmpty ? "These" : "." + ext)")

        let box = NSComboBox(frame: NSRect(x: 0, y: 0, width: 280, height: 26))
        box.addItems(withObjectValues: store.folderNames)
        box.stringValue = ext.isEmpty ? "Others" : "\(ext.uppercased()) Files"
        box.completes = true
        alert.accessoryView = box
        alert.window.initialFirstResponder = box

        NSApp.activate(ignoringOtherApps: true)
        let response = alert.runModal()

        switch response {
        case .alertFirstButtonReturn:
            let name = sanitize(box.stringValue)
            guard !name.isEmpty else { skippedThisSession.insert(ext); return }
            store.setRule(ext: ext, folder: name)
            if fm.fileExists(atPath: url.path) { move(url, to: name) }
        case .alertThirdButtonReturn:
            store.ignored.insert(ext)
            baseline.insert(url.lastPathComponent)
        default:
            skippedThisSession.insert(ext)
            baseline.insert(url.lastPathComponent)
        }
    }

    private func sanitize(_ s: String) -> String {
        s.trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "/", with: "-")
            .replacingOccurrences(of: ":", with: "-")
            .trimmingCharacters(in: CharacterSet(charactersIn: "."))
    }
}
