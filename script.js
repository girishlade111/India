class WebsiteBuilder {
    constructor() {
        this.apiKey = 'AIzaSyDK68voN4wRnCh95nrlu0m9vHbtJKOECqM';
        this.model = 'gemini-2.5-pro'; // Gemini 2.5 Pro model for enhanced code generation
        this.maxTokens = 1000000;
        this.editor = null;
        this.currentCode = '';
        this.promptHistory = [];
        this.codeHistory = [];
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.isUpdateMode = false;

        // Store instance globally for error handling
        window.websiteBuilder = this;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupTabs();
        this.initTheme();
        await this.initMonacoEditor();
        this.loadHistory();
        this.initializePreview();
        this.updatePromptUI();
    }

    setupEventListeners() {
        // Main buttons
        document.getElementById('enhanceBtn').addEventListener('click', () => this.enhancePrompt());
        document.getElementById('generateBtn').addEventListener('click', () => this.handleMainAction());

        // New integrated buttons
        const updateBtn = document.getElementById('updateBtn');
        const clearBtn = document.getElementById('clearBtn');

        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.handleUpdate());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAndStartNew());
        }

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Enter key support
        document.getElementById('promptInput').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.handleMainAction();
            }
        });
    }

    setupTabs() {
        // History tabs
        document.querySelectorAll('.history-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.dataset.tab;
                this.switchHistoryTab(tabType);
            });
        });

        // Output tabs
        document.querySelectorAll('.output-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.dataset.tab;
                this.switchOutputTab(tabType);
            });
        });
    }

    async initMonacoEditor() {
        return new Promise((resolve) => {
            require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });
            require(['vs/editor/editor.main'], () => {
                this.editor = monaco.editor.create(document.getElementById('monacoEditor'), {
                    value: '<!-- Your generated website code will appear here -->',
                    language: 'html',
                    theme: this.isDarkMode ? 'vs-dark' : 'vs-light',
                    automaticLayout: true,
                    fontSize: 14,
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on'
                });

                this.editor.onDidChangeModelContent(() => {
                    this.currentCode = this.editor.getValue();
                    this.updatePreview();
                });

                resolve();
            });
        });
    }

    switchHistoryTab(tabType) {
        document.querySelectorAll('.history-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.history-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');
        document.getElementById(`${tabType}History`).classList.add('active');
    }

    switchOutputTab(tabType) {
        document.querySelectorAll('.output-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.output-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabType}"].output-tab`).classList.add('active');
        document.getElementById(`${tabType}Panel`).classList.add('active');
    }

    async enhancePrompt() {
        const promptInput = document.getElementById('promptInput');
        const originalPrompt = promptInput.value.trim();

        if (!originalPrompt) {
            alert('Please enter a prompt first!');
            return;
        }

        const enhanceBtn = document.getElementById('enhanceBtn');
        enhanceBtn.disabled = true;
        enhanceBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"/></svg>Enhancing...';

        try {
            const enhancedPrompt = await this.callGeminiAPI(`
                You are an expert web development prompt engineer. Transform this basic website request into a comprehensive, detailed prompt that will generate a professional, modern website.

                Original prompt: "${originalPrompt}"

                Create an enhanced prompt that includes:

                1. WEBSITE PURPOSE & TYPE:
                   - Clearly define the website's primary purpose and target audience
                   - Specify the industry/niche if applicable
                   - Mention the desired user experience and goals

                2. DESIGN & VISUAL STYLE:
                   - Suggest modern design trends (minimalist, glassmorphism, neumorphism, etc.)
                   - Recommend color schemes and typography
                   - Specify layout preferences (grid-based, asymmetrical, etc.)
                   - Include animation and interaction suggestions

                3. TECHNICAL REQUIREMENTS:
                   - Ensure responsive design for all devices
                   - Include accessibility features (ARIA labels, proper contrast)
                   - Suggest modern CSS features (CSS Grid, Flexbox, custom properties)
                   - Recommend JavaScript interactivity where appropriate

                4. CONTENT STRUCTURE:
                   - Define specific sections needed (hero, about, services, contact, etc.)
                   - Suggest content hierarchy and information architecture
                   - Include SEO optimization requirements

                5. ADVANCED FEATURES:
                   - Suggest interactive elements (forms, animations, hover effects)
                   - Include modern web features (smooth scrolling, lazy loading)
                   - Recommend performance optimizations

                Return ONLY the enhanced prompt that is detailed, specific, and will result in a professional website. Make it comprehensive but not overly long. Focus on actionable details that will guide the AI to create exceptional results.
            `);

            promptInput.value = enhancedPrompt.trim();

            // Add visual feedback
            promptInput.style.borderColor = '#10b981';
            setTimeout(() => {
                promptInput.style.borderColor = '';
            }, 2000);

        } catch (error) {
            console.error('Error enhancing prompt:', error);
            alert('Failed to enhance prompt. Please check your internet connection and try again.');
        } finally {
            enhanceBtn.disabled = false;
            enhanceBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"/></svg>Enhance Prompt';
        }
    }

    async handleMainAction() {
        if (this.isUpdateMode && this.currentCode) {
            await this.handleUpdate();
        } else {
            await this.generateWebsite();
        }
    }

    async handleUpdate() {
        const promptInput = document.getElementById('promptInput');
        const updatePrompt = promptInput.value.trim();

        if (!updatePrompt) {
            alert('Please enter what you want to modify!');
            return;
        }

        if (!this.currentCode) {
            alert('Please generate a website first!');
            return;
        }

        this.showLoading('Updating your website...');
        this.disableButtons(true);

        try {
            const updatePromptText = `
                You are an expert full-stack web developer. Modify the following HTML website code based on this specific request: "${updatePrompt}"
                
                Current website code:
                ${this.currentCode}
                
                MODIFICATION EXCELLENCE STANDARDS:
                1. PRESERVE QUALITY: Maintain all existing professional standards and code quality
                2. ENHANCE FUNCTIONALITY: Improve the requested features while keeping existing ones
                3. MAINTAIN CONSISTENCY: Keep the same design language, color scheme, and visual style
                4. RESPONSIVE INTEGRITY: Ensure all changes work perfectly across all devices
                5. ACCESSIBILITY COMPLIANCE: Maintain WCAG 2.1 AA standards throughout modifications
                6. PERFORMANCE OPTIMIZATION: Keep or improve loading speed and Core Web Vitals
                7. MODERN STANDARDS: Use latest CSS and JavaScript best practices for new features
                8. CROSS-BROWSER COMPATIBILITY: Ensure modifications work in all modern browsers
                
                TECHNICAL REQUIREMENTS:
                - Implement changes using modern CSS (Grid, Flexbox, custom properties)
                - Add smooth animations and transitions for new elements
                - Maintain semantic HTML5 structure
                - Keep all existing JavaScript functionality intact
                - Optimize new code for performance and maintainability
                - Ensure proper error handling for new interactive elements
                
                CRITICAL OUTPUT RULES:
                - Start IMMEDIATELY with <!DOCTYPE html>
                - NO explanations, comments, or markdown formatting
                - NO code blocks or backticks
                - NO text before or after the HTML code
                - Return ONLY the complete, executable HTML code
                - Code must work perfectly when saved as .html file
                
                Generate the complete updated HTML code with professional-grade modifications:
            `;

            const updatedCode = await this.callGeminiAPI(updatePromptText);
            const cleanedCode = this.cleanGeneratedCode(updatedCode);

            // Add to histories
            this.addToPromptHistory(`[Update] ${updatePrompt}`);
            this.addToCodeHistory(cleanedCode);

            // Hide loading overlay before typing animation starts
            this.hideLoading();

            // Type the updated code
            await this.typeCode(cleanedCode);

            // Clear prompt input and update UI
            promptInput.value = '';
            this.updatePromptUI();

        } catch (error) {
            console.error('Error updating website:', error);
            alert('Failed to update website. Please try again.');
            this.hideLoading();
        } finally {
            this.disableButtons(false);
        }
    }

    clearAndStartNew() {
        this.currentCode = '';
        this.isUpdateMode = false;
        document.getElementById('promptInput').value = '';
        this.editor.setValue('<!-- Your generated website code will appear here -->');
        this.initializePreview();
        this.updatePromptUI();
    }

    updatePromptUI() {
        const promptInput = document.getElementById('promptInput');
        const generateBtn = document.getElementById('generateBtn');
        const generateBtnText = document.getElementById('generateBtnText');
        const updateBtn = document.getElementById('updateBtn');
        const clearBtn = document.getElementById('clearBtn');
        const modeIndicator = document.getElementById('modeIndicator');

        // Check if elements exist before manipulating them
        if (!promptInput || !generateBtn || !modeIndicator) {
            console.warn('Required UI elements not found');
            return;
        }

        if (this.currentCode && this.currentCode.trim() !== '' && !this.currentCode.includes('Your generated website code will appear here')) {
            // Update mode
            this.isUpdateMode = true;
            promptInput.placeholder = 'Describe what you want to modify or add to your website...';
            generateBtn.classList.add('hidden');

            if (updateBtn) updateBtn.classList.remove('hidden');
            if (clearBtn) clearBtn.classList.remove('hidden');

            modeIndicator.textContent = 'Update Mode';
            modeIndicator.className = 'mode-indicator update-mode';
        } else {
            // Create mode
            this.isUpdateMode = false;
            promptInput.placeholder = 'Describe the website you want to create or modify existing one...';
            generateBtn.classList.remove('hidden');

            if (updateBtn) updateBtn.classList.add('hidden');
            if (clearBtn) clearBtn.classList.add('hidden');

            modeIndicator.textContent = 'Create Mode';
            modeIndicator.className = 'mode-indicator create-mode';
        }
    }

    async generateWebsite() {
        const promptInput = document.getElementById('promptInput');
        const prompt = promptInput.value.trim();

        if (!prompt) {
            alert('Please enter a prompt!');
            return;
        }

        this.showLoading('Generating your website...');
        this.disableButtons(true);

        try {
            // Add to prompt history
            this.addToPromptHistory(prompt);

            // Generate website code with enhanced Gemini 2.5 Pro prompt
            const websitePrompt = `
                You are an expert full-stack web developer with 10+ years of experience creating award-winning websites. Create a complete, professional, modern website based on this description: "${prompt}"

                TECHNICAL EXCELLENCE REQUIREMENTS:
                1. ARCHITECTURE: Generate a SINGLE HTML file with embedded CSS and JavaScript
                2. RESPONSIVE DESIGN: Fully responsive using CSS Grid, Flexbox, and modern viewport units
                3. PERFORMANCE: Optimized for Core Web Vitals (LCP, FID, CLS)
                4. ACCESSIBILITY: WCAG 2.1 AA compliant with proper ARIA labels, semantic HTML5, keyboard navigation
                5. SEO OPTIMIZATION: Complete meta tags, structured data, semantic markup
                6. MODERN CSS: CSS custom properties, modern selectors, advanced animations, backdrop-filter
                7. JAVASCRIPT: ES6+ features, event delegation, performance-optimized interactions
                8. CROSS-BROWSER: Compatible with all modern browsers (Chrome, Firefox, Safari, Edge)

                DESIGN EXCELLENCE STANDARDS:
                - Apply current design trends (2024): Glassmorphism, neumorphism, or minimalist aesthetics
                - Use sophisticated color theory with proper contrast ratios (4.5:1 minimum)
                - Implement micro-interactions and smooth animations (60fps)
                - Create visual hierarchy using typography scale and spacing systems
                - Add subtle shadows, gradients, and modern visual effects
                - Ensure consistent spacing using 8px grid system

                ADVANCED FEATURES TO INCLUDE:
                - Smooth scrolling with intersection observer
                - CSS animations triggered by scroll position
                - Interactive hover effects and state changes
                - Form validation with custom styling
                - Loading states and transitions
                - Dark/light theme considerations
                - Progressive enhancement approach

                CODE QUALITY STANDARDS:
                - Clean, maintainable, well-structured code
                - Proper indentation and formatting
                - Efficient CSS with minimal redundancy
                - Optimized JavaScript with no console errors
                - Production-ready performance

                CRITICAL OUTPUT RULES:
                - Start IMMEDIATELY with <!DOCTYPE html>
                - NO explanations, comments, or markdown formatting
                - NO code blocks or backticks
                - NO text before or after the HTML code
                - Return ONLY the complete, executable HTML code
                - Code must work perfectly when saved as .html file

                Create an exceptional website that demonstrates professional web development expertise:
            `;

            const generatedCode = await this.callGeminiAPI(websitePrompt);
            const cleanedCode = this.cleanGeneratedCode(generatedCode);

            // Hide loading overlay before typing animation starts
            this.hideLoading();

            // Simulate typing effect
            await this.typeCode(cleanedCode);

            // Add to code history
            this.addToCodeHistory(cleanedCode);

            // Update UI to show update mode
            this.updatePromptUI();

            // Switch to preview tab
            this.switchOutputTab('preview');

        } catch (error) {
            console.error('Error generating website:', error);
            alert('Failed to generate website. Please check your internet connection and try again.');
            this.hideLoading();
        } finally {
            this.disableButtons(false);
        }
    }

    async handleFollowup() {
        const followupInput = document.getElementById('followupInput');
        const followupPrompt = followupInput.value.trim();

        if (!followupPrompt) {
            alert('Please enter what you want to modify!');
            return;
        }

        if (!this.currentCode) {
            alert('Please generate a website first!');
            return;
        }

        this.showLoading('Updating your website...');
        this.disableButtons(true);

        try {
            const updatePrompt = `
                Modify the following HTML website code based on this request: "${followupPrompt}"
                
                Current website code:
                ${this.currentCode}
                
                CRITICAL INSTRUCTIONS:
                1. Make the requested changes while maintaining the existing structure
                2. Keep all existing functionality unless specifically asked to remove it
                3. Ensure the modified code is still responsive and accessible
                4. Return ONLY the complete updated HTML code
                5. No explanations, comments, or markdown formatting
                
                IMPORTANT OUTPUT RULES:
                - Start IMMEDIATELY with <!DOCTYPE html>
                - Do NOT include any explanations, comments, or descriptions
                - Do NOT use markdown code blocks (no \`\`\`html or \`\`\`)
                - Do NOT add any text before or after the HTML code
                - Return ONLY the raw HTML code that can be directly saved as .html file
                
                Generate the complete updated HTML code now:
            `;

            const updatedCode = await this.callGeminiAPI(updatePrompt);
            const cleanedCode = this.cleanGeneratedCode(updatedCode);

            // Add to histories
            this.addToPromptHistory(`[Follow-up] ${followupPrompt}`);
            this.addToCodeHistory(updatedCode);

            // Hide loading overlay before typing animation starts
            this.hideLoading();

            // Type the updated code
            await this.typeCode(cleanedCode);

            // Clear follow-up input
            followupInput.value = '';

        } catch (error) {
            console.error('Error updating website:', error);
            alert('Failed to update website. Please try again.');
            this.hideLoading();
        } finally {
            this.disableButtons(false);
        }
    }

    async callGeminiAPI(prompt) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: this.maxTokens,
                    temperature: 0.7,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid API response');
        }

        return data.candidates[0].content.parts[0].text;
    }

    async typeCode(code) {
        return new Promise((resolve) => {
            this.switchOutputTab('code');
            this.editor.setValue('');

            let index = 0;
            const chunkSize = Math.max(50, Math.floor(code.length / 100)); // Dynamic chunk size based on code length

            const typeInterval = setInterval(() => {
                if (index < code.length) {
                    // Type larger chunks for faster display
                    const nextIndex = Math.min(index + chunkSize + Math.floor(Math.random() * 20), code.length);
                    const currentText = code.substring(0, nextIndex);
                    this.editor.setValue(currentText);
                    index = nextIndex;
                } else {
                    clearInterval(typeInterval);
                    this.editor.setValue(code);
                    this.currentCode = code;
                    this.updatePreview();
                    resolve();
                }
            }, 2); // Much faster interval - 2ms instead of 10ms
        });
    }

    updatePreview() {
        const previewFrame = document.getElementById('previewFrame');

        if (!previewFrame) {
            console.error('Preview frame not found');
            return;
        }

        if (this.currentCode && this.currentCode.trim() !== '' && !this.currentCode.includes('Your generated website code will appear here')) {
            try {
                // Clear any existing src to avoid conflicts
                previewFrame.src = '';

                // Process the code to prevent navigation issues
                const processedCode = this.processCodeForPreview(this.currentCode);

                // Use srcdoc for better compatibility
                previewFrame.srcdoc = processedCode;
                console.log('Preview updated with code length:', processedCode.length);

                // Set up iframe load handler to prevent navigation issues
                this.setupPreviewNavigation(previewFrame);

                // Fallback for browsers that don't support srcdoc well
                setTimeout(() => {
                    try {
                        if (!previewFrame.contentDocument || !previewFrame.contentDocument.body || previewFrame.contentDocument.body.innerHTML.trim() === '') {
                            console.log('Falling back to data URL method');
                            const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(processedCode);
                            previewFrame.src = dataUrl;
                        }
                    } catch (e) {
                        console.log('Cannot access iframe content, using data URL fallback');
                        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(processedCode);
                        previewFrame.src = dataUrl;
                    }
                }, 200);

            } catch (error) {
                console.error('Error updating preview:', error);
                // Fallback: try using data URL
                try {
                    const processedCode = this.processCodeForPreview(this.currentCode);
                    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(processedCode);
                    previewFrame.src = dataUrl;
                } catch (fallbackError) {
                    console.error('Fallback preview method also failed:', fallbackError);
                    // Last resort: try blob URL
                    try {
                        const processedCode = this.processCodeForPreview(this.currentCode);
                        const blob = new Blob([processedCode], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        previewFrame.src = url;

                        // Clean up blob URL after a delay
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                    } catch (blobError) {
                        console.error('All preview methods failed:', blobError);
                        previewFrame.srcdoc = '<html><body><p style="text-align:center;margin-top:50px;color:#ff6b6b;">Preview Error: Unable to display generated website. Please try refreshing the page.</p></body></html>';
                    }
                }
            }
        } else {
            console.log('No valid code to preview');
            this.showWelcomePreview();
        }
    }

    processCodeForPreview(code) {
        // Add base tag to prevent relative URL issues
        let processedCode = code;

        // Add navigation prevention script
        const navigationScript = `
            <script>
                // Prevent navigation that could break the preview
                (function() {
                    // Override window.open to prevent popups from breaking preview
                    const originalOpen = window.open;
                    window.open = function(url, target, features) {
                        if (target === '_blank' || target === '_top' || target === '_parent') {
                            return originalOpen.call(this, url, '_blank', features);
                        }
                        return originalOpen.call(this, url, target, features);
                    };
                    
                    // Prevent form submissions from navigating away
                    document.addEventListener('submit', function(e) {
                        const form = e.target;
                        if (form.target === '_blank') return;
                        
                        e.preventDefault();
                        console.log('Form submission prevented in preview mode');
                        
                        // Show a message instead
                        const message = document.createElement('div');
                        message.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#4CAF50;color:white;padding:10px 20px;border-radius:5px;z-index:10000;font-family:Arial,sans-serif;';
                        message.textContent = 'Form submission simulated in preview mode';
                        document.body.appendChild(message);
                        setTimeout(() => message.remove(), 3000);
                    });
                    
                    // Handle anchor clicks to prevent navigation issues
                    document.addEventListener('click', function(e) {
                        const link = e.target.closest('a');
                        if (!link) return;
                        
                        const href = link.getAttribute('href');
                        if (!href) return;
                        
                        // Allow hash links and javascript: links
                        if (href.startsWith('#') || href.startsWith('javascript:')) {
                            return;
                        }
                        
                        // Allow external links to open in new tab
                        if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
                            e.preventDefault();
                            window.open(href, '_blank');
                            return;
                        }
                        
                        // Prevent other navigation
                        if (href.startsWith('/') || href.includes('.html') || href.includes('.php')) {
                            e.preventDefault();
                            console.log('Navigation prevented in preview mode:', href);
                            
                            // Show a message
                            const message = document.createElement('div');
                            message.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#2196F3;color:white;padding:10px 20px;border-radius:5px;z-index:10000;font-family:Arial,sans-serif;';
                            message.textContent = 'Navigation simulated in preview mode: ' + href;
                            document.body.appendChild(message);
                            setTimeout(() => message.remove(), 3000);
                        }
                    });
                })();
            </script>
        `;

        // Insert the script before the closing body tag, or at the end if no body tag
        if (processedCode.includes('</body>')) {
            processedCode = processedCode.replace('</body>', navigationScript + '</body>');
        } else if (processedCode.includes('</html>')) {
            processedCode = processedCode.replace('</html>', navigationScript + '</html>');
        } else {
            processedCode += navigationScript;
        }

        return processedCode;
    }

    setupPreviewNavigation(previewFrame) {
        // Remove any existing listeners
        previewFrame.onload = null;

        // Set up load handler
        previewFrame.onload = () => {
            try {
                const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
                if (!doc) return;

                // Add additional navigation prevention
                doc.addEventListener('click', (e) => {
                    const link = e.target.closest('a');
                    if (link && link.href && !link.href.startsWith('#') && !link.href.startsWith('javascript:')) {
                        // Check if it's trying to navigate to the parent or a different page
                        if (link.href.includes('index.html') || link.href.includes(window.location.origin)) {
                            e.preventDefault();
                            console.log('Prevented navigation to parent page from preview');
                        }
                    }
                });

            } catch (error) {
                // Cross-origin restrictions prevent access, which is fine
                console.log('Cannot access iframe content for navigation setup (cross-origin)');
            }
        };
    }

    showWelcomePreview() {
        const previewFrame = document.getElementById('previewFrame');
        if (!previewFrame) return;

        const welcomeHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Girish IDE - Preview</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-align: center;
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }
                    .welcome-container {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        border-radius: 20px;
                        padding: 40px;
                        max-width: 500px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                        animation: fadeIn 1s ease-in-out;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    h1 {
                        font-size: 2rem;
                        margin-bottom: 1rem;
                        background: linear-gradient(45deg, #fff, #f0f0f0);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                    p {
                        font-size: 1.1rem;
                        line-height: 1.6;
                        margin-bottom: 2rem;
                        opacity: 0.9;
                    }
                    .pulse {
                        animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.7; }
                    }
                </style>
            </head>
            <body>
                <div class="welcome-container">
                    <h1>🚀 Girish IDE</h1>
                    <p>Your AI-powered website builder is ready!</p>
                    <p class="pulse">Enter a prompt and click "Generate Website" to see your creation come to life here.</p>
                </div>
            </body>
            </html>
        `;

        previewFrame.srcdoc = welcomeHTML;
    }
}

addToPromptHistory(prompt) {
    const historyItem = {
        id: Date.now(),
        content: prompt,
        timestamp: new Date().toLocaleString()
    };

    this.promptHistory.unshift(historyItem);
    this.renderPromptHistory();
    this.saveHistory();
}

addToCodeHistory(code) {
    const historyItem = {
        id: Date.now(),
        content: code,
        timestamp: new Date().toLocaleString()
    };

    this.codeHistory.unshift(historyItem);
    this.renderCodeHistory();
    this.saveHistory();
}

renderPromptHistory() {
    const container = document.getElementById('promptHistory');
    container.innerHTML = '';

    this.promptHistory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
                <div class="history-item-time">${item.timestamp}</div>
                <div class="history-item-content">${item.content}</div>
            `;
        div.addEventListener('click', () => {
            document.getElementById('promptInput').value = item.content;
        });
        container.appendChild(div);
    });
}

