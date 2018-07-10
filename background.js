var jobIds = [];

chrome.alarms.onAlarm.addListener(function (alarm) {
    for (var key in jobIds) {
        console.log("Processing job with id=" + jobIds[key].href);
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