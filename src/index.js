import { Editor } from './editor/editor.js';
import { createStatusBar } from './statusBar.js';
// import { setupUndoRedo } from './undoRedo.js';
import fs from 'fs';
import blessed from 'blessed';

// Criação da tela principal
const screen = blessed.screen({
  smartCSR: true,
  title: 'Editor de Texto em Node.js',
});



const statusBar = createStatusBar(screen);

// Configuração de desfazer/refazer
// setupUndoRedo(screen, editor, statusBar);


// Cria o editor
const editor = new Editor(screen);
screen.render();

// Eventos de salvar, abrir e sair
screen.key(['C-s'], () => {
  const content = editor.getValue();
  fs.writeFile('arquivo.txt', content, (err) => {
    if (err) {
      statusBar.setContent('Erro ao salvar o arquivo!');
    } else {
      statusBar.setContent('Arquivo salvo com sucesso!');
    }
    screen.render();
  });
});

screen.key(['C-o'], () => {
  fs.readFile('src/index.js', 'utf8', (err, data) => {
    if (err) {
      statusBar.setContent('Erro ao abrir o arquivo!');
    } else {
      editor.setContent(data);
      statusBar.setContent('Arquivo carregado com sucesso!');
    }
    screen.render();
  });
});

screen.key(['C-c'], () => {
  process.exit(0);
});
