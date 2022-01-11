class TrackFlags {
    constructor(value) {
        this.flags = []
        this.folder = false;
        this.selected = false;
        this.hasFx = false;
        this.muted = false;
        this.soloed = false;
        this.soloInPlace = false;
        this.recordArmed = false;
        this.recordMonitoringOn = false;
        this.recordMonitoringAuto = false;
        if (parseInt(value) & 1) {
            this.flags.push(FLAG_FOLDER);
            this.folder = true;
        }
        if (parseInt(value) & 2) {
            this.flags.push(FLAG_SELECTED);
            this.selected = true;
        }
        if (parseInt(value) & 4) {
            this.flags.push(FLAG_HAS_FX);
            this.hasFx = true;
        }
        if (parseInt(value) & 8) {
            this.flags.push(FLAG_MUTED);
            this.muted = true;
        }
        if (parseInt(value) & 16) {
            this.flags.push(FLAG_SOLOED);
            this.soloed = true;
        }
        if (parseInt(value) & 32) {
            this.flags.push(FLAG_SOLO_IN_PLACE);
            this.soloInPlace = true;
        }
        if (parseInt(value) & 64) {
            this.flags.push(FLAG_RECORD_ARMED);
            this.recordArmed = true;
        }
        if (parseInt(value) & 128) {
            this.flags.push(FLAG_RECORD_MONITORING_ON);
            this.recordMonitoringOn = true;
        }
        if (parseInt(value) & 256) {
            this.flags.push(FLAG_RECORD_MONITORING_AUTO);
            this.recordMonitoringAuto = true;
        }
    }
}
class Track {
    constructor(trackNumber, trackName, trackFlags, volume, pan, lastMeterPeak, lastMeterPos, widthPan2, panMode, sendCnt, recvCnt, hwoutCnt, color) {
        this.trackNumber = parseInt(trackNumber);
        this.trackName = trackName;
        this.trackFlags = new TrackFlags(trackFlags);
        this.volume = parseFloat(volume);
        this.pan = parseFloat(pan);
        this.lastMeterPeak = parseFloat(lastMeterPeak);
        this.lastMeterPos = parseFloat(lastMeterPos);
        this.widthPan2 = parseFloat(widthPan2);
        this.panMode = parseInt(panMode);
        this.sendCount = parseInt(sendCnt);
        this.receiveCount = parseInt(recvCnt);
        this.hardwareOutCount = parseInt(hwoutCnt);
        this.color = parseInt(color);
    }
    get isMaster() {
        return this.trackNumber === 0;
    }
    get isArmed() {
        return this.trackFlags.recordArmed;
    }
    get isMonitor() {
        return this.hardwareOutCount > 0 && this.receiveCount > 0;
    }
}

class TrackResponse {
    constructor(value) {
        var tracks = value.split("\n");
        var track_array = [];
        var throwAway, trackNumber, trackName, trackFlags, volume, pan, lastMeterPeak, lastMeterPos, widthPan2, panMode, sendCnt, recvCnt, hwoutCnt, color;
        tracks.forEach(function(value, index, arr) {
            [throwAway, trackNumber, trackName, trackFlags, volume, pan, lastMeterPeak, lastMeterPos, widthPan2, panMode, sendCnt, recvCnt, hwoutCnt, color] = value.split("\t");
            track_array.push(new Track(trackNumber, trackName, trackFlags, volume, pan, lastMeterPeak, lastMeterPos, widthPan2, panMode, sendCnt, recvCnt, hwoutCnt, color));
        });
        this.tracks = track_array;
        this.armedTracks = this.tracks.filter(function(value, index, arr) {
            return value.isArmed;
        });
        this.monitorTracks = this.tracks.filter(function(value, index, arr) {
            return value.isMonitor;
        });
    }
    getTrackByNumber(trackNumber){
        var matchingTracks = this.tracks.filter(function(value, index, arr) {
           return value.trackNumber === trackNumber;
        });
        return matchingTracks ? matchingTracks[0] : null;
    }
}
