+++
title = "9軸センサを使った姿勢推定でドリフトに困った話"
date = 2019-02-07T13:03:21+09:00
draft = false

# Tags and categories
# For example, use `tags = []` for no tags, or the form `tags = ["A Tag", "Another Tag"]` for one or more tags.
tags = []
categories = []

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder. 
[image]
  # Caption (optional)
  caption = ""

  # Focal point (optional)
  # Options: Smart, Center, TopLeft, Top, TopRight, Left, Right, BottomLeft, Bottom, BottomRight
  focal_point = ""
+++

# この記事について
この記事は9軸センサを用いて姿勢推定を行った際に，姿勢角がかなりドリフトして困った際の解決方法を記した記事です．

# 使用したもの
 - [Teensy3.2](https://www.switch-science.com/catalog/2447/?gclid=EAIaIQobChMIspXok9Go4AIVVAoqCh1I2A83EAAYASAAEgIOUvD_BwE)
 - [MPU9250搭載9軸センサ](https://www.switch-science.com/catalog/2845/)

今回はTeensy(Arduino互換のボード)とMPU9250を使いましたが， Arduinoと他の9軸・6軸センサでも同じ話だと思います．

# 実行環境
 - macOS Mojave 10.14.1

# MPU9250から加速度・ジャイロ・（地磁気）の生データを取得する
これに関してはMPU9250を使用している場合はSparkFunが提供している[ライブラリ](https://github.com/sparkfun/SparkFun_MPU-9250-DMP_Arduino_Library)を用いて簡単に取得できます．
examples/MPU9250_Basic/MPU9250_Basic.ino を見ればなにをやっているかはなんとなく分かります．
他のセンサを使っている人はよしなにして取得してください．

# ジャイロセンサの値を補正する
さて，加速度・ジャイロ・地磁気の生データを取得できたのでそれらを用いて姿勢角を算出してみましょう．
ジャイロセンサは定常状態（静止状態）でもジャイロの各軸の値が0にならず，その値をそのまま姿勢推定に使ってしまうと静止しているのに回転していると誤認識されてしまいます（いわゆるドリフト現象）．そこで，静止状態のときの値でジャイロセンサの各軸の値を補正してあげる必要があるのですが，**私はここでつまずきました**．

setup()内で静止状態の初期値を取得し，その値の分をジャイロセンサの値から引いて補正する．という実装が以下です．（諸々省略してますがこんな感じです）

```
float INITIAL_GYRO_X,INITIAL_GYRO_Y,INITIAL_GYRO_Z;

void setup() 
{
  // ~ もろもろの設定（略）
  
  // ジャイロの初期値を取得する
  INITIAL_GYRO_X = imu.gx;
  INITIAL_GYRO_Y = imu.gy;
  INITIAL_GYRO_Z = imu.gz;
}
void loop() 
{
  printGyroData();
}
void printGyroData(void)
{  
  float gyroX = imu.calcGyro(imu.gx - INITIAL_GYRO_X);
  float gyroY = imu.calcGyro(imu.gy - INITIAL_GYRO_Y);
  float gyroZ = imu.calcGyro(imu.gz - INITIAL_GYRO_Z);
  
  Serial.println("Gyro," + String(gyroX) + "," + String(gyroY) + "," + String(gyroZ));
}
```

これでジャイロの値が静止時に限りなく0に近くなると思い，Madgwickフィルタ([この記事](http://tattatatakemori.hatenablog.com/entry/2018/06/24/140422)が参考になります)を用いて姿勢角を推定したのですが，ドリフトが止まりません．
よくよく考えるとsetup()のなかで一回だけ初期値を取得しているのはブレが大きそうだなと思ったので，以下のように変更しました．

```
float INITIAL_GYRO_X,INITIAL_GYRO_Y,INITIAL_GYRO_Z;
float AVERAGENUM_INIT = 1000.0;
int counter_init = 0;
bool isCollectInitialData = true;

void setup() 
{
  // ~ もろもろの設定（略）
}

void loop() 
{
  if (isCollectInitialData)
  {
    initGyro();
  }
  printGyroData();
}

void printGyroData(void)
{  
  float gyroX = imu.calcGyro(imu.gx - INITIAL_GYRO_X);
  float gyroY = imu.calcGyro(imu.gy - INITIAL_GYRO_Y);
  float gyroZ = imu.calcGyro(imu.gz - INITIAL_GYRO_Z);
  
  Serial.println("Gyro," + String(gyroX) + "," + String(gyroY) + "," + String(gyroZ));
}

void initGyro() {
  INITIAL_GYRO_X += imu.gx / AVERAGENUM_INIT;
  INITIAL_GYRO_Y += imu.gy / AVERAGENUM_INIT;
  INITIAL_GYRO_Z += imu.gz / AVERAGENUM_INIT;
  counter_init += 1;
  if (counter_init >= AVERAGENUM_INIT) {
    isCollectInitialData = false;
  }
}
```
開始後のAVERAGENUM_INIT（今回は1000）フレームの各フレームでジャイロの静止状態時の値を取得し，平均をとっています．これを行うことで静止状態のジャイロセンサの値をブレを抑えて取得することができ，姿勢推定時の姿勢角のドリフトを抑えることができました．

# まとめ
Madgwickフィルタは優秀なのでジャイロの値を補正してあげるだけでかなりの精度がでます．自分は地磁気を使うのが面倒だったので加速度とジャイロの値のみを使ったのですが，かなり安定していました．

ドリフトが止まらなかった際にMadgwickフィルタのせいにしてジャイロの生データの確認を怠ったために解決に時間がかかってしまったのは反省です．

おしまい．
