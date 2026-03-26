class BlogEngine {
    constructor() {
        this.currentPostId = null;
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadTheme();
        this.loadPostsList();
        this.setupAutoSave();
        
        // Create demo post if no posts exist
        if (storage.getPostCount() === 0) {
            this.createDemoPost();
        }
    }

    cacheElements() {
        this.elements = {
            postsList: document.getElementById('postsList'),
            newPostBtn: document.getElementById('newPostBtn'),
            savePostBtn: document.getElementById('savePostBtn'),
            deletePostBtn: document.getElementById('deletePostBtn'),
            postTitle: document.getElementById('postTitle'),
            markdownEditor: document.getElementById('markdownEditor'),
            previewTitle: document.getElementById('previewTitle'),
            previewContent: document.getElementById('previewContent'),
            themeToggle: document.getElementById('themeToggle'),
            tabBtns: document.querySelectorAll('.tab-btn'),
            toolbarBtns: document.querySelectorAll('.toolbar-btn'),
            toast: document.getElementById('toast')
        };
    }

    bindEvents() {
        this.elements.newPostBtn.addEventListener('click', () => this.newPost());
        this.elements.savePostBtn.addEventListener('click', () => this.saveCurrentPost());
        this.elements.deletePostBtn.addEventListener('click', () => this.deleteCurrentPost());
        this.elements.postTitle.addEventListener('input', () => this.updatePreview());
        this.elements.markdownEditor.addEventListener('input', () => this.updatePreview());
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        this.elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        this.elements.toolbarBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleToolbarAction(e.target.closest('.toolbar-btn').dataset.action));
        });
    }

    loadPostsList() {
        const posts = storage.getAllPosts();
        this.elements.postsList.innerHTML = '';
        
        if (posts.length === 0) {
            this.elements.postsList.innerHTML = '<div class="placeholder-text">No posts yet. Create your first post!</div>';
            return;
        }
        
        posts.forEach(post => {
            const postElement = this.createPostElement(post);
            this.elements.postsList.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const div = document.createElement('div');
        div.className = 'post-item';
        if (this.currentPostId === post.id) {
            div.classList.add('active');
        }
        
        div.innerHTML = `
            <div class="post-title">${this.escapeHtml(post.title || 'Untitled')}</div>
            <div class="post-meta">
                <span><i class="far fa-calendar-alt"></i> ${new Date(post.updatedAt).toLocaleDateString()}</span>
                <span><i class="far fa-clock"></i> ${new Date(post.updatedAt).toLocaleTimeString()}</span>
            </div>
        `;
        
        div.addEventListener('click', () => this.loadPost(post.id));
        return div;
    }

    loadPost(id) {
        const post = storage.getPost(id);
        if (!post) return;
        
        this.currentPostId = id;
        this.elements.postTitle.value = post.title || '';
        this.elements.markdownEditor.value = post.content || '';
        this.updatePreview();
        
        // Update active state in posts list
        document.querySelectorAll('.post-item').forEach(item => {
            item.classList.remove('active');
        });
        const activePost = Array.from(document.querySelectorAll('.post-item')).find(
            item => item.querySelector('.post-title')?.textContent === (post.title || 'Untitled')
        );
        if (activePost) activePost.classList.add('active');
        
        this.elements.deletePostBtn.style.display = 'flex';
        this.showToast('Post loaded successfully', 'success');
    }

    saveCurrentPost() {
        const title = this.elements.postTitle.value.trim();
        const content = this.elements.markdownEditor.value;
        
        if (!title && !content) {
            this.showToast('Please add a title or content to save', 'warning');
            return;
        }
        
        const post = {
            id: this.currentPostId,
            title: title || 'Untitled',
            content: content,
            updatedAt: new Date().toISOString()
        };
        
        const savedPost = storage.savePost(post);
        this.currentPostId = savedPost.id;
        this.loadPostsList();
        this.elements.deletePostBtn.style.display = 'flex';
        this.showToast('Post saved successfully!', 'success');
    }

    newPost() {
        this.currentPostId = null;
        this.elements.postTitle.value = '';
        this.elements.markdownEditor.value = '';
        this.updatePreview();
        this.elements.deletePostBtn.style.display = 'none';
        
        // Remove active class from all posts
        document.querySelectorAll('.post-item').forEach(item => {
            item.classList.remove('active');
        });
        
        this.showToast('New post created. Start writing!', 'info');
    }

    deleteCurrentPost() {
        if (!this.currentPostId) return;
        
        if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            storage.deletePost(this.currentPostId);
            this.newPost();
            this.loadPostsList();
            this.showToast('Post deleted successfully', 'success');
        }
    }

    updatePreview() {
        const title = this.elements.postTitle.value.trim();
        const content = this.elements.markdownEditor.value;
        
        this.elements.previewTitle.textContent = title || 'Untitled Post';
        
        if (content) {
            const html = MarkdownHelper.render(content);
            this.elements.previewContent.innerHTML = html;
        } else {
            this.elements.previewContent.innerHTML = '<p class="placeholder-text">Start writing to see preview...</p>';
        }
    }

    switchTab(tabId) {
        // Update tab buttons
        this.elements.tabBtns.forEach(btn => {
            const btnTab = btn.dataset.tab;
            if (btnTab === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update tab content
        const editorTab = document.getElementById('editorTab');
        const previewTab = document.getElementById('previewTab');
        
        if (tabId === 'editor') {
            editorTab.classList.add('active');
            previewTab.classList.remove('active');
        } else {
            editorTab.classList.remove('active');
            previewTab.classList.add('active');
            this.updatePreview(); // Refresh preview when switching
        }
    }

    handleToolbarAction(action) {
        const textarea = this.elements.markdownEditor;
        
        switch(action) {
            case 'bold':
                MarkdownHelper.formatBold(textarea);
                break;
            case 'italic':
                MarkdownHelper.formatItalic(textarea);
                break;
            case 'heading':
                MarkdownHelper.formatHeading(textarea);
                break;
            case 'link':
                MarkdownHelper.formatLink(textarea);
                break;
            case 'code':
                MarkdownHelper.formatCode(textarea);
                break;
            case 'list':
                MarkdownHelper.formatList(textarea);
                break;
        }
        
        this.updatePreview();
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.loadTheme();
    }

    loadTheme() {
        if (this.isDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
            this.elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.removeAttribute('data-theme');
            this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    setupAutoSave() {
        let autoSaveTimeout;
        const autoSave = () => {
            if (this.currentPostId || this.elements.postTitle.value.trim() || this.elements.markdownEditor.value) {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    if (this.elements.postTitle.value.trim() || this.elements.markdownEditor.value) {
                        this.saveCurrentPost();
                        this.showToast('Auto-saved', 'info');
                    }
                }, 3000);
            }
        };
        
        this.elements.postTitle.addEventListener('input', autoSave);
        this.elements.markdownEditor.addEventListener('input', autoSave);
    }

    createDemoPost() {
        const demoContent = `# Welcome to BlogEngine Pro! 🎉

## Getting Started

This is your new **Markdown-powered** blog engine. Here's what you can do:

### Features:
- ✍️ **Write posts** in Markdown format
- 👁️ **Preview** your content in real-time
- 💾 **Auto-save** functionality
- 🌙 **Dark mode** support
- 📱 **Responsive design**

### Example Code Block:

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet('Blogger'));
\`\`\`

### Styling Options:

- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- [Links](https://example.com) to external resources
- > Blockquotes for highlighting important information

### Lists:

1. First item
2. Second item
3. Third item

Start writing your own posts by clicking the **"New Post"** button!

---

Happy Blogging! 🚀`;

        const demoPost = {
            title: 'Welcome to BlogEngine Pro!',
            content: demoContent
        };
        
        storage.savePost(demoPost);
        this.loadPostsList();
    }

    showToast(message, type = 'success') {
        const toast = this.elements.toast;
        const icon = toast.querySelector('i');
        const messageSpan = toast.querySelector('#toastMessage');
        
        // Set icon based on type
        icon.className = '';
        if (type === 'success') {
            icon.classList.add('fas', 'fa-check-circle');
        } else if (type === 'warning') {
            icon.classList.add('fas', 'fa-exclamation-triangle');
        } else if (type === 'info') {
            icon.classList.add('fas', 'fa-info-circle');
        }
        
        messageSpan.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogEngine();
});