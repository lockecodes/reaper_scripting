class SendFlags {
    constructor(value) {
        this.flags = []
        this.muted = false;
        if (parseInt(value) & 8) {
            this.flags.push(FLAG_MUTED);
            this.muted = true;
        }
    }
}

class Send {
    constructor(trackNumber, sendNumber, flags, volume, pan, other_track_index) {
        this.trackNumber = parseInt(trackNumber);
        this.sendNumber = parseInt(sendNumber);
        this.flags = new SendFlags(flags);
        this.volume = parseFloat(volume);
        this.pan = parseFloat(pan);
        this.otherTrackIndex = parseInt(other_track_index);
        this.isHardwareOutput = this.otherTrackIndex === -1;
        this.isReceive = this.sendNumber < 0;
        this.receiveNumber = this.sendNumber < 0 ? -1 * this.sendNumber : null;
        if ( trackResponse ) {
            this.track = trackResponse.getTrackByNumber(this.trackNumber);
            this.otherTrack = this.isHardwareOutput ? "HardwareOutput" : trackResponse.getTrackByNumber(this.otherTrackIndex);
        }
    }

    static processRequestData(data) {
        var throwAway, trackNumber, sendNumber, flags, volume, pan, other_track_index;
        [throwAway, trackNumber, sendNumber, flags, volume, pan, other_track_index] = data.trim().split("\t");
        return new Send(trackNumber, sendNumber, flags, volume, pan, other_track_index);
    }
}