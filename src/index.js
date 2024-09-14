import { Editor } from './editor/editor.js';
import { FileTree } from './fileTree/fileTree.js';
import { ConsoleBox } from './consoleBox/consoleBox.js';
import { WindowManager } from './windowManager.js';
import { createStatusBar } from './statusBar.js';
import { FileManager } from './fileManager.js';
import blessed from 'blessed';
import fs from 'fs';

// Verifica se o diretório foi passado como argumento
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Erro: Você deve fornecer o caminho do diretório.');
  process.exit(1);
}

const rootDir = args[0];
if (!fs.existsSync(rootDir) || !fs.statSync(rootDir).isDirectory()) {
  console.error('Erro: O diretório fornecido não existe ou não é um diretório válido.');
  process.exit(1);
}

// Criação da tela principal
const screen = blessed.screen({
  smartCSR: true,
  title: 'Editor de Texto em Node.js',
});

const statusBar = createStatusBar(screen);


// Carrega Modulos em ordem de dependencia
const consoleBox = new ConsoleBox(screen);
const editor = new Editor(screen);
const fileManager = new FileManager(editor, consoleBox, screen);
const fileTree = new FileTree(screen, rootDir, consoleBox, fileManager);
const windowManager = new WindowManager(editor, fileTree, consoleBox);


function loadFile(filePath) {
  if (!fs.existsSync(filePath)) {
    statusBar.setContent('Erro: O arquivo não existe!');
    screen.render();
    return;
  }

  if (fs.statSync(filePath).isFile()) {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        statusBar.setContent('Erro ao abrir o arquivo!');
      } else {
        editor.setContent(data);
        statusBar.setContent(`Arquivo ${filePath} carregado com sucesso!`);
      }
      screen.render();
    });
  } else {
    statusBar.setContent('Erro: O caminho fornecido não é um arquivo válido.');
    screen.render();
  }
}

screen.key(['C-c'], () => {
  process.exit(0);
});

// Renderiza a tela inicial
screen.render();
