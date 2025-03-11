define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
], function (msgBus, gr) {

    var shakeSymbolArr = [];
    function onGameParametersUpdated(){
        shakeSymbolArr.push(gr.lib._bonusAGameSence);
    }
    
    function onGameScenceShake(speedTime) {
        var shakeNum = 0;
        var u = setInterval(function () { 
            for (var i = 0; i < shakeSymbolArr.length; i++) {
                var tagetDiv = shakeSymbolArr[i];
                var value = shakeNum % 4 < 2 ? -4 : 4;
                if (shakeNum % 2 === 0) {
                    var currentLeft = tagetDiv._currentStyle._left + value;
                    tagetDiv.updateCurrentStyle({'_left': currentLeft});
                } else {
                    var currentTop = tagetDiv._currentStyle._top + value;
                    tagetDiv.updateCurrentStyle({'_top': currentTop});
                }
            }
            shakeNum++;
            if (shakeNum > 7) {
                clearInterval(u);
                shakeNum = 0;
            }
        }, speedTime);
    }

    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('gameScenceShake', onGameScenceShake);
    return {};
});