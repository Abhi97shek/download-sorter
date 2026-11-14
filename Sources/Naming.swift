import Foundation

/// A folder name that is safe to create inside Downloads: no path separators, and no
/// leading or trailing dots or spaces. May come back empty; callers must check.
func cleanFolderName(_ s: String) -> String {
    s.replacingOccurrences(of: "/", with: "-")
        .replacingOccurrences(of: ":", with: "-")
        .trimmingCharacters(in: CharacterSet(charactersIn: ".").union(.whitespacesAndNewlines))
}

/// "file.pdf" becomes "file (1).pdf" when `taken` says the name is in use; counts up until a name is free.
func uniqueFileName(_ name: String, taken: (String) -> Bool) -> String {
    let base = (name as NSString).deletingPathExtension
    let ext = (name as NSString).pathExtension
    var candidate = name, n = 1
    while taken(candidate) {
        candidate = ext.isEmpty ? "\(base) (\(n))" : "\(base) (\(n)).\(ext)"
        n += 1
    }
    return candidate
}
