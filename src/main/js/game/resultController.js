/**
 * @module game/resultDialog
 * @description result dialog control
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
    'game/particle/winParticles01',
    'game/particle/winParticles02',
], function (msgBus, audio, gr, loader, SKBeInstant,winParticles01,winParticles02) {
	var resultData = null;
    var resultPlaque = null;var particles01,particles02;
    var ticketCost;
    let suppressNonWinResultPlaque = true,showResultScreen = true;
    let explosionTimer = null ;
    var bigWinThresholds = {
                level1: {
                    upper: {multiplier: 5, inclusive: false}
                },
                level2: {
                    lower: {multiplier: 5, inclusive: true},
                    upper: {"multiplier": 20, inclusive: true}
                },
                level3: {
                    lower: {multiplier: 20, inclusive: false}
                }
            };
    function onGameParametersUpdated() {
        gr.lib._winPlaque.on('click',closeResultPlaque);
        gr.lib._winPlaque.pixiContainer.cursor = "pointer";
        gr.lib._nonWinPlaque.pixiContainer.cursor = "pointer";
        gr.lib._nonWinPlaque.on('click',closeResultPlaque);
        gr.lib._win_Text_1.autoFontFitText = true;
        gr.lib._win_Text_2.autoFontFitText = true;
        gr.lib._win_Value_1.autoFontFitText = true;
        gr.lib._win_Value_2.autoFontFitText = true;
        gr.lib._win_Text_1.setText(loader.i18n.Game.totalwin);
        gr.lib._win_Text_2.setText(loader.i18n.Game.totalwin);
        gr.lib._nonWin_Text1.autoFontFitText = true;
        gr.lib._nonWin_Text2.autoFontFitText = true;
        gr.lib._nonWin_Text1.setText(loader.i18n.Game.message_nonWin01);
        gr.lib._nonWin_Text2.setText(loader.i18n.Game.message_nonWin02);
        if(SKBeInstant.config.customBehavior){
            if(SKBeInstant.config.customBehavior.bigWinThresholds){
               bigWinThresholds = SKBeInstant.config.customBehavior.bigWinThresholds;
            }
        }else if(loader.i18n.gameConfig){
            if(loader.i18n.gameConfig.bigWinThresholds){
                bigWinThresholds = loader.i18n.gameConfig.bigWinThresholds;
            }
        }
        if(SKBeInstant.config.customBehavior){
            if(!SKBeInstant.config.customBehavior.suppressNonWinResultPlaque){
                suppressNonWinResultPlaque = false;
            }
        }else if(loader.i18n.gameConfig){
            if(!loader.i18n.gameConfig.suppressNonWinResultPlaque){
                suppressNonWinResultPlaque = false;
            }
        }
        
        if(SKBeInstant.config.customBehavior){
            if(!SKBeInstant.config.customBehavior.showResultScreen){
                showResultScreen = false;
            }
        }else if(loader.i18n.gameConfig){
            if(!loader.i18n.gameConfig.showResultScreen){
                showResultScreen = false;
            }
        }
	}
    function closeResultPlaque(){
        hideDialog();
        audio.play('ButtonBuy',1);
    }
	function hideDialog() {
        gr.lib._winPlaque.show(false);
        gr.lib._nonWinPlaque.show(false);
        if(explosionTimer){
            gr.getTimer().clearTimeout(explosionTimer);
        }
	}

    function particleAnim(){
        var level = findPrizeLevel();
        if(level===2){
            particles01 = winParticles01.getBubbleEmitter();
            particles01.updateSpawnPos(gr.lib._baseGameSence._currentStyle._width/2,gr.lib._baseGameSence._currentStyle._height/2);
            winParticles01.startBubbleEmitter();
            explosionTimer = gr.getTimer().setTimeout(function(){
                 winParticles01.startBubbleEmitter();
            },800);
        }else if(level===3){
            particles02 = winParticles02.getBubbleEmitter();
            particles02.updateSpawnPos(gr.lib._baseGameSence._currentStyle._width/2,gr.lib._baseGameSence._currentStyle._height/2);
            winParticles02.startBubbleEmitter();
            explosionTimer = gr.getTimer().setTimeout(function(){
                winParticles02.startBubbleEmitter();
            },800);
        }
    }

	function showDialog() {
		if (resultData.playResult === 'WIN') {
            gr.lib._win_Text.show(true);
            if (SKBeInstant.config.wagerType === 'BUY') {
                gr.lib._win_Text_1.setText(loader.i18n.Game.totalwin);
                gr.lib._win_Text_2.setText(loader.i18n.Game.totalwin);
            }else{
                gr.lib._win_Text_1.setText(loader.i18n.Game.totaldemowin);
                gr.lib._win_Text_2.setText(loader.i18n.Game.totaldemowin);
            }
            particleAnim();
			gr.lib._win_Value_1.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
			gr.lib._win_Value_2.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
			gr.lib._winPlaque.show(true);
            gr.lib._winPlaqueBG.gotoAndPlay('winPlaque',0.3,true);
            gr.lib._nonWinPlaque.show(false);
		} else {
            gr.lib._winPlaque.show(false);
            if(!suppressNonWinResultPlaque){
			    gr.lib._nonWinPlaque.show(true);
            }
		}
	}

    function findPrizeLevel(){
        // Grab the big win thresholds from the object      
        var totalWin = resultData.prizeValue;
        var numLevels = Object.keys(bigWinThresholds).length;
        // Return -1 if this is a non winner
        if (totalWin === 0){
          return -1;
        }

        for (var i = 0; i < numLevels; i++){
          var thisObj = bigWinThresholds['level'+(i+1)];
          var lowerLimitPresent = thisObj.lower || false;
          var upperLimitPresent = thisObj.upper || false;
          var withinUpper = false;
          var withinLower = false;
          if (lowerLimitPresent){
            if (thisObj.lower.inclusive){
              if (totalWin >= ticketCost*thisObj.lower.multiplier){
                withinLower = true;
              }
            }else{
              if (totalWin > ticketCost*thisObj.lower.multiplier){
                withinLower = true;
              }
            }
          }else{
              withinLower = true;
          }
          if (upperLimitPresent){
            if (thisObj.upper.inclusive){
              if (totalWin <= ticketCost*thisObj.upper.multiplier){
                withinUpper = true;
              }
            }else{
              if (totalWin < ticketCost*thisObj.upper.multiplier){
                withinUpper = true;
              }
            }
          }else{
            //it's the highest already
            withinUpper = true;
          }

          if (withinLower && withinUpper){
            return (i+1);
          }
        }
    }


	function onStartUserInteraction(data) {
        explosionTimer = null;
		resultData = data;
		hideDialog();
	}

	function onAllRevealed() {
        msgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
            tierPrizeShown: resultData.prizeDivision,
            formattedAmountWonShown: resultData.prizeValue
        });
        msgBus.publish('disableUI');
    }

    function onEnterResultScreenState() {
        if(gr.lib._tutorial.pixiContainer.visible){
            gr.lib._tutorial.show(false);
        }
        if(showResultScreen){
            showDialog();
        }
    }

	function onReStartUserInteraction(data) {
		onStartUserInteraction(data);
	}

    function onReInitialize() {
        hideDialog();
    }
	
    
    function onTutorialIsShown(){
        if(gr.lib._winPlaque.pixiContainer.visible || gr.lib._nonWinPlaque.pixiContainer.visible){            
            resultPlaque = gr.lib._winPlaque.pixiContainer.visible? gr.lib._winPlaque: gr.lib._nonWinPlaque;
            hideDialog();
            gr.lib._BG_dim.show(true);
        }
    }
    
    function onTutorialIsHide(){
        if(resultPlaque){
            resultPlaque.show(true);
            if (resultData.playResult === 'WIN'){
                gr.lib._winPlaqueBG.gotoAndPlay('winPlaque',0.3,true);
            }
            resultPlaque = null;
        }        
    }

    function onTicketCostChanged(prizePoint){
        ticketCost = prizePoint;
    }
    
    function resetAll(){
        hideDialog();
    }

    msgBus.subscribe('resetAll', resetAll);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('allRevealed', onAllRevealed);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
	return {};
});