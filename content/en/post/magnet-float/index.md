+++
title = "Electromagnetic levitation in Arduino"
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
I saw [this post](https://www.youtube.com/watch?time_continue=77&v=2vG-YtRmBSw&feature=emb_title) and thought that electromagnetic levitation (magnetic levitation) is amazing, so I struggled to make it with the familiar Arduino.

Electromagnetic levitation is very cool, isn't it?
The unseen power is fascinating to me.
It's also in [Pokémon's Skill](https://wiki.xn--rckteqa2e.com/wiki/%E3%81%A7%E3%82%93%E3%81%98%E3%81%B5%E3%82%86%E3%81%86), but for all the coolness of its name, it's not used much in games.

# About this article
I want to make the magnetic levitation of [like this](https://www.youtube.com/watch?time_continue=77&v=2vG-YtRmBSw&feature=emb_title) a reality using an electromagnet!

The actual results look like this.
https://twitter.com/AceZeami/status/1231863911109951488

Here's the article I referenced.
- [Floating light sphere made with Arduino](https://www.instructables.com/id/A-Levitating-Sphere-Rotates-Glows-and-Blinks-in-JP/)
- [Development of an educational magnetic levitation system using a Hall element displacement sensor](https://www.jstage.jst.go.jp/article/ieejias/139/2/139_136/_pdf/-char/ja)

# What to prepare
- Arduino
- Hall Sensor [A1324LUA-T](http://akizukidenshi.com/catalog/g/gI-07014/)
- electromagnet
- Neodymium magnet (**without a hole in the middle**)
- Motor Driver [10Amp 5V-30V DC Motor Driver](https://store.shopping.yahoo.co.jp/suzakulab/cytron-mdd10a.html)
- Something to keep you afloat.

In this article, I used Arduino-compatible Teensy3.2, but anything is OK.
I also used an electromagnet because I had a large surplus of hand-wound electromagnets that I had used in [another case](http://www.takeruh.work/project/dress-of-ghost/) before.
If you want to make one, please prepare bolts, nuts, and enamel wire accordingly.
I want a lot of current to flow through the motor driver, so I'm using a 10A motor driver, but I think anything is fine.
As for the neodymium magnet, use one without a hole in the middle. If there is a hole in the center, the magnetic field near the center is not constant (the direction of the magnetic field is reversed from the center), so the levitation is not stable. (This bothered me for about an hour.)

# Development Environment
- MacOS Mojave 10.14.6
- Arduino 1.8.11
- Platformio 4.2.1

# How to make things float

Simply put, if the repulsive force of the magnet and the gravity on the floating object are balanced, the object can be made to float in the air.
However, it has been shown by [Earnshaw's theorem] (https://ja.wikipedia.org/wiki/%E3%82%A2%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%BC%E3%81%AE%E5%AE%9A%E7%90%86) that magnetic levitation is not stable in a permanent magnet (static magnetic field) alone.
In order to make an object float, it is necessary to sense the current state (how far the object to be floated is from the magnet) and change the magnitude of the magnetic force accordingly.

This time, a Hall sensor (a sensor that senses magnetism) is used for sensing the state, and an electromagnet is used to change the magnitude of the magnetic force.

# Hardware Implementation

Attach the Hall sensor to the end of the electromagnet.
![IMG_2833のコピー.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/340630/abd90f44-4900-1f6a-6e77-93f733b05b11.png)

It is better to cover the hole sensor part with cushioning or curing tape as shown in the image. (When the neodymium magnet sticks to the Hall sensor, it will have a huge impact and break the Hall sensor.)
![IMG_2828のコピー.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/340630/c258b572-b058-295f-33da-a164e3f147c3.png)
Hang it up on a suitable stand.
![IMG_2832のコピー.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/340630/e5a83ab8-42e5-18b6-ff88-39f5887f127f.png)
Once the electromagnet, motor driver, and Arduino are properly connected, the hardware setup is complete.

# Software Implementation
Read more at [repository](https://github.com/TakeruAce/Float-Magnet) on Github. Only the main Magnet class is listed here.

It is written in various ways, but all we are doing is keeping the value of the Hall sensor constant with PID control. The value of the target Hall sensor depends on the weight of the object to be floated, so adjust it accordingly.
If the magnets are placed too close together, the repulsive force of the electromagnet will be insufficient and the neodymium magnet will stick to the electromagnet. Conversely, if the magnets are too far apart, the force of attraction between them will be insufficient and the neodymium magnet will fall off. Therefore, it is important to adjust the target values.

Magnet Class

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
Electromagnetic levitation, do you want to do it from above? You want to do it from the bottom?
This time, we were able to levitate by lifting the object from above, but we would like to try to levitate by using an electromagnet installed underneath the floating object.
