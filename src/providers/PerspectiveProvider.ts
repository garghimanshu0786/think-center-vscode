import * as vscode from 'vscode';

export interface Perspective {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    prompts: PerspectivePrompt[];
    contextualQuestions: string[];
}

export interface PerspectivePrompt {
    id: string;
    title: string;
    description: string;
    template: string;
    variables?: string[];
}

export class PerspectiveProvider implements vscode.TreeDataProvider<PerspectiveTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<PerspectiveTreeItem | undefined | null | void> = new vscode.EventEmitter<PerspectiveTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<PerspectiveTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private perspectives: Perspective[];

    constructor() {
        this.perspectives = this.initializePerspectives();
    }

    /**
     * Initializes the Think Center perspectives with their definitions and prompts
     */
    private initializePerspectives(): Perspective[] {
        return [
            {
                id: 'weaver',
                name: 'Weaver',
                description: 'Architecture and Design Perspective',
                icon: 'symbol-structure',
                color: '#4A90E2',
                prompts: [
                    {
                        id: 'architecture-review',
                        title: 'Architecture Review',
                        description: 'Analyze the overall architecture and design patterns',
                        template: 'As the Weaver perspective, review the architecture of this code:\n\n{selectedCode}\n\nFocus on:\n- Design patterns and architectural decisions\n- Component relationships and dependencies\n- Scalability and maintainability considerations\n- Potential structural improvements'
                    },
                    {
                        id: 'design-patterns',
                        title: 'Design Patterns Analysis',
                        description: 'Identify and evaluate design patterns',
                        template: 'From the Weaver perspective, analyze the design patterns in:\n\n{selectedCode}\n\nIdentify:\n- Current design patterns used\n- Pattern effectiveness and appropriateness\n- Missing patterns that could improve the design\n- Recommendations for pattern implementation'
                    },
                    {
                        id: 'structure-optimization',
                        title: 'Structure Optimization',
                        description: 'Suggest structural improvements and refactoring',
                        template: 'As the Weaver, examine this code structure:\n\n{selectedCode}\n\nProvide recommendations for:\n- Code organization and module structure\n- Separation of concerns\n- Abstraction levels\n- Interface design'
                    }
                ],
                contextualQuestions: [
                    'How does this fit into the overall system architecture?',
                    'What design patterns would be most appropriate here?',
                    'How can we improve the structural integrity of this code?',
                    'What are the long-term maintainability implications?'
                ]
            },
            {
                id: 'maker',
                name: 'Maker',
                description: 'Implementation and Development Perspective',
                icon: 'tools',
                color: '#7ED321',
                prompts: [
                    {
                        id: 'implementation-plan',
                        title: 'Implementation Plan',
                        description: 'Create a step-by-step implementation strategy',
                        template: 'As the Maker perspective, create an implementation plan for:\n\n{selectedCode}\n\nProvide:\n- Step-by-step implementation approach\n- Required dependencies and tools\n- Code structure and organization\n- Implementation milestones and checkpoints'
                    },
                    {
                        id: 'code-review',
                        title: 'Code Review',
                        description: 'Review implementation details and suggest improvements',
                        template: 'From the Maker perspective, review this implementation:\n\n{selectedCode}\n\nFocus on:\n- Code quality and best practices\n- Error handling and edge cases\n- Performance considerations\n- Code readability and documentation'
                    },
                    {
                        id: 'refactoring-suggestions',
                        title: 'Refactoring Suggestions',
                        description: 'Propose specific refactoring improvements',
                        template: 'As the Maker, analyze this code for refactoring opportunities:\n\n{selectedCode}\n\nSuggest:\n- Specific refactoring techniques\n- Code simplification opportunities\n- Performance improvements\n- Maintainability enhancements'
                    }
                ],
                contextualQuestions: [
                    'What is the most efficient way to implement this?',
                    'How can we make this code more maintainable?',
                    'What tools and libraries would be most helpful?',
                    'What are the implementation risks and how can we mitigate them?'
                ]
            },
            {
                id: 'checker',
                name: 'Checker',
                description: 'Quality Assurance and Testing Perspective',
                icon: 'check',
                color: '#F5A623',
                prompts: [
                    {
                        id: 'quality-assessment',
                        title: 'Quality Assessment',
                        description: 'Comprehensive quality and reliability analysis',
                        template: 'As the Checker perspective, assess the quality of:\n\n{selectedCode}\n\nEvaluate:\n- Code correctness and potential bugs\n- Error handling and edge cases\n- Security considerations\n- Performance implications'
                    },
                    {
                        id: 'test-strategy',
                        title: 'Test Strategy',
                        description: 'Design comprehensive testing approach',
                        template: 'From the Checker perspective, design tests for:\n\n{selectedCode}\n\nInclude:\n- Unit test cases and scenarios\n- Integration test considerations\n- Edge cases and error conditions\n- Test data and mock requirements'
                    },
                    {
                        id: 'bug-analysis',
                        title: 'Bug Analysis',
                        description: 'Identify potential issues and vulnerabilities',
                        template: 'As the Checker, analyze this code for potential issues:\n\n{selectedCode}\n\nIdentify:\n- Potential bugs and logical errors\n- Security vulnerabilities\n- Performance bottlenecks\n- Reliability concerns'
                    }
                ],
                contextualQuestions: [
                    'What could go wrong with this implementation?',
                    'How can we ensure this code is reliable and secure?',
                    'What test cases are needed to validate this functionality?',
                    'Are there any edge cases we haven\'t considered?'
                ]
            },
            {
                id: 'observer-guardian',
                name: 'Observer/Guardian',
                description: 'User Experience and Requirements Perspective',
                icon: 'account',
                color: '#BD10E0',
                prompts: [
                    {
                        id: 'user-experience-review',
                        title: 'User Experience Review',
                        description: 'Evaluate from the user\'s perspective',
                        template: 'As the Observer/Guardian perspective, evaluate the user experience of:\n\n{selectedCode}\n\nConsider:\n- User interaction and interface design\n- Accessibility and usability\n- User journey and workflow\n- Feedback and error messaging'
                    },
                    {
                        id: 'requirements-analysis',
                        title: 'Requirements Analysis',
                        description: 'Analyze requirements fulfillment and gaps',
                        template: 'From the Observer/Guardian perspective, analyze requirements for:\n\n{selectedCode}\n\nEvaluate:\n- Requirement coverage and completeness\n- User needs and expectations\n- Business value and objectives\n- Compliance and regulatory considerations'
                    },
                    {
                        id: 'stakeholder-impact',
                        title: 'Stakeholder Impact',
                        description: 'Assess impact on different stakeholders',
                        template: 'As the Observer/Guardian, assess stakeholder impact of:\n\n{selectedCode}\n\nAnalyze impact on:\n- End users and their workflows\n- Business stakeholders and objectives\n- Development and maintenance teams\n- System administrators and operators'
                    }
                ],
                contextualQuestions: [
                    'How will this affect the end user experience?',
                    'Does this meet the actual requirements and needs?',
                    'What are the broader implications for stakeholders?',
                    'How can we ensure this adds real value?'
                ]
            },
            {
                id: 'explorer-exploiter',
                name: 'Explorer/Exploiter',
                description: 'Innovation and Optimization Perspective',
                icon: 'rocket',
                color: '#50E3C2',
                prompts: [
                    {
                        id: 'optimization-analysis',
                        title: 'Optimization Analysis',
                        description: 'Identify performance and efficiency improvements',
                        template: 'As the Explorer/Exploiter perspective, analyze optimization opportunities in:\n\n{selectedCode}\n\nExplore:\n- Performance optimization techniques\n- Resource utilization improvements\n- Algorithmic enhancements\n- Caching and efficiency strategies'
                    },
                    {
                        id: 'alternative-approaches',
                        title: 'Alternative Approaches',
                        description: 'Explore different solutions and methodologies',
                        template: 'From the Explorer/Exploiter perspective, explore alternatives for:\n\n{selectedCode}\n\nConsider:\n- Different algorithmic approaches\n- Alternative technologies and frameworks\n- Innovative solutions and patterns\n- Trade-offs and benefits analysis'
                    },
                    {
                        id: 'innovation-opportunities',
                        title: 'Innovation Opportunities',
                        description: 'Identify areas for innovation and improvement',
                        template: 'As the Explorer/Exploiter, identify innovation opportunities in:\n\n{selectedCode}\n\nLook for:\n- Emerging technologies that could be applied\n- Creative solutions to current limitations\n- Automation and enhancement possibilities\n- Future-proofing considerations'
                    }
                ],
                contextualQuestions: [
                    'How can we make this more efficient or performant?',
                    'What alternative approaches should we consider?',
                    'Where are the opportunities for innovation?',
                    'How can we future-proof this solution?'
                ]
            }
        ];
    }

    /**
     * Get a specific perspective by ID
     */
    public getPerspective(id: string): Perspective | undefined {
        return this.perspectives.find(p => p.id === id);
    }

    /**
     * Get all available perspectives
     */
    public getAllPerspectives(): Perspective[] {
        return this.perspectives;
    }

    /**
     * Get perspective prompts with variables replaced
     */
    public getPromptWithContext(perspectiveId: string, promptId: string, context: Record<string, string>): string | undefined {
        const perspective = this.getPerspective(perspectiveId);
        if (!perspective) {
            return undefined;
        }

        const prompt = perspective.prompts.find(p => p.id === promptId);
        if (!prompt) {
            return undefined;
        }

        let processedTemplate = prompt.template;

        // Replace template variables with context values
        Object.entries(context).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), value);
        });

        return processedTemplate;
    }

    // TreeDataProvider implementation
    getTreeItem(element: PerspectiveTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: PerspectiveTreeItem): Thenable<PerspectiveTreeItem[]> {
        if (!element) {
            // Return root perspective items
            return Promise.resolve(
                this.perspectives.map(perspective => new PerspectiveTreeItem(
                    perspective.name,
                    perspective.description,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    {
                        command: 'thinkCenter.selectPerspective',
                        title: 'Select Perspective',
                        arguments: [perspective.id]
                    },
                    perspective.icon,
                    perspective.color,
                    'perspective',
                    perspective.id
                ))
            );
        } else if (element.contextValue === 'perspective') {
            // Return prompt items for a perspective
            const perspective = this.getPerspective(element.perspectiveId!);
            if (perspective) {
                return Promise.resolve(
                    perspective.prompts.map(prompt => new PerspectiveTreeItem(
                        prompt.title,
                        prompt.description,
                        vscode.TreeItemCollapsibleState.None,
                        {
                            command: 'thinkCenter.usePrompt',
                            title: 'Use Prompt',
                            arguments: [perspective.id, prompt.id]
                        },
                        'symbol-event',
                        '#666666',
                        'prompt',
                        perspective.id,
                        prompt.id
                    ))
                );
            }
        }

        return Promise.resolve([]);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

export class PerspectiveTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public readonly iconId?: string,
        public readonly color?: string,
        public readonly contextValue?: string,
        public readonly perspectiveId?: string,
        public readonly promptId?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.description = this.getDescription();
        
        if (iconId) {
            this.iconPath = new vscode.ThemeIcon(iconId, color ? new vscode.ThemeColor(color) : undefined);
        }
    }

    private getDescription(): string {
        if (this.contextValue === 'perspective') {
            return 'Perspective';
        } else if (this.contextValue === 'prompt') {
            return 'Prompt';
        }
        return '';
    }
}
