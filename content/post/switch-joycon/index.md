+++
title = "Nintendo SwitchのJoy-Conが認識されるけど充電されないので直した"
date = 2019-11-15
draft = false

# Authors. Comma separated list, e.g. `["Bob Smith", "David Jones"]`.
authors = []

# Tags and categories
# For example, use `tags = []` for no tags, or the form `tags = ["A Tag", "Another Tag"]` for one or more tags.
tags = ["Nintendo Switch"]
categories = []

# Projects (optional).
#   Associate this post with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects = ["deep-learning"]` references 
#   `content/project/deep-learning/index.md`.
#   Otherwise, set `projects = []`.

projects = []

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder. 
[image]
  # Caption (optional)
  caption = ""

  # Focal point (optional)
  # Options: Smart, Center, TopLeft, Top, TopRight, Left, Right, BottomLeft, Bottom, BottomRight
  focal_point = ""
+++

# はじめに
ポケモン新作が発売されるとのことで今まで買っていなかったNintendo Switchを購入しました。しかし、片方のジョイコンが携帯モードでは使用できるが、TVモードやテーブルモードでは使用できないという問題が生じていました。

公式のサポートページには同じ現象は記載されていませんでしたが、似たような問題が知恵袋では散見されています。
https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q13200212048
https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q12206272232

初期不良なので任天堂さんに送り返して修理してもらってもよかったのですが、せっかくなので分解して修理してみました。

# 準備したもの
[1.6mmY字ドライバ](https://www.amazon.co.jp/gp/product/B000AQOESS/ref=ppx_yo_dt_b_asin_title_o00_s00?ie=UTF8&psc=1)

# 症状
- ジョイコンを本体に接続すると「カシャーン！」という気持ちい音が本体から鳴る
- 充電はされない
- 本体に繋いでいる時のみ操作が有効になる
![IMG_2504.jpg](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/340630/9e8da20b-3576-d0e6-f3b9-9af3bd77e16d.jpeg)


# 手順
とりあえずダメ元で本体再起動&ジョイコンのシンクロボタン長押しをしましたが，症状に変化はありませんでした．

本体側でジョイコンとして認識しているので、ジョイコンの基盤自体の問題ではなく、充電やバッテリーあたりが怪しいですね……
Y字ドライバで裏面のネジを外して，中を見てみました。
![名称未設定.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/340630/1d59f160-caed-7145-4324-5be4d49733f6.png)

バッテリー関係のケーブルは赤と黒の配線部分ですが……なんと基盤と接続されているコネクタ(画像赤丸部分)がちょっとだけ浮いていました。

ドライバで軽く押してあげると、カチッという音とともには![error]()
まった感じがしました。
ん？もしかしてこれが原因？
ケースを元に戻して本体に再びはめると……
![IMG_2506.jpg](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/340630/669dcf57-9d15-ab97-3db6-dac573b9bccc.jpeg)

ちゃんと認識しましたとさ。（そもそも新品なので充電も満タン）

TVモードやテーブルモードでも問題なく使えました。
めでたしめでたし。

# おまけ
今回問題になったコネクタは上からカポッとはめるタイプのコネクタでした。
一回はめると外すの大変だったので製造段階でちゃんとはまってなかったんだなと思いました。

人間がはめてるのか機械がはめてるのか気になるところ。
![IMG_2502.jpg](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/340630/4edd5db0-e30a-66b3-fd0b-e3c8f219a2b5.jpeg)
