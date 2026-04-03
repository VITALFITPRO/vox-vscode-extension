import * as vscode from 'vscode';

let diagnosticCollection: vscode.DiagnosticCollection;

// ── Vocabulario del lenguaje Vox (ES / PT / IT) ───────────────────────────────
const VOX_ES = {
  declarations: ['variable', 'constante', 'funcion', 'clase', 'pantalla', 'constructor', 'importar', 'estado'],
  control:      ['si', 'sino', 'mientras', 'para', 'retornar', 'intentar', 'capturar', 'finalmente', 'ir_a', 'regresar'],
  other:        ['nuevo', 'este', 'extiende', 'hereda_de', 'diseño', 'al_tocar', 'al_cambiar', 'imprimir', 'asincrono', 'esperar'],
  types:        ['entero', 'decimal', 'texto', 'booleano', 'lista', 'objeto', 'vacio'],
  constants:    ['verdadero', 'falso', 'nulo'],
  widgets:      ['Texto', 'Boton', 'Imagen', 'Icono', 'columna', 'fila', 'centro', 'contenedor', 'relleno', 'espacio', 'pila', 'entrada', 'Lista', 'tarjeta', 'barra_app', 'flotante', 'dialogo', 'cargando', 'divisor', 'interruptor', 'deslizador', 'desplegable', 'navegacion_inferior', 'avatar', 'pagina_web', 'mapa', 'video', 'camara'],
};
const VOX_PT = {
  declarations: ['variavel', 'constante', 'funcao', 'classe', 'tela', 'construtor', 'importar', 'estado'],
  control:      ['se', 'senao', 'enquanto', 'para', 'retornar', 'tentar', 'capturar', 'finalmente', 'ir_para', 'voltar'],
  other:        ['novo', 'este', 'estende', 'herda_de', 'layout', 'ao_tocar', 'ao_mudar', 'imprimir', 'assincrono', 'aguardar'],
  types:        ['inteiro', 'decimal', 'texto', 'booleano', 'lista', 'objeto', 'vazio'],
  constants:    ['verdadeiro', 'falso', 'nulo'],
  widgets:      ['Texto', 'Botao', 'Imagem', 'Icone', 'coluna', 'linha', 'centro', 'container', 'preenchimento', 'espaco', 'pilha', 'entrada', 'Lista', 'cartao', 'barra_app', 'flutuante', 'dialogo', 'carregando', 'divisor', 'interruptor', 'deslizador', 'suspenso', 'navegacao_inferior', 'avatar', 'pagina_web', 'mapa', 'video', 'camera'],
};
const VOX_IT = {
  declarations: ['variabile', 'costante', 'funzione', 'classe', 'schermata', 'costruttore', 'importare', 'stato'],
  control:      ['se', 'altrimenti', 'mentre', 'per', 'ritorna', 'provare', 'catturare', 'finalmente', 'vai_a', 'torna'],
  other:        ['nuovo', 'questo', 'estende', 'eredita_da', 'layout', 'al_toccare', 'al_cambiare', 'stampa', 'asincrono', 'attendere'],
  types:        ['intero', 'decimale', 'testo', 'booleano', 'lista', 'oggetto', 'vuoto'],
  constants:    ['vero', 'falso', 'nullo'],
  widgets:      ['Testo', 'Bottone', 'Immagine', 'Icona', 'colonna', 'riga', 'centro', 'contenitore', 'riempimento', 'spazio', 'pila', 'input', 'Lista', 'scheda', 'barra_app', 'flottante', 'dialogo', 'caricamento', 'divisore', 'interruttore', 'cursore', 'tendina', 'navigazione_inferiore', 'avatar', 'pagina_web', 'mappa', 'video', 'fotocamera'],
};

