#!/usr/bin/python2
# -*- coding: utf-8 -*-
import redis
from PIL import Image
from base64 import decodestring
pool = redis.ConnectionPool(host='localhost', port=6379)
r = redis.Redis(connection_pool = pool)
keys = r.keys('*')
threshold = 64
print("<!DOCTYPE html>")
print("<html lang='zh-TW'>")
print("<head>")
print('<meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0">')
print("<meta http-equiv='X-UA-Compatible' content='IE-edge'>")
print("<title>Wedding Twitting Game</title>")
print("<link href='//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css' rel='stylesheet'>")
print("<link href='css/show.css' rel='stylesheet'>")
print('</head>')
print('<body>')
print('<script src="//code.jquery.com/jquery-1.10.2.min.js"></script>')
print('<div class="overlay" id="overlay" style="display: none;"></div>')
print('<div id="wrapper">')
print('<div id="window" class="win"></div>')
print('<div id="columns">')
print('<div id="0" class="pin">')
print('<label>抽牌</label>')
print('<img src="img/find.jpg">')
print('</div>')
for i in keys:
    result = r.hmget(i, ['id', 'name', 'msg', 'img'])
    a = result[3].split(';base64,') 
    url = 'https://graph.facebook.com/%s/picture?type=large' % result[0]
    tinyurl = url
    if len(a) == 2:
        surname = a[0].split('/')[-1]
        if surname == 'jpeg':
            surname = 'jpg'
        url = "img/%s.%s" % (result[0], surname)
        tinyurl = "_img/%s.%s" % (result[0], surname)
        fh = open(url, 'wb')
        fh.write(decodestring(a[1]))
        fh.close()
        tiny = Image.open(url)
        tiny.thumbnail((412, 412), Image.NEAREST)
        tiny.save(tinyurl)
    print('<div id="%s" class="pin" onclick="(function() {' % result[0]+
            'w = document.createElement(\'div\');' +
            'w.className = \'present\';' +
            'w.innerHTML = \'<a class=\\\'boxclose\\\' id=\\\'boxclose\\\'></a>' +
            '<label>' + result[1] + '</label>' +
            '<div class=\\\'pic\\\'><img src=\\\'%s\\\'></div>' % url +
            '<p>%s</p>\';' % result[2].replace('\n', "<br>").replace('\r\n', "<br>") +
            '$(\'#window\').empty().append(w);' +
            '$(\'#overlay\').fadeIn(200, function() {' +
            '$(\'#window\').css(\'display\', \'inline-block\').animate({\'top\': String($(document).scrollTop()) + \'px\', ' + 
            '\'left\': String($(document).scrollLeft() + ($(window).width()) / 2) + \'px\'}, 200)});' +
            '$(\'#boxclose\').click(function() {$(\'#window\').animate({\'top\': -($(\'#window\').height() + 50)}, 500, ' +
            'function() {$(\'#overlay\').fadeOut(\'fase\');});});' +
            '}())">')
    print('<label>%s</label>' % result[1]) 
    print('<img src="%s">' % tinyurl)
    msg = ""
    if len(result[2]) > threshold:
        msg = "..."
    msg = result[2].replace('\n', "<br>").replace('\r\n', "<br>").decode('utf-8')[:threshold] + msg
    print('<p>%s</p></div>' % msg.encode('utf-8'))
print('</div></div>')
print("</body>")
print("</html>")
pool.disconnect()
