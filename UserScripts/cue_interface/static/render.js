var trackResponse, selectedTrack, hardwareSend, receives = [];
var mouseDown = 0, sendOutputdB = 0;

/*
EVENTS
 */
function mouseUpHandler(event){mouseDown = 0;}
function mouseDownHandler(event, target){mouseDown = 1;}
function mouseLeaveHandler(event){mouseDown = 0;}
function mouseMoveHandler(event){
    if (mouseDown === 1) {
        var volTrackWidth = (this.getBoundingClientRect()["width"]);
        var volThumbWidth = volTrackWidth * 0.14375;
        var volThumbTrackWidth = (volTrackWidth - volThumbWidth);
        var volThumbTrackLEdge = this.getBoundingClientRect()["left"];
        var offsetX = (event.pageX - volThumbTrackLEdge - (volThumbWidth / 2));

        if (event.changedTouches !== undefined) { //we're doing touch stuff
            offsetX = (event.changedTouches[0].pageX - volThumbTrackLEdge - (volThumbWidth / 2));
        }
        if(offsetX<0){
            offsetX=0;
        }
        if(offsetX>volThumbTrackWidth){
            offsetX=volThumbTrackWidth;
        }

        var volThumb = this.getElementsByClassName("fader")[0];
        var offsetX320 = offsetX * (320 / volTrackWidth);
        var vteMove320 = "translate(" + offsetX320 + " 0)";
        volThumb.setAttributeNS(null, "transform", vteMove320);
        var volOutput = (offsetX  / volThumbTrackWidth);
        var volOutputdB = Math.pow(volOutput, 4) * 4;
        // TODO: setting receive volume manually to test (was -this.id)
        // actually now just setting just to volume since this all needs to be rewritten
        // $.get("_/SET/TRACK/" + selectedTrack.trackNumber  + "/SEND/" + -this.id + "/VOL/" + volOutputdB, function (data) {
        //     // need to do something here probably
        //     console.log(data);
        // });
        // set to 0 right now because that would be the hardware send I think
        // ajax async is an issue...not reliable settings
        $.get({
            url: "_/SET/TRACK/" + selectedTrack.trackNumber + "/SEND/0/VOL/" + volOutputdB,
            async: false
        }, function (data) {
            // need to do something here probably
            console.log(data);
        });
    }
}

function sendMouseMoveHandler(event){
    if (mouseDown === 1) {
        var sendTrackWidth = this.getElementsByClassName("sendBg")[0].getBoundingClientRect()["width"];
        var sendThumbWidth = this.getElementsByClassName("sendBg")[0].getBoundingClientRect()["height"];
        var sendThumbTrackWidth = (sendTrackWidth - sendThumbWidth);
        var sendThumbTrackLEdge = this.getElementsByClassName("sendBg")[0].getBoundingClientRect()["left"];

        var offsetX = event.pageX - sendThumbTrackLEdge - (sendThumbWidth / 2);
        if (event.changedTouches !== undefined) { //we're doing touch stuff
            offsetX = (event.changedTouches[0].pageX - sendThumbTrackLEdge - (sendThumbWidth / 2));
        }
        if(offsetX<0){
            offsetX=0;
        }
        if(offsetX>sendThumbTrackWidth){
            offsetX=sendThumbTrackWidth;
        }

        var offsetX262 = offsetX * (262 / sendTrackWidth) + 26;
        var sendThumb = this.getElementsByClassName("sendThumb")[0];
        sendThumb.setAttributeNS(null, "cx", offsetX262 );
        var sendLine = this.getElementsByClassName("sendLine")[0];
        sendLine.setAttributeNS(null, "x2", offsetX262 );

        var sendOutput = (offsetX  / sendThumbTrackWidth);
        sendOutputdB = Math.pow(sendOutput, 4) * 4;
        $.get("_/SET/TRACK/" + selectedTrack.trackNumber + "/SEND/" + -this.id + "/VOL/" + sendOutputdB, function (data) {
            // need to do something here probably
            console.log(data);
        });
    }
}

function sendMouseUpHandler(event){
    $.get("_/SET/TRACK/" + selectedTrack.trackNumber + "/SEND/" + -this.id + "/VOL/" + sendOutputdB + "e", function (data) {
        // need to do something here probably
        console.log(data);
    });
    mouseDown = 0;
}

function volFaderConect(content, thumb){
    content.addEventListener("mousemove", mouseMoveHandler, false);
    content.addEventListener("touchmove", mouseMoveHandler, false);
    content.addEventListener("mouseleave", mouseLeaveHandler, false);
    content.addEventListener("mouseup", mouseUpHandler, false);
    content.addEventListener("touchend", mouseUpHandler, false);
    thumb.addEventListener("mousedown", function (event) {mouseDownHandler(event, event.srcElement)}, false);
    thumb.addEventListener('touchstart', function(event){
        if (event.touches.length > 0) mouseDownHandler(event, event.srcElement);
        event.preventDefault(); }, false);
}

function sendConect(content, thumb){
    content.addEventListener("mousemove", sendMouseMoveHandler, false);
    content.addEventListener("touchmove", sendMouseMoveHandler, false);
    content.addEventListener("mouseleave", mouseLeaveHandler, false);
    content.addEventListener("mouseup", sendMouseUpHandler, false);
    content.addEventListener("touchend", sendMouseUpHandler, false);
    thumb.addEventListener("mousedown", function (event) {mouseDownHandler(event, event.srcElement)}, false);
    thumb.addEventListener('touchstart', function(event){
        if (event.touches.length > 0) mouseDownHandler(event, event.srcElement);
        event.preventDefault(); }, false);
}

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
        var trackRow2Content = document.getElementById("trackRow2Svg");
        if(trackRow2Content){
            var volThumb = trackRow2Content.getElementsByClassName("fader")[0];
            volFaderConect(trackRow2Content,volThumb);
            volThumb.volSetting = (Math.pow(hardwareSend.volume, 1/4) * 194.68);
            if(volThumb.volSetting){
                var vteMove = "translate(" + volThumb.volSetting + " 0)"
                if(mouseDown !== 1){
                    volThumb.setAttributeNS(null, "transform", vteMove);
                }
            }
        }

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
