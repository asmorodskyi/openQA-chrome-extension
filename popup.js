function trackJob(event) {
    chrome.runtime.sendMessage({messageid: "TrackJob"});
    window.close();
}

function insertRow(firstRow, secondRow) {
    var table = document.getElementById("openQAjobs");
    var row = table.insertRow(0);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = firstRow;
    cell2.innerHTML = secondRow;
}

document.getElementById('trackJob').addEventListener('click', trackJob);
window.onload = function () {
    chrome.runtime.sendMessage({messageid: "GetJobs"}, function (response) {
        insertRow("JOB URL",response+ " !!!");
    });
}