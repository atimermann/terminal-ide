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
            case 'home':
                this.col = 0;  // Move o cursor para o início da linha
                break;
            case 'end':
                this.col = lines[this.row].length;  // Move o cursor para o fim da linha
                break;
        }
        this.editor.updateContent();
    }

    // Verifica se o cursor está visível e ajusta a rolagem
    ensureVisibility() {
        const visibleLines = this.editor.editor.height - 1; // Subtraímos as margens do editor
        if (this.row > this.editor.editor.childBase + visibleLines) {
            this.editor.editor.scrollTo(this.editor.editor.childBase + 1); // Rola para o cursor
        } else if (this.row < this.editor.editor.childBase) {
            this.editor.editor.scrollTo(this.row); // Rola para cima se o cursor estiver fora de vista
        }
    }

    injectCursorMark(lines) {
        lines[this.row] = lines[this.row].slice(0, this.col) + '✦' + lines[this.row].slice(this.col, this.col + 1) + '✶' + lines[this.row].slice(this.col + 1);
        return lines
    }

    renderCursor(highlightedCode) {
        return highlightedCode.replace(/✦([\s\S]*?)✶/, (match, capturedText) => {
            if (!capturedText.trim()) {
                capturedText = ' ';  // Um espaço visível que pode ter o fundo azul
            }
            return `\x1b[7m${capturedText}\x1b[0m`; // Modo inverso e reset de formatação
        });
    }
}
