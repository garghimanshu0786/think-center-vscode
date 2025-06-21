import * as vscode from 'vscode';
import { AnalysisResult } from './ContextAnalyzer';

export interface ProjectContext {
    projectType: string;
    language: string;
    framework?: string;
    currentFile?: string;
    selectedCode?: string;
    relatedFiles?: string[];
    gitBranch?: string;
    errors?: vscode.Diagnostic[];
}

export class CopilotChatIntegration {
    private static readonly THINK_CENTER_SYSTEM_PROMPT = `You are GitHub Copilot enhanced with Think Center perspectives:

🧵 **Weaver** - Architecture & Patterns (system design, abstractions, long-term thinking)
🔨 **Maker** - Implementation & Execution (concrete code, pragmatic solutions, getting things done)  
✓ **Checker** - Quality & Validation (testing, edge cases, security, performance issues)
🔍 **O/G** - Developer Experience (workflow, maintainability, team impact, usability)
⚖️ **E/E** - Technical Tradeoffs (performance, technology choices, resource optimization)

**Interaction Protocol**: Users invoke perspectives by name: "Weaver, how should we structure this?" or "Maker and Checker, debate this approach"

**Key Principles**: 
- Conscious perspective selection IS the thinking process
- Productive tension between viewpoints creates insights  
- Each perspective contributes unique expertise
- Trust is granted immediately, respect is earned through quality

Ready for multi-perspective development thinking!`;

    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Think Center');
    }

    async initializeThinkCenter(): Promise<void> {
        try {
            // Copy the system prompt to clipboard for easy pasting
            await vscode.env.clipboard.writeText(CopilotChatIntegration.THINK_CENTER_SYSTEM_PROMPT);
            
            // Try to open Copilot Chat
            try {
                await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
            } catch (error) {
                // Copilot Chat might not be available, continue anyway
                console.log('Copilot Chat not available, proceeding with fallback');
            }

            const action = await vscode.window.showInformationMessage(
                '🧠 Think Center initialization copied to clipboard!',
                { modal: false },
                'Paste in Chat',
                'Show Instructions',
                'Copy Again'
            );

            if (action === 'Paste in Chat') {
                try {
                    await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
                } catch (error) {
                    vscode.window.showInformationMessage('Please open GitHub Copilot Chat manually and paste the initialization prompt');
                }
            } else if (action === 'Show Instructions') {
                this.showInstructions();
            } else if (action === 'Copy Again') {
                await vscode.env.clipboard.writeText(CopilotChatIntegration.THINK_CENTER_SYSTEM_PROMPT);
                vscode.window.showInformationMessage('Think Center prompt copied to clipboard again!');
            }
        } catch (error) {
            console.error('Failed to initialize Think Center in Copilot Chat:', error);
            this.fallbackInitialization();
        }
    }

    async askPerspectiveInChat(perspective: string, question: string, analysis: AnalysisResult): Promise<void> {
        const context = this.analysisToProjectContext(analysis);
        const prompt = this.buildChatPrompt(perspective, question, context);
        
        try {
            // Try to open Copilot Chat
            try {
                await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
            } catch (error) {
                // Copilot Chat might not be available
                console.log('Copilot Chat not available');
            }

            await vscode.env.clipboard.writeText(prompt);
            
            vscode.window.showInformationMessage(
                `${this.getPerspectiveEmoji(perspective)} ${this.getPerspectiveName(perspective)} prompt ready! Paste in Copilot Chat.`,
                'Open Chat',
                'Show Prompt'
            ).then(selection => {
                if (selection === 'Open Chat') {
                    try {
                        vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
                    } catch (error) {
                        vscode.window.showInformationMessage('Please open GitHub Copilot Chat manually');
                    }
                } else if (selection === 'Show Prompt') {
                    this.showPromptInOutput(prompt);
                }
            });
        } catch (error) {
            console.error('Failed to send to Copilot Chat:', error);
            this.showPromptInOutput(prompt);
        }
    }

    async councilMeeting(topic: string, analysis: AnalysisResult): Promise<void> {
        const context = this.analysisToProjectContext(analysis);
        const prompt = this.buildCouncilPrompt(topic, context);
        
        try {
            await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
        } catch (error) {
            console.log('Copilot Chat not available');
        }

        await vscode.env.clipboard.writeText(prompt);
        
        vscode.window.showInformationMessage(
            '🏛️ Council Meeting prompt ready! Paste in Copilot Chat.',
            'Open Chat',
            'Show Prompt'
        ).then(selection => {
            if (selection === 'Open Chat') {
                try {
                    vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
                } catch (error) {
                    vscode.window.showInformationMessage('Please open GitHub Copilot Chat manually');
                }
            } else if (selection === 'Show Prompt') {
                this.showPromptInOutput(prompt);
            }
        });
    }

    async analyzeCode(code: string, analysis: AnalysisResult): Promise<void> {
        const context = this.analysisToProjectContext(analysis);
        const prompt = this.buildAnalysisPrompt(code, context);
        await this.sendPromptToChat(prompt, 'Code Analysis');
    }

    async analyzeFile(fileContent: string, analysis: AnalysisResult): Promise<void> {
        const context = this.analysisToProjectContext(analysis);
        const prompt = this.buildFileAnalysisPrompt(fileContent, context);
        await this.sendPromptToChat(prompt, 'File Analysis');
    }

    async debugWithPerspectives(problem: string, analysis: AnalysisResult): Promise<void> {
        const context = this.analysisToProjectContext(analysis);
        const prompt = this.buildDebugPrompt(problem, context);
        await this.sendPromptToChat(prompt, 'Debug Session');
    }

    private async sendPromptToChat(prompt: string, label: string): Promise<void> {
        try {
            await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
        } catch (error) {
            console.log('Copilot Chat not available');
        }

        await vscode.env.clipboard.writeText(prompt);
        
        vscode.window.showInformationMessage(
            `🧠 Think Center ${label} prompt ready! Paste in Copilot Chat.`,
            'Open Chat',
            'Show Prompt'
        ).then(selection => {
            if (selection === 'Open Chat') {
                try {
                    vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
                } catch (error) {
                    vscode.window.showInformationMessage('Please open GitHub Copilot Chat manually');
                }
            } else if (selection === 'Show Prompt') {
                this.showPromptInOutput(prompt);
            }
        });
    }

    private buildChatPrompt(perspective: string, question: string, context: ProjectContext): string {
        const emoji = this.getPerspectiveEmoji(perspective);
        const perspectiveName = this.getPerspectiveName(perspective);
        
        return `**${emoji} ${perspectiveName}** analysis requested:

**Context**: ${this.formatContext(context)}
**Question**: ${question}

Please analyze this from the ${perspectiveName} perspective, focusing on ${this.getPerspectiveFocus(perspective)}.`;
    }

    private buildCouncilPrompt(topic: string, context: ProjectContext): string {
        return `**🏛️ Think Center Council Meeting**

**Context**: ${this.formatContext(context)}
**Topic**: ${topic}

**Council Assembly**:
🧵 **Weaver**: Architecture and design patterns
🔨 **Maker**: Implementation quality and pragmatic concerns  
✓ **Checker**: Potential issues, bugs, and improvements
🔍 **O/G**: Developer experience and maintainability
⚖️ **E/E**: Performance and optimization opportunities

Each perspective will analyze this topic and contribute their unique insights. Let the Council begin:`;
    }

    private buildAnalysisPrompt(code: string, context: ProjectContext): string {
        return `**🔍 Think Center Code Analysis**

**Context**: ${this.formatContext(context)}

**Code to Analyze**:
\`\`\`${context.language}
${code}
\`\`\`

**Multi-Perspective Analysis**:
- **Weaver**: Architecture and design patterns
- **Maker**: Implementation quality and pragmatic concerns
- **Checker**: Potential issues, bugs, and improvements
- **O/G**: Developer experience and maintainability
- **E/E**: Performance and optimization opportunities

Provide insights from each relevant perspective:`;
    }

    private buildFileAnalysisPrompt(fileContent: string, context: ProjectContext): string {
        const fileName = context.currentFile?.split('/').pop() || 'file';
        
        return `**📁 Think Center File Analysis: ${fileName}**

**Context**: ${this.formatContext(context)}

**File Overview**: Analyzing ${fileName} (${fileContent.split('\n').length} lines)

**Multi-Perspective Analysis**:
Please analyze this file from the perspective of Weaver (architecture), Checker (quality), and O/G (maintainability):

\`\`\`${context.language}
${fileContent.length > 2000 ? fileContent.substring(0, 2000) + '\n... (truncated)' : fileContent}
\`\`\``;
    }

    private buildDebugPrompt(problem: string, context: ProjectContext): string {
        return `**🐛 Think Center Debug Session**

**Context**: ${this.formatContext(context)}
**Problem**: ${problem}

**Debug Strategy**:
- **Checker**: Systematic diagnosis and root cause analysis
- **Maker**: Practical solutions and quick fixes
- **O/G**: Impact on developer workflow and team
- **E/E**: Performance implications and optimization

Let's debug this step-by-step with multiple perspectives:`;
    }

    private getPerspectiveEmoji(perspective: string): string {
        const emojis: { [key: string]: string } = {
            'weaver': '🧵',
            'maker': '🔨',
            'checker': '✓',
            'og': '🔍',
            'ee': '⚖️'
        };
        return emojis[perspective.toLowerCase()] || '🧠';
    }

    private getPerspectiveName(perspective: string): string {
        const names: { [key: string]: string } = {
            'weaver': 'Weaver',
            'maker': 'Maker',
            'checker': 'Checker',
            'og': 'Observer/Guardian',
            'ee': 'Explorer/Exploiter'
        };
        return names[perspective.toLowerCase()] || perspective;
    }

    private getPerspectiveFocus(perspective: string): string {
        const focuses: { [key: string]: string } = {
            'weaver': 'architecture patterns and system design',
            'maker': 'practical implementation and execution',
            'checker': 'quality assurance and validation',
            'og': 'developer experience and team impact',
            'ee': 'technical tradeoffs and optimization'
        };
        return focuses[perspective.toLowerCase()] || 'multi-perspective analysis';
    }

    private formatContext(context: ProjectContext): string {
        const parts: string[] = [];
        
        if (context?.projectType && context.projectType !== 'unknown') {
            parts.push(`${context.projectType} project`);
        }
        
        if (context?.framework) {
            parts.push(context.framework);
        }
        
        if (context?.language) {
            parts.push(context.language);
        }
        
        if (context?.currentFile) {
            parts.push(context.currentFile.split('/').pop() || '');
        }

        if (context?.errors && context.errors.length > 0) {
            parts.push(`${context.errors.length} diagnostic(s)`);
        }

        return parts.filter(Boolean).join(' | ') || 'Development context';
    }

    private showInstructions(): void {
        const panel = vscode.window.createWebviewPanel(
            'thinkCenterInstructions',
            'Think Center + Copilot Chat',
            vscode.ViewColumn.Beside,
            { enableScripts: false }
        );

        panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { 
                    font-family: var(--vscode-font-family); 
                    padding: 20px; 
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                .step { margin-bottom: 20px; }
                .code { 
                    background: var(--vscode-textCodeBlock-background); 
                    padding: 15px; 
                    border-radius: 4px; 
                    border-left: 3px solid var(--vscode-textLink-foreground);
                    margin: 10px 0;
                    white-space: pre-wrap;
                    font-family: var(--vscode-editor-font-family);
                    font-size: 12px;
                }
                h1, h3 { color: var(--vscode-textLink-foreground); }
                ul { padding-left: 20px; }
                li { margin: 5px 0; }
            </style>
        </head>
        <body>
            <h1>🧠 Think Center + Copilot Chat Integration</h1>
            <p><em>Based on the Think Center framework by <a href="https://github.com/achamian/think-center">@achamian</a></em></p>
            
            <div class="step">
                <h3>Step 1: Initialize (One Time)</h3>
                <p>Paste this in Copilot Chat to activate Think Center:</p>
                <div class="code">${CopilotChatIntegration.THINK_CENTER_SYSTEM_PROMPT}</div>
            </div>
            
            <div class="step">
                <h3>Step 2: Use Perspectives</h3>
                <p>Examples:</p>
                <ul>
                    <li><strong>Weaver</strong>: "Weaver, how should I structure this API?"</li>
                    <li><strong>Maker</strong>: "Maker, what's the implementation approach?"</li>
                    <li><strong>Checker</strong>: "Checker, what could go wrong with this code?"</li>
                    <li><strong>Council</strong>: "Council meeting: Should we use microservices?"</li>
                </ul>
            </div>
            
            <div class="step">
                <h3>Step 3: Advanced Patterns</h3>
                <ul>
                    <li><strong>Paired thinking:</strong> "Weaver and Maker, explore this together"</li>
                    <li><strong>Debate mode:</strong> "Checker and E/E, debate this approach"</li>
                    <li><strong>Council meetings:</strong> "Full council analysis of this architecture"</li>
                    <li><strong>Sequential analysis:</strong> "Weaver → Maker → Checker analysis"</li>
                </ul>
            </div>

            <div class="step">
                <h3>Step 4: Extension Features</h3>
                <ul>
                    <li><strong>Cmd+Shift+T</strong>: Open Think Center panel</li>
                    <li><strong>Cmd+Shift+W</strong>: Ask Weaver directly</li>
                    <li><strong>Cmd+Shift+M</strong>: Ask Maker directly</li>
                    <li><strong>Cmd+Shift+C</strong>: Ask Checker directly</li>
                    <li><strong>Right-click</strong> on selected code → Think Center</li>
                </ul>
            </div>
        </body>
        </html>`;
    }

    private fallbackInitialization(): void {
        vscode.window.showInformationMessage(
            'Think Center prompt copied to clipboard! Paste in any AI chat to activate.',
            'Show Prompt'
        ).then(selection => {
            if (selection === 'Show Prompt') {
                this.showPromptInOutput(CopilotChatIntegration.THINK_CENTER_SYSTEM_PROMPT);
            }
        });
    }

    private showPromptInOutput(prompt: string): void {
        this.outputChannel.clear();
        this.outputChannel.appendLine('Think Center Prompt:');
        this.outputChannel.appendLine('='.repeat(50));
        this.outputChannel.appendLine(prompt);
        this.outputChannel.appendLine('='.repeat(50));
        this.outputChannel.appendLine('Copy this prompt and paste it in GitHub Copilot Chat');
        this.outputChannel.show();
    }

    /**
     * Converts AnalysisResult from ContextAnalyzer to ProjectContext for compatibility
     */
    private analysisToProjectContext(analysis: AnalysisResult): ProjectContext {
        return {
            projectType: analysis.context.projectType || 'unknown',
            language: analysis.context.language || 'unknown',
            framework: analysis.context.projectType,
            currentFile: analysis.context.activeFile,
            selectedCode: analysis.context.selectedText,
            relatedFiles: analysis.context.dependencies,
            gitBranch: analysis.context.gitRepository
        };
    }
}
