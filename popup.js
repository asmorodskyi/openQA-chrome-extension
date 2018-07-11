function trackJob(event) {
    chrome.runtime.sendMessage({messageid: "TrackJob"});
    window.close();
}

function insertRow(firstRow, secondRow) {
    var table = document.getElementById("openQAjobs");
    var row = table.insertRow(table.rows.length);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = firstRow;
    cell2.innerHTML = secondRow;
}

document.getElementById('trackJob').addEventListener('click', trackJob);
window.onload = function () {
    chrome.runtime.sendMessage({messageid: "GetJobs"}, function (response) {
        insertRow("JOB NAME", "JOB STATUS");
        for (var i = 0; i < response.length; i++) {
            var xhr = new XMLHttpRequest();
            var requestURL = new URL(response[i]);
            xhr.onreadystatechange = function () {
                if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                    var jobJSON = JSON.parse(this.response);
                    insertRow(jobJSON["job"]["name"], jobJSON["job"]["state"]);
                }
            }
            xhr.open("GET", requestURL, true);
            xhr.send();

        }
    });
}