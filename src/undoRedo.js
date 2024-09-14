export function setupUndoRedo(screen, editor, statusBar) {
    let undoStack = [];
    let redoStack = [];

    editor.on('keypress', function (ch, key) {
        if (
            key &&
            key.full !== 'C-s' &&
            key.full !== 'C-o' &&
            key.full !== 'C-z' &&
            key.full !== 'C-y'
        ) {
            undoStack.push(editor.getValue());
            redoStack = [];
        }
    });

    // Função de desfazer (Ctrl+Z)
    screen.key(['C-z'], function () {
        if (undoStack.length > 0) {
            redoStack.push(editor.getValue());
            const lastState = undoStack.pop();
            editor.setValue(lastState);
            statusBar.setContent('Desfeito');
            screen.render();
        }
    });

    // Função de refazer (Ctrl+Y)
    screen.key(['C-y'], function () {
        if (redoStack.length > 0) {
            undoStack.push(editor.getValue());
            const nextState = redoStack.pop();
            editor.setValue(nextState);
            statusBar.setContent('Refeito');
            screen.render();
        }
    });
}
