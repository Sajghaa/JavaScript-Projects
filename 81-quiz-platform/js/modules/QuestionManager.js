// QuestionManager.js - Manages questions and answers
class QuestionManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.questions = this.generateQuestions();
    }

    generateQuestions() {
        return {
            general: [
                { text: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2 },
                { text: "Which planet is known as the Red Planet?", options: ["Mars", "Jupiter", "Venus", "Saturn"], correct: 0 },
                { text: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"], correct: 2 },
                { text: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
                { text: "Which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2 }
            ],
            science: [
                { text: "What is H2O commonly known as?", options: ["Oxygen", "Hydrogen", "Water", "Salt"], correct: 2 },
                { text: "What is the hardest natural substance?", options: ["Iron", "Gold", "Diamond", "Platinum"], correct: 2 },
                { text: "What gas do plants absorb?", options: ["Oxygen", "Nitrogen", "Hydrogen", "Carbon Dioxide"], correct: 3 },
                { text: "What is the center of an atom called?", options: ["Proton", "Neutron", "Electron", "Nucleus"], correct: 3 },
                { text: "What is the speed of light?", options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"], correct: 0 }
            ],
            history: [
                { text: "Who discovered America?", options: ["Columbus", "Magellan", "Cook", "Vespucci"], correct: 0 },
                { text: "Which ancient civilization built Machu Picchu?", options: ["Aztecs", "Mayans", "Incas", "Olmecs"], correct: 2 },
                { text: "Who was the first man on the moon?", options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "John Glenn"], correct: 1 },
                { text: "When did the Berlin Wall fall?", options: ["1987", "1988", "1989", "1990"], correct: 2 },
                { text: "Who painted the Sistine Chapel?", options: ["Da Vinci", "Michelangelo", "Raphael", "Donatello"], correct: 1 }
            ],
            technology: [
                { text: "Who founded Microsoft?", options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Jeff Bezos"], correct: 1 },
                { text: "What does CPU stand for?", options: ["Computer Processing Unit", "Central Processing Unit", "Core Processing Unit", "Central Processor Unit"], correct: 1 },
                { text: "Which company created the iPhone?", options: ["Samsung", "Google", "Apple", "Microsoft"], correct: 2 },
                { text: "What does 'AI' stand for?", options: ["Automated Intelligence", "Artificial Intelligence", "Augmented Intelligence", "Advanced Intelligence"], correct: 1 },
                { text: "Which programming language is known for web development?", options: ["Python", "Java", "JavaScript", "C++"], correct: 2 }
            ],
            movies: [
                { text: "Who played Jack in Titanic?", options: ["Brad Pitt", "Leonardo DiCaprio", "Johnny Depp", "Tom Cruise"], correct: 1 },
                { text: "What is the highest-grossing film of all time?", options: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars"], correct: 0 },
                { text: "Who directed Inception?", options: ["Steven Spielberg", "James Cameron", "Christopher Nolan", "Quentin Tarantino"], correct: 2 },
                { text: "Which actor plays Iron Man?", options: ["Chris Evans", "Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo"], correct: 1 },
                { text: "What year was the first Star Wars released?", options: ["1975", "1976", "1977", "1978"], correct: 2 }
            ],
            sports: [
                { text: "How many players in a soccer team?", options: ["10", "11", "12", "13"], correct: 1 },
                { text: "Who has the most Ballon d'Or awards?", options: ["Cristiano Ronaldo", "Lionel Messi", "Pele", "Maradona"], correct: 1 },
                { text: "Which country won the 2018 FIFA World Cup?", options: ["Germany", "Brazil", "France", "Argentina"], correct: 2 },
                { text: "What is the national sport of Japan?", options: ["Baseball", "Sumo", "Judo", "Karate"], correct: 2 },
                { text: "Who is the fastest man alive?", options: ["Usain Bolt", "Tyson Gay", "Yohan Blake", "Justin Gatlin"], correct: 0 }
            ]
        };
    }

    async loadQuestions(categoryId, count, difficulty) {
        const categoryQuestions = this.questions[categoryId] || this.questions.general;
        let questions = [...categoryQuestions];
        
        // Shuffle and take requested count
        questions = this.shuffleArray(questions).slice(0, count);
        
        return questions.map((q, index) => ({
            id: index,
            text: q.text,
            options: q.options,
            correctAnswer: q.options[q.correct],
            correctIndex: q.correct,
            userAnswer: null
        }));
    }

    renderQuestion(question, index) {
        const letters = ['A', 'B', 'C', 'D'];
        
        return `
            <div class="question-text">${index + 1}. ${question.text}</div>
            <div class="options-list">
                ${question.options.map((option, optIndex) => `
                    <div class="option-item ${question.userAnswer === optIndex ? 'selected' : ''}" data-option-index="${optIndex}">
                        <div class="option-letter">${letters[optIndex]}</div>
                        <div class="option-text">${option}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachOptionListeners() {
        document.querySelectorAll('.option-item').forEach(option => {
            option.onclick = () => {
                const optionIndex = parseInt(option.dataset.optionIndex);
                const currentQuestion = window.app.quizManager.currentQuestions[window.app.quizManager.currentIndex];
                
                // Remove selected class from all options
                option.parentElement.querySelectorAll('.option-item').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                option.classList.add('selected');
                currentQuestion.userAnswer = optionIndex;
                
                // Update score
                window.app.scoreManager.updateScore(currentQuestion);
            };
        });
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

window.QuestionManager = QuestionManager;