const API = (function() {
    const BASE_URL = 'https://api.vibespace.com/v1';
    const MOCK_DELAY = 800; 
    
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    const getPosts = async (page = 1, limit = 10) => {
        await delay(MOCK_DELAY);
        
        // Mock response
        return {
            success: true,
            data: {
                posts: [],
                total: 0,
                page,
                limit,
                hasMore: false
            }
        };
    };
    
    // Create post
    const createPost = async (postData) => {
        await delay(MOCK_DELAY);
        
        // Mock response
        return {
            success: true,
            data: {
                id: Date.now(),
                ...postData,
                createdAt: new Date().toISOString(),
                likes: 0,
                comments: [],
                shares: 0
            }
        };
    };
    
    // Like/unlike post
    const toggleLike = async (postId) => {
        await delay(MOCK_DELAY / 2);
        
        // Mock response
        return {
            success: true,
            data: {
                postId,
                liked: Math.random() > 0.5
            }
        };
    };
    
    // Add comment
    const addComment = async (postId, comment) => {
        await delay(MOCK_DELAY);
        
        // Mock response
        return {
            success: true,
            data: {
                id: Date.now(),
                postId,
                ...comment,
                createdAt: new Date().toISOString(),
                likes: 0
            }
        };
    };
    
    // Follow user
    const followUser = async (userId) => {
        await delay(MOCK_DELAY / 2);
        
        // Mock response
        return {
            success: true,
            data: {
                userId,
                following: Math.random() > 0.5
            }
        };
    };
    
    // Get trending topics
    const getTrendingTopics = async () => {
        await delay(MOCK_DELAY);
        
        // Mock response
        return {
            success: true,
            data: [
                { id: 1, tag: '#WebDesign', posts: 25400 },
                { id: 2, tag: '#AI', posts: 18700 },
                { id: 3, tag: '#Tech', posts: 15200 },
                { id: 4, tag: '#Creative', posts: 9800 },
                { id: 5, tag: '#Innovation', posts: 7600 }
            ]
        };
    };
    
    // Get user suggestions
    const getUserSuggestions = async (limit = 3) => {
        await delay(MOCK_DELAY);
        
        // Mock response
        return {
            success: true,
            data: [
                {
                    id: 6,
                    name: 'Michael Chen',
                    handle: '@michael.chen',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                    bio: 'Web Developer & Designer',
                    followers: 15420,
                    isFollowing: false
                },
                {
                    id: 7,
                    name: 'Sarah Johnson',
                    handle: '@sarah.j',
                    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                    bio: 'Digital Marketing Expert',
                    followers: 8920,
                    isFollowing: true
                },
                {
                    id: 8,
                    name: 'David Park',
                    handle: '@david.park',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
                    bio: 'AI Researcher',
                    followers: 23450,
                    isFollowing: false
                }
            ]
        };
    };
    
    // Public API
    return {
        getPosts,
        createPost,
        toggleLike,
        addComment,
        followUser,
        getTrendingTopics,
        getUserSuggestions
    };
})();