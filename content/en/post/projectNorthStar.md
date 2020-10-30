+++
title = "ProjectNorthStar"
date = 2018-09-10T21:09:40+09:00
draft = true

# Tags and categories
# For example, use `tags = []` for no tags, or the form `tags = ["A Tag", "Another Tag"]` for one or more tags.
tags = []
categories = []

# Featured image
# Place your image in the `static/img/` folder and reference its filename below, e.g. `image = "example.jpg"`.
# Use `caption` to display an image caption.
#   Markdown linking is allowed, e.g. `caption = "[Image credit](http://example.org)"`.
# Set `preview` to `false` to disable the thumbnail in listings.
[header]
image = ""
caption = ""
preview = true

+++

# North Star をつくってみた話
前々から気になっていた[Project North Star](https://developer.leapmotion.com/northstar/)ですが，先日機会があって[exiii](https://exiii.jp/)さんからレンズを頂いたのでこれを機に作ってみよう，となりました．
exiiiさんの[簡易版NorthStarの作り方](https://exiii.jp/2018/07/19/project_north_star_jp-2/)ページを参考に作成しています．

# 用意した材料
基本的にはexiiiさんのページに記載されているものと同じです．
ヤスリとかを使ったものを書いておきます．

* 

# 制作フェーズ

## レンズ作成
最初で最後の難所ですが，exiiiさんからとれたてレンズを頂いたのであとは磨くだけでした．(レンズのデータはexiiiさんが公開しているので,DMM.makeとかに発注すれば自分でも用意できます)

用意したスポンジヤスリで，ひたすら傷を消していく作業……

#400 -> #800 -> #1500 の順にやすって，最後にアレを使って仕上げです．

400番終了後

800番終了後

1500番終了後

あれ，これ本当に透明になるの……？

アレを使ったあと

！！！

アレを使った瞬間に透明になるので驚きました．

あとは作成したレンズにミラーシールを貼っていきましょう．
デザインナイフを駆使するとうまくいきました．

とりあえずレンズ作成は終了です．
肝になる部分なのでこだわり抜いて磨きましょう．
無我の境地に至れます．

## 3Dデータ作成フェーズ
これはexiiiさんの公開しているデータをもとに3Dプリントするだけですね．

と思っていましたが，大きな部品がうちの研究室にある3Dプリンタ(Ultimaker3 extended)だとサイズが足りない……！

結局いい感じに回転させて縦に印刷することに．
何回か印刷に失敗しましたが(ゴミがたくさんできました)，最終的にはinfillをmaxにしてspeedをlowにすればなんとかできました．
これは業者に発注したほうがいいかもしれませんね．

ちなみに素材はUltimakerのPLAを使いました．

## 組み立てフェーズ
これも基本的にはexiiiさんのページの通りに従えばうまくいきます．
3Dパーツの穴にねじ切りをして組み立てると……

完成！！

## デモ試してみた
Leap MotionをUnityで使ったことなかったので必要なソフトウェアをインストール．
実行してみると…！！
画角の広さに圧倒される！
正直今までのARデバイスは画角が狭くて境目が認識できるのでなんだかなあといった感じだったのですが，
このぐらい画角が広いと全然違和感なく見れますね．

まさに夢に描いていたようなARって感じがします．