// __mocks__/vscode.js
module.exports = {
  languages: {
    registerCompletionItemProvider: jest.fn(),
  },
  CompletionItem: class {},
  CompletionItemKind: {
    Method: 0,
  },
  MarkdownString: class {},
};
