export class WindowManager {
    constructor(editor, fileTree, consoleBox) {
        this.editor = editor;
        this.fileTree = fileTree;
        this.consoleBox = consoleBox;

        // Configurações iniciais de layout
        this.layout = {
            fileTree: { top: 0, left: 0, width: '10%', height: '80%' },
            editor: { top: 0, left: '10%', width: '90%', height: '80%' },
            consoleBox: { top: '80%', left: 0, width: '100%', height: '20%' },
        };

        this.applyLayout();
    }

    // Método para aplicar o layout baseado no objeto layout
    applyLayout() {
        const { editor, fileTree, consoleBox } = this.layout;

        // Atualiza a posição e o tamanho de cada área
        this.editor.setPosition(editor.top, editor.left, editor.width, editor.height);
        this.fileTree.setPosition(fileTree.top, fileTree.left, fileTree.width, fileTree.height);
        this.consoleBox.setPosition(consoleBox.top, consoleBox.left, consoleBox.width, consoleBox.height);
    }

    // Método para atualizar as dimensões de qualquer área
    updateArea(areaName, newDimensions) {
        if (this.layout[areaName]) {
            this.layout[areaName] = { ...this.layout[areaName], ...newDimensions };
            this.applyLayout();
        }
    }
}
