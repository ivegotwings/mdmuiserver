ProgressTracker = function () {
    let requestCount = 0;
    let responseCount = 0;

    function addNewWorkUnit () {
        if(ProgressTracker.progressBar) {
            //requestCount++;
            //handleProgress();
        }
    }

    function markWorkUnitDone () {
        if(ProgressTracker.progressBar) {
            //responseCount++;
            //handleProgress();
        }
    }

    function handleProgress() {
        if (!ProgressTracker.progressBar) {
            //console.log('progrssBar is undefined', ProgressTracker.progressBar, requestCount, responseCount);
            return;
        }

        if (requestCount > 0) {
            if (responseCount < requestCount) {
                if (responseCount > 0) {
                    let step = ProgressTracker.progressBar.max / requestCount;
                    ProgressTracker.progressBar.value = step * responseCount;
                    //console.log("Progress increase : ", ProgressTracker.progressBar.value, requestCount, responseCount);
                }
            } else {
                ProgressTracker.progressBar.value = ProgressTracker.progressBar.max - (ProgressTracker.progressBar.max / 10);
            }
        }
    }

    function resetProgress (force = false) {
        //console.log('progressTimer called');
        if (!ProgressTracker.progressBar) {
            return;
        }

        let progressVal = ProgressTracker.progressBar.value;
        //console.log('Reset progress :', currentVal, ProgressTracker.progressBar.value, ProgressTracker.progressBar.max, requestCount, responseCount);
        if (force || (progressVal == ProgressTracker.progressBar.value && progressVal > 0 && progressVal < ProgressTracker.progressBar.max && (requestCount == responseCount || responseCount > requestCount))) {
            //console.log("PSTOP at: " + progressVal + ", " + requestCount + ", " + responseCount);
            let leftOver = ProgressTracker.progressBar.max - progressVal;
            if (leftOver > 0) {
                ProgressTracker.progressBar.value += leftOver;
                responseCount = requestCount = 0;
                ProgressTracker.progressBar.value = 0;
                //console.log("PROGRESS-RESET: " + ProgressTracker.progressBar.value + ", " + ProgressTracker.progressBar.max + ", " + requestCount + ", " + responseCount);
            }
        }
    }

    //let progressTimer = setInterval(resetProgress, 4000);

    return {
        addNewWorkUnit: addNewWorkUnit,
        markWorkUnitDone: markWorkUnitDone,
        resetProgress: resetProgress,
        handleProgress: handleProgress
    };
}();
