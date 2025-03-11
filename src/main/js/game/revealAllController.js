/**
 * @module game/revealAllButton
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/utils/gladButton',
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton, ) {

    var autoPlay,runeAutoPlay,amuletAutoPlay;
    var interval,runeInterval;
	
    function revealAll() {
        audio.play('ButtonBuy',1);
        msgBus.publish('startReveallAll');
        msgBus.publish('hiddenInfo');
		var symbol;
		var delayTime = 0;
        for (var i = 1; i < 4; i++) {
            for (var j = 1; j < 6; j++) {
                symbol = gr.lib['_BaseSymbolEffect_'+i+'_'+j];
                if(!symbol.reveal){
                    symbol.needPlayAnim = false;
                    symbol.pixiContainer.interactive = false;
                    symbol.pixiContainer.$sprite.cursor = "default";
                    symbol.timer = gr.getTimer().setTimeout(symbol.revealFun, delayTime);
                    delayTime += interval;
                }
            }
        }   
    }
    
    function runeRevealAll(){
        audio.play('ButtonBuy',1);
        msgBus.publish('hiddenInfo');
        var symbol,revealSymbol = 0;
		var delayTime = 0;
        var RandomArr = getRandomSymbol();
        for (let i = 1; i < 9; i++) {
            symbol = gr.lib['_bonusAStoneButton_'+i];
            symbol.pixiContainer.interactive = false;
            symbol.pixiContainer.$sprite.cursor = "default";
            if(symbol.reveal){
                revealSymbol++;
            }
        }   
        for (let i = 1; i < 5; i++) {
            symbol = gr.lib['_bonusAStoneButton_'+RandomArr[i-1]];
            if(!symbol.reveal){
                revealSymbol++;
                symbol.needPlayAnim = false;
                symbol.timer = gr.getTimer().setTimeout(symbol.revealFun, delayTime);
                delayTime += runeInterval;
                if(revealSymbol===4){
                    break;
                }
            }
        }   
    }
    function amuletRevealAll(){
        audio.play('ButtonBuy',1);
        msgBus.publish('hiddenInfo');
        var symbol;
        var RandomNum = Math.floor(6*Math.random()+1);
        symbol = gr.lib['_symbosS'+RandomNum];
        symbol.pixiContainer.interactive = false;           
        symbol.pixiContainer.$sprite.cursor = "default";           
        symbol.revealFun();
    }

    function getRandomSymbol(){
        let arr = [];
        while (arr.length<4){
            let num = Math.floor(8*Math.random()+1);
            if(arr.indexOf(num)==-1){
                arr.push(num);
            }
        }
        return arr;
    }
    function onGameParametersUpdated() {
        if(SKBeInstant.config.customBehavior){
           interval = Number(SKBeInstant.config.customBehavior.baseGameRevealInterval) || 200;
        }else if(loader.i18n.gameConfig){
           interval = Number(loader.i18n.gameConfig.baseGameRevealInterval) || 200;
        }else{
            interval = 200;
        }
        if(SKBeInstant.config.customBehavior){
           runeInterval = Number(SKBeInstant.config.customBehavior.runeBonusRevealInterval) || 800;
        }else if(loader.i18n.gameConfig){
           runeInterval = Number(loader.i18n.gameConfig.runeBonusRevealInterval) || 800;
        }else{
            runeInterval = 800;
        }
        var options = {'avoidMultiTouch': true, 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92}; 
        autoPlay = new gladButton(gr.lib._buttonRevealAll, 'BuyButton', options);
        autoPlay.click(function () {
            gr.lib._buttonRevealAll.show(false);
            revealAll();
        });
        runeAutoPlay = new gladButton(gr.lib._buttonRuneBonusRevealAll, 'BuyButton', options);
        runeAutoPlay.click(function () {
            gr.lib._runeBonusRevealAll.show(false);
            runeRevealAll();
        });
        amuletAutoPlay = new gladButton(gr.lib._buttonAmuletBonusRevealAll, 'BuyButton', options);
        amuletAutoPlay.click(function () {
            gr.lib._amuletBonusRevealAll.show(false);
            amuletRevealAll();
        });
        gr.lib._revealAllText.autoFontFitText = true;
        gr.lib._runeBonusRevealAllText.autoFontFitText = true;
        gr.lib._amuletBonusRevealAllText.autoFontFitText = true;
        gr.lib._revealAllText.setText(loader.i18n.Game.button_autoPlay);
        gr.lib._runeBonusRevealAllText.setText(loader.i18n.Game.button_autoPlay);
        gr.lib._amuletBonusRevealAllText.setText(loader.i18n.Game.button_autoPlay);
        gr.lib._buttonRevealAll.show(false);
        gr.lib._runeBonusRevealAll.show(false);
        gr.lib._amuletBonusRevealAll.show(false);
	}

    function onStartUserInteraction(data) {
        var enable = SKBeInstant.config.autoRevealEnabled === false? false: true;
        if(enable){
            if(data.scenario){
                gr.lib._buttonRevealAll.show(true);
            }
        }else{
            gr.lib._buttonRevealAll.show(false);
        }
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        gr.lib._buttonRevealAll.show(false);
        gr.lib._buttonStop.show(false);
    }

    function onReset() {
        onReInitialize();
    }
    
    

    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('reset', onReset);

    return {};
});