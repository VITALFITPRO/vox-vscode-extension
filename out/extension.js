"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const node_1 = require("vscode-languageclient/node");
let client;
function activate(context) {
    // ── 1. Cliente LSP — conecta al servidor Vox ────────────────────────────────
    const serverOptions = {
        run: { command: 'dart', args: ['run', 'bin/vox.dart', 'lsp'], transport: node_1.TransportKind.stdio },
        debug: { command: 'dart', args: ['run', 'bin/vox.dart', 'lsp'], transport: node_1.TransportKind.stdio },
    };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'vox' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.vox'),
        },
    };
    client = new node_1.LanguageClient('vox-lsp', 'Vox Language Server', serverOptions, clientOptions);
    client.start();
    // ── 2. Formateo automático al guardar ───────────────────────────────────────
    context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(e => {
        if (e.document.languageId !== 'vox') {
            return;
        }
        const cfg = vscode.workspace.getConfiguration('vox');
        if (cfg.get('autoFormat', true)) {
            e.waitUntil(Promise.resolve(formatDocument(e.document)));
        }
    }));
    // ── 3. Comandos para todas las plataformas ──────────────────────────────────
    const platformCommands = [
        ['vox.compilar', 'vox compilar'],
        ['vox.ejecutar_web', 'vox ejecutar_web'],
        ['vox.ejecutar_android', 'vox ejecutar_android'],
        ['vox.ejecutar_ios', 'vox ejecutar_ios'],
        ['vox.ejecutar_mac', 'vox ejecutar_mac'],
        ['vox.ejecutar_windows', 'vox ejecutar_windows'],
        ['vox.ejecutar_linux', 'vox ejecutar_linux'],
    ];
    for (const [id, cmd] of platformCommands) {
        context.subscriptions.push(vscode.commands.registerCommand(id, () => runCommand(cmd)));
    }
    // ── 4. Formateador manual (Shift+Alt+F) ─────────────────────────────────────
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('vox', {
        provideDocumentFormattingEdits(document) {
            return formatDocument(document);
        }
    }));
}
function runCommand(cmd) {
    const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Vox');
    terminal.show();
    terminal.sendText(cmd);
}
// ── Formateador ───────────────────────────────────────────────────────────────
function formatDocument(document) {
    const edits = [];
    let indent = 0;
    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        const text = line.text.trim();
        if (text.startsWith('}')) {
            indent = Math.max(0, indent - 1);
        }
        let newText = '  '.repeat(indent) + text;
        newText = newText.replace(/\b(si|mientras|funcion|para|funcao|enquanto|funzione|mentre|per)\s*\(/g, '$1 (');
        if (line.text !== newText && (text.length > 0 || line.text.length > 0)) {
            edits.push(vscode.TextEdit.replace(line.range, newText));
        }
        let opens = 0;
        for (const ch of text) {
            if (ch === '{') {
                opens++;
            }
            if (ch === '}') {
                opens--;
            }
        }
        indent += Math.max(0, opens);
    }
    return edits;
}
async function deactivate() {
    if (client) {
        await client.stop();
    }
}
//# sourceMappingURL=extension.js.map