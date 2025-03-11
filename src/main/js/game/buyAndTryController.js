/**
 * @module game/buyAndTryController
 * @description buy and try button control
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
    'game/utils/gladButton',
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton) {
    
	var currentTicketCost = null;
	var replay, tryButton, buyButton;
    var MTMReinitial = false;
    
	function onGameParametersUpdated(){
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92,'avoidMultiTouch': true};
        tryButton = new gladButton(gr.lib._buttonTry, "BuyButton",scaleType);
        buyButton = new gladButton(gr.lib._buttonBuy, "BuyButton",scaleType);
        gr.lib._buttonBuyLight.gotoAndPlay('BuyButtonAnim',0.5,false);
        gr.lib._buttonBuyLight.onComplete = function(){
            gr.getTimer().setTimeout(function(){
                gr.lib._buttonBuyLight.gotoAndPlay('BuyButtonAnim',0.3,false);
            },2000);
        };
		gr.lib._buttonBuy.show(false);
		gr.lib._buttonTry.show(false);
		gr.lib._buttonStop.show(false);
		gr.lib._buttonPlayAgainMTM.show(false);
		gr.lib._buttonExit.show(false);
		gr.lib._buttonPlayAgain.show(false);
		gr.lib._buttonAutoPlay.show(false);
        gr.lib._network.show(false);
        replay = false;
        gr.lib._buyText.autoFontFitText = true;
        if(SKBeInstant.config.wagerType === 'BUY'){
            gr.lib._buyText.setText(loader.i18n.Game.button_buy);
        }else{
            gr.lib._buyText.setText(loader.i18n.Game.button_try);
        }
        gr.lib._tryText.autoFontFitText = true;
        gr.lib._tryText.setText(loader.i18n.Game.button_try);
		tryButton.click(play);
		buyButton.click(play);
	}

	function play() {
        msgBus.publish('clickBuyTicket');
		if (replay) {
            msgBus.publish('resetAll');
			msgBus.publish('jLotteryGame.playerWantsToRePlay', {price:currentTicketCost});
		} else {
			msgBus.publish('jLotteryGame.playerWantsToPlay', {price:currentTicketCost});
		}
		gr.lib._buttonBuy.show(false);
		gr.lib._buttonTry.show(false);
        gr.lib._network.show(true);
        gr.lib._network.gotoAndPlay('networkActivity', 0.3, true);
		audio.play('ButtonBuy',1);
        msgBus.publish('disableUI');
	}

	function onStartUserInteraction(data) {
        gr.lib._network.stopPlay();
        gr.lib._network.show(false);        
		gr.lib._buttonBuy.show(false);
		gr.lib._buttonTry.show(false);
		currentTicketCost = data.price;
        msgBus.publish('enableUI');
		replay = true;
	}

	function showBuyOrTryButton() {
		if(SKBeInstant.config.jLotteryPhase !== 2) {
			return;
		}
        gr.lib._buttonBuy.show(true);
        gr.lib._buttonTry.show(true);
	}

	function onInitialize() {
		showBuyOrTryButton();
	}

	function onTicketCostChanged(data) {
		currentTicketCost = data;
	}

    function onReInitialize() {
        gr.lib._network.stopPlay();
        gr.lib._network.show(false);  
        if (MTMReinitial) {
            replay = false;
            gr.lib._buyText.setText(loader.i18n.Game.button_buy);
            MTMReinitial = false;
        }
		showBuyOrTryButton();
	}
    
    function onPlayerWantsPlayAgain(){
        showBuyOrTryButton();
    }
    
    function onReStartUserInteraction(){
        gr.lib._network.stopPlay();
        gr.lib._network.show(false);   
        msgBus.publish('enableUI');
    }
    
    function onPlayerWantsToMoveToMoneyGame(){
        MTMReinitial = true;
    }
    function onReset(){
        gr.lib._network.stopPlay();
        gr.lib._network.show(false);  
        showBuyOrTryButton();
    }
    function onGameInit(data){
        let gameLogicResponse = data.GameLogicResponse;
        let paytableResponse = null;
        if (data && data.PaytableResponse) {
			paytableResponse = data.PaytableResponse;
		}
        if(gameLogicResponse.PromotionalFreeSpin){
            isPFS = true;
            pfsCurrentTicketCost = paytableResponse[0].prizeDetails[0].price;
        }
    }

    msgBus.subscribe('platformMsg/ClientService/Game.Init', onGameInit);
    msgBus.subscribe('platformMsg/ClientService/Game.ReInit', onGameInit);
    msgBus.subscribe('jLotterySKB.reset', onReset);
    msgBus.subscribe("playerWantsPlayAgain", onPlayerWantsPlayAgain);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.initialize', onInitialize);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);

	return {};
});