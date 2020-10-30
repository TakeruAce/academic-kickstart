+++
title = "Arduinoで電磁浮遊"
subtitle = ""

# Add a summary to display on homepage (optional).
summary = ""

date = 2020-03-12T11:52:50+09:00
draft = false

# Authors. Comma separated list, e.g. `["Bob Smith", "David Jones"]`.
authors = []

# Is this a featured post? (true/false)
featured = false

# Tags and categories
# For example, use `tags = []` for no tags, or the form `tags = ["A Tag", "Another Tag"]` for one or more tags.
tags = []
categories = []

# Projects (optional).
#   Associate this post with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects = ["deep-learning"]` references 
#   `content/project/deep-learning/index.md`.
#   Otherwise, set `projects = []`.
# projects = ["internal-project"]

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder. 
[image]
  # Caption (optional)
  caption = ""

  # Focal point (optional)
  # Options: Smart, Center, TopLeft, Top, TopRight, Left, Right, BottomLeft, Bottom, BottomRight
  focal_point = ""
+++

[この投稿](https://www.youtube.com/watch?time_continue=77&v=2vG-YtRmBSw&feature=emb_title)を見て電磁浮遊(磁気浮遊)すげーって思ったので、おなじみのArduinoで作れないものかと格闘してみました。

電磁浮遊って、かっこいいですよね。
見えない力というものにが魅力を感じます。
[ポケモンの技](https://wiki.xn--rckteqa2e.com/wiki/%E3%81%A7%E3%82%93%E3%81%98%E3%81%B5%E3%82%86%E3%81%86)にもありますが、~~名前のかっこよさの割にはあまり対戦では使われていません~~。

# この記事について
[こんな感じ](https://www.youtube.com/watch?time_continue=77&v=2vG-YtRmBSw&feature=emb_title)の磁力による浮揚を、電磁石を使って実現したい！という願望を叶えるものです。

実際の結果はこんな感じです。
<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">浮いた、たのしい。 <a href="https://t.co/yAClaxzwlh">pic.twitter.com/yAClaxzwlh</a></p>&mdash; TK㌃ (@AceZeami) <a href="https://twitter.com/AceZeami/status/1231863911109951488?ref_src=twsrc%5Etfw">February 24, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

参考にした記事について上げておきます。
- [Arduinoで作る浮遊光球](https://www.instructables.com/id/A-Levitating-Sphere-Rotates-Glows-and-Blinks-in-JP/)
- [ホール素子変位センサを利用した教育用磁気浮上システムの開発](https://www.jstage.jst.go.jp/article/ieejias/139/2/139_136/_pdf/-char/ja)

# 用意するもの
- Arduino
- ホールセンサ [A1324LUA-T](http://akizukidenshi.com/catalog/g/gI-07014/)
- 電磁石
- ネオジム磁石(**真ん中に穴が空いていないやつ**)
- モータドライバ [10Amp 5V-30V DC Motor Driver](https://store.shopping.yahoo.co.jp/suzakulab/cytron-mdd10a.html)
- 浮かせたいもの

本記事ではArduino互換のTeensy3.2を用いましたが、何でもOKです。
また、電磁石も以前[別件](http://www.takeruh.work/project/dress-of-ghost/)で使用した手巻き電磁石が大量に余っていたので、それを使いました。
作りたい方はボルト、ナット、エナメル線を適宜用意して作ってください。
モータドライバもたくさん電流が流れてほしいので10Aのものにしていますが、何でも大丈夫だと思います。
ネオジム磁石に関しては真ん中に穴が空いていないものを使いましょう。真ん中に穴が空いていると、中心付近の磁場が一定ではなくなってしまう（中心と、少しずれたところの磁場の向きが逆になってしまう）ため、浮揚が安定しません。（これで1時間ぐらい悩みました）

# 開発環境
- MacOS Mojave 10.14.6
- Arduino 1.8.11
- Platformio 4.2.1

# ものを浮かせる仕組み

簡単に言えば、磁石の反発する力と浮遊体にかかる重力がつり合えばものは空中に浮かせることができます。
しかし、永久磁石（静的な磁場）のみでは磁気浮揚が安定しないことが[アーンショーの定理](https://ja.wikipedia.org/wiki/%E3%82%A2%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%BC%E3%81%AE%E5%AE%9A%E7%90%86)によって示されています。
ものを浮かせるためには現在の状態（浮かせたいものが磁石とどの程度離れているか）をセンシングし、それに応じて磁力の大きさを変化させる必要があるみたいです。

今回は状態のセンシングにホールセンサ（磁気を感じ取るセンサ）を、磁力の大きさを変化させるために電磁石を使います。

# ハードウェア実装

電磁石の先っぽにホールセンサを取り付けます。
![IMG_2833のコピー.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/340630/abd90f44-4900-1f6a-6e77-93f733b05b11.png)

ホールセンサの部分は画像のようにプチプチみたいな緩衝材とか養生テープとかで覆ってあげたほうがいいです。（ネオジム磁石がくっつくとすごい衝撃がかかりホールセンサが壊れるので）

![IMG_2828のコピー.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/340630/c258b572-b058-295f-33da-a164e3f147c3.png)
それを適当な台の上に吊るします。
![IMG_2832のコピー.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/340630/e5a83ab8-42e5-18b6-ff88-39f5887f127f.png)
電磁石、モータドライバ、Arduinoを適切に接続したらハードのセットアップは完了です。

# ソフトフェア実装
詳しくはGithubの[レポジトリ](https://github.com/TakeruAce/Float-Magnet)で。ここではメインのMagnetクラスだけ載せます。

色々書いてありますが、やっていることはPID制御でホールセンサの値を一定に保つようにしているだけです。目標のホールセンサの値は浮かせるものの重さによっても変化するので、適宜調整しましょう。
磁石を近づけすぎると電磁石の反発する力が足りず、ネオジム磁石と電磁石がくっついてしまいます。逆に磁石を離しすぎると磁石同士の引き合う力が足りず、ネオジム磁石が落っこちてしまいます。そのため、目標値の調整は重要です。

Magnet クラス

```cpp:magnet.hpp
#ifndef   MAGNET_HPP
#define   MAGNET_HPP
#include<Arduino.h>

class Magnet {
    public:
        int pwm_pin, sensor_pin, dir_pin;
        Magnet(int dir, int pwm, int sensor) {
            pwm_pin = pwm_pin;
            sensor_pin = sensor_pin;
            dir_pin = dir_pin;
        }
        void setup() {
            pinMode(pwm_pin,OUTPUT);
            pinMode(dir_pin,OUTPUT);
        }
        void update() {
            sensor_val = analogRead(sensor_pin);
        }
        bool getIsGenerating() {return isGenerating;}
        void setIsGenerating(bool isGen) {isGenerating = isGen;}
        int getPWM() {return pwm_val;}
        int getSensorVal() { return sensor_val; }
        void handleMagnet(int target) {
            if (isGenerating) {
                pwm_val = pwmfunc(sensor_val,target);
            } else {
                pwm_val = 0;
            }
            pwm_val = constrain(PWM_CORR * pwm_val, -MAX_PWM_VAL, MAX_PWM_VAL);
        }
        void reset() {
            pwm_val = 0;
            error_i = 0;
            error_prev = 0;
        }
        
    private:
        float pwm_val;
        int sensor_val = 0;
        float KP=0.005,KI=0.002,KD=0.00001;
        float PWM_CORR = 0.5;
        float error_i;
        float error_prev;
        int last_updated_time;
        int MAX_PWM_VAL = 150;
        int THRESHOULD_UPPER = 210;
        int range = 100;
        bool isGenerating = false;
        int pwmfunc(int val, int target) {
            // pid 
            float error = target - val;
            error_i += error;
            float error_d = (error - error_prev) / (float)(micros() - last_updated_time) * 1000000.0;
            pwm_val += error * KP + error_i * KI + error_d * KD;
            last_updated_time = micros();
            error_prev = error;
            Serial.println("pwm : " + (String)pwm_val + " error : " + error + " error_i : " + error_i);
            return pwm_val;
        };
};

#endif 
```

# Next Step
「電磁浮遊、上からやるか？下からやるか？」
今回は上から吊る形での浮遊でしたが、浮遊物体の下に設置した電磁石による浮遊にも挑戦してみたいです。
