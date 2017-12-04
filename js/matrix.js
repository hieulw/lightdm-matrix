function desenhar() {
    canvasMatrix.fillStyle = "rgba(0, 0, 0, 0.07)", 
    canvasMatrix.fillRect(0, 0, c.width, c.height), 
    canvasMatrix.fillStyle = "#0F0", 
    canvasMatrix.font = tamanhoFonte + "px Verdana";
  
    for (var a = 0; a < letras.length; a++) {
        var b = codigos[Math.floor(Math.random() * codigos.length)];
        canvasMatrix.fillText(b, a * tamanhoFonte, 
        letras[a] * tamanhoFonte), 
        letras[a] * tamanhoFonte > c.height && Math.random() > .965 && (letras[a] = 0), letras[a]++;
    }
}

var c = document.getElementById("matrix"),
    canvasMatrix = c.getContext("2d");
    c.height = window.innerHeight, c.width = window.innerWidth - 22;
    var codigos = "abcdefghijklmnopqrstuvxzwy0123456789%&#?¥µ§ØΩφΣπ$Üñþ√ϖϑβξ¶Æ";
    codigos = codigos.split("");

 for (var tamanhoFonte = 13, columns = c.width / tamanhoFonte, letras = [],     x = 0; x < columns; x++) letras[x] = 1;
    setInterval(desenhar, 60),
      
setTimeout(function() {$(".carregando").addClass("aumentar")}, 300), setTimeout(function() {$(".box-fixo").fadeOut(600)}, 4800), setTimeout(function() {$(".svg-box").addClass("opacidade1")}, 4e3);