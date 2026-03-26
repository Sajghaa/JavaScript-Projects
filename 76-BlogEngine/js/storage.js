class BlogStorage {
    constructor() {
        this.storageKey = 'blog_posts';
        this.currentId = null;
    }

    getAllPosts() {
        const posts = localStorage.getItem(this.storageKey);
        return posts ? JSON.parse(posts) : [];
    }

    getPost(id) {
        const posts = this.getAllPosts();
        return posts.find(post => post.id === id);
    }

    savePost(post) {
        const posts = this.getAllPosts();
        
        if (post.id) {
            // Update existing post
            const index = posts.findIndex(p => p.id === post.id);
            if (index !== -1) {
                posts[index] = { ...posts[index], ...post, updatedAt: new Date().toISOString() };
            }
        } else {
            // Create new post
            post.id = Date.now().toString();
            post.createdAt = new Date().toISOString();
            post.updatedAt = post.createdAt;
            posts.unshift(post);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(posts));
        return post;
    }

    deletePost(id) {
        const posts = this.getAllPosts();
        const filteredPosts = posts.filter(post => post.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filteredPosts));
        return true;
    }

    getPostCount() {
        return this.getAllPosts().length;
    }
}

const storage = new BlogStorage();