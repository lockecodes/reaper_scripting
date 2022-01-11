/*
REWRITING THIS PIECE BY PIECE
 */

wwr_req("NTRACK;TRACK");
wwr_start();

var nTrack = 0, nTrackOld = 0, trackNameAr = [], trackRcvCntAr = [], trackHwOutCntAr = [], receiveIdxAr = [], receiveVolAr = [], receiveMuteAr = [], trackColoursAr = [], trackIsMonitorAr = [], trackIsMonitorArOld = [], selectChoiceIdx = 0, selectChoiceOld = "", mouseDown = 0, sendOutputdB = 0, selectedChoice = "";

function mouseDownEventHandler(msg) {
    return function(e) {
        if (typeof e == 'undefined') e=event;
        if (e.preventDefault) e.preventDefault();
        wwr_req(msg);
        return false;
        }
    }

function mouseUpHandler(event){mouseDown = 0;}
function mouseDownHandler(event, target){mouseDown = 1;}
function mouseLeaveHandler(event){mouseDown = 0;}
function mouseMoveHandler(event){
    if (mouseDown != 1){ return; }
    else {
        var volTrackWidth = (this.getBoundingClientRect()["width"]);
        var volThumbWidth = volTrackWidth * 0.14375;
        var volThumbTrackWidth = (volTrackWidth - volThumbWidth);
        var volThumbTrackLEdge = this.getBoundingClientRect()["left"];
        offsetX = (event.pageX - volThumbTrackLEdge - (volThumbWidth / 2));

        if (event.changedTouches != undefined) { //we're doing touch stuff
            offsetX = (event.changedTouches[0].pageX - volThumbTrackLEdge - (volThumbWidth / 2));
            }
        if(offsetX<0){offsetX=0};
        if(offsetX>volThumbTrackWidth){offsetX=volThumbTrackWidth};

        var volThumb = this.getElementsByClassName("fader")[0];
        var offsetX320 = offsetX * (320 / volTrackWidth);
        var vteMove320 = "translate(" + offsetX320 + " 0)";
        volThumb.setAttributeNS(null, "transform", vteMove320);
        var volOutput = (offsetX  / volThumbTrackWidth);
        var volOutputdB = Math.pow(volOutput, 4) * 4;
        wwr_req("SET/TRACK/" + selectChoiceIdx  + "/SEND/" + -this.id + "/VOL/" + volOutputdB)
        }
    }
function sendMouseMoveHandler(event){
    if (mouseDown != 1){ return; }
    else {
        var sendTrackWidth = this.getElementsByClassName("sendBg")[0].getBoundingClientRect()["width"];
        var sendThumbWidth = this.getElementsByClassName("sendBg")[0].getBoundingClientRect()["height"];
        var sendThumbTrackWidth = (sendTrackWidth - sendThumbWidth);
        var sendThumbTrackLEdge = this.getElementsByClassName("sendBg")[0].getBoundingClientRect()["left"];

        offsetX = event.pageX - sendThumbTrackLEdge - (sendThumbWidth / 2);
        if (event.changedTouches != undefined) { //we're doing touch stuff
            offsetX = (event.changedTouches[0].pageX - sendThumbTrackLEdge - (sendThumbWidth / 2));
            }
        if(offsetX<0){offsetX=0};
        if(offsetX>sendThumbTrackWidth){offsetX=sendThumbTrackWidth};

        var offsetX262 = offsetX * (262 / sendTrackWidth) + 26;
        var sendThumb = this.getElementsByClassName("sendThumb")[0];
        sendThumb.setAttributeNS(null, "cx", offsetX262 );
        var sendLine = this.getElementsByClassName("sendLine")[0];
        sendLine.setAttributeNS(null, "x2", offsetX262 );

        var sendOutput = (offsetX  / sendThumbTrackWidth);
        sendOutputdB = Math.pow(sendOutput, 4) * 4;
        wwr_req("SET/TRACK/" + selectChoiceIdx + "/SEND/" + -this.id + "/VOL/" + sendOutputdB)
        }
    }

