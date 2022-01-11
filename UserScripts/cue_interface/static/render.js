var trackResponse, selectedTrack, hardwareSend, receives = [];

function renderTrackSelect(data) {
    trackResponse = new TrackResponse(data.trim());
    var trackSelect = document.getElementById("trackSelect");
    trackResponse.monitorTracks.forEach(function(value, index, arr) {
        var option = document.createElement("option");
        option.text = value.trackName;
        option.value = value.trackName;
        trackSelect.add(option);
    });
}

function resetDynamicDiv() {
    var dynamicDiv = document.getElementById("dynamicContent");
    dynamicDiv.innerHTML = "";
    var innerHTML = "";
    var trackRow = document.createElement("div")
    trackRow.className = "trackRow2";
    innerHTML = trackRow.outerHTML;
    var receives = document.createElement("div");
    receives.id = "receives";
    innerHTML += receives.outerHTML;
    dynamicDiv.innerHTML = innerHTML.trim();
}

function renderNewMonitor(selectedValue) {
    resetDynamicDiv();
    $.get("_/TRACK", function (data) {
        trackResponse = new TrackResponse(data.trim());
        selectedTrack = trackResponse.monitorTracks.filter(function(value, index, arr) {
            return value.trackName === selectedValue;
        })[0];
        handleSends(selectedTrack);
        // hide instructions
        var instructions = document.getElementById("instructions");
        instructions.style.display = "none";

        var faderContent = document.getElementsByClassName("trackRow2")[0];
        var receivesContent = document.getElementById("receives");
        var cloneMidiPreset = document.getElementById("trackRowMidiPreset").cloneNode(true);
        var cloneFader = document.getElementById("trackRow2Svg").cloneNode(true);

        faderContent.appendChild(cloneFader);
        if(selectedTrack.trackName in ACTION_IDS) {
            faderContent.appendChild(cloneMidiPreset);
        }

        receives.forEach(function(value, index, arr) {
            console.log(value);
            var sendDiv = document.createElement("div");
            var cloneTrackSend = document.getElementById("trackSendSvg").cloneNode(true);
            sendDiv.className = ("sendDiv");
            receivesContent.appendChild(sendDiv);
            sendDiv.appendChild(cloneTrackSend);
        });
        /*
        TODO: Add doing things and attaching events to things
         */

    });
}

function handleSends(selectedTrack) {
    var trackNumber = selectedTrack.trackNumber;
    receives = []
    // Harware send
    $.get({
        url: "_/GET/TRACK/" + trackNumber + "/SEND/0",
        async: false
        }).done(function (data) {
        hardwareSend = Send.processRequestData(data);
    });
    // receives
    for(var i = 1; i<selectedTrack.receiveCount + 1; i++) {
        $.get({
            url: "_/GET/TRACK/" + trackNumber + "/SEND/" + (-i),
            async: false
            }).done(function (data) {
            receives.push(Send.processRequestData(data));
        });
    }
}
