var jobIds = [];

chrome.alarms.onAlarm.addListener(function (alarm) {
    for (var key in jobIds) {
        var xhr = new XMLHttpRequest();
        var URLString = jobIds[key].origin+"/api/v1/jobs/"+key.substring(key.lastIndexOf("/")+1,key.length);
        console.log("Requesting URL-"+ URLString);
        var requestURL = new URL(URLString);
        xhr.onreadystatechange = function() {
            if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                var jobJSON = JSON.parse(this.responseText);
                if(jobJSON["job"]["state"] === "done" || jobJSON["job"]["state"] === "canceled") {
                    console.log("Job " + key + " is done or canceled ");
                    delete jobIds[key];
                    new Notification('openQAChecker', {
                        icon: '48.png',
                        body: 'Job ' + key + "is finished"
                      });
                }
                console.log("Current job state - " + jobJSON["job"]["state"]);
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
    if (request.messageid === "CreateAlarm") {
        chrome.tabs.query({active: true}, function (tabs) {
            if (tabs.length !== 0 && /\/tests\/\d{1,7}/.test(tabs[0].url)) {
                var exists = false;
                for(var key in jobIds){
                    if(key === tabs[0].url) {
                        exists=true;
                        break;
                    }
                }
                if(exists) {
                    console.log("Already processing "+ tabs[0].url)
                }else {
                    var url = new URL(tabs[0].url);
                    console.log('Start tracking ' + url.pathname + " for host - " + url.hostname);
                    jobIds[tabs[0].url]=url;
                }
            } else {
                console.log('Wrong tab');
            }
        });
    }
});