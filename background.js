var jobIds = [];

chrome.alarms.onAlarm.addListener(function (alarm) {
    for (var i = 0; i < jobIds.length; i++) {
        var xhr = new XMLHttpRequest();
        console.log("Requesting URL-"+ jobIds[i]);
        var requestURL = new URL(jobIds[i]);
        xhr.onreadystatechange = function() {
            if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                var jobJSON = JSON.parse(this.response);
                if(jobJSON["job"]["state"] === "done" || jobJSON["job"]["state"] === "canceled") {
                    console.log("Job " + jobIds[i] + " is done or canceled ");
                    jobIds.splice(jobIds[i],1);
                    new Notification('openQAChecker', {
                        icon: '48.png',
                        body: 'Job ' + jobJSON["job"]["name"] + "is finished"
                      });
                }
                console.log("Job with id=" + jobJSON["job"]["id"] + "has state " + jobJSON["job"]["state"]);
            }
        }
        xhr.open("GET", requestURL, true);
        xhr.send();
    }
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.get("openQAChecker", function(alarm) {
        if(alarm === undefined ){
            console.log("First pluging start. Creating alarm");
            chrome.alarms.create("openQAChecker", {periodInMinutes: 0.1});
        }
        else{
            console.log("Alarm already exists");
        }
    });
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.messageid === "TrackJob") {
        chrome.tabs.query({active: true}, function (tabs) {
            if (tabs.length !== 0 && /\/tests\/\d{1,7}/.test(tabs[0].url)) {
                var exists = false;
                var url = new URL(tabs[0].url);
                // url to query openQA for job status
                var URLString = url.origin+"/api/v1/jobs/"+url.href.substring(url.href.lastIndexOf("/")+1,url.href.length);
                for (var i = 0; i < jobIds.length; i++) { // checking if we already processing this URL 
                    if(jobIds[i] === URLString) {
                        exists=true;
                        break;
                    }
                }
                if(exists) {
                    console.log("Already processing "+ tabs[0].url)
                }else {
                    console.log('Start tracking ' + url.pathname + " for host - " + url.hostname);
                    jobIds.push(URLString);
                }
            } else {
                console.log('Wrong tab');
            }
        });
    }
    if (request.messageid === "GetJobs") {
        sendResponse(jobIds);
    }
});