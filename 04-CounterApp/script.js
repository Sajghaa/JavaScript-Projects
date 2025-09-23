let count = 5;

function updateDisplay(){
    document.getElementById('counter').textContent = count;
}

function increment(){
    count++;
    updateDisplay();
}

function decrement(){
    count--;
    updateDisplay();
}

function reset(){
    count = 0;
    updateDisplay()
}