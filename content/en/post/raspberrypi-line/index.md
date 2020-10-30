+++
title = "Using Bottle.py to turn my Raspberry Pi into a web server and linked it with LINE"
date = 2019-03-28T12:28:35+09:00
draft = false

# Authors. Comma separated list, e.g. `["Bob Smith", "David Jones"]`.
authors = []

# Tags and categories
# For example, use `tags = []` for no tags, or the form `tags = ["A Tag", "Another Tag"]` for one or more tags.
tags = ["IoT","Raspberry Pi"]
categories = []

# Projects (optional).
#   Associate this post with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects = ["deep-learning"]` references 
#   `content/project/deep-learning/index.md`.
#   Otherwise, set `projects = []`.

projects = ["smartcontroller-line"]

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder. 
[image]
  # Caption (optional)
  caption = ""

  # Focal point (optional)
  # Options: Smart, Center, TopLeft, Top, TopRight, Left, Right, BottomLeft, Bottom, BottomRight
  focal_point = ""
+++

Since I was able to turn Raspberry Pi into a smart remote control by [previous article](https://takeruace.github.io/post/ceiling-light-hack), I thought it would be nice to be able to run it from LINE, so I gave it a try.
In short, you can turn on the light in your room and the air conditioner from LINE.

# What we want to do 
Specifically, I'd like to make the LINE ↔ Raspberry Pi collaboration in the following steps.
I'm not very familiar with it, so I narrowed down my knowledge and divided the steps in detail.

![system.png](https://qiita-image-store.s3.amazonaws.com/0/340630/34ad9b34-07ed-291e-52d4-edabaa8e5928.png)


1. Sending a message to the LINE Bot from your LINE account.
2. Posting an http request to the web server on the Raspberry Pi with Webhook
3. Receives an http request on a web server and executes a local shell according to the content of the request.
4. Posting  an http request to the reply URL for LINE messaging API from the web server
5. Reporting what the Bot has done to you

To be honest, I didn't know much about webhooks or web servers, so I read a lot of things before I started.
[Explanation of the WebAPI](https://qiita.com/busyoumono99/items/9b5ffd35dd521bafce47)

[What is Webhook?](https://qiita.com/soarflat/items/ed970f6dc59b2ab76169)

So let's get on with it...
What we're going to do is, broadly speaking.

- Building a web server on a Raspberry Pi
- Creation of LINE Bot and linkage with web server

It is.
Since it is also my study, the following is written in chronological order. I've been working on them one by one, so it's taking a long time, but don't worry.

# Item

- Raspberry Pi 3 model B
    - This is the only one I had at hand, so other models are OK too.
- Macbook (work PC)
 - Anything is OK, if you have it. I think that LINE developper registration and file editing can be smoother if you have it.
- Some kind of shell script in the RaspberryPi
    - In my case, this is a smart remote control operation script that I made before. Even if you don't need it, you can implement it up to LINE reply.

# Summary of what we used
- python 3.5.3
- bottle 0.12
- ngrok 2.3.25
- LINE messaging API

# Building a web server on a Raspberry Pi
## Creating a Test Server
Now, there are many ways to build a web server on the Raspberry Pi.
However, I don't have any knowledge of the subject at all.
As the title says, I would like to build a web server using Bottle, a lightweight web application framework for Python. Apparently, you can build a web server easily.
See [this article](https://qiita.com/take-iwiw/items/3f86281312646fd9d893) to build a test web server that can handle simple http requests.

Let's work in the directory `home/pi/smartController/` as follows.

`wget https://bottlepy.org/bottle.py`
and a file called `bottle.py` will be downloaded under smartController/.
Next, we create a file called index.py.
This file can be used to start up a server and process an http request.
First, let's set up a server that simply handles http requests.
Edit the file `nano index.py` to read the following.

```python:index.py
#!/bin/env python
# coding: utf-8

import json
from bottle import route, run, request, HTTPResponse, template, static_file

@route('/test', method='POST')
def test() :
    var = request.json
    retBody = {}
    if var["req"] == "0":
        retBody["res"] = "Good"
    elif var["req"] == "1":
        retBody["res"] = "Bad"
    else :
        retBody["res"] = "No request"
    
    r = HTTPResponse(status=200, body=retBody)
    r.set_header("Content-Type", "application/json")
    return r

def main():
    print('Server Start')
    run(host='0.0.0.0', port=8080, debug=True, reloader=True)
    # run(host='0.0.0.0', port=8080, debug=False, reloader=False)

if __name__ == '__main__':
    main()
```

- main() function
    - Launches the server on the specified port.
- test() function
    - Functions for handling http requests
    - You can determine the processing of the API exposed by `@route`. The URL and type (GET/POST) of the endpoint are specified here.
    - Here, we take a json as a test and return a response with `Good` if the content is `0`, `1` or `Bad` if the content is `1`, otherwise the response with `No request` is stored in the json's `res`.

The folder structure is as follows.

```
home/
　└ pi/
　　└ smartController/
　　　　├ index.py
　　　　└ bottle.py
```

Let's start up the web server.
Run `python3 index.py` on the Raspberry Pi to start the server.

Use the curl command to send an http request to the server you just created and check if it's working. (This can be done from a Raspberry Pi or from a work PC in the same LAN)

```
curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"req":"0"}' http://Raspberry PiのIPアドレス（192.168.xxx.xxx）:8080/test
curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"req":"1"}' http://Raspberry PiのIPアドレス（192.168.xxx.xxx）:8080/test
curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"req":"2"}' http://Raspberry PiのIPアドレス（192.168.xxx.xxx）:8080/test
```

then, it returns

```
{"res": "Good"}
{"res": "Bad"}
{"res": "No request"}
```

I thought it was a high hurdle to make a WebAPI, but it's easy to make a simple request. **Thanks to Bottles**.

## Allowing external access to the web server
Now, we can handle http requests from the same LAN, but we still can't call them from LINE's webhook feature. Let's make it possible to send an http request from an external network.
Moreover, I heard that LINE Bot's Webhook function is limited to SSL connection ([Oreore certificate](http://dreamerdream.hateblo.jp/entry/2016/01/04/000000) is also not allowed).
I found a super convenient free service called [ngrok](https://ngrok.com/) when I was looking for it.

[ngrok is too useful](https://qiita.com/mininobu/items/b45dbc70faedf30f484e) explains it briefly
In short, a service that allows you to publish network services running on your local PC to the outside world. What's more, ngrok will do the SSL authentication part for you! This is useful.
So, I'll try to use it.

Go to ngrok's site and register via Get started for Free (you can use your Github or Google account)
On the Raspberry pi

```
$ wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-arm.zip
$ unzip ngrok-stable-linux-arm.zip
$ sudo mv ngrok /usr/local/bin/
$ ngrok version
```
If the version is confirmed, it is OK. (2.3.25 this time.)
It's a good idea to tie the authtoken to the first screen when you register.

```
$ ngrok authtoken <your authtoken>
```

The rest is simple: we want to access port 8080 of the localhost on which the web server is running from the outside, so we execute

```
ngrok http 8080
```
The address to which access to localhost:8080 is shown in the `Forwarding` section.
It's properly both http and https.
Incidentally, the problem that the program stops when the ssh login fires can be solved by the screen command to create a virtual terminal. It is mentioned briefly in the following article.
[Node.js Automatically start, persist, and SSH RaspberryPi programs and leave processes behind after logging out](https://qiita.com/mochifuture/items/ed863857affc80d0189f)

Now let's send an http request.

```
curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"req":"0"}' https://<The address displayed when ngrok is started>/test
```
and 
```
{"res": "Good"}
```
is returned.

# Creation of LINE Bot and linkage with web server
## Create a LINE Bot
This is easy to do if you use the webhook function of LINE Bot.
[Using Google Apps Script to parrot back with the LINE Messaging API](
https://qiita.com/nogizakaJinro/items/e2a178c1cb7a0699a80f)
to register as a developer, create a provider, create a channel, and register your account and friends.

## Linking to a web server
From the channel settings created above, the
- Issuing an access token
- Use of Webhook: Set to "Do"
- Webhook URL : Set the **https address** displayed by ngrok earlier (not http).
Let's do it.

Rewrite `index.py` to support webhooks from LINE like the following.

```python:index.py
#!/bin/env python
# coding: utf-8

import json
from bottle import route, run, request, HTTPResponse, template, static_file,ServerAdapter
import os
import pandas as pd
import requests

@route('/static/:path#.+#', name='static')
def static(path):
    return static_file(path, root='static')

# Access token
ACCESS_TOKEN = "<your Access token>"
# API URL for the response message
url = 'https://api.line.me/v2/bot/message/reply'

@route('/')
def root():
    return template("index")

@route('/', method='POST')
def handleEvent() :
    req = request.json["events"][0]
    replyToken = req["replyToken"]
    userMessage = req["message"]["text"]

    replyText = controllSmartRemoteController(userMessage)
    requestForReply(replyToken,replyText)
    r = HTTPResponse(status=200, body={})
    return r

def requestForReply(replyToken,replyText) :
    postData = {
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': replyText,
      }],
    }
    headers = {
        'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    }
    result = requests.post(url,data=json.dumps(postData).encode("utf-8"),headers=headers)

# return response message to me
def controllSmartRemoteController(commandtext):
    command = ""
    actionData = pd.read_csv("data/actionData.csv")
    for i,value in actionData.iterrows():
        if commandtext == value[0]:
            reply = value[1]
            command = "sh " + value[2]
    
    if not command:
        return "他の命令をしてください！"
    result = os.system(command)
    if result == 0:
        return reply
    else :
        return "失敗しました....." 

def main():
    print('Server Start')
    run(host='0.0.0.0', port=8080, debug=True, reloader=True)

if __name__ == '__main__':
    main()
```

Function Description

- handleEvent
    - Receives and returns a request from LINE messaging API.
- connotrollSmartRemoteController
    - Find and run the execution command for the user's message on the Raspberry Pi
- requestForReply
    - Execute an http request to reply to the user (myself).
    
You access `data/action.csv` with `controlSmartRemoteController`, but this file is csv like below.

|Messages|Replies|Path of the shell to run|
|:---|:---|:---|
|Good night...good night...good night...good night. Turn off the lights. |/home/pi/smartController/shell/sample.sh|

You can add your own commands, responses, and shell paths.
By the way, please refer to [this article](https://qiita.com/AceZeami/items/6099d3ace9ec3e26d571) for the shells to turn off the lights from Raspberry Pi.
The final folder structure looks like this.

```
home/
  └ pi/
    └ smartController/
       ├ index.py
       ├ bottle.py
       ├ data
       |   └ actionData.csv
       └ shell
           └ sample.sh
```

Now you can turn off the lights in your house just by sending a message to the SmartController you've added to LINE! I can't tell from the screen capture, but the light in the room is turned off when the message comes back! LOL.
<div align="center">
<img src="https://qiita-image-store.s3.amazonaws.com/0/340630/6500d2ae-021f-10ff-bea6-a262de4dd930.gif" width="200">
</div>
Now let's add your own commands to `actionData.csv` to control various things.
It's still spring, but it gets hotter in summer, so it's good to turn on the air conditioner from LINE before you go home.

# What I didn't do this time
- No security or error handling because it only implements the minimum logic.
    - Checking by [X-line-siguniture](https://qiita.com/yorifuji/items/71e31baf896adb69f567) is required.
- I want to be able to make a reservation, too.
    - Registering a task in CRON when you receive an http request

# Summary
The bottle is easy
ngrok is useful
IoT is fun!

# Reflection.
I found out that LINE's webhook is only for SSL authentication.
LINE messaging API → Google Apps Script → Web server... I didn't know about the super useful tool called ngrok until late (lack of research).
