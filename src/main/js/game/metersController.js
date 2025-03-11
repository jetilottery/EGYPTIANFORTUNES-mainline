/**
 * @module game/meters
 * @description meters control
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/component/currencyHelper/currencyHelper',
    '../game/gameUtils'
], function (msgBus, gr, loader, SKBeInstant, currencyHelper, gameUtils) {

	var resultData = null;
    var MTMReinitial = false;

	function onStartUserInteraction(data) {
		resultData = data;
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
	}

	function onEnterResultScreenState() {
        if (resultData.prizeValue > 0 || SKBeInstant.isWLA()){
            gr.lib._winsValue.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
            gameUtils.fixMeter(gr);
        }
	}

	function onReStartUserInteraction(data) {
		onStartUserInteraction(data);
	}

	function onReInitialize() {
        if (MTMReinitial && SKBeInstant.config.balanceDisplayInGame) {
            gr.lib._balanceText.show(true);
            gr.lib._balanceValue.show(true);
            gr.lib._meterDivision0.show(true);
        }
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
	}
	
	function onUpdateBalance(data){
        if (SKBeInstant.config.balanceDisplayInGame) {
            if (SKBeInstant.isSKB()) {
                gr.lib._balanceValue.setText(currencyHelper.formatBalance(data.balance));
            } else {
                gr.lib._balanceValue.setText(data.formattedBalance);
            }
            gameUtils.fixMeter(gr);
        }
	}
    
    function setAutoFontFitText(){
        gr.lib._ticketCostMeterText.autoFontFitText = true;
        gr.lib._ticketCostMeterValue.autoFontFitText = true;
        gr.lib._balanceText.autoFontFitText = true;
        gr.lib._balanceValue.autoFontFitText = true;
        gr.lib._winsText.autoFontFitText = true;
        gr.lib._winsValue.autoFontFitText = true;
    }

	function onGameParametersUpdated(){
        setAutoFontFitText();
        if(SKBeInstant.config.balanceDisplayInGame === false || SKBeInstant.config.wagerType === 'TRY'){
            gr.lib._balanceValue.show(false);
            gr.lib._balanceText.show(false);
            gr.lib._meterDivision0.show(false);
        }
        gameUtils.setTextStyle(gr.lib._balanceText,{padding:2});
		gr.lib._balanceText.setText(loader.i18n.Game.balance);
        gameUtils.setTextStyle(gr.lib._balanceValue,{padding:2});
        if(!SKBeInstant.isSKB()){
           gr.lib._balanceValue.setText('');
        }
        gameUtils.setTextStyle(gr.lib._winsText,{padding:2});
        gameUtils.setTextStyle(gr.lib._winsValue,{padding:2});
        gameUtils.setTextStyle(gr.lib._ticketCostMeterText,{padding:2});
        gameUtils.setTextStyle(gr.lib._ticketCostMeterValue,{padding:2});
        gr.lib._meterDivision0.setText(loader.i18n.Game.meter_division);
        gr.lib._meterDivision1.setText(loader.i18n.Game.meter_division);
        gr.lib._ticketCostMeterText.setText(loader.i18n.Game.meter_wager);
        gr.lib._winsText.setText(loader.i18n.Game.wins);
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
	}
    
    function onTicketCostChanged(prizePoint){
        if (SKBeInstant.config.wagerType === 'BUY') {
			gr.lib._winsText.setText(loader.i18n.Game.wins);
            gr.lib._ticketCostMeterValue.setText(SKBeInstant.formatCurrency(prizePoint).formattedAmount);
		} else {
			gr.lib._winsText.setText(loader.i18n.Game.wins_demo);
            gr.lib._ticketCostMeterValue.setText(loader.i18n.Game.demo + SKBeInstant.formatCurrency(prizePoint).formattedAmount);
		}
        gameUtils.fixMeter(gr);
    }
	function onPlayerWantsPlayAgain(){
        gameUtils.fixMeter(gr);
    }
    
	function onBeforeShowStage(data){
        gr.lib._balanceValue.setText(currencyHelper.formatBalance(data.response.Balances["@totalBalance"]));
        gameUtils.fixMeter(gr);
        gr.forceRender();
	}

    function updateWinValue(data){
        if (data.value > 0 || SKBeInstant.isWLA()){
            gr.lib._winsValue.setText(SKBeInstant.formatCurrency(data.value).formattedAmount);
            gameUtils.fixMeter(gr);
        }
    }
    
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('updateWinValue', updateWinValue);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
//	msgBus.subscribe('jLottery.initialize', onInitialize);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('jLottery.updateBalance', onUpdateBalance);
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',function(){
        MTMReinitial = true;
    });
    msgBus.subscribe('winboxError', function(){
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
    });

	return {};
});