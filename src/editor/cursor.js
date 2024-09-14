import {highlight} from "cli-highlight";

export class Cursor {
    constructor(editor) {
        this.editor = editor;
        this.row = 0;
        this.col = 0;
    }

    // Método para mover o cursor
    move(direction) {
        const lines = this.editor.getLines()
        const visibleLines = this.editor.editor.height - 1;
        switch (direction) {
            case 'left':
                if (this.col > 0) {
                    this.col--;
                }
                break;
            case 'right':
                if (this.col < lines[this.row].length) {
                    this.col++;
                }
                break;
            case 'up':
                if (this.row > 0) {
                    this.row--;
                    this.col = Math.min(this.col, lines[this.row].length);  // Ajusta coluna para não ultrapassar a linha
                }
                break;
            case 'down':
                if (this.row < lines.length - 1) {
                    this.row++;
                    this.col = Math.min(this.col, lines[this.row].length);  // Ajusta coluna para não ultrapassar a linha
                }
                break;
            case 'pageup':
                this.row = Math.max(this.row - visibleLines, 0);
                this.col = Math.min(this.col, lines[this.row].length);  // Ajusta a coluna para não ultrapassar a linha
                break;
            case 'pagedown':
                this.row = Math.min(this.row + visibleLines, lines.length - 1);
                this.col = Math.min(this.col, lines[this.row].length);  // Ajusta a coluna para não ultrapassar a linha
                break;
            case 'home':
                this.col = 0;
                break;
            case 'end':
                this.col = lines[this.row].length;
                break;
        }
        this.editor.updateContent();
    }

    // Verifica se o cursor está visível e ajusta a rolagem
    ensureVisibility() {
        const visibleLines = this.editor.editor.height - 2; // Subtraímos as margens do editor
        if (this.row > this.editor.editor.childBase + visibleLines) {
            this.editor.editor.scrollTo(this.row - visibleLines); // Rola para o cursor
        } else if (this.row < this.editor.editor.childBase) {
            this.editor.editor.scrollTo(this.row); // Rola para cima se o cursor estiver fora de vista
        }
    }

    injectCursorMark(lines) {
        // Inserindo os delimitadores invisíveis
        lines[this.row] = lines[this.row].slice(0, this.col) + '\u200B' + lines[this.row].slice(this.col, this.col + 1) + '\u2063' + lines[this.row].slice(this.col + 1);
        return lines;
    }

    renderCursor(highlightedCode) {
        // Regex para capturar o código ANSI antes e depois do cursor
        return highlightedCode.replace(/\u200B([\s\S]*?)\u2063/, (match, capturedText, offset, string) => {
            // Captura a formatação ANSI antes do delimitador \u200B
            const beforeCursor = string.slice(0, offset);
            const ansiBeforeCursor = beforeCursor.match(/(\x1b\[[0-9;]*m)+$/);
            const previousFormat = ansiBeforeCursor ? ansiBeforeCursor[0] : '';

            // Caso o conteúdo seja vazio ou espaço, substitua por um espaço visível
            if (!capturedText.trim()) {
                capturedText = ' ';  // Um espaço visível para garantir o fundo azul
            }

            // Retorna o texto com a inversão de cor e restabelece a formatação anterior
            return `${previousFormat}\x1b[7m${capturedText}\x1b[0m${previousFormat}`;
        });
    }

}
