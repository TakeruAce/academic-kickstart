+++
title = "Transcalibur"
date = 2018-11-22T19:27:17+09:00
draft = false

# Tags: can be used for filtering projects.
# Example: `tags = ["machine-learning", "deep-learning"]`
tags = ["research"]

# Project summary to display on homepage.
summary = "A dynamic deformable interface that reproduces the haptic feeling of grasping various shapes in VR."

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
The shape of the grasping object as perceived by humans is affected by the moment of inertia of the object and its appearance. In this project, we developed a handheld VR controller "Transcalibur" that can reproduce the sensation of holding various virtual objects by moving the positions of the two weights.

The relationship between the position of the weight and the perceived shape of the device is formulated using a data-driven method to optimize the position of the weight of the device for the appearance of a given virtual object.

# Video
{{<youtube OiSbn6D5kwA>}}

# Hardware 
By moving the two weighted modules in polar coordinates in a two-dimensional plane, Transcalibur changes its own moment of inertia.
{{<figure src="/img/transform.gif">}} 

# Computational Perception Model
In order to generate real sensations with various objects in the virtual environment, it is necessary to know the relationship between the "position of the weight" and the "shape that humans actually perceive".
However, this relationship has not been established as a theory.

Therefore, we collected a large amount of paired data of "actual human shape perception" for Transcalibur's "weight position" and formulated a mathematical model of human shape perception by performing multiple regression analysis.

{{<figure src="/img/approach.png">}} 


# Award
**Honorable Mention** at CHI2019
# Media
[<font color="blue">『ブルーサーマル』的VR超初心者入門漫画 その3＞＞「で、結局のところVRの正体ってなんですか？」</font>](https://cgworld.jp/feature/201810-thermal-03.html) CGWORLD.jp 2018.10
