# Think Center VS Code Extension

> **Forked from [Think Center](https://github.com/himanshu-garg/think-center)** - A multi-perspective cognitive framework for software development that integrates directly into VS Code.

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=garghimanshu0786.think-center)
[![GitHub](https://img.shields.io/github/stars/garghimanshu0786/think-center-vscode?style=social)](https://github.com/garghimanshu0786/think-center-vscode)

Think Center provides five distinct thinking perspectives to help developers approach problems more comprehensively and make better decisions.

## 🎯 What is Think Center?

Think Center is a cognitive framework that encourages looking at problems through multiple lenses:

- **🏗️ Weaver**: Architecture and design perspective
- **🔨 Maker**: Implementation and development perspective  
- **✅ Checker**: Quality assurance and testing perspective
- **👥 Observer/Guardian**: User experience and requirements perspective
- **🚀 Explorer/Exploiter**: Innovation and optimization perspective

## 🌟 Features

### Dual Integration Approach

This extension offers two ways to use Think Center:

1. **Native VS Code Extension**: Full UI with panels, tree views, and context analysis
2. **Copilot Chat Integration**: Direct prompts you can use in GitHub Copilot Chat

### Extension Features

- **Smart Context Analysis**: Automatically analyzes your current code context
- **Perspective-Based Prompts**: Tailored prompts for each thinking perspective
- **Interactive UI Panel**: Rich webview interface for exploring perspectives
- **Tree View**: Quick access to perspectives and prompts
- **Keyboard Shortcuts**: Fast access to Think Center functionality
- **Context Menus**: Right-click integration in the editor

### Copilot Chat Integration

- **Ready-to-use Prompts**: Copy and paste prompts directly into Copilot Chat
- **Context-Aware Templates**: Prompts that adapt to your current code selection
- **No Setup Required**: Works immediately with GitHub Copilot

## 🚀 Quick Start

### Option 1: Native Extension

1. Install the extension
2. Open any code file
3. Use `Ctrl+Shift+T` (or `Cmd+Shift+T` on Mac) to open Think Center panel
4. Select a perspective and choose a prompt
5. The extension analyzes your context and generates a tailored prompt

### Option 2: Copilot Chat

1. Install the extension  
2. Select some code in your editor
3. Use `Ctrl+Shift+P` > "Think Center: Copy Prompt for Copilot Chat"
4. Paste the prompt in GitHub Copilot Chat
5. Start your multi-perspective conversation

## 📋 Commands

- `thinkCenter.openPanel` - Open Think Center panel
- `thinkCenter.analyzeContext` - Analyze current context
- `thinkCenter.showPerspectives` - Show perspectives tree view
- `thinkCenter.weaverPrompt` - Quick Weaver perspective prompt
- `thinkCenter.makerPrompt` - Quick Maker perspective prompt
- `thinkCenter.checkerPrompt` - Quick Checker perspective prompt
- `thinkCenter.observerPrompt` - Quick Observer/Guardian perspective prompt
- `thinkCenter.explorerPrompt` - Quick Explorer/Exploiter perspective prompt
- `thinkCenter.copilotChatPrompt` - Generate prompt for Copilot Chat

## ⌨️ Keyboard Shortcuts

- `Ctrl+Shift+T` (`Cmd+Shift+T`): Open Think Center panel
- `Ctrl+Shift+W` (`Cmd+Shift+W`): Weaver perspective
- `Ctrl+Shift+M` (`Cmd+Shift+M`): Maker perspective  
- `Ctrl+Shift+C` (`Cmd+Shift+C`): Checker perspective
- `Ctrl+Shift+O` (`Cmd+Shift+O`): Observer/Guardian perspective
- `Ctrl+Shift+E` (`Cmd+Shift+E`): Explorer/Exploiter perspective

## 🎨 The Five Perspectives

### 🏗️ Weaver - Architecture & Design
Focus on structure, patterns, and long-term maintainability.
- Analyze overall architecture
- Review design patterns
- Evaluate structural integrity
- Plan for scalability

### 🔨 Maker - Implementation & Development
Focus on practical implementation and coding.
- Create implementation plans
- Review code quality
- Suggest refactoring
- Optimize development workflow

### ✅ Checker - Quality & Testing
Focus on reliability, security, and correctness.
- Identify potential bugs
- Design test strategies
- Assess security risks
- Validate requirements

### 👥 Observer/Guardian - User Experience & Requirements
Focus on user needs and stakeholder value.
- Evaluate user experience
- Analyze requirements
- Consider accessibility
- Assess business impact

### 🚀 Explorer/Exploiter - Innovation & Optimization
Focus on performance, alternatives, and future possibilities.
- Identify optimization opportunities
- Explore alternative approaches
- Consider emerging technologies
- Plan for future needs

## 🛠️ Configuration

The extension can be configured through VS Code settings:

```json
{
  "thinkCenter.enableContextAnalysis": true,
  "thinkCenter.showPerspectiveIcons": true,
  "thinkCenter.autoRefreshContext": true,
  "thinkCenter.defaultPerspective": "weaver"
}
```

## 🔧 Usage Examples

### Architecture Review (Weaver)
```
Select a class or module, use Weaver perspective:
"Analyze the architecture and design patterns in this code, focusing on maintainability and scalability..."
```

### Code Quality Check (Checker)
```
Select problematic code, use Checker perspective:
"Review this code for potential bugs, security issues, and reliability concerns..."
```

### Performance Optimization (Explorer/Exploiter)
```
Select performance-critical code, use Explorer/Exploiter perspective:
"Identify optimization opportunities and alternative approaches for better performance..."
```

## 🤝 Integration with Copilot Chat

The extension works seamlessly with GitHub Copilot Chat:

1. **Context-Aware Prompts**: Automatically includes your selected code and context
2. **Perspective Templates**: Each perspective has specialized prompt templates
3. **One-Click Copy**: Generated prompts can be copied with one click
4. **No Dependencies**: Works with any Copilot Chat setup

## 📚 Learn More

Think Center is based on cognitive science principles for better decision-making and problem-solving in software development. Each perspective encourages different types of thinking:

- **Convergent thinking** (Checker, Maker)
- **Divergent thinking** (Explorer/Exploiter, Weaver)  
- **Critical thinking** (Observer/Guardian)

## 🐛 Issues & Feedback

Found a bug or have a suggestion? Please [open an issue](https://github.com/yourusername/think-center-vscode/issues).

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

This VS Code extension is based on the [Think Center cognitive framework](https://github.com/himanshu-garg/think-center) by Himanshu Garg. The original Think Center framework concepts are inspired by cognitive science research on perspective-taking and multi-dimensional thinking in software development.

## 🔗 Related Projects

- **[Think Center Framework](https://github.com/himanshu-garg/think-center)** - Original multi-perspective cognitive framework
- **[Think Center Documentation](https://github.com/himanshu-garg/think-center/blob/main/README.md)** - Learn more about the thinking methodology

---

**Happy coding with multiple perspectives! 🧠✨**

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
