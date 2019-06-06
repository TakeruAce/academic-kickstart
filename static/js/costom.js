$(function(){
    var $target = $('.target');//対象の要素
    var bgColor = '#FF138D';//対象の要素に指定する色
    var speed = 5000;//アニメーションのスピード
    var easing = 'linear';//アニメーションのイージング

    $target.stop().animate({  
        
        backgroundColor: bgColor
        
    }, speed, easing);  
});