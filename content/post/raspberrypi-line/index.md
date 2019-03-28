+++
title = "Bottle.pyでRaspberry PiをWebサーバにしてLINEと連携させてみた"
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

[以前の記事](https://takeruace.github.io/post/ceiling-light-hack)でRaspberry Piをスマートリモコンにすることができたので，最終的にはそれをLINEから動かせたら良いなと思い，やってみました．
要するに，LINEから自室の電気をつけたりエアコンの電源を入れたりできるようにしました，ということです．

# 何をするのか
具体的には以下のようなステップでLINE↔Raspberry Piの連携を行いたいです．
あまり詳しくないなりに知識を絞り出して細かめにステップを分けました．

![system.png](https://qiita-image-store.s3.amazonaws.com/0/340630/34ad9b34-07ed-291e-52d4-edabaa8e5928.png)


1. LINEのBotに自分のLINEアカウントからメッセージを送信する
2. WebhookでRaspberry Pi上のWebサーバにhttpリクエストをPOSTする
3. Webサーバ上でhttpリクエストを受け取り，リクエストの内容に応じてローカルのシェルを実行する
4. WebサーバからLINE messaging APIの返信用URLにhttpリクエストをPOSTする
5. Botが自分に何をしたのか報告する

正直WebhookとかWebサーバとかなんとなくでしかわからなかったので始める前にいろいろ読みました．

[WebAPIについての説明](https://qiita.com/busyoumono99/items/9b5ffd35dd521bafce47)

[Webhookとは？](https://qiita.com/soarflat/items/ed970f6dc59b2ab76169)

それではやっていきましょう．
やることは大まかに分けて

- Raspberry PiにWebサーバ構築
- LINE Botの作成・Webサーバとの連携

です．
自分の勉強も兼ねているので以下は時間軸で書いてあります．一つ一つやっているので長くなってますが悪しからず．

#用意するもの

- Raspberry Pi 3 model B
    - 手元にあったのがこれなだけでほかのモデルでもOKです．
- Macbook (作業用PC）
 - あれば何でもOKです．あったほうがLINE developper登録やファイルの編集がスムーズに行えると思います．
- RaspberryPi内の何らかのシェルスクリプト
    - 僕の場合は以前作ったスマートリモコン操作スクリプトですが，これは何でも良いと思います．なくてもLINEの返信までは実装できます．

# 使ったものまとめ
- python 3.5.3
- bottle 0.12
- ngrok 2.3.25
- LINE messaging API

# Raspberry PiにWebサーバ構築
## テストサーバの作成
さて，Raspberry Pi上にWebサーバを構築する方法はこの世の中に数多に存在します．
しかし，私はそのあたりの知識がまったくありません．
そこで，タイトルにもあるようにBottleというPython用の軽量なWebアプリケーションフレームワークを使ってWebサーバーを作りたいと思います．どうやら簡単にWebサーバを構築できるみたいです．
[この記事](https://qiita.com/take-iwiw/items/3f86281312646fd9d893)を参考にとりあえず簡単なhttpリクエストを処理できるテストWebサーバを作ってみます．

以下，`home/pi/smartController/`というディレクトリで作業することにします．

`wget https://bottlepy.org/bottle.py`
でsmartController/下に`bottle.py`というファイルがダウンロードされます．
次にindex.pyというファイルを作ります．
このファイル1つでサーバを立ち上げ，httpリクエストの処理を行わせることができます．
まずは単純にhttpリクエストを処理させるだけのサーバを立ち上げてみましょう．
`nano index.py`より，以下のように編集します．

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

- main 関数
    - サーバを指定したポートで立ち上げます．
- test 関数
    - httpリクエストを処理する関数
    - `@route`によって公開されるAPIの処理を決めることができます．ここではエンドポイントのURLと種類(GET/POST)を指定しています
    - ここではテストとしてjsonを受け取り，中身の`req`が`0`であれば`Good`を，`1`であれば`Bad`を，それ以外であれば`No request`をjsonの`res`に格納してレスポンスを返します．

フォルダ構成は以下のとおりです．

```
home/
　└ pi/
　　└ smartController/
　　　　├ index.py
　　　　└ bottle.py
```

それではWebサーバを起動してみます．
Raspberry Pi上で`python3 index.py`を実行するとサーバが立ち上がります．

curl コマンドを使って今立てたサーバにhttpリクエストを送り，動いているか確認しましょう．(これはRaspberry Piからでも同一LAN内の作業用PCからでも良いです)

```
curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"req":"0"}' http://Raspberry PiのIPアドレス（192.168.xxx.xxx）:8080/test
curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"req":"1"}' http://Raspberry PiのIPアドレス（192.168.xxx.xxx）:8080/test
curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"req":"2"}' http://Raspberry PiのIPアドレス（192.168.xxx.xxx）:8080/test
```
を実行して，それぞれ

```
{"res": "Good"}
{"res": "Bad"}
{"res": "No request"}
```
が返ってくればOKです．
WebAPIを作るのってハードル高いと思ってましたが，簡単なリクエスト処理するぐらいなら結構簡単にできるんですね．**Bottleに感謝**．

## Webサーバを外部からアクセスできるようにする
さて，同一LANからのhttpリクエストは処理できるようになりましたが，これではまだLINEのwebhook機能から呼ぶことはできません．外部のネットワークからもhttpリクエストを送れるようにしましょう．
さらに，LINE BotのWebhook機能はSSLによる接続に限る([オレオレ証明書](http://dreamerdream.hateblo.jp/entry/2016/01/04/000000)でもダメ)らしいです．
「こんなことのために証明書発行するのは面倒だな……簡単にhttps用意してくれるのないかなー」と思って調べていると[ngrok](https://ngrok.com/)という超便利な無料で使えるサービスを発見しました．

[ngrokが便利すぎる](https://qiita.com/mininobu/items/b45dbc70faedf30f484e) が簡単に説明してくれています
簡単にいうと、ローカルPC上で稼働しているネットワークサービスを外部公開できるサービス.しかもngrokはSSL認証の部分を肩代わりしてくれる！！これは便利ですね．
ということで早速使ってみます．

ngrokのサイトに行き，Get started for Freeより登録します(GithubやGoogleのアカウントが使えます)
Raspberry pi上で

```
$ wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-arm.zip
$ unzip ngrok-stable-linux-arm.zip
$ sudo mv ngrok /usr/local/bin/
$ ngrok version
```
を実行しましょう．versionが確認できればOKです．(今回は2.3.25)
登録すると一番最初の画面に出てくるauthtokenの紐づけも行っておくと良いでしょう．

```
$ ngrok authtoken <自分のauthtoken>
```

あとは簡単です．Webサーバを立ち上げているlocalhostの8080ポートを外部からアクセスさせたいので，

```
ngrok http 8080
```
と実行します．
どこのアドレスにアクセスするとlocalhost:8080につながるかが`Forwarding`の部分に出力されます．
ちゃんとhttpとhttpsの両方ありますね．
ちなみにsshログインが切れると実行したプログラムが止まってしまうという問題に対しては，screenという仮想端末作成コマンドで解決できます．以下の記事でサラッと述べられています．
[【Node.js】 RaspberryPiのプログラムを自動起動・永続化・SSH ログアウト後もプロセスを残す](
https://qiita.com/mochifuture/items/ed863857affc80d0189f)

ではhttpリクエストを送ってみましょう．

```
curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"req":"0"}' https://<ngrok起動時に表示されたアドレス>/test
```

```
{"res": "Good"}
```
が返ってくればOKです．

# LINE Botの作成・Webサーバとの連携
## LINE Botを作る
といってもこれはLINE Botのwebhook機能を使えば簡単です．
[Google Apps Scriptを使ってLINE Messaging APIでオウム返しをする](
https://qiita.com/nogizakaJinro/items/e2a178c1cb7a0699a80f)
を参考にデベロッパー登録・プロバイダ作成・チャンネル作成・自分のアカウントと友達登録までをしてみてください．

## Webサーバと連携させる
上で作成したチャンネルの設定のところから，
- アクセストークンの発行
- Webhookの利用：「する」に設定
- Webhook URL ：先程ngrokで表示された**httpsのアドレス**を設定(httpではダメ)
しましょう．

LINEからのwebhookに対応するために最初に書いた`index.py`を以下のように書き換えます．

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

# チャンネルのアクセストークン
ACCESS_TOKEN = "<自分のチャンネルのアクセストークン>"
# 応答メッセージ用のAPI URL
url = 'https://api.line.me/v2/bot/message/reply'

@route('/')
def root():
    return template("index")

@route('/', method='POST')
def handleEvent() :
    req = request.json["events"][0]
    # WebHookで受信した応答用Token
    replyToken = req["replyToken"]
    # ユーザーのメッセージを取得
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
    #対応する命令を取得
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
    # run(host='0.0.0.0', port=8080, debug=False, reloader=False)

if __name__ == '__main__':
    main()
```

関数の説明

- handleEvent
    - LINE messaging APIからのリクエストを受け取って返す．
- controllSmartRemoteController
    - ユーザのメッセージに対する実行コマンドを探してRaspberry Pi上で実行
- requestForReply
    - ユーザ(自分)に返信を行うためのhttpリクエスト実行
    
`controllSmartRemoteController`で`data/action.csv`にアクセスしていますがこのファイルは

|メッセージ|対応するリプライ|実行するシェルのパス|
|:---|:---|:---|
|おやすみ|おやすみなさい．電気を消します．|/home/pi/smartController/shell/sample.sh|

のような形式のcsvファイル(ヘッダーあり)です．
自分の出したい指令とそれに対する応答，実行したいシェルのパスをじゃんじゃん追加していきましょう．
ちなみにRaspberry Piから電気を消す等のshellについては[この記事](https://qiita.com/AceZeami/items/6099d3ace9ec3e26d571)に乗せているのでそちらも参考にしてみてください．
最終的なフォルダ構成はこんな感じですね．

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

これでLINEに追加したSmartControllerくんにメッセージを送るだけで自宅の電気を消せます！ちゃんとメッセージも返ってくるのでOKですね(画面キャプチャからではわかりませんがメッセージが帰ってくるときに部屋の電気も消えています！笑)
<div align="center">
<img src="https://qiita-image-store.s3.amazonaws.com/0/340630/6500d2ae-021f-10ff-bea6-a262de4dd930.gif" width="200">
</div>
あとは`actionData.csv`に好きなコマンドを随時追加して，いろんなものをコントロールできるようにしてみましょう．
まだ春ですが夏は暑くなるので，自宅に帰る前にLINEからエアコンの電源を入れておけたりするのは良いですよね．

# 今回やらなかったこと
- 最低限のロジックの実装しかしていないためセキリュティやエラー処理をしていない
    - [X-line-siguniture](https://qiita.com/yorifuji/items/71e31baf896adb69f567)によるチェック等が必要
- 指示を出したら即実行だが，予約もできるようにしたい
    - httpリクエストを受け取ったらcronにタスクを登録する

# まとめ
bottleは簡単
ngrokは便利
IoTは楽しい

# 反省
LINEのwebhookがSSL認証のみだと知り，
LINE messaging API → Google Apps Script → Web サーバという経路を最初は実装していた．ngrokという超便利ツールを知るのが遅かった(調査不足)