renderCodeHistory() {
    const container = document.getElementById('codeHistory');
    container.innerHTML = '';

    this.codeHistory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
                <div class="history-item-time">${item.timestamp}</div>
                <div class="history-item-content">Generated website code (${item.content.length} characters)</div>
            `;
        div.addEventListener('click', () => {
            this.editor.setValue(item.content);
            this.currentCode = item.content;
            this.updatePreview();
        });
        container.appendChild(div);
    });
}

showLoading(message) {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    text.textContent = message;
    overlay.classList.remove('hidden');
}

hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('hidden');
}

disableButtons(disabled) {
    document.getElementById('enhanceBtn').disabled = disabled;
    document.getElementById('generateBtn').disabled = disabled;

    const updateBtn = document.getElementById('updateBtn');
    if (updateBtn) {
        updateBtn.disabled = disabled;
    }

    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.disabled = disabled;
    }
}

saveHistory() {
    localStorage.setItem('websiteBuilder_promptHistory', JSON.stringify(this.promptHistory));
    localStorage.setItem('websiteBuilder_codeHistory', JSON.stringify(this.codeHistory));
}

loadHistory() {
    const savedPromptHistory = localStorage.getItem('websiteBuilder_promptHistory');
    const savedCodeHistory = localStorage.getItem('websiteBuilder_codeHistory');

    if (savedPromptHistory) {
        this.promptHistory = JSON.parse(savedPromptHistory);
        this.renderPromptHistory();
    }

    if (savedCodeHistory) {
        this.codeHistory = JSON.parse(savedCodeHistory);
        this.renderCodeHistory();
    }
}

initTheme() {
    this.applyTheme();
    this.updateThemeIcon();
}

toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode);
    this.applyTheme();
    this.updateThemeIcon();

    // Update Monaco editor theme
    if (this.editor) {
        monaco.editor.setTheme(this.isDarkMode ? 'vs-dark' : 'vs-light');
    }
}

applyTheme() {
    document.body.classList.toggle('dark-theme', this.isDarkMode);
}

updateThemeIcon() {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (this.isDarkMode) {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

initializePreview() {
    console.log('Initializing preview...');
    this.showWelcomePreview();
}

cleanGeneratedCode(code) {
    // Remove markdown code blocks if present
    let cleanedCode = code.replace(/```html\s*/gi, '').replace(/```\s*$/gi, '');

    // Remove any explanatory text before DOCTYPE
    const doctypeIndex = cleanedCode.indexOf('<!DOCTYPE');
    if (doctypeIndex > 0) {
        cleanedCode = cleanedCode.substring(doctypeIndex);
    }

    // Remove any text after the closing </html> tag
    const htmlEndIndex = cleanedCode.lastIndexOf('</html>');
    if (htmlEndIndex !== -1) {
        cleanedCode = cleanedCode.substring(0, htmlEndIndex + 7);
    }

    // Remove common unwanted prefixes
    const unwantedPrefixes = [
        'Here is the HTML code:',
        'Here\'s the HTML code:',
        'Here is the complete HTML:',
        'Here\'s the complete HTML:',
        'The HTML code is:',
        'HTML code:',
        'Code:',
        'Here you go:',
        'Sure! Here\'s',
        'Certainly! Here\'s'
    ];

    for (const prefix of unwantedPrefixes) {
        if (cleanedCode.toLowerCase().startsWith(prefix.toLowerCase())) {
            cleanedCode = cleanedCode.substring(prefix.length).trim();
        }
    }

    // Remove any remaining leading/trailing whitespace
    cleanedCode = cleanedCode.trim();

    // Ensure it starts with DOCTYPE
    if (!cleanedCode.toLowerCase().startsWith('<!doctype')) {
        console.warn('Generated code does not start with DOCTYPE, code may be malformed');
    }

    return cleanedCode;
}
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebsiteBuilder();
});    // Ad
d method to force refresh preview
forceRefreshPreview() {
    console.log('Force refreshing preview...');
    const previewFrame = document.getElementById('previewFrame');
    if (!previewFrame) return;

    // Clear iframe completely
    previewFrame.src = 'about:blank';
    previewFrame.srcdoc = '';

    // Wait a moment then update
    setTimeout(() => {
        this.updatePreview();
    }, 100);
}

// Enhanced preview validation
validatePreview() {
    const previewFrame = document.getElementById('previewFrame');
    if (!previewFrame) return false;

    try {
        // Check if iframe has content
        if (previewFrame.srcdoc && previewFrame.srcdoc.trim() !== '') {
            return true;
        }

        if (previewFrame.src && previewFrame.src !== 'about:blank') {
            return true;
        }

        return false;
    } catch (e) {
        return false;
    }
}
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebsiteBuilder();
});

// Add global error handler for preview issues
window.addEventListener('error', (event) => {
    if (event.target && event.target.id === 'previewFrame') {
        console.warn('Preview frame error detected, attempting refresh...');
        const builder = window.websiteBuilder;
        if (builder && builder.forceRefreshPreview) {
            builder.forceRefreshPreview();
        }
    }
});