// ── Documentación hover ───────────────────────────────────────────────────────
const HOVER_DOCS: Record<string, string> = {
  'funcion':     '**funcion** `(ES)` — Declara una función.\n```vox\nfuncion nombre(parametros) {\n  retornar valor;\n}\n```',
  'clase':       '**clase** `(ES)` — Declara una clase orientada a objetos.\n```vox\nclase MiClase hereda_de Base {\n  constructor() { }\n}\n```',
  'pantalla':    '**pantalla** `(ES)` — Declara una pantalla de UI.\n```vox\npantalla Inicio {\n  diseño {\n    columna { }\n  }\n}\n```',
  'variable':    '**variable** `(ES)` — Declara una variable mutable.\n```vox\nvariable nombre = valor;\n```',
  'constante':   '**constante** `(ES)` — Declara una constante inmutable.\n```vox\nconstante PI = 3.14;\n```',
  'estado':      '**estado** `(ES)` — Variable reactiva (actualiza la UI automáticamente).\n```vox\nestado variable contador = 0;\n```',
  'si':          '**si** `(ES/PT/IT)` — Condicional.\n```vox\nsi (condicion) {\n} sino {\n}\n```',
  'mientras':    '**mientras** `(ES)` — Bucle mientras se cumpla la condición.\n```vox\nmientras (i < 10) {\n  i++;\n}\n```',
  'para':        '**para** `(ES/PT)` — Bucle de iteración.\n```vox\npara (variable i = 0; i < 10; i++) { }\n```',
  'retornar':    '**retornar** `(ES)` — Retorna un valor desde una función.\n```vox\nretornar miValor;\n```',
  'nuevo':       '**nuevo** `(ES)` — Crea una nueva instancia de una clase.\n```vox\nvariable obj = nuevo MiClase(params);\n```',
  'este':        '**este** `(ES/PT)` — Referencia al objeto actual.\n```vox\neste.propiedad = valor;\n```',
  'hereda_de':   '**hereda_de** `(ES)` — Herencia de clase.\n```vox\nclase Hijo hereda_de Padre { }\n```',
  'ir_a':        '**ir_a** `(ES)` — Navega a otra pantalla.\n```vox\nir_a("NombrePantalla");\n```',
  'regresar':    '**regresar** `(ES)` — Regresa a la pantalla anterior.\n```vox\nregresar();\n```',
  'imprimir':    '**imprimir** `(ES/PT)` — Imprime en la consola.\n```vox\nimprimir("Hola mundo");\n```',
  'diseño':      '**diseño** `(ES)` — Bloque de definición de la interfaz visual.\n```vox\ndiseño {\n  columna { }\n}\n```',
  'asincrono':   '**asincrono** `(ES)` — Declara una función asíncrona.\n```vox\nasincrono funcion cargarDatos() {\n  variable res = esperar api.obtener();\n}\n```',
  'esperar':     '**esperar** `(ES)` — Espera el resultado de una operación asíncrona.\n```vox\nvariable datos = esperar obtenerDatos();\n```',
  'intentar':    '**intentar** `(ES)` — Bloque de manejo de errores.\n```vox\nintentar {\n} capturar (error) {\n  imprimir(error);\n}\n```',
  // Types
  'entero':      '**entero** `tipo` — Número entero. Ej: `42`',
  'decimal':     '**decimal** `tipo` — Número con decimales. Ej: `3.14`',
  'texto':       '**texto** `tipo` — Cadena de caracteres. Ej: `"Hola"`',
  'booleano':    '**booleano** `tipo` — Verdadero o falso.',
  'lista':       '**lista** `tipo` — Colección ordenada.\n```vox\nvariable items: lista = [1, 2, 3];\n```',
  'objeto':      '**objeto** `tipo` — Tipo genérico.',
  'vacio':       '**vacio** `tipo` — Sin valor de retorno (void).',
  'verdadero':   '**verdadero** — Valor booleano `true`.',
  'falso':       '**falso** — Valor booleano `false`.',
  'nulo':        '**nulo** — Ausencia de valor (`null`).',
  // Widgets
  'Texto':       '**Texto** `widget` — Muestra texto en pantalla.\n```vox\nTexto("Hola", tamaño: 24, color: "azul")\n```',
  'Boton':       '**Boton** `widget` — Botón interactivo.\n```vox\nBoton("Clic", al_tocar: () {\n  ir_a("Siguiente");\n})\n```',
  'columna':     '**columna** `widget` — Organiza hijos verticalmente.\n```vox\ncolumna(alineacion: "centro") {\n  Texto("A")\n  Texto("B")\n}\n```',
  'fila':        '**fila** `widget` — Organiza hijos horizontalmente.\n```vox\nfila(alineacion: "centro") { }\n```',
  'contenedor':  '**contenedor** `widget` — Caja con tamaño, color y relleno.\n```vox\ncontenedor(ancho: 200, alto: 100, color: "#FF0000") { }\n```',
  'centro':      '**centro** `widget` — Centra su hijo en el espacio disponible.',
  'Imagen':      '**Imagen** `widget` — Muestra una imagen.\n```vox\nImagen("assets/foto.png", ancho: 200)\n```',
  'entrada':     '**entrada** `widget` — Campo de texto editable.\n```vox\nentrada(etiqueta: "Email", al_cambiar: (v) { })\n```',
  'Lista':       '**Lista** `widget` — Lista desplazable de elementos.\n```vox\nLista(items: misItems, constructor: (item) {\n  tarjeta { Texto(item.nombre) }\n})\n```',
  'tarjeta':     '**tarjeta** `widget` — Contenedor con sombra y bordes redondeados.',
  'barra_app':   '**barra_app** `widget` — Barra superior de navegación.',
  'flotante':    '**flotante** `widget` — Botón de acción flotante (FAB).\n```vox\nflotante(icono: "mas", al_tocar: () { })\n```',
  'dialogo':     '**dialogo** `widget` — Ventana de diálogo modal.',
  'cargando':    '**cargando** `widget` — Indicador de carga (spinner).',
  'navegacion_inferior': '**navegacion_inferior** `widget` — Barra de navegación inferior.\n```vox\nnavegacion_inferior(opciones: [...]) { }\n```',
  'pagina_web':  '**pagina_web** `widget` — Visor de páginas web (WebView).',
  'mapa':        '**mapa** `widget` — Widget de mapa interactivo.',
  'video':       '**video** `widget` — Reproductor de video.',
  'camara':      '**camara** `widget` — Acceso a la cámara del dispositivo.',
};

