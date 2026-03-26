class MarkdownHelper {
    static render(markdown) {
        if (!markdown) return '';
        
        // Configure marked options
        marked.setOptions({
            highlight: function(code, lang) {
                return code;
            },
            breaks: true,
            gfm: true
        });
        
        return marked.parse(markdown);
    }
    
    static insertAtCursor(textarea, before, after = '') {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const insertion = before + selectedText + after;
        
        textarea.value = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + selectedText.length;
        textarea.focus();
        
        // Trigger input event
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
    }
    
    static formatBold(textarea) {
        this.insertAtCursor(textarea, '**', '**');
    }
    
    static formatItalic(textarea) {
        this.insertAtCursor(textarea, '*', '*');
    }
    
    static formatHeading(textarea) {
        this.insertAtCursor(textarea, '# ', '');
    }
    
    static formatLink(textarea) {
        this.insertAtCursor(textarea, '[', '](url)');
    }
    
    static formatCode(textarea) {
        this.insertAtCursor(textarea, '```\n', '\n```');
    }
    
    static formatList(textarea) {
        this.insertAtCursor(textarea, '- ', '');
    }
}