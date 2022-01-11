$(document).ready(function() {
    $.get("_/TRACK", renderTrackSelect);
    $("#trackSelect").change(function(){
        var selectedValue = $(this).children("option:selected").val();
        renderNewMonitor(selectedValue);
    });
});
