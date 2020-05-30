+++
title = "The story of the trouble of drifting with posture estimation using a 9-axis sensor"
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

# About
This article describes how to solve the problem of the drift of the pose angle when the pose is estimated using a 9-axis sensor.．

# Items
 - [Teensy3.2](https://www.switch-science.com/catalog/2447/?gclid=EAIaIQobChMIspXok9Go4AIVVAoqCh1I2A83EAAYASAAEgIOUvD_BwE)
 - [MPU9250](https://www.switch-science.com/catalog/2845/)

This time, I used Teensy (Arduino compatible board) and MPU9250, but I think it is the same story for Arduino and other 9-axis and 6-axis sensors.

# Environment
 - macOS Mojave 10.14.1

# Acquire raw acceleration, gyro and (geomagnetic) data from MPU9250
This can be easily obtained by using [library](https://github.com/sparkfun/SparkFun_MPU-9250-DMP_Arduino_Library) provided by SparkFun if you use MPU9250.
If you look at examples/MPU9250_Basic/MPU9250_Basic.ino, you can understand what you are doing.

# Correcting the gyro sensor value
Now that we have obtained the raw data of acceleration, gyro and geomagnetism, let's calculate the attitude angle using them.
If the gyroscopes are used for posture estimation, the gyroscopes will be mistakenly assumed to be rotating even though they are stationary (so-called drift phenomenon). 
So I need to correct each axis of the gyro-sensor by the value in the stationary state, but **I stumbled here**.

Setup() function takes the initial value of the stationary state and subtracts it from the gyro sensor value to correct it. 

```
float INITIAL_GYRO_X,INITIAL_GYRO_Y,INITIAL_GYRO_Z;

void setup() 
{
  // ~ setup
  
  // Get the initial value of the gyro
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

I thought that this would make the gyro's value as close as possible to 0 at rest, so I estimated the orientation angle using Madgwick filter ([this article](http://tattatatakemori.hatenablog.com/entry/2018/06/24/140422) is helpful), but the drift does not stop.
If you think about it, it seems that the initial value is only retrieved once in setup(), so I changed it as follows.

```
float INITIAL_GYRO_X,INITIAL_GYRO_Y,INITIAL_GYRO_Z;
float AVERAGENUM_INIT = 1000.0;
int counter_init = 0;
bool isCollectInitialData = true;

void setup() 
{
  // ~ setup
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
The values of the gyro are taken from each frame of AVERAGENUM_INIT (in this case 1000) after the start and averaged. By doing this, we were able to obtain the values of the gyro-sensors in the stationary state with less blurring, and we were able to suppress the drift of the posture angle during the posture estimation.

*3/23 Postscript*

Regarding the above initGyro(), we add the change like below.

```
void setup() {
   initGyro();
}

void initGyro() {
  INITIAL_GYRO_X = 0;
  INITIAL_GYRO_Y = 0;
  INITIAL_GYRO_Z = 0;
  for (int i = 0;i < AVERAGENUM_INIT;i++) {
    INITIAL_GYRO_X += imu.gx / AVERAGENUM_INIT;
    INITIAL_GYRO_Y += imu.gy / AVERAGENUM_INIT;
    INITIAL_GYRO_Z += imu.gz / AVERAGENUM_INIT;
    delay(5);
  }
}

```

If so, we can call this function in setup().
With this code, once you call initGyro(), the rest of the code doesn't work at all until it finishes, but it's okay to use it for calibration for about 5 seconds.

# Summing up
The Madgwick filter is very good, so you can get a lot of accuracy just by correcting the gyro values. I didn't want to use geomagnetism, so I used only the acceleration and gyro values, but they were quite stable.

When the drift didn't stop, I blamed it on the Madgwick filter and neglected to check the raw data of the gyro, so it took a long time to solve it.

The end...