+++
title = "RaspberryPiで自宅のシーリングライトに目覚まし機能をつけてみた"
date = 2019-03-24T11:27:17+09:00
draft = false

# Authors. Comma separated list, e.g. `["Bob Smith", "David Jones"]`.
authors = []

# Tags and categories
# For example, use `tags = []` for no tags, or the form `tags = ["A Tag", "Another Tag"]` for one or more tags.
tags = ["IoT", "Raspberry Pi"]
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

スマホのアラームが聞こえてるけどそのまま寝続けてしまい起きたら11時……みたいなことが最近多いです．
聴覚刺激はもう自分の体には効かなくなってしまったと悟り，違う感覚を刺激して目を覚めさせようと思いました．
触覚でも良かったのですが，簡単そうな視覚から刺激してみます．あと光で目覚めると体にいいって聞いたことある気がします．（要出典）

# なにをするのか
自宅にある**リモコンで操作できる照明**を，時刻を指定してスイッチオンします．
具体的には，
- リモコンからでる赤外線信号をRaspberryPiに覚えさせ，同じ信号を赤外LEDから発信できるようにする
- 上記の操作を指定した日時に実行できるようにする
といったところ．

# 赤外線発信器を作る
とてもわかり易い記事があったので参考にさせていただきました．
みなさんも [格安スマートリモコンのつくりかた](https://qiita.com/takjg/items/e6b8af53421be54b62c9) を見てスマートリモコンを作り，自宅のリモコンを学習させましょう．
準備するものは，上の記事の通りのものを[秋月電子通商](http://akizukidenshi.com/catalog/contents2/akiba.aspx)で買いました．RaspberryPiの型だけはRaspberryPi3 ModelBを使っています．

完成したのがこちらです．赤外LEDは僕の場合は１つで十分でした．
![image.png](https://qiita-image-store.s3.amazonaws.com/0/340630/ee003708-e39b-3bf7-df78-3144582400a8.png)


赤外線受信モジュールにリモコンを向けて信号を送り，学習をさせます．
送信のpythonスクリプトを実行するとちゃんと部屋の電気が消えたりついたりします．部屋をハックしている感じが**とても良い:relaxed:**．
次はこのスクリプトを指定時間に実行させます．

# 指定した時間に信号を送る
これはcronというものを使えば簡単に行えます．
cronとは定期的にコマンドを実行するためのデーモンプロセスのことですが，詳しくはこちらの記事を．[初心者向けcronの使い方](https://qiita.com/tossh/items/e135bd063a50087c3d6a)．
要は日時指定すれば勝手に実行しておいてくれるやつですね．

まず，実行したいコマンドが含まれたバッチファイルを適当なディレクトリに作りましょう．

<!-- ```:バッチファイル作成
sudo touch /home/pi/hogehoge/lightUp.sh
``` -->

```shell:lightUp.sh
for i in `seq 1 3`
do
  python3 /home/pi/hogehoge/irrp.py -p -g17 -f /home/pi/hogehoge/codes light:on
  sleep 1s
done
```

1回では失敗する可能性もあるので， 明かりをつけるコマンドを1秒おきに3回送ることにします．
**相対パス指定ではcronで実行するときうまく動いてくれないみたいなので絶対パスで指定しましょう．**
(ここで手こずりました．)

この時点でのフォルダ構成はこんな感じです．
codesは赤外線受信のコードを使用するとirrp.pyと同じディレクトリに作成される赤外線データファイルです．

```:フォルダ構成
home/
  └ pi/
     └ hogehoge/
          ├ irrp.py
          ├ codes
          └ lightUp.sh
```

ではcronにシェルを登録していきましょう．

`crontab -e`

でcronに登録するためのファイルが開けます．初めて起動するときに，好きなエディタを選べと言われるので好きなエディタを選びましょう．
そのファイルの末尾に，用途に合わせて

```
#毎日8時にlightUp.shを実行
00 8 * * * sh /home/pi/hogehoge/lightUp.sh
#毎月曜日の8時30分に実行
30 8 * * 1 sh /home/pi/hogehoge/lightUp.sh
#平日の８時３０分に実行(もっと賢く書けそう) 
30 8 * * 1 sh /home/pi/hogehoge/lightUp.sh
30 8 * * 2 sh /home/pi/hogehoge/lightUp.sh
30 8 * * 3 sh /home/pi/hogehoge/lightUp.sh
30 8 * * 4 sh /home/pi/hogehoge/lightUp.sh
30 8 * * 5 sh /home/pi/hogehoge/lightUp.sh
```

と追加しましょう．

書式は

分　時　日　月　曜日　コマンド

です．*はワイルドカードで任意の値を指します．

これで指定した時刻にコマンドが実行されます！
朝８時に電気が私を起こしてくれますね．

### cronのログを見る
cron のログを確認できるようにするとちゃんと動いてるか見れて便利です．

`sudo nano /etc/rsyslog.conf`

より，コメントアウトされている以下の行のコメントを外します．

```
#cron.* /var/log/cron.log
↓
cron.* /var/log/cron.log
```

保存をしたらログ管理システムを再起動します

`sudo /etc/init.d/rsyslog restart`

以下のコマンドでログが見れます．きちんと８時に実行されていますね．

```sudo cat /var/log/cron.log```
![image.png](https://qiita-image-store.s3.amazonaws.com/0/340630/90bff408-854d-73a4-47a4-4adab45a4d20.png)

# 時間変えるのにいちいちラズパイのcron書き換えないといけないの！？
むしろ起床時間を固定したほうが規則正しい生活をするという目標に合っているので，気軽に書き換え可能でないほうがいい気がします．
でもSlackとかLINEから気軽に起床時間設定できるといいですよね．
数日使ってみてその機能が必要だな〜と思ったら作ろうと思います．

# まとめ
そもそもこういう機能がついた照明とかスマートリモコンとかって結構売ってますよね．
単純な興味で作ったのですが，一から作ってみるといろいろ中身が知れていいですね．

## 参考記事
[格安スマートリモコンのつくりかた](https://qiita.com/takjg/items/e6b8af53421be54b62c9)

[初心者向けcronの使い方](https://qiita.com/tossh/items/e135bd063a50087c3d6a)
