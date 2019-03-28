+++
title = "Smart Controller with LINE"
date = 2019-03-28T12:35:52+09:00
draft = false

# Tags: can be used for filtering projects.
# Example: `tags = ["machine-learning", "deep-learning"]`
tags = ["IoT", "Raspberry Pi","other"]

# Project summary to display on homepage.
summary = "LINEから操作できる自宅用スマートコントローラ"

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
どこにいても [<font color = "green">LINE</font>] (https://line.me/ja/) から自宅の家電を操作できるシステム

# System
詳しくは以下の2つの投稿を参照．

[<font color='blue'>RaspberryPiで自宅のシーリングライトに目覚まし機能をつけてみた</font>](https://qiita.com/AceZeami/items/6099d3ace9ec3e26d571)

[<font color='blue'>Bottle.pyでRaspberry PiをWebサーバにしてLINEと連携させてみた</font>](https://qiita.com/AceZeami/items/41eb122dcb0feda0eae7)

## Raspberry Piから家電を操作
赤外線受信機を使って自宅にある家電のリモコンの信号をRaspberryPiに覚えさせた．

RaspberryPiのGPIOを使って赤外LEDを操作し，覚えた信号を発信することで家電を操作できる．
![image.png](https://qiita-image-store.s3.amazonaws.com/0/340630/ee003708-e39b-3bf7-df78-3144582400a8.png)

## LINE Botの作成
LINE messaging APIを用い，ユーザのメッセージに対して返答をするBotを作成した．

このBotを通してRaspberry Piを操作できる．

## LINEからRaspberry Piを操作
- Bottleというpythonで簡単にWebサーバを立てられるフレームワークを使用し，RaspberryPi上にWebサーバを構築
  - ngrokというサービスを使って自宅LAN外からもwebサーバにアクセス可能に
- httpリクエストに応じてRaspberry Piから家電に信号を送るというWebアプリケーションをRanbberry Pi上に作成・導入
  - LINE messaging APIからwebhookで送られるhttpリクエストを処理
- LINE messaging APIを用い，ユーザのメッセージに対して返答をするBotを作成
  - このBotを通してRaspberry Piを操作可能

<div align="center">
<img src="https://qiita-image-store.s3.amazonaws.com/0/340630/6500d2ae-021f-10ff-bea6-a262de4dd930.gif" width="200">
</div>
