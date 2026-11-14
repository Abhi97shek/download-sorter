import Foundation
import Combine

/// Stores which file extension goes to which folder. Saved as JSON in
/// ~/Library/Application Support/DownloadSorter/rules.json
final class RuleStore: ObservableObject {
    static let shared = RuleStore()

    /// extension (lowercase, no dot) -> folder name
    @Published var rules: [String: String] = [:] { didSet { save() } }
    /// extensions the user chose to always leave alone
    @Published var ignored: Set<String> = [] { didSet { save() } }

    private let fileURL: URL
    private var loading = true

    private struct Saved: Codable {
        var rules: [String: String]
        var ignored: [String]
    }

    static let defaults: [String: [String]] = [
        "Images": ["jpg", "jpeg", "png", "gif", "heic", "heif", "webp", "bmp", "tiff", "tif", "svg", "ico", "raw", "cr2", "nef", "avif"],
        "PDFs": ["pdf"],
        "Documents": ["doc", "docx", "txt", "rtf", "odt", "pages", "md", "epub"],
        "Spreadsheets": ["xls", "xlsx", "csv", "numbers", "ods", "tsv"],
        "Presentations": ["ppt", "pptx", "key", "odp"],
        "Videos": ["mp4", "mov", "avi", "mkv", "wmv", "flv", "webm", "m4v"],
        "Music": ["mp3", "wav", "aac", "flac", "m4a", "ogg", "aiff"],
        "Archives": ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tgz"],
        "Installers": ["dmg", "pkg", "iso", "mpkg"],
        "Code": ["py", "js", "ts", "html", "css", "json", "xml", "swift", "java", "c", "cpp", "h", "sh", "ipynb", "yaml", "yml", "sql"],
        "Fonts": ["ttf", "otf", "woff", "woff2"],
    ]

    init(fileURL: URL? = nil) {
        if let fileURL {
            self.fileURL = fileURL
        } else {
            let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
                .appendingPathComponent("DownloadSorter", isDirectory: true)
            try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
            self.fileURL = dir.appendingPathComponent("rules.json")
        }

        let defaults = Dictionary(uniqueKeysWithValues: RuleStore.defaults.flatMap { folder, exts in exts.map { ($0, folder) } })
        if let data = try? Data(contentsOf: self.fileURL) {
            if let saved = try? JSONDecoder().decode(Saved.self, from: data) {
                // Folder names from disk get the same cleaning as typed ones
                rules = saved.rules.compactMapValues { let n = cleanFolderName($0); return n.isEmpty ? nil : n }
                ignored = Set(saved.ignored)
            } else {
                // Unreadable: keep a copy before the defaults overwrite it, so the user's rules are never lost silently
                let backup = self.fileURL.appendingPathExtension("bak")
                try? FileManager.default.removeItem(at: backup)
                try? FileManager.default.copyItem(at: self.fileURL, to: backup)
                rules = defaults
            }
        } else {
            rules = defaults
        }
        loading = false
        save()
    }

    func folder(for ext: String) -> String? { rules[ext.lowercased()] }

    /// Returns false, and changes nothing, when the folder name is empty once cleaned.
    @discardableResult
    func setRule(ext: String, folder: String) -> Bool {
        let name = cleanFolderName(folder)
        guard !name.isEmpty else { return false }
        rules[ext.lowercased()] = name
        ignored.remove(ext.lowercased())
        return true
    }

    func removeRule(ext: String) { rules.removeValue(forKey: ext) }

    /// All folder names currently used by rules, sorted.
    var folderNames: [String] { Array(Set(rules.values)).sorted() }

    private func save() {
        guard !loading else { return }
        let saved = Saved(rules: rules, ignored: ignored.sorted())
        if let data = try? JSONEncoder().encode(saved) {
            try? data.write(to: fileURL, options: .atomic)
        }
    }
}
