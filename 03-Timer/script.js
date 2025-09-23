let timerInterval;
let remainingSeconds = 0;

function updateTimer(){
    let mins = Math.floor(remainingSeconds / 60);
    let secs = remainingSeconds % 60;

    mins = mins < 10 ? "0" + mins : mins;
    secs = secs < 10 ? "0" + secs : secs;

    document.getElementById('time').textContent = `${mins}:${secs}`;

    if(remainingSeconds <= 0){
        clearInterval(timerInterval);
        timerInterval = null;
        alert("Time's Up!");
    }
}


function startTimer(){
    if(!timerInterval){
        let inputMinutes = parseInt(document.getElementById('minutesInput').value) || 0;
        if (remainingSeconds === 0) remainingSeconds = inputMinutes * 60;

        timerInterval = setInterval(() =>{
            remainingSeconds--;
            updateTimer();
        },1000);
    }
}


function pauseTimer(){
    clearInterval(timerInterval);
    timerInterval= null;
}

function resetTimer(){
    clearInterval(timerInterval);
    timerInterval = null;
    remainingSeconds = 0;
    document.getElementById('time').textContent = "00:00";
}