/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * @module game/exitButton
 * @description exit button control
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
    'game/utils/gladButton',
], function (msgBus, gr, loader, SKBeInstant, gladButton, ) {

    var playAgain;
	function playAgainButton() {
		
		// audio.play('ButtonGeneric');
        gr.lib._buttonPlayAgain.show(false);
		msgBus.publish('playerWantsPlayAgain');
	}
	
	function onGameParametersUpdated(){
        gr.lib._playAgainText.autoFontFitText = true;
        gr.lib._playAgainText.setText(loader.i18n.Game.button_buy);
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92,'avoidMultiTouch': true};
        playAgain = new gladButton(gr.lib._buttonPlayAgain, "BuyButton", scaleType);
		playAgain.click(playAgainButton);
	}
    
    function onReInitialize(){
        gr.lib._playAgainText.setText(loader.i18n.Game.button_buy);
        gr.lib._buttonPlayAgain.show(false);
    }

	function onEnterResultScreenState() {
		if (SKBeInstant.config.jLotteryPhase === 2) {
            gr.getTimer().setTimeout(function(){
                msgBus.publish('playerWantsPlayAgain');
                // gr.lib._buttonPlayAgain.show(true);
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
		}
	}

	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

	return {};
});