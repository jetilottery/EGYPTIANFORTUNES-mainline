/**
 * @module game/exitButton
 * @description exit button control
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
    'game/utils/gladButton',
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton) {
    var exitButton, homeButton;
    var whilePlaying = false;
    var warnReset = false;
    var warnShown = false;

	function exit() {
		audio.play('ButtonBuy',1);
        if (window.loadedRequireArray) {
            for (var i = window.loadedRequireArray.length - 1; i >= 0; i--) {
                requirejs.undef(window.loadedRequireArray[i]);
            }
            window.loadedRequireArray = [];
        }
		msgBus.publish('jLotteryGame.playerWantsToExit');
	}
	
	function onGameParametersUpdated(){
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92,'avoidMultiTouch': true};
        exitButton = new gladButton(gr.lib._buttonExit, 'BuyButton', scaleType);
        gr.lib._exitText.autoFontFitText = true;
        gr.lib._exitText.setText(loader.i18n.Game.button_exit);
		exitButton.click(exit);
        gr.lib._buttonExit.show(false);
        if (SKBeInstant.isWLA()&&!SKBeInstant.isSKB()) {
            homeButton = new gladButton(gr.lib._buttonHome, 'homeButton', scaleType);
            homeButton.click(exit);
            if (SKBeInstant.config.jLotteryPhase === 1) {
                gr.lib._buttonHome.show(false);
            } else {
                gr.lib._buttonHome.show(true);
            }
        }else{
            gr.lib._buttonHome.show(false);
        }
	}

	function onEnterResultScreenState() {
		if (SKBeInstant.config.jLotteryPhase === 1) {
            gr.getTimer().setTimeout(function () {
                gr.lib._buttonExit.show(true);
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
		}else{
            gr.getTimer().setTimeout(function(){
                whilePlaying = false;
                if (SKBeInstant.isWLA()&&!SKBeInstant.isSKB()) {
                    if (warnShown) {
                        warnReset = true;
                    } else {
                        gr.lib._buttonHome.show(true);
                    }
                }
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
		}       
	}
    
    function onReInitialize(){
        whilePlaying = false;
        if (SKBeInstant.isWLA()&&!gr.lib._tutorial.pixiContainer.visible&&!SKBeInstant.isSKB()) {
            gr.lib._buttonHome.show(true);
            homeButton.enable(true);
        }
    }
     
    function onDisableUI() {
		// gr.lib._buttonHome.show(false);
        if (SKBeInstant.isWLA()&&!SKBeInstant.isSKB()) {
            homeButton.enable(false);
        }
	}

    function onTutorialIsShown(){
        if (SKBeInstant.isWLA()&&!SKBeInstant.isSKB()) {
            homeButton.enable(false);
        }
    }
    
    function onTutorialIsHide(){
        if (SKBeInstant.config.jLotteryPhase === 2 && !whilePlaying && SKBeInstant.isWLA()&&!SKBeInstant.isSKB()) {
            homeButton.enable(true);
        }
    }

    function onPlayerWantsPlayAgain(){
        if(SKBeInstant.isWLA()&&!SKBeInstant.isSKB()) {
            homeButton.enable(true);
        }
    }

    function onReStartUserInteraction(){
        whilePlaying = true;
        if (SKBeInstant.isWLA()) {
            // homeButton.show(false);
        }
    }
    function onStartUserInteraction(){
        whilePlaying = true;
        if (SKBeInstant.isWLA()&&!SKBeInstant.isSKB()) {
            homeButton.enable(false);
        }
    }
	msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLotterySKB.reset', onTutorialIsHide);
    msgBus.subscribe("playerWantsPlayAgain", onPlayerWantsPlayAgain);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    msgBus.subscribe('warnIsShown', function(){
        warnShown = true;
    });
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);

	return {};
});

