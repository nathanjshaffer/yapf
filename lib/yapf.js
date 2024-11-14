'use babel';

import YapfView from './yapf-view';
import { CompositeDisposable } from 'atom';
const fs = require("fs");
const path = require("path");

const { BufferedProcess } = require("atom");



function handleError(err, msg) {
  const errorHandling = atom.config.get("formatters-python.errorHandling");
  if (errorHandling !== "hide") {
    atom.notifications.addError(`formatters-python: ${msg}`, {
      detail: err,
      dismissable: errorHandling === "show",
    });
  }
}

export default {

  yapfView: null,
  modalPanel: null,
  subscriptions: null,

    activate(state) {
      this.yapfView = new YapfView(state.yapfViewState);
      this.modalPanel = atom.workspace.addModalPanel({
        item: this.yapfView.getElement(),
        visible: false
      });

      // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
      this.subscriptions = new CompositeDisposable();

      // Register command that toggles this view
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'yapf:toggle': () => this.toggle()
       }));

      this.subscriptions.add(atom.commands.add('atom-workspace', {
         'yapf:format': () => this.format()
       }));
    },

    deactivate() {
      this.modalPanel.destroy();
      this.subscriptions.dispose();
      this.yapfView.destroy();
    },

    serialize() {
      return {
        yapfViewState: this.yapfView.serialize()
      };
    },

    toggle() {
      console.log('Yapf was toggled!');
      return (
        this.modalPanel.isVisible() ?
        this.modalPanel.hide() :
        this.modalPanel.show()
      );
    },

    format() {
     let editor = atom.workspace.getActiveTextEditor();
     let editorPath =`'${editor.getPath()}'`;
     console.log('Format?');
     if (editor.getGrammar().scopeName === "source.python"){
       console.log('Format!');

       command = 'yapf';
       args = ['-i', editorPath];
       cwd = path.dirname(path)
       options  = { shell: true,  cwd};
       stdout = (output) => {console.log(output)};
       stderr = (err) => {
         handleError(err, [command, args]);
       }
       exit = (code) => {console.log(`yapf exited with ${code}`)};

       const bp = new BufferedProcess({command, args, options, stdout, stderr, exit});
     }

    }

  };
