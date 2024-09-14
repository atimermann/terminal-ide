import contrib from 'blessed-contrib';

export class ConsoleBox {
    constructor(screen) {
        this.screen = screen;

        // Cria o log contínuo usando o blessed-contrib
        this.logBar = contrib.log({
            parent: this.screen,
            bottom: 0,
            left: 0,
            width: '100%',
            height: 5,  // O log ocupará 5 linhas
            label: 'Log',
            border: {type: 'line'},
            tags: true, // Permitir tags para formatação de cores
            scrollable: true,
        });
    }

    // Método para adicionar uma nova mensagem ao log
    info(message) {
        this.logBar.log(message);  // Adiciona a nova mensagem ao log
        this.screen.render();  // Renderiza a tela novamente para exibir o log atualizado
    }

    // Método para atualizar a posição e o tamanho da área do Log
    setPosition(top, left, width, height) {
        this.logBar.top = top;
        this.logBar.left = left;
        this.logBar.width = width;
        this.logBar.height = height;
        this.screen.render();
    }
}