export function activate(context: vscode.ExtensionContext) {
  // 1. Diagnósticos en tiempo real
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

  // 2. Formateo automático al guardar (si está habilitado en config)
  context.subscriptions.push(
    vscode.workspace.onWillSaveTextDocument(e => {
      if (e.document.languageId !== 'vox') { return; }
      const cfg = vscode.workspace.getConfiguration('vox');
      if (cfg.get<boolean>('autoFormat', true)) {
        e.waitUntil(Promise.resolve(formatDocument(e.document)));
      }
    })
  );

  // 3. Comandos para todas las plataformas
  const platformCommands: [string, string][] = [
    ['vox.compilar',         'vox compilar'],
    ['vox.ejecutar_web',     'vox ejecutar_web'],
    ['vox.ejecutar_android', 'vox ejecutar_android'],
    ['vox.ejecutar_ios',     'vox ejecutar_ios'],
    ['vox.ejecutar_mac',     'vox ejecutar_mac'],
    ['vox.ejecutar_windows', 'vox ejecutar_windows'],
    ['vox.ejecutar_linux',   'vox ejecutar_linux'],
  ];
  for (const [id, cmd] of platformCommands) {
    context.subscriptions.push(vscode.commands.registerCommand(id, () => runCommand(cmd)));
  }

  // 4. Formateador manual (Shift+Alt+F)
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('vox', {
      provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
        return formatDocument(document);
      }
    })
  );

  // 5. Autocompletado inteligente
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'vox',
      { provideCompletionItems: buildCompletionItems },
      '.', '(', ' '
    )
  );

  // 6. Hover con documentación
  context.subscriptions.push(
    vscode.languages.registerHoverProvider('vox', {
      provideHover: buildHover,
    })
  );
}

function runCommand(cmd: string) {
  const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Vox');
  terminal.show();
  terminal.sendText(cmd);
}

// ── Diagnósticos ─────────────────────────────────────────────────────────────
function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection) {
  if (document.languageId !== 'vox') { return; }

  const diagnostics: vscode.Diagnostic[] = [];
  const lines = document.getText().split('\n');
  let braces = 0;
  let parens = 0;
  let inString = false;
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Error: 'función' con tilde → debe ser 'funcion'
    const tildeRx = /\bfunción\b/g;
    let m: RegExpExecArray | null;
    while ((m = tildeRx.exec(line)) !== null) {
      diagnostics.push(new vscode.Diagnostic(
        new vscode.Range(i, m.index, i, m.index + 7),
        'Escribe "funcion" sin tilde — es una palabra reservada de Vox',
        vscode.DiagnosticSeverity.Error
      ));
    }

    // Balance de llaves y paréntesis (respeta strings y comentarios)
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      const nx = line[c + 1];

      if (inBlockComment) {
        if (ch === '*' && nx === '/') { inBlockComment = false; c++; }
        continue;
      }
      if (inString) {
        if (ch === '"') { inString = false; }
        continue;
      }
      if (ch === '/' && nx === '/') { break; }
      if (ch === '/' && nx === '*') { inBlockComment = true; c++; continue; }
      if (ch === '"') { inString = true; continue; }

      if (ch === '{') { braces++; }
      if (ch === '}') {
        braces--;
        if (braces < 0) {
          diagnostics.push(new vscode.Diagnostic(
            new vscode.Range(i, c, i, c + 1),
            'Llave "}" sin apertura correspondiente',
            vscode.DiagnosticSeverity.Error
          ));
          braces = 0;
        }
      }
      if (ch === '(') { parens++; }
      if (ch === ')') {
        parens--;
        if (parens < 0) {
          diagnostics.push(new vscode.Diagnostic(
            new vscode.Range(i, c, i, c + 1),
            'Paréntesis ")" sin apertura correspondiente',
            vscode.DiagnosticSeverity.Error
          ));
          parens = 0;
        }
      }
    }
  }

  const last = lines.length - 1;
  const lastRange = new vscode.Range(last, 0, last, lines[last].length);
  if (braces > 0) {
    diagnostics.push(new vscode.Diagnostic(lastRange,
      `Faltan ${braces} llave(s) de cierre "}" en el documento`,
      vscode.DiagnosticSeverity.Error));
  }
  if (parens > 0) {
    diagnostics.push(new vscode.Diagnostic(lastRange,
      `Faltan ${parens} paréntesis de cierre ")" en el documento`,
      vscode.DiagnosticSeverity.Error));
  }

  collection.set(document.uri, diagnostics);
}

