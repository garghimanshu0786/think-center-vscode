import * as vscode from 'vscode';
import { ContextAnalyzer, AnalysisResult } from '../services/ContextAnalyzer';
import { PerspectiveProvider, Perspective } from '../providers/PerspectiveProvider';

export class ThinkCenterPanel {
    public static currentPanel: ThinkCenterPanel | undefined;
    public static readonly viewType = 'thinkCenter.panel';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _contextAnalyzer: ContextAnalyzer;
    private readonly _perspectiveProvider: PerspectiveProvider;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (ThinkCenterPanel.currentPanel) {
            ThinkCenterPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            ThinkCenterPanel.viewType,
            'Think Center',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'out')
                ]
            }
        );

        ThinkCenterPanel.currentPanel = new ThinkCenterPanel(panel, extensionUri);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        ThinkCenterPanel.currentPanel = new ThinkCenterPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._contextAnalyzer = ContextAnalyzer.getInstance();
        this._perspectiveProvider = new PerspectiveProvider();

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'analyzeContext':
                        this._analyzeContext();
                        return;
                    case 'selectPerspective':
                        this._selectPerspective(message.perspectiveId);
                        return;
                    case 'usePrompt':
                        this._usePrompt(message.perspectiveId, message.promptId);
                        return;
                    case 'openCopilotChat':
                        this._openCopilotChat(message.prompt);
                        return;
                    case 'refreshContext':
                        this._refreshContext();
                        return;
                }
            },
            null,
            this._disposables
        );

        // Listen for active editor changes to refresh context
        vscode.window.onDidChangeActiveTextEditor(
            () => this._refreshContext(),
            null,
            this._disposables
        );

        // Listen for text selection changes
        vscode.window.onDidChangeTextEditorSelection(
            () => this._refreshContext(),
            null,
            this._disposables
        );
    }

    private async _analyzeContext() {
        try {
            const analysis = await this._contextAnalyzer.analyzeCurrentContext();
            this._panel.webview.postMessage({
                command: 'contextAnalyzed',
                analysis: analysis
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to analyze context: ${error}`);
        }
    }

    private _selectPerspective(perspectiveId: string) {
        const perspective = this._perspectiveProvider.getPerspective(perspectiveId);
        if (perspective) {
            this._panel.webview.postMessage({
                command: 'perspectiveSelected',
                perspective: perspective
            });
        }
    }

    private async _usePrompt(perspectiveId: string, promptId: string) {
        try {
            // Get current context
            const analysis = await this._contextAnalyzer.analyzeCurrentContext();
            const selectedText = analysis.context.selectedText || '';
            const activeFile = analysis.context.activeFile || '';

            // Prepare context for prompt template
            const context = {
                selectedCode: selectedText,
                activeFile: activeFile,
                language: analysis.context.language || '',
                projectType: analysis.context.projectType || ''
            };

            // Get the processed prompt
            const prompt = this._perspectiveProvider.getPromptWithContext(perspectiveId, promptId, context);
            
            if (prompt) {
                this._panel.webview.postMessage({
                    command: 'promptGenerated',
                    prompt: prompt,
                    perspectiveId: perspectiveId,
                    promptId: promptId
                });
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate prompt: ${error}`);
        }
    }

    private async _openCopilotChat(prompt: string) {
        try {
            // Copy prompt to clipboard for easy pasting
            await vscode.env.clipboard.writeText(prompt);
            
            // Open Copilot Chat
            await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
            
            vscode.window.showInformationMessage(
                'Prompt copied to clipboard! Paste it in Copilot Chat to start the conversation.',
                'Got it'
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open Copilot Chat: ${error}`);
        }
    }

    private async _refreshContext() {
        await this._analyzeContext();
    }

    public dispose() {
        ThinkCenterPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = await this._getHtmlForWebview(webview);
        
        // Perform initial context analysis
        await this._analyzeContext();
    }

    private async _getHtmlForWebview(webview: vscode.Webview): Promise<string> {
        // Get perspectives data
        const perspectives = this._perspectiveProvider.getAllPerspectives();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Think Center</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .header h1 {
            margin: 0;
            color: var(--vscode-textLink-foreground);
            font-size: 2em;
        }
        
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.8;
        }
        
        .context-section, .perspectives-section {
            margin-bottom: 30px;
            padding: 20px;
            background-color: var(--vscode-sideBar-background);
            border-radius: 8px;
            border: 1px solid var(--vscode-panel-border);
        }
        
        .section-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 15px;
            color: var(--vscode-textLink-foreground);
        }
        
        .context-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .context-item {
            padding: 10px;
            background-color: var(--vscode-input-background);
            border-radius: 4px;
            border: 1px solid var(--vscode-input-border);
        }
        
        .context-label {
            font-weight: bold;
            margin-bottom: 5px;
            color: var(--vscode-textLink-foreground);
        }
        
        .complexity-indicator {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .complexity-low {
            background-color: var(--vscode-charts-green);
            color: white;
        }
        
        .complexity-medium {
            background-color: var(--vscode-charts-yellow);
            color: black;
        }
        
        .complexity-high {
            background-color: var(--vscode-charts-red);
            color: white;
        }
        
        .perspective-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .perspective-card {
            padding: 20px;
            background-color: var(--vscode-input-background);
            border-radius: 8px;
            border: 1px solid var(--vscode-input-border);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .perspective-card:hover {
            border-color: var(--vscode-textLink-foreground);
            background-color: var(--vscode-list-hoverBackground);
        }
        
        .perspective-card.selected {
            border-color: var(--vscode-textLink-foreground);
            background-color: var(--vscode-list-activeSelectionBackground);
        }
        
        .perspective-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .perspective-icon {
            margin-right: 10px;
            font-size: 1.2em;
        }
        
        .perspective-name {
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .perspective-description {
            margin-bottom: 15px;
            opacity: 0.8;
        }
        
        .prompts-list {
            display: none;
        }
        
        .prompts-list.visible {
            display: block;
        }
        
        .prompt-item {
            padding: 10px;
            margin: 5px 0;
            background-color: var(--vscode-editor-background);
            border-radius: 4px;
            border: 1px solid var(--vscode-panel-border);
            cursor: pointer;
        }
        
        .prompt-item:hover {
            background-color: var(--vscode-list-hoverBackground);
        }
        
        .prompt-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .prompt-description {
            font-size: 0.9em;
            opacity: 0.8;
        }
        
        .button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
            margin: 5px;
        }
        
        .button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .prompt-preview {
            display: none;
            margin-top: 20px;
            padding: 20px;
            background-color: var(--vscode-textCodeBlock-background);
            border-radius: 8px;
            border: 1px solid var(--vscode-panel-border);
        }
        
        .prompt-preview.visible {
            display: block;
        }
        
        .prompt-text {
            white-space: pre-wrap;
            font-family: var(--vscode-editor-font-family);
            font-size: 0.9em;
            margin-bottom: 15px;
            max-height: 300px;
            overflow-y: auto;
            padding: 10px;
            background-color: var(--vscode-editor-background);
            border-radius: 4px;
        }
        
        .actions {
            text-align: center;
            margin-top: 20px;
        }
        
        .refresh-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 1.2em;
        }
        
        .loading {
            text-align: center;
            opacity: 0.6;
        }
    </style>
</head>
<body>
    <button class="refresh-button" onclick="refreshContext()" title="Refresh Context">↻</button>
    
    <div class="header">
        <h1>Think Center</h1>
        <p>Multi-perspective cognitive framework for software development</p>
    </div>
    
    <div class="context-section">
        <div class="section-title">Current Context</div>
        <div id="contextInfo" class="loading">Analyzing context...</div>
        <div class="actions">
            <button class="button secondary" onclick="analyzeContext()">Refresh Context</button>
        </div>
    </div>
    
    <div class="perspectives-section">
        <div class="section-title">Think Center Perspectives</div>
        <div class="perspective-grid">
            ${perspectives.map(perspective => `
                <div class="perspective-card" onclick="selectPerspective('${perspective.id}')">
                    <div class="perspective-header">
                        <span class="perspective-icon">📐</span>
                        <span class="perspective-name">${perspective.name}</span>
                    </div>
                    <div class="perspective-description">${perspective.description}</div>
                    <div class="prompts-list" id="prompts-${perspective.id}">
                        ${perspective.prompts.map(prompt => `
                            <div class="prompt-item" onclick="event.stopPropagation(); usePrompt('${perspective.id}', '${prompt.id}')">
                                <div class="prompt-title">${prompt.title}</div>
                                <div class="prompt-description">${prompt.description}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    
    <div class="prompt-preview" id="promptPreview">
        <div class="section-title">Generated Prompt</div>
        <div class="prompt-text" id="promptText"></div>
        <div class="actions">
            <button class="button" onclick="openCopilotChat()">Open in Copilot Chat</button>
            <button class="button secondary" onclick="copyPrompt()">Copy to Clipboard</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentPrompt = '';
        let selectedPerspective = null;
        
        // Message handling
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'contextAnalyzed':
                    updateContextInfo(message.analysis);
                    break;
                case 'perspectiveSelected':
                    showPerspectiveDetails(message.perspective);
                    break;
                case 'promptGenerated':
                    showPromptPreview(message.prompt);
                    break;
            }
        });
        
        function analyzeContext() {
            vscode.postMessage({ command: 'analyzeContext' });
        }
        
        function selectPerspective(perspectiveId) {
            // Toggle perspective selection
            if (selectedPerspective === perspectiveId) {
                selectedPerspective = null;
                document.getElementById('prompts-' + perspectiveId).classList.remove('visible');
                document.querySelector('[onclick*="' + perspectiveId + '"]').classList.remove('selected');
            } else {
                // Clear previous selection
                if (selectedPerspective) {
                    document.getElementById('prompts-' + selectedPerspective).classList.remove('visible');
                    document.querySelector('[onclick*="' + selectedPerspective + '"]').classList.remove('selected');
                }
                
                selectedPerspective = perspectiveId;
                document.getElementById('prompts-' + perspectiveId).classList.add('visible');
                document.querySelector('[onclick*="' + perspectiveId + '"]').classList.add('selected');
                
                vscode.postMessage({ 
                    command: 'selectPerspective', 
                    perspectiveId: perspectiveId 
                });
            }
        }
        
        function usePrompt(perspectiveId, promptId) {
            vscode.postMessage({ 
                command: 'usePrompt', 
                perspectiveId: perspectiveId,
                promptId: promptId
            });
        }
        
        function openCopilotChat() {
            if (currentPrompt) {
                vscode.postMessage({ 
                    command: 'openCopilotChat', 
                    prompt: currentPrompt 
                });
            }
        }
        
        function copyPrompt() {
            if (currentPrompt) {
                navigator.clipboard.writeText(currentPrompt);
            }
        }
        
        function refreshContext() {
            vscode.postMessage({ command: 'refreshContext' });
        }
        
        function updateContextInfo(analysis) {
            const contextDiv = document.getElementById('contextInfo');
            const context = analysis.context;
            
            const html = \`
                <div class="context-info">
                    <div class="context-item">
                        <div class="context-label">Active File</div>
                        <div>\${context.activeFile || 'None'}</div>
                    </div>
                    <div class="context-item">
                        <div class="context-label">Language</div>
                        <div>\${context.language || 'Unknown'}</div>
                    </div>
                    <div class="context-item">
                        <div class="context-label">Project Type</div>
                        <div>\${context.projectType || 'Unknown'}</div>
                    </div>
                    <div class="context-item">
                        <div class="context-label">Complexity</div>
                        <div>
                            <span class="complexity-indicator complexity-\${analysis.complexity}">
                                \${analysis.complexity.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="context-item">
                    <div class="context-label">Relevant Perspectives</div>
                    <div>\${analysis.relevantPerspectives.join(', ')}</div>
                </div>
                \${context.selectedText ? \`
                    <div class="context-item">
                        <div class="context-label">Selected Text</div>
                        <div style="max-height: 100px; overflow-y: auto; font-family: monospace; font-size: 0.8em;">
                            \${context.selectedText.substring(0, 500)}\${context.selectedText.length > 500 ? '...' : ''}
                        </div>
                    </div>
                \` : ''}
            \`;
            
            contextDiv.innerHTML = html;
        }
        
        function showPromptPreview(prompt) {
            currentPrompt = prompt;
            document.getElementById('promptText').textContent = prompt;
            document.getElementById('promptPreview').classList.add('visible');
        }
        
        // Initialize
        analyzeContext();
    </script>
</body>
</html>`;
    }
}
