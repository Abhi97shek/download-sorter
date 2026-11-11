import SwiftUI

final class FormModel: ObservableObject {
    @Published var newExt = ""
    @Published var newFolder = ""
    @Published var filter = ""
}

/// "Manage Rules" window: see which extensions go where, add, change or remove rules.
struct RulesView: View {
    @ObservedObject var store = RuleStore.shared
    @ObservedObject private var form = FormModel()

    private var grouped: [(folder: String, exts: [String])] {
        var g: [String: [String]] = [:]
        for (ext, folder) in store.rules {
            if form.filter.isEmpty || ext.contains(form.filter.lowercased()) || folder.lowercased().contains(form.filter.lowercased()) {
                g[folder, default: []].append(ext)
            }
        }
        return g.keys.sorted().map { ($0, g[$0]!.sorted()) }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Files downloaded to your Downloads folder are moved into these sub-folders.")
                .font(.callout).foregroundStyle(.secondary)

            HStack {
                TextField("Extension (e.g. sketch)", text: $form.newExt).frame(width: 170)
                Image(systemName: "arrow.right").foregroundStyle(.secondary)
                TextField("Folder name", text: $form.newFolder)
                Button("Add Rule") {
                    let e = form.newExt.trimmingCharacters(in: .whitespaces).trimmingCharacters(in: CharacterSet(charactersIn: ".")).lowercased()
                    let f = form.newFolder.trimmingCharacters(in: .whitespaces)
                    guard !e.isEmpty, !f.isEmpty else { return }
                    store.setRule(ext: e, folder: f)
                    form.newExt = ""; form.newFolder = ""
                }
                .keyboardShortcut(.defaultAction)
            }

            TextField("Search", text: $form.filter)

            List {
                ForEach(grouped, id: \.folder) { group in
                    Section(header: Text("📁 \(group.folder)").font(.headline)) {
                        ForEach(group.exts, id: \.self) { ext in
                            HStack {
                                Text(ext.isEmpty ? "(no extension)" : ".\(ext)").monospaced()
                                Spacer()
                                Button(role: .destructive) { store.removeRule(ext: ext) } label: {
                                    Image(systemName: "trash")
                                }
                                .buttonStyle(.borderless)
                                .help("Remove rule — you'll be asked again next time")
                            }
                        }
                    }
                }
                if !store.ignored.isEmpty {
                    Section(header: Text("🚫 Never sorted").font(.headline)) {
                        ForEach(store.ignored.sorted(), id: \.self) { ext in
                            HStack {
                                Text(ext.isEmpty ? "(no extension)" : ".\(ext)").monospaced()
                                Spacer()
                                Button("Stop ignoring") { store.ignored.remove(ext) }
                                    .buttonStyle(.borderless)
                            }
                        }
                    }
                }
            }
        }
        .padding(16)
        .frame(minWidth: 480, minHeight: 460)
    }
}