// ── Formateador ───────────────────────────────────────────────────────────────
function formatDocument(document: vscode.TextDocument): vscode.TextEdit[] {
  const edits: vscode.TextEdit[] = [];
  let indent = 0;

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const text = line.text.trim();

    if (text.startsWith('}')) { indent = Math.max(0, indent - 1); }

    let newText = '  '.repeat(indent) + text;
    // Espacio entre palabras clave y paréntesis: si( → si (
    newText = newText.replace(/\b(si|mientras|funcion|para|funcao|enquanto|funzione|mentre|per)\s*\(/g, '$1 (');

    if (line.text !== newText && (text.length > 0 || line.text.length > 0)) {
      edits.push(vscode.TextEdit.replace(line.range, newText));
    }

    let opens = 0;
    for (const ch of text) {
      if (ch === '{') { opens++; }
      if (ch === '}') { opens--; }
    }
    indent += Math.max(0, opens);
  }

  return edits;
}

// ── Autocompletado ────────────────────────────────────────────────────────────
function buildCompletionItems(document: vscode.TextDocument): vscode.CompletionItem[] {
  const items: vscode.CompletionItem[] = [];
  const text = document.getText();

  // Identificadores definidos por el usuario en el archivo actual
  const userSymbols = new Set<string>();
  const defPatterns = [
    /\b(?:funcion|funcao|funzione)\s+([a-zA-ZáéíóúñÁÉÍÓÚÑüÜ_][\wáéíóúñÁÉÍÓÚÑüÜ]*)/g,
    /\b(?:variable|variavel|variabile|constante|costante)\s+([a-zA-ZáéíóúñÁÉÍÓÚÑüÜ_][\wáéíóúñÁÉÍÓÚÑüÜ]*)/g,
    /\b(?:clase|classe|schermata|tela|pantalla)\s+([A-ZÁÉÍÓÚ][a-zA-ZáéíóúñÁÉÍÓÚÑüÜ\d]*)/g,
  ];
  for (const rx of defPatterns) {
    let m: RegExpExecArray | null;
    while ((m = rx.exec(text)) !== null) { userSymbols.add(m[1]); }
  }
  for (const sym of userSymbols) {
    const item = new vscode.CompletionItem(sym, vscode.CompletionItemKind.Variable);
    item.detail = 'Símbolo definido en este archivo';
    items.push(item);
  }

  // Todos los tokens del lenguaje (ES + PT + IT)
  const allLangs = [VOX_ES, VOX_PT, VOX_IT];
  const allWidgets = new Set([...VOX_ES.widgets, ...VOX_PT.widgets, ...VOX_IT.widgets]);
  const allTypes   = new Set([...VOX_ES.types,   ...VOX_PT.types,   ...VOX_IT.types]);
  const seen = new Set<string>();

  for (const lang of allLangs) {
    const groups: [string[], vscode.CompletionItemKind][] = [
      [lang.declarations, vscode.CompletionItemKind.Keyword],
      [lang.control,      vscode.CompletionItemKind.Keyword],
      [lang.other,        vscode.CompletionItemKind.Keyword],
      [lang.constants,    vscode.CompletionItemKind.Constant],
      [lang.types,        vscode.CompletionItemKind.TypeParameter],
      [lang.widgets,      vscode.CompletionItemKind.Class],
    ];
    for (const [words, kind] of groups) {
      for (const word of words) {
        if (seen.has(word)) { continue; }
        seen.add(word);
        const item = new vscode.CompletionItem(word, kind);
        if (HOVER_DOCS[word]) {
          item.documentation = new vscode.MarkdownString(HOVER_DOCS[word]);
        }
        if (allWidgets.has(word)) {
          item.detail = 'Widget Vox';
        } else if (allTypes.has(word)) {
          item.detail = 'Tipo de dato Vox';
        } else {
          item.detail = 'Palabra clave Vox';
        }
        items.push(item);
      }
    }
  }

  return items;
}

// ── Hover ─────────────────────────────────────────────────────────────────────
function buildHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined {
  const range = document.getWordRangeAtPosition(
    position,
    /[a-zA-ZáéíóúñÁÉÍÓÚÑüÜ_][\wáéíóúñÁÉÍÓÚÑüÜ]*/
  );
  if (!range) { return undefined; }
  const word = document.getText(range);
  const doc = HOVER_DOCS[word];
  if (!doc) { return undefined; }
  return new vscode.Hover(new vscode.MarkdownString(doc), range);
}

export function deactivate() {
  diagnosticCollection?.clear();
}
