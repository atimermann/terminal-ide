import fs from 'fs';

export class FileManager {
    constructor(editor, consoleBox, screen) {
        this.editor = editor;
        this.consoleBox = consoleBox;
        this.screen = screen;
        this.openFiles = [];  // Array para manter o controle dos arquivos abertos
        this.currentFile = null;

        // Configura o atalho Ctrl + S para salvar o arquivo
        this.setupSaveShortcut();
    }

    // Método para abrir um arquivo
    openFile(filePath) {
        if (!fs.existsSync(filePath)) {
            this.consoleBox.info('Erro: O arquivo não existe!');
            this.screen.render();
            return;
        }

        if (fs.statSync(filePath).isFile()) {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    this.consoleBox.info('Erro ao abrir o arquivo!');
                } else {
                    // Atualiza o conteúdo do editor
                    this.editor.setContent(data);
                    this.currentFile = filePath;

                    // Adiciona o arquivo à lista de arquivos abertos
                    if (!this.openFiles.includes(filePath)) {
                        this.openFiles.push(filePath);
                    }

                    this.consoleBox.info(`Arquivo ${filePath} aberto com sucesso!`);
                }
                this.screen.render();
            });
        } else {
            this.consoleBox.info('Erro: O caminho fornecido não é um arquivo válido.');
            this.screen.render();
        }
    }

    // Método para salvar o arquivo atualmente aberto
    saveCurrentFile() {
        if (this.currentFile) {
            const content = this.editor.getContent();
            fs.writeFile(this.currentFile, content, (err) => {
                if (err) {
                    this.consoleBox.info('Erro ao salvar o arquivo!');
                } else {
                    this.consoleBox.info(`Arquivo ${this.currentFile} salvo com sucesso!`);
                }
                this.screen.render();
            });
        } else {
            this.consoleBox.info('Nenhum arquivo aberto para salvar.');
            this.screen.render();
        }
    }

    // Método para fechar um arquivo
    closeFile(filePath) {
        const fileIndex = this.openFiles.indexOf(filePath);
        if (fileIndex !== -1) {
            this.openFiles.splice(fileIndex, 1);
            this.consoleBox.info(`Arquivo ${filePath} fechado.`);
            this.screen.render();
            if (this.currentFile === filePath) {
                this.currentFile = null;
                this.editor.setContent('');  // Limpa o conteúdo do editor
            }
        } else {
            this.consoleBox.info('Erro: O arquivo não está aberto.');
            this.screen.render();
        }
    }

    // Lista todos os arquivos abertos
    listOpenFiles() {
        return this.openFiles;
    }

    // Configura o atalho Ctrl + S para salvar o arquivo
    setupSaveShortcut() {
        this.screen.key(['C-s'], () => {
            this.saveCurrentFile();
        });
    }
}
