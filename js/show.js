var id = [];
var lastid = 0;
var presented = [];
var threshold = 64;
var randomThroughThreshold = 15;
var timeout = 400;
var keylock = false;
function select() {
    $("#boxclose").click();
    for (var i = 0; i < randomThroughThreshold; ++i) {
        setTimeout( function(e) {
            /*var j = Math.floor(Math.random() * 10) - 5;
            if (j == 0)
                j = 1;
            if (lastid + j < 0)
                j = 0;
            else if (lastid + j >= id.length)
                j = id.length - 1;
            else
                j = j + lastid;
            lastid = j;*/
            var j = Math.floor(Math.random() * id.length);
            lastid = j;
            if (e == randomThroughThreshold - 1) {
                if (presented.length != id.length) {
                    while ($.inArray(j, presented) != -1) {
                        j += 1;
                        if (j >= id.length)
                            j = 0;
                    }
                    presented.push(j);
                    setTimeout(function() {$("#"+id[j]).click(); keylock = false;}, timeout);
                } else {
                    alert("都翻過一遍囉");
                    keylock = false;
                }
            }
            $('html,body').animate({scrollTop: $("#" + id[j]).offset().top - 20,
                scrollLeft: $('#' + id[j]).offset().left + ($('#' + id[j]).width() - $(window).width()) / 2}, timeout);
            if ($("#" + id[j]).css("opacity") == 1.0)
                $("#" + id[j]).toggleClass("unhover");
            else
                $("#" + id[j]).toggleClass("hovering");
            setTimeout(function() {
                if ($("#" + id[j]).hasClass("unhover"))
                    $("#" + id[j]).toggleClass("unhovered");
                else if ($("#" + id[j]).hasClass("hovering"))
                    $("#" + id[j]).toggleClass("hovering");
            }, timeout);
        }, i * timeout, i);
    }
}
var manipulatePin = function(data) {
    for (var i = 0; i < data.length; ++i) {
        var c = data[i];
        if (c.id == undefined) continue;
        console.log(c.id);
        console.log(c.msg);
        console.log(c.img)
        var p = document.getElementById(c.id);
        if (p == null) {
            p = document.createElement("div");
            p.id = c.id;
            p.className = "pin";
            id.push(p.id);
            $('#columns').append(p);
        }
        console.log(p.innerHTML);
        msg = "";
        if (c.msg.length > threshold)
            msg = "......";
        msg = c.msg.replace(/\n/g, "<br>").replace(/\r\n/g, "<br>").slice(0, threshold) + msg;
        if (c.img == undefined)
            c.img = '//graph.facebook.com/' + c.id + '/picture?type=large';
        p.innerHTML ="<label>" + c.name + 
                     "</label><img src=\"" + c.img + "\" />" + 
                     "<p>" + msg + "</p>";
        console.log(p.innerHTML);
        p.onclick = (function() {
            var curC = c;
            return function() {
                w = document.createElement("div");
                w.className = "present";
                w.innerHTML = "<a class='boxclose' id='boxclose'></a>" +
                              "<label>" + curC.name + 
                              "</label><div class=''><img src=\"" + curC.img + "\" /></div>" + 
                              "<p>" + curC.msg.replace(/\n/g, "<br>").replace(/\r\n/g, "<br>") + "</p>";
                $('#window').empty().append(w);
                $('#overlay').fadeIn(200, function() {
                    $('#window').css("display", "inline-block").animate({'top': String($(document).scrollTop()) + 'px',
                        'left': String($(document).scrollLeft() + ($(window).width()) / 2)}, 200);
                });
                $('#boxclose').click(function() {
                    $('#window').animate({'top': -($('#window').height() + 50)}, 500, function() {
                        $('#overlay').fadeOut('fast');
                    });
                });
            }
        })();
    }
}

function main() {
    var first = document.createElement("div");
    first.id = "0";
    first.className = "pin";
    first.innerHTML = "<label>抽牌</label>" +
                      "<img src='img/find.jpg' />";
    first.onclick = select;
    $("#columns").append(first);
    $('html').keydown(function(e){
        if (e.which == 32) {
            if (keylock)
                return;
            keylock = true;
            select();
            e.preventDefault();
        } else if (e.which == 27) {
            $('#boxclose').click();
            e.preventDefault();
        }
    });
    $.get("/add", manipulatePin);
    setInterval(function() {
        $.get("/change", manipulatePin)
    }, 3000);
    /*var nameRef = new Firebase('https://weddingmsg.firebaseIO.com/');
    nameRef.on('child_changed', function(childSnapshot, prevChildName) {
        var c = childSnapshot
        var p = document.getElementById(childSnapshot.name());
        msg = "";
        if (childSnapshot.val().msg.length > threshold)
            msg = "......";
        msg = childSnapshot.val().msg.replace(/\n/g, "<br>").replace(/\r\n/g, "<br>").slice(0, threshold) + msg;
        p.innerHTML ="<label>" + childSnapshot.val().name + 
                     "</label><img src=\"//graph.facebook.com/" + p.id + "/picture?type=large\" />" + 
                     "<p>" + msg + "</p>";
        p.onclick = function() {
            w = document.createElement("div");
            w.className = "present";
            w.innerHTML = "<a class='boxclose' id='boxclose'></a>" +
                     "<label>" + c.val().name + 
                     "</label><img src=\"//graph.facebook.com/" + p.id + "/picture?type=large\" />" + 
                     "<p>" + c.val().msg.replace(/\n/g, "<br>").replace(/\r\n/g, "<br>") + "</p>";
            $('#window').empty().append(w);
            $('#overlay').fadeIn(200, function() {
                $('#window').css("display", "inline-block").animate({'top': String($(document).scrollTop()) + 'px'}, 200);
            });
            $('#boxclose').click(function() {
                $('#window').animate({'top': '-1000px'}, 500, function() {
                    $('#overlay').fadeOut('fast');
                });
            });
        };
    });
    nameRef.on('child_added', function(childSnapshot, prevChildName) {
        var c = childSnapshot;
        var p = document.createElement("div");
        p.id = childSnapshot.name();
        p.className = "pin";
        id.push(p.id);
        msg = "";
        if (childSnapshot.val().msg.length > threshold)
            msg = "......";
        msg = childSnapshot.val().msg.replace(/\n/g, "<br>").replace(/\r\n/g, "<br>").slice(0, threshold) + msg;
        p.innerHTML ="<label>" + childSnapshot.val().name + 
                     "</label><img src=\"//graph.facebook.com/" + p.id + "/picture?type=large\" />" + 
                     "<p>" + msg + "</p>";
        p.onclick = function() {
            w = document.createElement("div");
            w.className = "present";
            w.innerHTML = "<a class='boxclose' id='boxclose'></a>" + 
                     "<label>" + c.val().name + 
                     "</label><img src=\"//graph.facebook.com/" + p.id + "/picture?type=large\" />" + 
                     "<p>" + c.val().msg.replace(/\n/g, "<br>").replace(/\r\n/g, "<br>") + "</p>";
            $('#window').empty().append(w);
            $('#overlay').fadeIn(200, function() {
                $('#window').css("display", "inline-block").animate({'top': String($(document).scrollTop()) + 'px'}, 200);
            });
            $('#boxclose').click(function() {
                $('#window').animate({'top': '-1000px'}, 500, function() {
                    $('#overlay').fadeOut('fast');
                });
            });
        };
        $('#columns').append(p);
    });*/
    
}
main();

