import blessed from 'blessed';
import fs from 'fs';
import path from 'path';

export class FileTree {
    constructor(screen, rootDir, consoleBox, fileManager) {
        this.screen = screen;
        this.rootDir = rootDir;
        this.nodes = [];
        this.tree = [];
        this.selectedNodeIndex = 0;
        this.fileManager = fileManager

        // Cria o widget de file tree
        this.fileTree = blessed.box({
            parent: this.screen,
            top: 0,
            left: 0,
            width: '20%',
            height: '100%-1',
            label: 'File Tree',
            border: { type: 'line' },
            keys: false,
            tags: true,
            scrollable: true,
        });

        // Carrega a árvore de arquivos sem mostrar o diretório raiz
        this.loadFileTree();

        // Ativa atalhos globais para navegação
        this.setupGlobalShortcuts();
    }

    // Método para carregar a árvore de arquivos
    loadFileTree() {
        this.tree = this.buildTree(this.rootDir); // Constrói a árvore começando pelos arquivos dentro do rootDir
        this.nodes = this.flattenTree(this.tree); // Cria uma lista plana dos nós para navegação
        this.renderTree();
        this.screen.render();
    }

    // Método para construir a estrutura da árvore a partir de um diretório, começando sem o diretório raiz
    buildTree(dir) {
        const files = fs.readdirSync(dir);
        const tree = [];

        files.forEach(file => {
            if (file.startsWith('.')) return;  // Ignora arquivos/diretórios ocultos
            const fullPath = path.join(dir, file);
            const isDirectory = fs.statSync(fullPath).isDirectory();
            if (isDirectory) {
                tree.push({
                    name: file,
                    path: fullPath,
                    type: 'directory',
                    children: this.buildTree(fullPath),  // Recursivamente adiciona subdiretórios
                    extended: false
                });
            } else {
                tree.push({ name: file, path: fullPath, type: 'file' });  // Adiciona arquivos
            }
        });

        // Ordena a lista colocando diretórios antes dos arquivos, e ambos em ordem alfabética
        tree.sort((a, b) => {
            if (a.type === b.type) {
                return a.name.localeCompare(b.name);
            }
            return a.type === 'directory' ? -1 : 1;
        });

        return tree;
    }

    // Cria uma lista plana da árvore para facilitar a navegação
    flattenTree(tree, depth = 0, parentExtended = true) {
        let flatTree = [];
        if (parentExtended) {
            tree.forEach(node => {
                flatTree.push({ ...node, depth });  // Adiciona o nó atual
                if (node.extended && node.children) {
                    flatTree = flatTree.concat(this.flattenTree(node.children, depth + 1, node.extended));
                }
            });
        }
        return flatTree;
    }

    // Renderiza a árvore de arquivos na tela
    renderTree() {
        const lines = this.nodes.map((node, index) => {
            const prefix = ' '.repeat(node.depth * 2);  // Indentação
            const icon = node.type === 'directory' ? (node.extended ? '⏷' : '⏵') : '•';
            const selected = this.selectedNodeIndex === index ? '{blue-fg}{bold}' : '';
            const endSelected = this.selectedNodeIndex === index ? '{/bold}{/blue-fg}' : '';
            return `${selected}${prefix}${icon} ${node.name}${endSelected}`;
        });
        this.fileTree.setContent(lines.join('\n'));
        this.screen.render();
    }

    // Configura atalhos globais para navegação e abrir/fechar diretórios
    setupGlobalShortcuts() {
        this.screen.key(['C-up', 'C-down', 'C-right', 'C-left', 'C-o'], (ch, key) => {
            if (key.full === 'C-up') {
                this.navigateTree(-1);  // Move para cima
            }
            if (key.full === 'C-down') {
                this.navigateTree(1);  // Move para baixo
            }
            if (key.full === 'C-right') {
                this.expandNode();  // Expande nó (abre diretório)
            }
            if (key.full === 'C-left') {
                    this.collapseNode();  // Colapsa nó (fecha diretório)
                }
            if (key.full === 'C-o') {
                this.openSelectedFile(); // Usa Ctrl + O para abrir o arquivo selecionado
            }
        });
    }

    openSelectedFile() {
        const selectedNode = this.nodes[this.selectedNodeIndex];
        if (selectedNode && selectedNode.type === 'file') {
            this.fileManager.openFile(selectedNode.path);  // Chama o método openFile do fileManager
        }
    }

    // Navega para cima ou para baixo na árvore de arquivos
    navigateTree(direction) {
        this.selectedNodeIndex = Math.max(0, Math.min(this.nodes.length - 1, this.selectedNodeIndex + direction));
        this.renderTree();
    }

    // Expande o nó selecionado (abre diretório)
    expandNode() {
        const selectedNode = this.nodes[this.selectedNodeIndex];
        if (selectedNode.type === 'directory' && !selectedNode.extended) {
            selectedNode.extended = true;  // Expande o diretório

            // Atualiza diretamente a árvore original (this.tree) para manter o estado
            this.updateTreeExpansion(selectedNode.path, true);

            this.nodes = this.flattenTree(this.tree);  // Reutiliza a árvore atualizada
            this.renderTree();
        }
    }

    // Colapsa o nó selecionado (fecha diretório)
    collapseNode() {
        const selectedNode = this.nodes[this.selectedNodeIndex];
        if (selectedNode.type === 'directory' && selectedNode.extended) {
            // Colapsa o diretório e todos os subdiretórios
            this.collapseSubdirectories(selectedNode);

            // Atualiza diretamente a árvore original (this.tree) para manter o estado
            this.updateTreeExpansion(selectedNode.path, false);

            this.nodes = this.flattenTree(this.tree);  // Reutiliza a árvore atualizada
            this.renderTree();
        }
    }

    // Colapsa recursivamente todos os subdiretórios
    collapseSubdirectories(node) {
        node.extended = false;  // Colapsa o nó atual
        if (node.children) {
            node.children.forEach(child => {
                if (child.type === 'directory') {
                    this.collapseSubdirectories(child);  // Recursivamente colapsa os subdiretórios
                }
            });
        }
    }

    // Função auxiliar para atualizar o estado de expansão da árvore original (this.tree)
    updateTreeExpansion(path, expanded) {
        function recurse(tree) {
            for (const node of tree) {
                if (node.path === path) {
                    node.extended = expanded;
                    return;
                }
                if (node.children) {
                    recurse(node.children);
                }
            }
        }
        recurse(this.tree);
    }

    // Método para atualizar a posição e o tamanho da área do FileTree
    setPosition(top, left, width, height) {
        this.fileTree.top = top;
        this.fileTree.left = left;
        this.fileTree.width = width;
        this.fileTree.height = height;
        this.screen.render();
    }
}
