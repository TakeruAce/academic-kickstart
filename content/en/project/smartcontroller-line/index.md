+++
title = "Smart Controller"
date = 2019-03-28T12:35:52+09:00
draft = false

# Tags: can be used for filtering projects.
# Example: `tags = ["machine-learning", "deep-learning"]`
tags = ["IoT", "Raspberry Pi","other"]

# Project summary to display on homepage.
summary = "Smart home controller that can be operated from LINE"

# Slides (optional).
#   Associate this page with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides = "example-slides"` references 
#   `content/slides/example-slides.md`.
#   Otherwise, set `slides = ""`.
slides = ""

# Optional external URL for project (replaces project detail page).
external_link = ""

# Links (optional).
url_pdf = ""
url_code = ""
url_dataset = ""
url_slides = ""
url_video = ""
url_poster = ""

# Custom links (optional).
#   Uncomment line below to enable. For multiple links, use the form `[{...}, {...}, {...}]`.
# url_custom = [{icon_pack = "fab", icon="twitter", name="Follow", url = "https://twitter.com"}]

image_preview = "pic.png"

[header]
image = ""

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder. 
[image]
  # Caption (optional)
  caption = ""

  # Focal point (optional)
  # Options: Smart, Center, TopLeft, Top, TopRight, Left, Right, BottomLeft, Bottom, BottomRight
  focal_point = ""
  preview_only = true
+++

{{<figure src = "featured.png">}}
# About
A system that allows you to control your home appliances from anywhere with [<font color = "green">LINE</font>](https://line.me/ja/)

# System
See the following two posts for more information (Japanese).

[<font color='blue'>RaspberryPiで自宅のシーリングライトに目覚まし機能をつけてみた</font>](https://qiita.com/AceZeami/items/6099d3ace9ec3e26d571)

[<font color='blue'>Bottle.pyでRaspberry PiをWebサーバにしてLINEと連携させてみた</font>](https://qiita.com/AceZeami/items/41eb122dcb0feda0eae7)

## Operate home appliances from a Raspberry Pi
I made RaspberryPi memorize the signal of the remote control of my home appliances by using the infrared receiver.

Using the GPIO of RaspberryPi, we can operate the infrared LED and send the learned signal to control the home appliances.
![image.png](https://qiita-image-store.s3.amazonaws.com/0/340630/ee003708-e39b-3bf7-df78-3144582400a8.png)

## Create a LINE Bot
Using LINE messaging API, we created a bot that replies to user's messages.

You can operate the Raspberry Pi through this Bot.

## Control the Raspberry Pi from LINE
- Building a web server on RaspberryPi using Bottle, a Python framework for setting up a web server.
  - You can access the web server from outside your home LAN using a service called ngrok.
- Create and implement a web application on the Ranbberry Pi that sends signals from the Raspberry Pi to home appliances in response to http requests
  - Handle http requests sent by webhook from LINE messaging API.
- Create a bot that responds to a user's message using LINE messaging API.
  - You can control your Raspberry Pi through this Bot.

<div align="center">
<img src="https://qiita-image-store.s3.amazonaws.com/0/340630/6500d2ae-021f-10ff-bea6-a262de4dd930.gif" width="200">
</div>
