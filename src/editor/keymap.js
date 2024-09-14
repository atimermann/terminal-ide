export class Keymap {
    constructor(editor) {
        this.editor = editor;
        this.editor.screen.on('keypress', (ch, key) => this.handleKeyPress(ch, key)); // Delegar o evento para a Keymap
    }

    // Método para manipular a tecla pressionada
    handleKeyPress(ch, key) {
        if (key) {
            if (key.full === 'escape') {
                return;  // Sair do modo de edição se apertar ESC
            }

            if (key.full === 'backspace') {
                this.editor.handleBackspace();
                return;
            }

            if (key.full === 'enter') {
                this.editor.handleEnter();
                return;
            }

            if (key.full === 'space') {
                this.editor.insertText(' ');
                return;
            }

            // Movimentação do cursor
            if (key.full === 'left') {
                this.editor.cursor.move('left');
                return;
            }
            if (key.full === 'right') {
                this.editor.cursor.move('right');
                return;
            }
            if (key.full === 'up') {
                this.editor.cursor.move('up');
                return;
            }
            if (key.full === 'down') {
                this.editor.cursor.move('down');
                return;
            }

            // Implementação de Home e End
            if (key.full === 'home') {
                this.editor.cursor.move('home');
                return;
            }
            if (key.full === 'end') {
                this.editor.cursor.move('end');
                return;
            }
        }

        // Adiciona o caractere digitado na posição do cursor
        if (ch) {
            this.editor.insertText(ch);
        }
    }
}
