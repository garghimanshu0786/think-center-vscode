# Think Center for VS Code

*Bringing multi-perspective thinking to your coding workflow*

[![Version](https://img.shields.io/vscode-marketplace/v/himanshu-garg.think-center)](https://marketplace.visualstudio.com/items?itemName=himanshu-garg.think-center)
[![Downloads](https://img.shields.io/vscode-marketplace/d/himanshu-garg.think-center)](https://marketplace.visualstudio.com/items?itemName=himanshu-garg.think-center)

> This extension brings the Think Center framework into VS Code, making it easy to approach coding challenges from multiple perspectives. Built on the foundation of [achamian/think-center](https://github.com/achamian/think-center).

## What is Think Center?

Think Center is a cognitive framework that helps developers think through problems using five distinct perspectives. Instead of getting stuck in one way of thinking, you can deliberately shift between different mental modes to find better solutions.

## The Five Perspectives

**�️ Weaver** - *The Architect*  
Thinks about structure, patterns, and how everything fits together. Great for system design and long-term maintainability.

**🔨 Maker** - *The Builder*  
Focuses on getting things done. Practical implementation, working code, and pragmatic solutions.

**✅ Checker** - *The Quality Guardian*  
Hunts for bugs, edge cases, and potential problems. Your first line of defense against issues.

**👁️ Observer/Guardian** - *The User Advocate*  
Considers the human side: developer experience, usability, and team impact.

**⚡ Explorer/Exploiter** - *The Optimizer*  
Looks for performance improvements, alternative approaches, and technical trade-offs.

## How to Use

### Quick Start with Copilot Chat

1. **Initialize**: Press `Cmd+Shift+I` to set up Think Center in Copilot Chat
2. **Ask away**: "Weaver, how should I structure this API?" or "Checker, what could break here?"
3. **Get diverse insights**: Each perspective brings unique expertise to your problem

### Extension Features

- **Panel Interface**: `Cmd+Shift+T` opens the Think Center panel
- **Context Menus**: Right-click on code to analyze with specific perspectives  
- **Keyboard Shortcuts**: Direct access to each perspective
- **Smart Context**: The extension understands your current code and project

### Example Conversations

```
You: "Checker, review this authentication function"
Copilot: *analyzes for security issues, edge cases, error handling*

You: "Weaver and Maker, debate whether to use microservices here"
Copilot: *presents architectural trade-offs from both perspectives*

You: "Council meeting: how do we improve this component's performance?"
Copilot: *multi-perspective analysis covering all angles*
```

## Installation

**From VS Code Marketplace:**
1. Open VS Code
2. Go to Extensions (Cmd+Shift+X)
3. Search for "Think Center"
4. Click Install

**From Command Line:**
```bash
code --install-extension himanshu-garg.think-center
```

## Commands & Shortcuts

| Command | Shortcut | Description |
|---------|----------|-------------|
| Open Panel | `Cmd+Shift+T` | Opens the Think Center interface |
| Initialize Chat | `Cmd+Shift+I` | Sets up Think Center in Copilot Chat |
| Ask Weaver | `Cmd+Shift+W` | Architecture and design perspective |
| Ask Maker | `Cmd+Shift+M` | Implementation perspective |
| Ask Checker | `Cmd+Shift+C` | Quality assurance perspective |
| Council Meeting | `Cmd+Shift+U` | All perspectives together |

## Works With

- **GitHub Copilot Chat** - Primary integration
- **Any AI Chat** - Copy prompts to use anywhere
- **All Languages** - Context-aware for your project type
- **Team Workflows** - Share perspective-based code reviews

## Why This Matters

Good code isn't just about syntax—it's about making thoughtful decisions. Think Center helps you:

- **Avoid tunnel vision** by deliberately shifting perspectives
- **Catch issues early** by thinking like a tester while coding
- **Build maintainable systems** by considering long-term architecture
- **Write human-friendly code** by thinking about your teammates

## Configuration

```json
{
  "thinkCenter.enabled": true,
  "thinkCenter.defaultIntegration": "both",
  "thinkCenter.includeContext": true
}
```

## Contributing

Found a bug or have an idea? [Open an issue](https://github.com/garghimanshu0786/think-center-vscode/issues) or contribute directly.

## Credits

This extension is built on the Think Center framework created by [@achamian](https://github.com/achamian). The original framework and methodology can be found at [achamian/think-center](https://github.com/achamian/think-center).

Special thanks to the Think Center community for developing this powerful thinking methodology.

---

*Happy coding with multiple perspectives! 🧠*
