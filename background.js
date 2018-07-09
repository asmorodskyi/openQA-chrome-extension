chrome.alarms.onAlarm.addListener(function( alarm ) {
    console.log("Got an alarm!", alarm);
  });

  chrome.runtime.onMessage.addListener( function(request,sender,sendResponse)
{
    if( request.greeting === "GetURL" )
    {
        var tabURL = "Not set yet";
        chrome.tabs.query({active:true},function(tabs){
            if(tabs.length === 0) {
                sendResponse({});
                return;
            }
            tabURL = tabs[0].url;
            sendResponse( {navURL:tabURL} );
        });        
    }
});