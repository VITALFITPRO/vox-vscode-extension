# Vox VSC Extension

**Vox** es el primer lenguaje de programación y diseño de interfaces con sintaxis 100% en español, italiano y portugués, diseñado desde cero para aprender, crear y compilar aplicaciones reales multiplataforma (iOS, Android, Windows, C#) bajo un esquema riguroso, potente y orientado a objetos.

Esta extensión proporciona el resaltado de sintaxis sintético y los *Snippets* de autocompletado inteligente para el editor de código Visual Studio Code.

## Características 🛠️

- **Resaltado de Sintaxis Nativo**: Mapeo completo de tokens y palabras clave para `.vox` en tres idiomas (ES, PT, IT).
- **Snippets Inmediatos**: Crea estructuras complejas, clases, interfaces, variables reactivas y métodos usando atajos como `pantalla`, `clase`, `fun`, `ira`, `nav`.
- **Detección de Interfaz de Usuario**: Entiende jerarquías declarativas como Flutter/SwiftUI para palabras como `columna`, `fila`, `Texto`, `Boton`.

---

## Palabras Claves (Keywords) 📚

Vox ha sido diseñado usando vocabularios técnicos reales en tres lenguajes distintos para no forzar el inglés en los usuarios nativos. 

| Categoría | Español (ES) | Portugués (PT) | Italiano (IT) |
|---|---|---|---|
| **Declarativos** | `variable`, `funcion`, `clase`, `constructor`, `estado` | `variavel`, `funcao`, `classe`, `construtor`, `estado` | `variabile`, `funzione`, `classe`, `costruttore`, `stato` |
| **BIFs (Control)** | `si`, `mientras`, `para`, `retornar`, `ir_a`, `regresar` | `se`, `enquanto`, `para`, `retornar`, `ir_para`, `voltar` | `se`, `mentre`, `per`, `ritorna`, `vai_a`, `torna` |
| **OOP Clases** | `nuevo`, `este`, `hereda_de` | `novo`, `este`, `estende` | `nuovo`, `questo`, `estende` |
| **Navegación UI** | `pantalla`, `diseño`, `imprimir` | `tela`, `layout`, `imprimir` | `schermata`, `layout`, `stampa` |

---

## Instalación 📦

1. Descarga el instalador `.vsix`.
2. En Visual Studio Code, ve a la pestaña "Extensiones".
3. Haz clic en el ícono de los tres puntos `(...)` en la esquina superior derecha del panel de extensiones.
4. Selecciona **Instalar desde VSIX** (`Install from VSIX...`).
5. Busca el archivo descargado y presiona Instalar. ¡Y listo!

---

*Desarrollado y Architectado por Anthony (VITALFITPRO)*
