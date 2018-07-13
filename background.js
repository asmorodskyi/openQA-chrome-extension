chrome.alarms.onAlarm.addListener(function (alarm) {
    var storage = chrome.storage.local;
    storage.get(['openQACheckJSON'], function (result) {
        var jobIds = result.openQACheckJSON;
        console.log("onAlarm event jobIds-" + jobIds.length);
        for (var i = 0; i < jobIds.length; i++) {
            var xhr = new XMLHttpRequest();
            console.log("Requesting URL-" + jobIds[i]);
            xhr.onreadystatechange = function () {
                if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                    var jobJSON = JSON.parse(this.response);
                    if (jobJSON["job"]["state"] === "done" || jobJSON["job"]["state"] === "canceled") {
                        console.log("Job " + jobJSON["job"]["id"] + " is done or canceled ");
                        var index = jobIds.indexOf(this.responseURL);
                        console.log("JobIds size - " + jobIds.length + " and about to delete " + index);
                        jobIds.splice(index, 1);
                        storage.set({"openQACheckJSON": jobIds});
                        chrome.browserAction.setBadgeText({text: jobIds.length.toString()});
                        new Notification('openQAChecker', {
                            icon: '48.png',
                            body: 'Job ' + jobJSON["job"]["name"] + "is finished"
                        });
                    } else {
                        console.log("Job with id=" + jobJSON["job"]["id"] + "has state " + jobJSON["job"]["state"]);
                    }
                }
            }
            xhr.open("GET", new URL(jobIds[i]), true);
            xhr.send();
        }
    });
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.browserAction.setBadgeBackgroundColor({color: [190, 190, 190, 230]});
    chrome.browserAction.setBadgeText({text: '0'});
    chrome.storage.local.set({"openQACheckJSON": []});
    chrome.alarms.get("openQAChecker", function (alarm) {
        if (alarm === undefined) {
            console.log("First pluging start. Creating alarm");
            chrome.alarms.create("openQAChecker", {periodInMinutes: 2});
        } else {
            console.log("Alarm already exists");
        }
    });
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.messageid === "TrackJob") {
        chrome.tabs.query({active: true}, function (tabs) {
            var storage = chrome.storage.local;
            storage.get(['openQACheckJSON'], function (result) {
                if (tabs.length !== 0 && /\/tests\/\d{1,7}/.test(tabs[0].url)) {
                    var jobIds = result.openQACheckJSON;
                    var url = new URL(tabs[0].url);
                    // url to query openQA for job status
                    var URLString = url.origin + "/api/v1/jobs/" + url.href.substring(url.href.lastIndexOf("/") + 1, url.href.length);
                    var index = jobIds.indexOf(URLString);
                    if (index > -1) {
                        console.log("Already processing " + URLString)
                    } else {
                        console.log('Start tracking ' + URLString);
                        jobIds.push(URLString);
                        storage.set({"openQACheckJSON": jobIds});
                        chrome.browserAction.setBadgeText({text: jobIds.length.toString()});
                    }
                } else {
                    console.log('Wrong tab');
                }
            });
        });
    }
    if (request.messageid === "GetJobs") {
        chrome.storage.local.get(['openQACheckJSON'], function (result) {
            sendResponse(result.openQACheckJSON);
        });
        return true;
    }
});