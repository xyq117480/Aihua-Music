function $(s){
    return document.querySelectorAll(s);
}

var lis = $('#list li');
var isMobile = false;
var isApple = false;
var size = 16;
!function(){
    var u = window.navigator.userAgent;
    var m = /(Android)|(iPhone)|(iPad)|(iPod)/i;
    if(m.test(u)){
        isMobile = true;
    }
    var ap = /(iPhone)|(iPad)|(iPod)|(Mac)/i;
    if(ap.test(u)){
        isApple = true;
    }
}();

for(var i=0; i<lis.length; i++){
    lis[i].onclick = function(){
        for(var j=0; j<lis.length; j++){
            lis[j].className="";
        }
        this.className = "selected";
        load('/media/'+this.title);
    }
}

var xhr = new XMLHttpRequest();
var ac = new (window.AudioContext||window.webkitAudioContext)();
var gainNode = ac[ac.createGain?"createGain":"createGainNode"]();
gainNode.connect(ac.destination);

var analyser = ac.createAnalyser();
isMobile && (size = 16);
analyser.fftSize = size*2;
analyser.connect(gainNode);

var source = null;
var count = 0;

var box = $("#box")[0];
var height, width;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.globalCompositeOperation = "lighter";
box.appendChild(canvas);

var Dots =[];
function random(min,max){
    min = min || 0;
    max = max || 1;
    return max >= min ? Math.round(Math.random()*(max - min) + min) : 0;
}
function getDots() {
    Dots = [];
    for(var i=0;i<size;i++){
        var x = random(0,width);
        var y = random(0,height);
        var color = "rgba("+random(100,250)+","+random(50,250)+","+random(50,100)+", 0)";
        Dots.push({
            x: x,
            y: y,
            dx : random(1,8) * 0.2,
            dx2 : random(1, 8) * 0.2,
            dy: random(1, 5),
            color:color,
            cap: 0,
            cheight: 10
        });
    }
}

var line;

function resize(){
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.height = height;
    canvas.width = width;
    line = ctx.createLinearGradient(0,height,0,0);
    line.addColorStop(0, "green");
    line.addColorStop(0.5, "#ff0");
    line.addColorStop(1, "#f00");
    
    getDots();
}
resize();
window.onresize = resize;

function draw(arr){
    ctx.fillStyle = line;
    ctx.clearRect(0,0,width,height);
    var w = width / size;
    ctx.fillStyle = line;
    for(var i=0;i<size;i++){
        if(draw.type == "column"){
            var h = arr[i] / 256 * height;
            ctx.fillRect(w*i, height-h, w*0.6,h);
        }
        else if(draw.type == "dot"){
            
            var o = Dots[i];
            var x = o.x , y = o.y, r = Math.round((arr[i]/2+10)*(height> width ? width : height)/(isMobile ? 300 : 500));
            o.y += o.dx;
            o.y > height && (o.y = 0);
            
            
            
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2, true);
            var g = ctx.createRadialGradient(x, y, r/5, x, y ,r/1.5);
            g.addColorStop(0, "rgb(255,255,255)");
            g.addColorStop(1, o.color);
            ctx.fillStyle = g;
            ctx.fill();
            //ctx.strokeStyle = "#fff";
            //ctx.stroke();
        }
        
    }
}
draw.type = "column";
var types = $("#type button");
for (var i = 0; i < types.length; i++) {
    types[i].onclick = function() {
        // for (var j = 0;j<types.length;j++){
        //     types[j].className = "";
        // }
        // this.className = "selected";
        draw.type = this.getAttribute("data-type");
    }
};

function load(url){
    var n = ++count;
    source && source[source.stop?"stop":"noteOff"]();
    xhr.abort();
    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";
    xhr.onload = function(){
        if(n != count )return;
        ac.decodeAudioData(xhr.response,function(buffer){
            if(n != count)return;
            var bufferSource = ac.createBufferSource();
            bufferSource.buffer = buffer;
            bufferSource.connect(analyser);
            bufferSource[bufferSource.start?"start":"noteOn"](0);
            source = bufferSource;
            visualizer();
        },function(err){
            console.log(err);
        });
    }
    xhr.send();
}

function visualizer(){
    var arr = new Uint8Array(analyser.frequencyBinCount);
    
    requestAnimationFrame = window.requestAnimationFrame||
                            window.webkitRequestAnimationFrame||
                            window.mozRequestAnimationFrame;
    function v(){
        analyser.getByteFrequencyData(arr);
        draw(arr);
        requestAnimationFrame(v);
    }
    requestAnimationFrame(v);
}

function changeVolume(percent){
    gainNode.gain.value = percent * percent;
}

$('#volume')[0].onchange = function(){
    changeVolume(this.value/this.max);
}
$('#volume')[0].onchange();