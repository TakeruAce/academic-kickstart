+++
title = "Adding an alarm function to my ceiling light at home with RaspberryPi"
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

I've been hearing the alarm on my smart phone, but I keep going to sleep and waking up at 11:00.......................
I realized that auditory stimulation was no longer working for my body, so I decided to stimulate a different kind of sensation to wake me up.
I would have liked to use tactile sensation, but I'll try to stimulate it with simple visual stimulation. Also, I think I've heard that waking up with light is good for you. 
# What I do here
Switching on the lights in your home that can be operated with the remote control by specifying the time.
Specifically, the
- The RaspberryPi learns the infrared signal from the remote control so that it can send the same signal from the infrared LED.
- Allowing the above operations to be performed at the specified date and time
Something like that.


# Make an infrared transmitter
I found the article very easy to understand, so I used it as a reference.
Let's learn how to make a smart remote control by watching [how to make a cheap smart remote control](https://qiita.com/takjg/items/e6b8af53421be54b62c9).
I bought the above items at [Akizuki Denshi Tsusho](http://akizukidenshi.com/catalog/contents2/akiba.aspx). I used RaspberryPi3 ModelB only for the type of RaspberryPi.

Here's the finished product. One infrared LED was enough in my case.


A remote control is pointed at the infrared receiver module to send a signal for learning.
When I run the sending python script, the lights in the room go on and off. The feeling of hacking the room is **so good:relaxed:**.
The next step is to run this script at the specified time.

# Sending the signal at the specified time.
This can be done easily by using a cron.
A cron is a daemon process that executes commands periodically, see this article for more details. [How to use cron for beginners](https://qiita.com/tossh/items/e135bd063a50087c3d6a).
The point is, you can specify the date and time, and it will execute it.

First, let's create a batch file containing the commands we want to execute in an appropriate directory.


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
Since it may fail once, we will send the turn-on command three times every second.
**The relative path does not seem to work well when running with cron, so please specify the absolute path. **
(I had a hard time here...)

The folder structure at this point is like this.
codes is an infrared data file that is created in the same directory as irrp.py when using infrared receiver codes.

```:Folder structure
home/
  └ pi/
     └ hogehoge/
          ├ irrp.py
          ├ codes
          └ lightUp.sh
```

Let's register a shell in cron.

`crontab -e` opens a file for registration to cron. When you start the program for the first time, you will be asked to choose your favorite editor, so choose your favorite editor.
At the end of the file, you can add some codes.
```
#Run lightUp.sh at 8am every day
00 8 * * * sh /home/pi/hogehoge/lightUp.sh
#Runs every Monday at 8:30 a.m.
30 8 * * 1 sh /home/pi/hogehoge/lightUp.sh
#Run at 8:30 a.m. on a weekday (I could write smarter) 
30 8 * * 1 sh /home/pi/hogehoge/lightUp.sh
30 8 * * 2 sh /home/pi/hogehoge/lightUp.sh
30 8 * * 3 sh /home/pi/hogehoge/lightUp.sh
30 8 * * 4 sh /home/pi/hogehoge/lightUp.sh
30 8 * * 5 sh /home/pi/hogehoge/lightUp.sh
```


Format is

Minutes Time Day Month Day Command

Now the command will be executed at the specified time!
The electricity wakes me up at 8 a.m. ...

### View cron's log.
It's useful to be able to check the cron log to see if it's working properly

In `sudo nano /etc/rsyslog.conf`, remove the comment of the following line which is commented out.

```
#cron.* /var/log/cron.log
↓
cron.* /var/log/cron.log
```

After saving the file, restart the log management system

`sudo /etc/init.d/rsyslog restart`

You can see the log by the following command. It's running at 8:00.


```sudo cat /var/log/cron.log```
![image.png](https://qiita-image-store.s3.amazonaws.com/0/340630/90bff408-854d-73a4-47a4-4adab45a4d20.png)


# I have to rewrite every single cron of Razpai to change the time!
Rather, a fixed wake-up time is better suited to the goal of living a regular life, so I think it's better if it's not casually rewritable.
But it would be nice to be able to set your wake-up time easily from Slack or LINE.
I'll use it for a few days, and if I feel that I need the feature, I'll make it.

# Summary
First of all, lighting and smart remote controls with such functions are sold quite a bit, aren't they?
I made it out of a simple interest, but it's good to know the contents of a lot of things when you make it from scratch.

# Reference Article.
[How to make a cheap smart remote control](https://qiita.com/takjg/items/e6b8af53421be54b62c9)

[How to Use CRON for Beginners](https://qiita.com/tossh/items/e135bd063a50087c3d6a)
