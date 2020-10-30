+++
title = "Transcalibur"
date = 2018-11-22T19:27:17+09:00
draft = false

# Tags: can be used for filtering projects.
# Example: `tags = ["machine-learning", "deep-learning"]`
tags = ["research"]

# Project summary to display on homepage.
summary = "VR内で様々な形状のものを把持している感覚を再現する、動的変形コントローラ"

# Optional image to display on homepage.
image_preview = "transcalibur.jpg"

# Optional external URL for project (replaces project detail page).
external_link = ""

# Does the project detail page use math formatting?
math = false

# Does the project detail page use source code highlighting?
highlight = true

# Featured image
# To use, add an image named `featured.jpg/png` to your project's folder. 
[image]
  # Caption (optional)
  caption = ""
  
  # Focal point (optional)
  # Options: Smart, Center, TopLeft, Top, TopRight, Left, Right, BottomLeft, Bottom, BottomRight
  focal_point = "Smart"
+++
# Concepts
人間が知覚する把持物体の形状は物体の慣性モーメントやその見た目に影響を受ける。本プロジェクトでは２つのおもりの位置を動かすことで、様々なバーチャル物体を持った感覚を再現できる手持ちVRコントローラTranscaliburを開発した。

おもりの位置と知覚する形状の関係をデータ駆動型の手法で数式化することで、与えられたバーチャル物体の見た目に対してデバイスのおもりの位置を最適化して提示することを可能にした。

# Video
{{<youtube OiSbn6D5kwA>}}

# Hardware 
重りの入った2つのウェイトモジュールを2次元平面内で極座標的に移動させることで、Transcaliburは自身の慣性モーメントを変化させる。
{{<figure src="/img/transform.gif">}} 

# Computational Perception Model
VR環境において様々な物体を持った感覚をリアルに生起させるためには、「おもりの位置」と「人間が実際に知覚する形状」の関係性を知る必要がある。

しかし、この関係性は明確な理論として確立されているわけではない。

そこで、我々はTranscaliburの「おもりの位置」に対する「人間が実際に知覚する形状」というペアデータを大量に集め、重回帰分析を行うことによって人間の形状知覚モデルを数式化した。

{{<figure src="/img/approach.png">}} 


# Award
**Honorable Mention** at CHI2019
# Media
[<font color="blue">『ブルーサーマル』的VR超初心者入門漫画 その3＞＞「で、結局のところVRの正体ってなんですか？」</font>](https://cgworld.jp/feature/201810-thermal-03.html) CGWORLD.jp 2018.10
