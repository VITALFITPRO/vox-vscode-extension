import * as vscode from 'vscode';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
  // 1. Diagnósticos / LSP Básico (Tarea 5)
  diagnosticCollection = vscode.languages.createDiagnosticCollection('vox');
  context.subscriptions.push(diagnosticCollection);

  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection);
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(e => updateDiagnostics(e.document, diagnosticCollection))
  );
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => updateDiagnostics(doc, diagnosticCollection))
  );

  // 2. Comandos (Botones Play) (Tarea 6)
  context.subscriptions.push(vscode.commands.registerCommand('vox.compilar', () => runCommand('vox compilar')));
  context.subscriptions.push(vscode.commands.registerCommand('vox.ejecutar_movil', () => runCommand('vox ejecutar_movil')));
  context.subscriptions.push(vscode.commands.registerCommand('vox.ejecutar_web', () => runCommand('vox ejecutar_web')));

  // 3. Formateador (Tarea 7)
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('vox', {
      provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
        return formatDocument(document);
      }
    })
  );
}

function runCommand(cmd: string) {
  const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Vox');
  terminal.show();
  terminal.sendText(cmd);
}

function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection) {
  if (document.languageId !== 'vox') {
    return;
  }
  const diagnostics: vscode.Diagnostic[] = [];
  const text = document.getText();
  const lines = text.split('\n');

  // Regex para buscar llaves y palabras clave
  let llavesAbiertas = 0;
  let parentesisAbiertos = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Chequeo de palabras mal escritas comunes
    const funcionMalEscrita = /\bfunción\b/g;
    let match;
    while ((match = funcionMalEscrita.exec(line)) !== null) {
      const range = new vscode.Range(i, match.index, i, match.index + 7);
      const diagnostic = new vscode.Diagnostic(range, 'La palabra reservada es "funcion", no "función" (sin tilde)', vscode.DiagnosticSeverity.Error);
      diagnostics.push(diagnostic);
    }

    // Contar llaves y paréntesis sencillos para simular un "LSP" básico de emparejamiento
    // (Nota: es un chequeo en tiempo real rudimentario)
    for (let c = 0; c < line.length; c++) {
      if (line[c] === '{') llavesAbiertas++;
      if (line[c] === '}') llavesAbiertas--;
      if (line[c] === '(') parentesisAbiertos++;
      if (line[c] === ')') parentesisAbiertos--;
    }
  }

  // Notificar al final del doc si quedó desbalanceado general
  if (llavesAbiertas > 0) {
    const lastLine = lines.length - 1;
    const range = new vscode.Range(lastLine, 0, lastLine, lines[lastLine].length);
    diagnostics.push(new vscode.Diagnostic(range, 'Falta cerrar al menos una llave "}" en el documento', vscode.DiagnosticSeverity.Error));
  }
  
  if (parentesisAbiertos > 0) {
    const lastLine = lines.length - 1;
    const range = new vscode.Range(lastLine, 0, lastLine, lines[lastLine].length);
    diagnostics.push(new vscode.Diagnostic(range, 'Falta cerrar al menos un paréntesis ")" en el documento', vscode.DiagnosticSeverity.Error));
  }

  collection.set(document.uri, diagnostics);
}

function formatDocument(document: vscode.TextDocument): vscode.TextEdit[] {
  const textEdits: vscode.TextEdit[] = [];
  let indentLevel = 0;
  
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    let rawText = line.text.trim();
    
    // Disminuir indentación si empiza con }
    if (rawText.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Formatear la línea (2 espacios por nivel)
    let newText = '  '.repeat(indentLevel) + rawText;
    
    // Ajustar espacios después de palabras clave comunes
    newText = newText.replace(/\b(si|mientras|funcion|para)\(/g, '$1 (');

    if (line.text !== newText && (rawText.length > 0 || line.text.length > 0)) {
      textEdits.push(vscode.TextEdit.replace(line.range, newText));
    }
    
    // Aumentar indentación si termina con { (o contiene { y no })
    let localOpens = 0;
    for (const char of rawText) {
      if (char === '{') localOpens++;
      if (char === '}') localOpens--;
    }
    indentLevel += Math.max(0, localOpens);
  }
  
  return textEdits;
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.clear();
  }
}
