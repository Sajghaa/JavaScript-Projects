export class Card {
    constructor(id, symbol, pairId) {
        this.id = id;
        this.symbol = symbol;
        this.pairId = pairId;
        this.isFlipped = false;
        this.isMatched = false;
        this.element = null;
    }

    // Create card DOM element
    createElement() {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.id = this.id;
        cardDiv.dataset.pairId = this.pairId;

        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';

        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = this.symbol;

        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = '?';

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        cardDiv.appendChild(cardInner);

        this.element = cardDiv;
        return cardDiv;
    }

    // Flip card
    flip() {
        if (this.isMatched || this.isFlipped) return false;
        
        this.isFlipped = true;
        this.element.classList.add('flipped');
        return true;
    }

    // Unflip card
    unflip() {
        if (this.isMatched) return false;
        
        this.isFlipped = false;
        this.element.classList.remove('flipped');
        return true;
    }

    // Mark as matched
    match() {
        this.isMatched = true;
        this.isFlipped = true;
        this.element.classList.add('matched');
        this.element.classList.add('flipped');
    }

    // Reset card
    reset() {
        this.isFlipped = false;
        this.isMatched = false;
        this.element.classList.remove('flipped', 'matched');
    }

    // Check if card is playable (not matched and not flipped)
    isPlayable() {
        return !this.isMatched && !this.isFlipped;
    }
}