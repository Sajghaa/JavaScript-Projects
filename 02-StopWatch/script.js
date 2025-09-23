let stopWatchInterval;
let stopWatchSeconds = 0;

function updateStopWatch(){
    
    let hrs = Math.floor(stopWatchSeconds / 3600);
    let mins = Math.floor((stopWatchSeconds % 3600) / 60);
    let secs = stopWatchSeconds % 60;

    hrs = hrs < 10 ? "0" + hrs : hrs;
    mins = mins < 10 ? "0" + mins : mins;
    secs = secs < 10 ? "0" + secs : secs;

    document.getElementById('time').textContent = `${hrs}:${mins}:${secs}`;
 }


 function startStopWatch(){
    if(!stopWatchInterval){
        stopWatchInterval = setInterval(() =>{
            stopWatchSeconds++;
            updateStopWatch();
        }, 1000)
    }
 }

 function pauseStopWatch(){
    clearInterval(stopWatchInterval);
    stopWatchInterval = null
 };

 function resetStopWatch(){
    clearInterval(stopWatchInterval);
    stopWatchInterval = null;
    stopWatchSeconds = 0;
    updateStopWatch();
 }