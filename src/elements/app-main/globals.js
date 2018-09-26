Globals = function () {
    let requestCount = 0;
    let responseCount = 0;

    function handleProgress() {
        if (!Globals.progressBar) {
            return;
        }

        if (Globals.requestCount > 0) {
            if (Globals.responseCount < Globals.requestCount) {
                if (Globals.responseCount > 0) {
                    let step = Globals.progressBar.max / Globals.requestCount;
                    Globals.progressBar.value = step * Globals.responseCount;
                    //console.log("Progress increase : ", Globals.progressBar.value, Globals.requestCount, Globals.responseCount);
                }
            } else {
                Globals.progressBar.value = Globals.progressBar.max - (Globals.progressBar.max / 10);
            }
        }
    }

    function resetProgress(force = false) {
        //console.log('progressTimer called');

        if (!Globals.progressBar) {
            return;
        }

        let progressVal = Globals.progressBar.value;
        //console.log('Reset progress :', currentVal, Globals.progressBar.value, Globals.progressBar.max, Globals.requestCount, Globals.responseCount);
        if (force || (progressVal == Globals.progressBar.value && progressVal > 0 && progressVal < Globals.progressBar.max && (Globals.requestCount == Globals.responseCount || Globals.responseCount > Globals.requestCount))) {
            //console.log("PSTOP at: " + progressVal + ", " + Globals.requestCount + ", " + Globals.responseCount);
            let leftOver = Globals.progressBar.max - progressVal;
            if (leftOver > 0) {
                Globals.progressBar.value += leftOver;
                Globals.responseCount = Globals.requestCount = 0;
                Globals.progressBar.value = 0;
                //console.log("PRESET: " + Globals.progressBar.value + ", " + Globals.progressBar.max + ", " + Globals.requestCount + ", " + Globals.responseCount);
            }
        }
    }

    let progressTimer = setInterval(resetProgress, 3000);

    return {
        requestCount: requestCount,
        responseCount: responseCount,
        handleProgress: handleProgress,
        resetProgress: resetProgress,
        progressTimer: progressTimer
    };

}();
