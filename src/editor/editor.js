import blessed from 'blessed';
import {Cursor} from './cursor.js';
import {Keymap} from "./keymap.js";
import {highlight} from "cli-highlight";

export class Editor {
    constructor(screen) {
        this.screen = screen;
        this.content = '';
        this.editor = blessed.box({
            parent: this.screen,
            tags: true,
            top: 0,
            left: '20%',
            width: '80%',
            height: '80%-1',
            mouse: true,
            scrollable: true,
            alwaysScroll: true,
            scrollbar: {
                ch: ' ',
                inverse: true,
            },
            border: {
                type: 'line'
            }
        });

        this.cursor = new Cursor(this);
        this.keymap = new Keymap(this);

        this.updateContent();
    }

    setPosition(top, left, width, height) {
        this.editor.top = top;
        this.editor.left = left;
        this.editor.width = width;
        this.editor.height = height;
        this.screen.render();
    }

    getLines() {
        return this.content.split('\n');
    }

    // Método para definir o conteúdo remotamente
    setContent(newContent) {
        this.content = newContent;
        this.cursor.row = 0;
        this.cursor.col = 0;  // Reinicia a posição do cursor
        this.updateContent();  // Atualiza o conteúdo exibido
    }

    getContent(){
        return this.content
    }

    updateContent() {

        let lines = this.getLines()
        lines = this.cursor.injectCursorMark(lines)

        let highlightedContent = highlight(lines.join('\n'), {language: 'javascript', theme: 'nord'});
        highlightedContent = this.cursor.renderCursor(highlightedContent)
        this.editor.setContent(highlightedContent);

        this.cursor.ensureVisibility();

        this.editor.screen.render();
    }

    insertText(newContent) {
        const lines = this.getLines()
        lines[this.cursor.row] = lines[this.cursor.row].slice(0, this.cursor.col) + newContent + lines[this.cursor.row].slice(this.cursor.col);
        this.cursor.col++;
        this.content = lines.join('\n');
        this.updateContent();
    }

    handleBackspace() {
        const lines = this.getLines()
        if (this.cursor.col > 0) {
            lines[this.cursor.row] = lines[this.cursor.row].slice(0, this.cursor.col - 1) + lines[this.cursor.row].slice(this.cursor.col);
            this.cursor.col--;
        } else if (this.cursor.row > 0) {
            const prevLineLength = lines[this.cursor.row - 1].length;
            lines[this.cursor.row - 1] += lines[this.cursor.row];
            lines.splice(this.cursor.row, 1);
            this.cursor.row--;
            this.cursor.col = prevLineLength;
        }
        this.content = lines.join('\n');
        this.updateContent();
    }

    handleEnter() {
        const lines = this.getLines()
        const line = lines[this.cursor.row];
        const newLine = line.slice(this.cursor.col);
        lines[this.cursor.row] = line.slice(0, this.cursor.col);
        lines.splice(this.cursor.row + 1, 0, newLine);
        this.cursor.row++;
        this.cursor.col = 0;
        this.content = lines.join('\n');
        this.updateContent();
    }

    handleDelete() {
        const lines = this.getLines();

        // Caso ainda haja caracteres na linha à direita do cursor, remove o caractere à frente
        if (this.cursor.col < lines[this.cursor.row].length) {
            lines[this.cursor.row] = lines[this.cursor.row].slice(0, this.cursor.col) + lines[this.cursor.row].slice(this.cursor.col + 1);
        } else if (this.cursor.row < lines.length - 1) {
            // Se estiver no fim da linha, mas não na última linha, junta a linha atual com a próxima
            const nextLine = lines[this.cursor.row + 1];
            lines[this.cursor.row] += nextLine;
            lines.splice(this.cursor.row + 1, 1);
        }

        this.content = lines.join('\n');
        this.updateContent();
    }
}
