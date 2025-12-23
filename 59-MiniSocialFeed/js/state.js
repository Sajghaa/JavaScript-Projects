const State = (function() {
    // Initial state
    let state = {
        theme: localStorage.getItem('social-feed-theme') || 'light',
        user: {
            id: 1,
            name: 'Alex Morgan',
            handle: '@alex.morgan',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
            isOnline: true
        },
        posts: [],
        notifications: [],
        messages: [],
        bookmarks: [],
        currentFeed: 'forYou',
        isLoading: false,
        hasMorePosts: true,
        currentPage: 1
    };

    // Getter for entire state
    const getState = () => ({ ...state });

    // Getter for specific state property
    const get = (key) => {
        if (key.includes('.')) {
            return key.split('.').reduce((obj, k) => obj?.[k], state);
        }
        return state[key];
    };

    // Setter for state
    const set = (key, value) => {
        if (key.includes('.')) {
            const keys = key.split('.');
            const lastKey = keys.pop();
            const target = keys.reduce((obj, k) => obj[k] = obj[k] || {}, state);
            target[lastKey] = value;
        } else {
            state[key] = value;
        }
        
        // Dispatch state change event
        window.dispatchEvent(new CustomEvent('stateChange', { 
            detail: { key, value } 
        }));
        
        // Persist theme to localStorage
        if (key === 'theme') {
            localStorage.setItem('social-feed-theme', value);
        }
        
        return state;
    };

    // Update specific properties
    const update = (updates) => {
        Object.keys(updates).forEach(key => {
            set(key, updates[key]);
        });
        return state;
    };

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        set('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        return newTheme;
    };

    // Add post
    const addPost = (post) => {
        post.id = Date.now();
        post.createdAt = new Date().toISOString();
        post.likes = 0;
        post.comments = [];
        post.isLiked = false;
        post.isBookmarked = false;
        
        state.posts.unshift(post);
        window.dispatchEvent(new CustomEvent('postAdded', { detail: post }));
        return post;
    };

    // Toggle like on post
    const toggleLike = (postId) => {
        const postIndex = state.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            const post = state.posts[postIndex];
            post.isLiked = !post.isLiked;
            post.likes += post.isLiked ? 1 : -1;
            
            // Update the post in the array
            state.posts[postIndex] = { ...post };
            
            window.dispatchEvent(new CustomEvent('postUpdated', { 
                detail: { postId, type: 'like', value: post.isLiked } 
            }));
            
            return post;
        }
        return null;
    };

    // Add comment to post
    const addComment = (postId, comment) => {
        const postIndex = state.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            const post = state.posts[postIndex];
            comment.id = Date.now();
            comment.createdAt = new Date().toISOString();
            comment.likes = 0;
            comment.isLiked = false;
            
            post.comments.push(comment);
            state.posts[postIndex] = { ...post };
            
            window.dispatchEvent(new CustomEvent('commentAdded', { 
                detail: { postId, comment } 
            }));
            
            return comment;
        }
        return null;
    };

    // Toggle bookmark
    const toggleBookmark = (postId) => {
        const postIndex = state.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            const post = state.posts[postIndex];
            post.isBookmarked = !post.isBookmarked;
            
            if (post.isBookmarked) {
                state.bookmarks.push(postId);
            } else {
                state.bookmarks = state.bookmarks.filter(id => id !== postId);
            }
            
            state.posts[postIndex] = { ...post };
            
            window.dispatchEvent(new CustomEvent('postUpdated', { 
                detail: { postId, type: 'bookmark', value: post.isBookmarked } 
            }));
            
            return post;
        }
        return null;
    };

    // Delete post
    const deletePost = (postId) => {
        const postIndex = state.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            const deletedPost = state.posts[postIndex];
            state.posts.splice(postIndex, 1);
            
            window.dispatchEvent(new CustomEvent('postDeleted', { 
                detail: { postId } 
            }));
            
            return deletedPost;
        }
        return null;
    };

    // Initialize state
    const init = () => {
        // Apply saved theme
        document.documentElement.setAttribute('data-theme', state.theme);
        
        // Load initial posts (in a real app, this would be from an API)
        loadInitialPosts();
        
        console.log('State initialized');
        return state;
    };

    // Load initial posts (mock data)
    const loadInitialPosts = () => {
        const mockPosts = [
            {
                id: 1,
                userId: 2,
                userName: 'Sam Wilson',
                userHandle: '@samwilson',
                userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                content: 'Just launched my new portfolio website! 🚀 Built with React and Three.js for some amazing 3D effects. Check it out and let me know what you think!',
                tags: ['#WebDesign', '#React', '#ThreeJS'],
                image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                likes: 234,
                comments: 42,
                shares: 18,
                createdAt: '2024-03-15T10:30:00Z',
                isLiked: false,
                isBookmarked: false,
                comments: []
            },
            {
                id: 2,
                userId: 3,
                userName: 'Emma Chen',
                userHandle: '@emmachen',
                userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                content: 'The future of AI is here! Just attended an amazing workshop on GPT-4 and its applications in creative industries. Mind = blown! 🤯',
                tags: ['#AI', '#MachineLearning', '#Innovation'],
                likes: 189,
                comments: 31,
                shares: 9,
                createdAt: '2024-03-15T08:15:00Z',
                isLiked: true,
                isBookmarked: true,
                comments: [
                    {
                        id: 101,
                        userId: 4,
                        userName: 'Jordan Lee',
                        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                        content: 'Completely agree! The creative potential is endless.',
                        likes: 12,
                        createdAt: '2024-03-15T09:20:00Z'
                    }
                ]
            },
            {
                id: 3,
                userId: 4,
                userName: 'Jordan Lee',
                userHandle: '@jordanlee',
                userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                content: 'Morning coding session complete! ☕ There\'s something magical about writing code with a cup of coffee and good music.',
                tags: ['#DeveloperLife', '#Coding', '#Productivity'],
                likes: 156,
                comments: 28,
                shares: 5,
                createdAt: '2024-03-14T14:45:00Z',
                isLiked: false,
                isBookmarked: false,
                comments: []
            },
            {
                id: 4,
                userId: 5,
                userName: 'Taylor Swift',
                userHandle: '@taylorswift',
                userAvatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                content: 'Just wrapped up an incredible photoshoot in the mountains! Nature always provides the best backdrop. 🌄',
                tags: ['#Photography', '#Nature', '#Adventure'],
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                likes: 421,
                comments: 67,
                shares: 34,
                createdAt: '2024-03-14T11:20:00Z',
                isLiked: true,
                isBookmarked: false,
                comments: []
            }
        ];
        
        state.posts = mockPosts;
    };

    // Load more posts (simulated)
    const loadMorePosts = () => {
        if (state.isLoading || !state.hasMorePosts) return Promise.resolve([]);
        
        set('isLoading', true);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const newPosts = [
                    {
                        id: Date.now(),
                        userId: 6,
                        userName: 'Michael Chen',
                        userHandle: '@michael.chen',
                        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                        content: 'Just published my first article on Medium about sustainable web development practices. Check it out!',
                        tags: ['#Sustainability', '#WebDev', '#Writing'],
                        likes: 89,
                        comments: 15,
                        shares: 7,
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                        isLiked: false,
                        isBookmarked: false,
                        comments: []
                    }
                ];
                
                state.posts = [...state.posts, ...newPosts];
                state.currentPage += 1;
                state.isLoading = false;
                state.hasMorePosts = state.currentPage < 3; // Simulate limited posts
                
                window.dispatchEvent(new CustomEvent('postsLoaded', { 
                    detail: { posts: newPosts, page: state.currentPage } 
                }));
                
                resolve(newPosts);
            }, 1500);
        });
    };

    // Subscribe to state changes
    const subscribe = (event, callback) => {
        window.addEventListener(event, callback);
        return () => window.removeEventListener(event, callback);
    };

    // Public API
    return {
        getState,
        get,
        set,
        update,
        toggleTheme,
        addPost,
        toggleLike,
        addComment,
        toggleBookmark,
        deletePost,
        init,
        loadMorePosts,
        subscribe
    };
})();