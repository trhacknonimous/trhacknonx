var conf_neige={

// Placez le nombre de flocons de neige (plus de 30 - 40 non recommandés)
snowmax:35,

// Placez les couleurs pour la neige.  Ajoutez autant de couleurs comme vous voudrez
snowcolor:new Array("#aaaacc","#ddddFF","#ccccDD","red","blue","yellow"),

// Placez les polices, celle créent les flocons de neige.  Ajoutez autant de polices comme vous voudrez
snowtype:new Array("Arial Black","Arial Narrow","Times","Comic Sans MS"),

// Placez la lettre qui crée votre flocon de neige (recommandé: *)
snowletter:"*",

// Placez la vitesse de la descente (gamme recommandée de valeurs de 0,3 à 2)
sinkspeed:2,

// Placez la maximal-taille de vos snowflaxes
snowmaxsize:30,

// Placez la minimal-taille de vos snowflaxes
snowminsize:10,

// Placez la neiger-zone
// Placez 1 pour tout-au-dessus-neiger, placez 2 pour la gauche-côté-chute de neige 
// L'ensemble 3 pour centre-neiger, a placé 4 pour la droit-côté-chute de neige
snowingzone:1,

///////////////////////////////////////////////////////////////////////////
// LA CONFIGURATION FINIT ICI
///////////////////////////////////////////////////////////////////////////

// N'éditez pas au-dessous de cette ligne
snow:new Array(),
marginbottom:window.innerHeight,
marginright:window.innerWidth,
x_mv:new Array(),
crds:new Array(),
lftrght:new Array(),

initsnow:function(){

	var snowsizerange=this.snowmaxsize-this.snowminsize;

	for (var i=0;i<=this.snowmax;i++) {

		this.crds[i] = 0;                      
        this.lftrght[i] = Math.random()*15;         
        this.x_mv[i] = 0.03 + Math.random()/10;
		
		var neige=document.createElement("span");
		neige.textContent=this.snowletter;
		neige.style.position="absolute";
        neige.style.fontFamily=this.snowtype[this.randommaker(this.snowtype.length)];
        neige.size=this.randommaker(snowsizerange)+this.snowminsize;
        neige.style.fontSize=neige.size;
        neige.style.color=this.snowcolor[this.randommaker(this.snowcolor.length)];
        neige.sink=this.sinkspeed*neige.size/5;

        if (this.snowingzone==1) {neige.posx=this.randommaker(this.marginright-neige.size)}
        if (this.snowingzone==2) {neige.posx=this.randommaker(this.marginright/2-neige.size)}
        if (this.snowingzone==3) {neige.posx=this.randommaker(this.marginright/2-neige.size)+this.marginright/4}
        if (this.snowingzone==4) {neige.posx=this.randommaker(this.marginright/2-neige.size)+this.marginright/2}
		neige.posy=this.randommaker(2*this.marginbottom-this.marginbottom-2*neige.size)
        neige.style.left=neige.posx;
        neige.style.top=neige.posy;
		this.snow.push(document.body.appendChild(neige));
	}
    this.movesnow();
},

movesnow:function(){
    for (var i=0;i<=this.snowmax;i++) {
        this.crds[i] += this.x_mv[i];
        this.snow[i].posy+=this.snow[i].sink;
        this.snow[i].style.left=this.snow[i].posx+this.lftrght[i]*Math.sin(this.crds[i]);
        this.snow[i].style.top=this.snow[i].posy;
        
        if (this.snow[i].posy>=this.marginbottom-2*this.snow[i].size || parseInt(this.snow[i].style.left)>(this.marginright-3*this.lftrght[i])){
            if (this.snowingzone==1) {this.snow[i].posx=this.randommaker(this.marginright-this.snow[i].size)}
            if (this.snowingzone==2) {this.snow[i].posx=this.randommaker(this.marginright/2-this.snow[i].size)}
            if (this.snowingzone==3) {this.snow[i].posx=this.randommaker(this.marginright/2-this.snow[i].size)+this.marginright/4}
            if (this.snowingzone==4) {this.snow[i].posx=this.randommaker(this.marginright/2-this.snow[i].size)+this.marginright/2}
            this.snow[i].posy=0;
        }
    }
    setTimeout(this.movesnow.bind(this),50);
},

randommaker:function(range) {        
    rand=Math.floor(range*Math.random());
    return rand;
}
}


    addEventListener('load',conf_neige.initsnow.bind(conf_neige),false)