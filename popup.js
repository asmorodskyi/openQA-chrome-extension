function setAlarm(event) {
    var tabURL='Undef';
    chrome.runtime.sendMessage({greeting: "GetURL"},
        function (response) {
            tabURL = response.navURL;
            alert(tabURL);
            chrome.alarms.create("alarmName", {delayInMinutes: 1});
        });
    window.close();
  }
  
  function clearAlarm() {
    chrome.alarms.clearAll();
    window.close();
  }
  
  //An Alarm delay of less than the minimum 1 minute will fire
  // in approximately 1 minute incriments if released
  document.getElementById('setAlarm').addEventListener('click', setAlarm);
  document.getElementById('clearAlarm').addEventListener('click', clearAlarm);