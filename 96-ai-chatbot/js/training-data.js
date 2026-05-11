// Training data for the chatbot - Intent classification and responses
const trainingData = {
    // Greetings
    greetings: {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'what\'s up', 'howdy'],
        responses: [
            'Hello! How can I help you today?',
            'Hi there! What can I do for you?',
            'Hey! Great to see you!',
            'Greetings! How may I assist you?'
        ]
    },
    
    // How are you
    howAreYou: {
        patterns: ['how are you', 'how do you do', 'how\'s it going', 'how are you doing', 'how you doing'],
        responses: [
            "I'm doing great, thank you for asking! How can I help you?",
            "I'm functioning perfectly! What can I assist you with?",
            "All systems operational! Ready to help you."
        ]
    },
    
    // Name
    name: {
        patterns: ['what is your name', 'who are you', 'your name', 'what do I call you', 'tell me your name'],
        responses: [
            "I'm your AI Assistant! I'm here to help answer your questions.",
            "You can call me AI Assistant. I'm a chatbot powered by natural language processing.",
            "I'm an AI chatbot created to assist you with various tasks and questions."
        ]
    },
    
    // Capabilities
    capabilities: {
        patterns: ['what can you do', 'your capabilities', 'help me', 'what do you know', 'features', 'abilities'],
        responses: [
            "I can help you with:\n• Answering general questions\n• Telling jokes\n• Calculating math problems\n• Providing weather information\n• Giving recommendations\n• Having casual conversations\n• And much more!",
            "I'm trained to understand natural language and respond to a wide range of queries. Just ask me anything!",
            "My capabilities include conversation, calculations, recommendations, and general knowledge questions."
        ]
    },
    
    // Jokes
    jokes: {
        patterns: ['tell me a joke', 'joke', 'make me laugh', 'funny', 'humor', 'say something funny'],
        responses: [
            "Why don't scientists trust atoms? Because they make up everything! 😄",
            "What do you call a bear with no teeth? A gummy bear! 🐻",
            "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
            "What do you call a fake noodle? An impasta! 🍝",
            "Why don't eggs tell jokes? They'd crack each other up! 🥚"
        ]
    },
    
    // Weather
    weather: {
        patterns: ['weather', 'temperature', 'forecast', 'is it raining', 'cold outside', 'hot outside'],
        responses: [
            "I don't have live weather data access, but you can check weather.com for accurate forecasts!",
            "For weather information, I recommend checking a weather service or app like Weather.com or AccuWeather.",
            "I wish I could tell you the weather, but I don't have live API access. Try a weather service!"
        ]
    },
    
    // Math calculations
    math: {
        patterns: ['calculate', 'math', 'what is', 'equals', 'solve', 'compute'],
        // This will be handled by a special function in the chatbot
        isMath: true
    },
    
    // Recommendations
    recommendations: {
        patterns: ['recommend', 'suggestion', 'what should I', 'ideas', 'suggest', "what's good"],
        responses: [
            "That depends on what you're looking for! Movies? Books? Music? Food? Tell me more!",
            "I'd love to help with recommendations. What category are you interested in?",
            "To give you the best recommendation, could you specify what you're looking for?"
        ]
    },
    
    // Movies
    movies: {
        patterns: ['movie', 'film', 'cinema', 'watch', 'show', 'series', 'netflix'],
        responses: [
            "Some popular movies right now include Oppenheimer, Barbie, and Spider-Man: Across the Spider-Verse!",
            "If you like sci-fi, try Dune or Interstellar. For comedy, The Hangover or Superbad are classics!",
            "I'd recommend checking out IMDb's top 250 list for the best movies of all time!"
        ]
    },
    
    // Music
    music: {
        patterns: ['music', 'song', 'artist', 'band', 'playlist', 'listen'],
        responses: [
            "Music taste is personal! Some popular artists include Taylor Swift, Drake, The Weeknd, and Bad Bunny.",
            "I recommend checking out Spotify's 'Discover Weekly' playlist for personalized music suggestions!",
            "What genre do you like? Pop, Rock, Hip-hop, Classical, Jazz? I can suggest based on that!"
        ]
    },
    
    // Books
    books: {
        patterns: ['book', 'read', 'novel', 'reading', 'author', "what's a good book"],
        responses: [
            "Some highly recommended books: 'Project Hail Mary' by Andy Weir, 'Atomic Habits' by James Clear, and 'Dune' by Frank Herbert.",
            "If you like fantasy, try 'The Name of the Wind' or 'Mistborn'. For thriller, 'The Silent Patient' is great!",
            "What genre are you interested in? Fiction, Non-fiction, Mystery, Sci-fi? I can give better recommendations!"
        ]
    },
    
    // Food
    food: {
        patterns: ['food', 'eat', 'restaurant', 'cooking', 'recipe', 'hungry', "what's for dinner"],
        responses: [
            "Some delicious cuisines to try: Italian, Japanese, Mexican, Indian, and Thai!",
            "Popular dishes include pizza, sushi, tacos, curry, and pad thai. What sounds good?",
            "For recipes, I recommend checking out AllRecipes or Pinterest for inspiration!"
        ]
    },
    
    // Technology
    technology: {
        patterns: ['technology', 'tech', 'gadget', 'device', 'computer', 'phone', 'laptop', 'smartphone'],
        responses: [
            "Technology is advancing rapidly! AI, quantum computing, and renewable energy are exciting fields.",
            "Some popular tech products include iPhones, Samsung Galaxy, MacBooks, and gaming PCs like Alienware.",
            "Are you interested in a specific area of tech? Hardware, software, AI, cybersecurity? Let me know!"
        ]
    },
    
    // Science
    science: {
        patterns: ['science', 'scientific', 'physics', 'chemistry', 'biology', 'space', 'astronomy'],
        responses: [
            "Science is fascinating! Did you know that octopuses have three hearts? 🐙",
            "Space fact: One day on Venus is longer than one year on Earth! 🌍",
            "Biology fact: Your body has about 37 trillion cells! 🔬"
        ]
    },
    
    // Help
    help: {
        patterns: ['help', 'support', 'assist', 'what can you do', 'how to use', 'commands'],
        responses: [
            "I can help with:\n• Answering questions\n• Math calculations\n• Telling jokes\n• Recommendations\n• General conversation\n\nJust type your message naturally!"
        ]
    },
    
    // Feelings - Sad
    sad: {
        patterns: ['sad', 'depressed', 'unhappy', 'feeling down', 'not good', 'terrible'],
        responses: [
            "I'm sorry to hear you're feeling down. Remember that tough times don't last, but tough people do! 💪",
            "It's okay to have bad days. Consider talking to a friend or family member. Would you like me to tell you a joke to cheer you up?",
            "I'm here for you. Sometimes taking a walk, listening to music, or doing something you love can help improve your mood."
        ]
    },
    
    // Feelings - Happy
    happy: {
        patterns: ['happy', 'excited', 'wonderful', 'great day', 'awesome', 'amazing'],
        responses: [
            "That's wonderful to hear! I'm glad you're having a great day! 🎉",
            "Awesome! Keep that positive energy going! What made you happy today?",
            "Happiness is contagious! Thanks for sharing your positive vibes with me!"
        ]
    },
    
    // Thanks
    thanks: {
        patterns: ['thank you', 'thanks', 'appreciate', 'grateful', 'thank'],
        responses: [
            "You're very welcome! Happy to help! 😊",
            "My pleasure! Let me know if you need anything else.",
            "Glad I could assist you!"
        ]
    },
    
    // Goodbye
    goodbye: {
        patterns: ['bye', 'goodbye', 'see you', 'farewell', 'take care', 'cya'],
        responses: [
            "Goodbye! Have a great day! 👋",
            "See you later! Come back anytime you need assistance.",
            "Take care! It was nice chatting with you!"
        ]
    },
    
    // Fallback (when no pattern matches)
    fallback: [
        "I'm not sure I understand. Could you rephrase that?",
        "Interesting! Could you tell me more about that?",
        "I'm still learning! Could you ask that in a different way?",
        "Let me think about that... In the meantime, is there something else I can help with?"
    ]
};

// Additional responses for specific intents
const specificResponses = {
    aboutAI: {
        patterns: ['what is ai', 'what is artificial intelligence', 'explain ai', 'ai meaning'],
        response: "Artificial Intelligence (AI) is the simulation of human intelligence in machines that are programmed to think and learn. It includes machine learning, natural language processing, and computer vision!"
    },
    
    aboutChatbot: {
        patterns: ['how do you work', 'how do chatbots work', 'how are you programmed', 'how do you understand me'],
        response: "I use Natural Language Processing (NLP) to understand your messages! I analyze patterns, keywords, and context to determine your intent and provide appropriate responses."
    },
    
    meaningOfLife: {
        patterns: ['meaning of life', 'purpose of life', 'why are we here', 'what is life'],
        response: "That's a deep philosophical question! Many say the meaning of life is to find happiness, help others, and leave the world better than you found it. What do you think?"
    }
};

// Combine all training data
window.trainingData = trainingData;
window.specificResponses = specificResponses;