function sendMouseUpHandler(event){
    wwr_req("SET/TRACK/" + selectChoiceIdx + "/SEND/" + -this.id + "/VOL/" + sendOutputdB + "e");
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

function wwr_onreply(results) {
   var resultsDisplay = document.getElementById("_results");
    if(resultsDisplay!=null){
        resultsDisplay.innerHTML = results;
        }

    var ar = results.split("\n");
    for (var x=0;x<ar.length;x++) {
        var tok = ar[x].split("\t");
        if (tok.length > 0) switch (tok[0]) {
            case "NTRACK":
                if (tok.length > 1) {
                    nTrack = parseInt(tok[1])+1;
                    if(nTrack!=nTrackOld){
                        trackRcvCntAr=[];
                        nTrackOld=nTrack;
                        }
                    }
            break;
            case "TRACK":
            idx = parseInt(tok[1]);

            if(tok[2]!=trackNameAr[idx]){
                trackNameAr[idx] = tok[2];
                }

            if(tok[11]!=trackRcvCntAr[idx]){
                trackRcvCntAr[idx] = tok[11];
                }

            if(tok[12]!=trackHwOutCntAr[idx]){
                trackHwOutCntAr[idx] = tok[12];
                }

            if(tok[13]>0 && tok[13]!=trackColoursAr[idx]){
                trackColoursAr[idx] = tok[13];
                }

            break;

            case "SEND":
                if (tok.length > 3) {
                    var f = -tok[2] - 1;
                    receiveIdxAr[f] = tok[6];
                    receiveVolAr[f] = tok[4];
                    if(tok[6]==-1){var hardVol = tok[4]}
                    if(tok[3]&8){receiveMuteAr[f] = 1}
                    else{receiveMuteAr[f] = 0}
                    }
            break;
            }
        }

        for(x=0;x<nTrack;x++){
            if((trackHwOutCntAr[x]>0) && (trackRcvCntAr[x]>0)){
                trackIsMonitorAr[x] = 1;
                }
            else {trackIsMonitorAr[x] = 0;}
            }
        var trackSelect = document.getElementById("trackSelect");
        if(trackIsMonitorAr.length>(nTrack+1)){
            trackIsMonitorAr.pop();
            for(i=trackSelect.options.length ; i>=1 ; i--){
                    trackSelect.remove(i);
                }
            }
        if(trackIsMonitorArOld.length>nTrack){
            trackIsMonitorArOld.pop();
            }

        for(x=0;x<trackIsMonitorArOld.length;x++){
            if(trackIsMonitorArOld[x]===undefined){trackIsMonitorArOld[x]=0} //so that first time round doesn't count as 'changed'
            }
        function getSum(total, num) {return total + num;}
        var trackIsMonitorArSum = trackIsMonitorAr.reduce(getSum);
        if(trackIsMonitorArOld.length>0){var trackIsMonitorArOldSum = trackIsMonitorArOld.reduce(getSum)}
        if(trackIsMonitorArSum!=trackIsMonitorArOldSum){
            for(i=trackSelect.options.length ; i>=1 ; i--){
                    trackSelect.remove(i);
                }
            }

        if(trackSelect.options.length==1){
            for(x=0;x<nTrack;x++){
                if(trackIsMonitorAr[x]==1){
                    var option = document.createElement("option");
                    option.text = trackNameAr[x];
                    trackSelect.add(option);
                    }
                trackIsMonitorArOld[x] = trackIsMonitorAr[x];
                }
            }

        var selectChoice = trackSelect.value;
        if(selectChoice!=selectChoiceOld){
            selectChoiceIdx = trackNameAr.indexOf(selectChoice);
            selectChoiceOld = selectChoice;
            selectedChoice = selectChoice
            }

        // for(y=1;y<(parseInt(trackRcvCntAr[selectChoiceIdx])+1);y++){
        //     wwr_req("GET/TRACK/" + selectChoiceIdx + "/SEND/" + (-y)); // requesting receive values of the track being displayed
        //    }
        // wwr_req("GET/TRACK/" + selectChoiceIdx + "/SEND/" + 0); // request the first normal send, which should be the hardware send

        var faderContent = document.getElementsByClassName("trackRow2")[0];
        var receivesContent = document.getElementById("receives");
        var instructions = document.getElementById("instructions");
        var cloneMidiPreset = document.getElementById("trackRowMidiPreset").cloneNode(true);
        var cloneFader = document.getElementById("trackRow2Svg").cloneNode(true);
        var cloneTrackSend = document.getElementById("trackSendSvg").cloneNode(true);
        var drawnReceives = trackRcvCntAr[selectChoiceIdx];
        var drawnReceivesDone = receivesContent.childNodes.length;
        if (drawnReceives<drawnReceivesDone || drawnReceives==null){
            if(receivesContent.lastChild){receivesContent.removeChild(receivesContent.lastChild)}
        }
        if (drawnReceives>drawnReceivesDone){
            var sendDiv = document.createElement("div");
            sendDiv.className = ("sendDiv");
            receivesContent.appendChild(sendDiv);
            sendDiv.appendChild(cloneTrackSend);
        }
        if (drawnReceives==null && faderContent.innerHTML){
            faderContent.innerHTML=""
            instructions.style.display = "block";
        }
        if (drawnReceives>=1 && faderContent.innerHTML===""){
            faderContent.appendChild(cloneFader);
            instructions.style.display = "none";
            if(selectedChoice in ACTION_IDS) {
                faderContent.appendChild(cloneMidiPreset);
            }
        }

        //----------------------------------
        // Now do things based on what's been DRAWN
        //----------------------------------

        var trackRow2Content = document.getElementById("trackRow2Svg");
        if(trackRow2Content){
            var volThumb = trackRow2Content.getElementsByClassName("fader")[0];
                volFaderConect(trackRow2Content,volThumb);
                volThumb.volSetting = (Math.pow(hardVol, 1/4) * 194.68);
                if(volThumb.volSetting){
                    var vteMove = "translate(" + volThumb.volSetting + " 0)"
                    if(mouseDown != 1){volThumb.setAttributeNS(null, "transform", vteMove);}
                    }
            }

        for(x=0;x<drawnReceivesDone;x++){ //remember not to spam the DOM like a twat
            var thisChild = receivesContent.childNodes[x];
            if(thisChild && receiveIdxAr[x] && receiveVolAr[x]){
                thisChild.id = x+1;
                thisName = trackNameAr[receiveIdxAr[x]];
                thisVol = mkvolstr(receiveVolAr[x]);
                var thisCol = ("#" + (trackColoursAr[receiveIdxAr[x]]|0x1000000).toString(16).substr(-6));
                if(thisChild){
                    sendTitleText = thisChild.getElementsByClassName("sendTitleText")[0]
                    sDbText = thisChild.getElementsByClassName("sDbText")[0];
                    }
                if(sendTitleText && sendTitleText.textContent!=thisName)sendTitleText.textContent = thisName;
                if(sDbText && sDbText.Content!=thisVol)sDbText.textContent = thisVol;
                var sendLine = thisChild.getElementsByClassName("sendLine")[0];
                sSetting = (Math.pow(receiveVolAr[x], 1/4) * 154) + 27;
                if(mouseDown != 1){sendLine.setAttributeNS(null, "x2", sSetting);}
                var sendThumb = thisChild.getElementsByClassName("sendThumb")[0];
                if(mouseDown != 1){sendThumb.setAttributeNS(null, "cx", sSetting);}

                sendConect(thisChild,sendThumb);

                var sendThumbColour = thisChild.getAttribute("style")
                var defaultColour = "#000000";
                if(thisCol!=defaultColour){
                    if(sendThumbColour!=thisCol){
                        sendThumb.setAttributeNS(null, "fill", thisCol);
                        sendTitleText.setAttributeNS(null, "fill", thisCol);
                        }
                    }
                    else{
                        sendThumb.setAttributeNS(null, "fill", "#808080");
                        sendTitleText.setAttributeNS(null, "fill", "#A3A3A3");
                        }

                var sendMuteButton = thisChild.getElementsByClassName("send_mute")[0];
                sendMuteButton.onmousedown = mouseDownEventHandler("SET/TRACK/" + selectChoiceIdx + "/SEND/" + (-x-1) + "/MUTE/-1");
                var sendMuteOff = thisChild.getElementsByClassName("send_mute_off")[0];
                var sendMuteOn = thisChild.getElementsByClassName("send_mute_on")[0];
                if(receiveMuteAr[x]==1){
                    sendMuteOff.style.visibility = "hidden";
                    sendMuteOn.style.visibility = "visible";
                    }
                else{
                    sendMuteOff.style.visibility = "visible";
                    sendMuteOn.style.visibility = "hidden";
                    }
                }
        }
}

function init(){
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    for (let l = 0; l < document.styleSheets.length; l ++) {
      let ss = document.styleSheets[l];
      if (ss.cssRules) for (let i=0; i < ss.cssRules.length; i++){
        let st = ss.cssRules[i].selectorText;
        if (st != undefined && st.startsWith(".button")) ss.removeRule(i--);
      }
    }
  }
}
function changeMidiPreset(direction) {
    wwr_req(ACTION_IDS[selectedChoice][direction]);
}
function currentMidiPreset() {
    wwr_req(ACTION_IDS[selectedChoice]["current"]);
    wwr_req("GET/EXTSTATE/section/key");
}
