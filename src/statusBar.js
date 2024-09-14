import blessed from 'blessed';

export function createStatusBar(screen) {
    const statusBar = blessed.box({
        parent: screen,
        bottom: 0,
        left: 0,
        width: '100%',
        height: 1,
        style: {
            fg: 'black',
            bg: 'gray',
            bold: true
        },
        content: 'Ctrl+S: Salvar | Ctrl+O: Abrir | Ctrl+C: Sair | Ctrl+Setas: Navega lista de arquivos',
    });

    return statusBar;
}
