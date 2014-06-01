var keynum, allowedLines = 4, rowLength = 30;
var image_src = '';
$(document).ready(function() {
    String.prototype.splice = function(idx, s) {
        return (this.slice(0, idx) + s + this.slice(idx));
    }
    $("textarea").keydown(function(e, obj) {
        if (window.event) {
            keynum = e.keyCode;
        } else if (e.which) {
            keynum = e.which;
        }
        if (keynum == 13 && allowedLines <= $(this).val().split("\n").length)
            return false;
    });
    $("textarea").keyup(function(e, obj) { 
        lines = $(this).val().split("\n");
        for(var i = 0; i < lines.length; ++i) {
            size = 0;
            for (var j = 0; j < lines[i].length; ++j) {
                if (lines[i].charCodeAt(j) > 11904)
                    size += 2;
                else
                    size++;
                if (size > rowLength) {
                    lines[i] = lines[i].splice(j, "\n");
                    size = 0;
                }
            }
        }
        $(this).val(lines.join('\n'));
        console.log($(this).val().split('\n').length);
        if (allowedLines < $(this).val().split('\n').length) {
            lines = $(this).val().split("\n").slice(0, allowedLines);
            $(this).val(lines.join('\n'));
        }
    })
})
window.fbAsyncInit = function() {
    FB.init({
        appId: '1394986837448291',
        status: true,
        cookie: true,
        xfbml: true
    });
    FB.Event.subscribe('auth.authResponseChange', function(response) {
        if (response.status === 'connected') {
            main();
        } else if (response.status === 'not_authorized') {
            noneLogin();
        } else {
            noneLogin();
        }
    });
};

// Load SDK asynchronously
(function(d) {
    var js, id = "facebook-jssdk", ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement('script');
    js.id = id;
    js.async = true;
    js.src = "//connect.facebook.net/zh_TW/all.js";
    ref.parentNode.insertBefore(js, ref);
}(document));


function main() {
    //Firebase.goOffline();
    $('.middle').children().stop().animate({height: screen.height * 0.7}, 300);
    $('#welcome').fadeOut("slow", function() {$('form').fadeIn();});
    $('#upload').change(function() {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            var f = this.files[0];
            reader.onload = function(e) {
                if (f.type.slice(0, 5) == 'image') {
                    image_src = reader.result;
                    if (image_src.slice(5, 10) != 'image')
                        image_src = image_src.slice(0, 5) + f.type + image_src.slice(5);
                } else {
                    // for android browser only
                    var n = f.name.slice(f.name.length - 3);
                    if (n == 'jpg') {
                        image_src = reader.result;
                        image_src = image_src.slice(0, 5) + 'image/jpeg;' + image_src.slice(5);
                    } else if (n == 'png') {
                        image_src = reader.result;
                        image_src = image_src.slice(0, 5) + 'image/png;' + image_src.slice(5);
                    } else {
                        alert("檔案格式不支援");
                    }
                }
            };
            reader.readAsDataURL(this.files[0]);
        }
    })
    /*$('#takepic').click(function() {
        $('.win').fadeIn(400, function() {
            var errorCallback = function(e) {
                console.log("Rejected", e);
            }
            navigator.getUserMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia;
            var video = document.querySelector('video');
            var canvas = document.querySelector('canvas');
            var ctx = canvas.getContext('2d');
            var localMediaStream = null;
            function snapshot() {
                if (localMediaStream) {
                    console.log($('video').attr('width'));
                    ctx.drawImage(video, 0, 0, 640, 480, 0, 0, 320, 240 );
                    $('#toshow').attr('src', canvas.toDataURL('image/webp')).fadeIn();
                }
            }
            $('#shot').click(snapshot);
            $('#writeback').click(function() {
                $('.middle').children().stop().animate({height: screen.height * 0.9}, 300);
                $('#dataurl').attr('src', $('#toshow').attr('src'));
                $('.win').fadeOut();
            });
            if (navigator.getUserMedia) {
                navigator.getUserMedia ({
                    video: {
                        mandatory: {
                            minWidth: 640,
                            minHeight: 480
                        }
                    }
                }, function(stream) {
                    video.src = window.URL.createObjectURL(stream);
                    localMediaStream = stream;
                }, errorCallback);
            } else {
                alert("fail");
            }
        });
    });*/
    $("form").submit(function(event) {
        document.getElementById('sender').innerHTML = '上傳中...請等待';
        FB.api('/me', function(response) {
            console.log("submit " + response.name);
            //var nameRef = new Firebase('https://weddingmsg.firebaseIO.com/' + response.id);
            var text = document.getElementById("areainput").value.replace(/[<]/g, "&lt;").replace(/[>]/g, "&gt;");
            /*nameRef.set({name: response.name, msg: text}, function(error) {
                if (error) {
                    console.log("Data save error" + error);
                } else {
                    console.log("Ok");
                    $('.message_ok').fadeIn().fadeOut(1200);
                }
            });*/
            if (image_src == '')
                image_src = '//graph.facebook.com/' + response.id + '/picture?type=large';
            console.log(image_src);
            var jqxhr = $.post("/", {id: response.id, name: response.name, msg: text, img: image_src}, function() {
                console.log("ok");
                document.getElementById('sender').innerHTML = '送出成功';
                alert("上傳成功");
                //$('.message_ok').fadeIn().fadeOut(1200);
            }).fail(function(e) {
                console.log('fail');
                alert("上傳失敗");
                document.getElementById('sender').innerHTML = '送出失敗，請重新點擊';
                //$('.message_fail').fadeIn().fadeOut(1200);
            });
        });
        event.preventDefault();
        return;
    });
}

function noneLogin() {
    $('form').fadeOut("slow", function() {$('#welcome').fadeIn();});
    $('.middle').children().stop().animate({height: 0}, 300);
    FB.login();
}


