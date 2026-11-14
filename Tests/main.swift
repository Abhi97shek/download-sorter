import Foundation

var failures = 0
func check(_ ok: Bool, _ what: String, line: Int = #line) {
    if !ok { failures += 1; print("FAIL (line \(line)): \(what)") }
}

// Folder names: nothing can climb out of Downloads or end up empty
check(cleanFolderName("Work Files") == "Work Files", "plain name kept")
check(cleanFolderName("../Desktop") == "-Desktop", "parent path cannot escape")
check(cleanFolderName("a/b:c") == "a-b-c", "separators become dashes")
check(cleanFolderName("..") == "", "dots only is empty")
check(cleanFolderName(" . . ") == "", "dots and spaces only is empty")
check(cleanFolderName("  Taxes  ") == "Taxes", "spaces trimmed")

// Duplicate names: never overwrite, always count up
check(uniqueFileName("a.pdf") { _ in false } == "a.pdf", "free name unchanged")
check(uniqueFileName("a.pdf") { $0 == "a.pdf" } == "a (1).pdf", "first clash")
check(uniqueFileName("a.pdf") { ["a.pdf", "a (1).pdf"].contains($0) } == "a (2).pdf", "second clash")
check(uniqueFileName("README") { $0 == "README" } == "README (1)", "no extension")

// The rules file
let dir = FileManager.default.temporaryDirectory.appendingPathComponent("ds-check-\(UUID().uuidString)")
try! FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
let file = dir.appendingPathComponent("rules.json")

let fresh = RuleStore(fileURL: file)
check(fresh.folder(for: "PDF") == "PDFs", "defaults load, and lookups ignore case")
check(fresh.setRule(ext: "sketch", folder: " ../Design "), "rule saved")
check(fresh.folder(for: "sketch") == "-Design", "stored folder name is cleaned")
check(!fresh.setRule(ext: "xyz", folder: ".."), "empty name rejected")
check(fresh.folder(for: "xyz") == nil, "rejected rule not stored")
check(RuleStore(fileURL: file).folder(for: "sketch") == "-Design", "rules survive a restart")

try! "{ not json".write(to: file, atomically: true, encoding: .utf8)
_ = RuleStore(fileURL: file)
check((try? String(contentsOf: file.appendingPathExtension("bak"), encoding: .utf8)) == "{ not json",
      "a damaged rules.json is backed up before it is replaced")

try! #"{"rules":{"abc":"../Evil","def":".."},"ignored":["zzz"]}"#.write(to: file, atomically: true, encoding: .utf8)
let loaded = RuleStore(fileURL: file)
check(loaded.folder(for: "abc") == "-Evil", "a hand-edited bad folder name is cleaned on load")
check(loaded.folder(for: "def") == nil, "an empty folder name is dropped on load")
check(loaded.ignored.contains("zzz"), "the never-sort list is kept")

try? FileManager.default.removeItem(at: dir)
if failures > 0 { print("\(failures) check(s) failed"); exit(1) }
print("all checks passed")
