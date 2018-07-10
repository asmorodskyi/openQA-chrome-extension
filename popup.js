function setAlarm(event) {
    chrome.runtime.sendMessage({messageid: "CreateAlarm"});
    window.close();
}

document.getElementById('setAlarm').addEventListener('click', setAlarm);