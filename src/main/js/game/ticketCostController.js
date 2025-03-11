/**
 * @module game/ticketCost
 * @description ticket cost meter control
 */
define([
    'skbJet/component/gladPixiRenderer/Sprite',
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
    'game/utils/gladButton',
], function (Sprite, msgBus, audio, gr, loader, SKBeInstant, gladButton) {
    
    var plusButton, minusButton;
    var _currentPrizePoint, prizePointList;
    var ticketIcon, ticketIconObj = null;
    var boughtTicket = false;
    var MTMReinitial = false;
    var isPFS = false;
    var pfsCurrentTicketCost = null;
    
    function registerControl() {
        var formattedPrizeList = [];
        var strPrizeList = [];
        for (var i = 0; i < prizePointList.length; i++) {
            formattedPrizeList.push(SKBeInstant.formatCurrency(prizePointList[i]).formattedAmount);
            strPrizeList.push(prizePointList[i] + '');
        }
        var priceText, stakeText;
        if(SKBeInstant.isWLA()){
            priceText = loader.i18n.MenuCommand.WLA.price;
            stakeText = loader.i18n.MenuCommand.WLA.stake;
        }else{
            priceText = loader.i18n.MenuCommand.Commercial.price;
            stakeText = loader.i18n.MenuCommand.Commercial.stake;            
        }
        
        msgBus.publish("jLotteryGame.registerControl", [{
                name: 'price',
                text: priceText,
                type: 'list',
                enabled: 1,
                valueText: formattedPrizeList,
                values: strPrizeList,
                value: SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault
            }]);
        msgBus.publish("jLotteryGame.registerControl", [{
            name: 'stake',
            text: stakeText,
            type: 'stake',
            enabled: 0,
            valueText: '0',
            value: 0
        }]);
    }
    
    function gameControlChanged(value) {
        msgBus.publish("jLotteryGame.onGameControlChanged",{
			name: 'stake',
			event: 'change',
			params: [SKBeInstant.formatCurrency(value).amount/100, SKBeInstant.formatCurrency(value).formattedAmount]
		});
        msgBus.publish("jLotteryGame.onGameControlChanged",{
			name: 'price',
			event: 'change',
			params: [value, SKBeInstant.formatCurrency(value).formattedAmount]
		});
	}
    
    function onConsoleControlChanged(data){
        if (data.option === 'price') {
            gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
            msgBus.publish('resetAll');	
            setTicketCostValue(Number(data.value));
            msgBus.publish("jLotteryGame.onGameControlChanged", {
                name: 'stake',
                event: 'change',
                params: [SKBeInstant.formatCurrency(data.value).amount/100, SKBeInstant.formatCurrency(data.value).formattedAmount]
            });
        }
    }

    function onGameParametersUpdated() {
        gr.lib._ticketCostValue.autoFontFitText = true;
        prizePointList = [];
        ticketIcon = {};
        gr.lib._TicketCostDim.show(false);
        var style = null;
        if(SKBeInstant.getGameOrientation()==="landscape"){
            style = {
                "_id": "_dfgbka",
                "_name": "_ticketCostLevelIcon_",
                "_SPRITES": [],
                "_style": {
                    "_width": "30",
                    "_height": "6",
                    "_left": "196",
                    "_background": {
                        "_imagePlate": "_ticketCostLevelIconOff"
                    },
                    "_top": "63",
                    "_transform": {
                        "_scale": {
                            "_x": "0.6",
                            "_y": "0.75"
                        }
                    }
                }
            };
        }else{
            style = {
                "_id": "_dfgbka",
                "_name": "_ticketCostLevelIcon_",
                "_SPRITES": [],
                "_style": {
                    "_width": "30",
                    "_height": "6",
                    "_left": "196",
                    "_background": {
                        "_imagePlate": "_ticketCostLevelIconOff"
                    },
                    "_top": "62",
                    "_transform": {
                        "_scale": {
                            "_x": "0.6",
                            "_y": "0.75"
                        }
                    }
                }
            };
        }
        var length = SKBeInstant.config.gameConfigurationDetails.revealConfigurations.length;
        var width = Number(style._style._width) * Number(style._style._transform._scale._x);
        var space = 4;
        var left = (gr.lib._ticketCost._currentStyle._width - (length * width + (length - 1) * space)-10) / 2;
        for (var i = 0; i < length; i++) {
            var spData = JSON.parse(JSON.stringify(style));
            spData._id = style._id + i;
            spData._name = spData._name + i;
            spData._style._left = left + (width + space) * i;
            var sprite = new Sprite(spData);
            gr.lib._ticketCost.pixiContainer.addChild(sprite.pixiContainer);
            var price = SKBeInstant.config.gameConfigurationDetails.revealConfigurations[i].price;
            prizePointList.push(price);
            ticketIcon[price] = "_ticketCostLevelIcon_" + i;
		}
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92,'avoidMultiTouch': true};
        plusButton = new gladButton(gr.lib._ticketCostPlus, "plusButton",scaleType);       
        minusButton = new gladButton(gr.lib._ticketCostMinus, "minusButton", scaleType);        
        registerControl();
        if(prizePointList.length <= 1||SKBeInstant.config.jLotteryPhase === 1 ){
            plusButton.show(false);
            minusButton.show(false);
            gr.lib._ticketCost.show(false);
            gr.lib._TicketCostDim.show(false);
            if(SKBeInstant.getGameOrientation()==="landscape"){
                adjustPosition(gr.lib._revealAll);
                adjustPosition(gr.lib._runeBonusRevealAll);
                adjustPosition(gr.lib._amuletBonusRevealAll);
                adjustPosition(gr.lib._buy);
                adjustPosition(gr.lib._try);
            }
        }else{
            plusButton.show(true);
			minusButton.show(true);
            plusButton.click(increaseTicketCost);
            minusButton.click(decreaseTicketCost);
        }
	}

    function adjustPosition(sprite){
        let length = gr.lib._metersBG._currentStyle._width;
        let width = sprite._currentStyle._width;
        let left = (length-width)/2;
        sprite.updateCurrentStyle({'_left':left});
    }

	function setTicketCostValue(prizePoint) {
		var index = prizePointList.indexOf(prizePoint);
		if (index < 0) {
			msgBus.publish('error', 'Invalide prize point ' + prizePoint);
			return;
		}
        plusButton.enable(true);
        minusButton.enable(true);
        gr.lib._TicketCostDim.show(false);
		if (index === 0) {
            minusButton.enable(false);
		} 
		if (index === (prizePointList.length - 1)) {
            plusButton.enable(false);
		} 
        
        var valueString = SKBeInstant.formatCurrency(prizePoint).formattedAmount;

        if(SKBeInstant.config.wagerType === 'BUY'){
            gr.lib._ticketCostValue.setText(valueString);
        }else{
            gr.lib._ticketCostValue.setText(loader.i18n.Game.demo +  valueString);
        }         
        if (ticketIconObj) {
            ticketIconObj.setImage('ticketCostLevelIconOff');
        }
        ticketIconObj = gr.lib[ticketIcon[prizePoint]];
        ticketIconObj.setImage('ticketCostLevelIconOn');
        
		_currentPrizePoint = prizePoint;
		msgBus.publish('ticketCostChanged', prizePoint);
	}
    
    function setTicketCostValueWithNotify(prizePoint){
        setTicketCostValue(prizePoint);
        gameControlChanged(prizePoint);
    }

	function increaseTicketCost() {
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
		var index = prizePointList.indexOf(_currentPrizePoint);
		index++;
        setTicketCostValueWithNotify(prizePointList[index]);
        if(index === prizePointList.length-1){
            audio.play('ButtonBetMax', 1);
        }else{
            audio.play('ButtonBetUp',1);
        }
        msgBus.publish('resetAll');		
	}

	function decreaseTicketCost() {
        gr.lib._winsValue.setText(SKBeInstant.config.defaultWinsValue);
		var index = prizePointList.indexOf(_currentPrizePoint);
		index--;
        setTicketCostValueWithNotify(prizePointList[index]);
        audio.play('ButtonBetDn', 1);
        msgBus.publish('resetAll');		
	}

	function setDefaultPricePoint() {
        setTicketCostValueWithNotify(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
	}

	function onInitialize() {
        if(isPFS){
            gameControlChanged(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
            disableConsole();
            msgBus.publish('ticketCostChanged', SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
            return;
        }
        setDefaultPricePoint();
        // gr.lib._ticketCost.show(false);
	}

	function onReInitialize() {
        if(MTMReinitial){
            enableConsole();
            if(isPFS){
                gameControlChanged(pfsCurrentTicketCost);
                disableConsole();
                msgBus.publish('ticketCostChanged', pfsCurrentTicketCost);
                plusButton.show(false);
                minusButton.show(false);
                gr.lib._ticketCost.show(false);
                gr.lib._TicketCostDim.show(false);
                if(SKBeInstant.getGameOrientation()==="landscape"){
                    adjustPosition(gr.lib._revealAll);
                    adjustPosition(gr.lib._runeBonusRevealAll);
                    adjustPosition(gr.lib._amuletBonusRevealAll);
                    adjustPosition(gr.lib._buy);
                    adjustPosition(gr.lib._try);
                }
            }else{
                if(_currentPrizePoint){
                    setTicketCostValueWithNotify(_currentPrizePoint);
                }else{
                    setDefaultPricePoint();
                }
            }
            boughtTicket = false;
            gr.lib._ticketCost.show(false);
            MTMReinitial = false;
        }else{
            onReset();
        }
	}
    
    function onReset(){
        if(isPFS){return;}
        enableConsole();
        if(_currentPrizePoint){
            setTicketCostValueWithNotify(_currentPrizePoint);
        }else{
            setDefaultPricePoint();
        }
        boughtTicket = false;
        gr.lib._ticketCost.show(true);
    }

	function onStartUserInteraction(data) {
        disableConsole();
        if(isPFS){
            gameControlChanged(data.price);
            msgBus.publish('ticketCostChanged', data.price);
            return;
        }
        boughtTicket = true;
		if (data.price) {
			_currentPrizePoint = data.price;
            setTicketCostValueWithNotify(_currentPrizePoint);
		}
        plusButton.enable(false);
        minusButton.enable(false); 
        if(SKBeInstant.config.jLotteryPhase !== 1 && prizePointList.length > 1){
            gr.lib._TicketCostDim.show(true);
        }
		msgBus.publish('ticketCostChanged', _currentPrizePoint);
	}

	function onReStartUserInteraction(data) {
		onStartUserInteraction(data);
	}

	function enableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"price","event":"enable","params":[1]}
        });
    } 
	function disableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"price","event":"enable","params":[0]}
        });
    }

    function onPlayerWantsPlayAgain(){
        if(isPFS){return;}
        boughtTicket = false;
        enableConsole();
        setTicketCostValueWithNotify(_currentPrizePoint);   
        if(SKBeInstant.config.jLotteryPhase !== 1 && prizePointList.length > 1){
            gr.lib._ticketCost.show(true);
        }     
    }
    
    function onTutorialIsShown(){
        if(!boughtTicket){
            gr.lib._ticketCost.show(false);
        }
    }
    function onTutorialIsHide(){
        if(!boughtTicket&&!isPFS){
            if(SKBeInstant.config.jLotteryPhase !== 1 && prizePointList.length > 1){
                gr.lib._ticketCost.show(true);
            }  
        }
    }
    function onDisableUI(){
        plusButton.enable(false);
        minusButton.enable(false);
        if(SKBeInstant.config.jLotteryPhase !== 1 && prizePointList.length > 1&&!isPFS){
            gr.lib._TicketCostDim.show(true);
        }
    }
    
    function onPlayerWantsToMoveToMoneyGame(){
        MTMReinitial = true;
        plusButton.enable(false);
		minusButton.enable(false);
    }

    function onGameInit(data){
        let gameLogicResponse = data.GameLogicResponse;
        if(gameLogicResponse.PromotionalFreeSpin){
            isPFS = true;
            if (data && data.PaytableResponse) {
                pfsCurrentTicketCost = data.PaytableResponse[0].prizeDetails[0].price;
            }
        }

    }   

    msgBus.subscribe("playerWantsPlayAgain", onPlayerWantsPlayAgain);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('jLottery.initialize', onInitialize);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('platformMsg/ClientService/Game.Init', onGameInit);
    msgBus.subscribe('platformMsg/ClientService/Game.ReInit', onGameInit);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
    msgBus.subscribe('jLotterySKB.reset', onReset);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    msgBus.subscribe('disableUI', onDisableUI);
//    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
    

	return {};
});