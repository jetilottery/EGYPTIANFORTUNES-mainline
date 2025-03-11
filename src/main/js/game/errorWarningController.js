define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'game/utils/gladButton',
    'skbJet/component/SKBeInstant/SKBeInstant',
], function(msgBus, audio, gr, loader, gladButton, SKBeInstant) {
    var scaleType;
    var continueButton, warningExitButton, errorExitButton, winBoxErrorButton;
    var tutorialVisible = false;
    var resultPlaque = null;
    var showWarn = false;
    var warnMessage = null;
    var inGame = false;
    var gameError = false;
    var hasWin = false;
    
    function setFont(){
        gr.lib._warningExitText.autoFontFitText = true;
        gr.lib._warningContinueText.autoFontFitText = true;
        gr.lib._warningText.autoFontFitText = true;
        gr.lib._errorExitText.autoFontFitText = true;
        gr.lib._errorTitle.autoFontFitText = true;
        gr.lib._errorText.autoFontFitText = true;
        gr.lib._winBoxErrorText.autoFontFitText = true;
        gr.lib._winBoxExitText.autoFontFitText = true;
        gr.lib._warningExitText.setText(loader.i18n.Game.warning_button_exitGame);
        gr.lib._warningContinueText.setText(loader.i18n.Game.warning_button_continue);
        gr.lib._errorExitText.setText(loader.i18n.Game.error_button_exit);
        gr.lib._errorTitle.setText(loader.i18n.Game.error_title);
        gr.lib._winBoxErrorText.setText(loader.i18n.Error.error29000);
		gr.lib._winBoxExitText.setText(loader.i18n.Game.error_button_exit);    
    }

    function onGameParametersUpdated() {
        scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true };
        continueButton = new gladButton(gr.lib._warningContinueButton,'tutorialReelButton', scaleType);
        warningExitButton = new gladButton(gr.lib._warningExitButton, 'tutorialReelButton', scaleType);
        errorExitButton = new gladButton(gr.lib._errorExitButton, 'tutorialReelButton', scaleType);		
		winBoxErrorButton = new gladButton(gr.lib._winBoxExitButton,'tutorialReelButton', scaleType);
        setFont();
        if (gr.lib._ErrorScene){
            gr.lib._ErrorScene.show(false);
        }
        if(gr.lib._winBoxError){
            gr.lib._winBoxError.show(false);
        }
        gr.lib._errorTitle.show(true);
        errorExitButton.click(function() {
            msgBus.publish('jLotteryGame.playerWantsToExit');
            audio.play('ButtonBuy',1);
        });

        continueButton.click(closeErrorWarn);
        warningExitButton.click(function() {
            msgBus.publish('jLotteryGame.playerWantsToExit');
            audio.play('ButtonBuy',1);
        });
		winBoxErrorButton.click(function() {
            msgBus.publish('jLotteryGame.playerWantsToExit');
            audio.play('ButtonBuy',1);
        });
    }

    function onWarn(warning) {
        if (gr.lib._ErrorScene){
            gr.lib._ErrorScene.show(true);
        }
        gr.lib._buttonInfo.show(false);
        gr.lib._BG_dim.show(true);      
        if (gr.lib._tutorial.pixiContainer.visible) {
            gr.lib._tutorial.show(false);
            tutorialVisible = true;
        }
        resultPlaque = hasWin ? gr.lib._winPlaque: gr.lib._nonWinPlaque;
		if(resultPlaque.pixiContainer.visible){
			resultPlaque.show(false);
		}else{
			resultPlaque = null;
		}
        msgBus.publish('tutorialIsShown');
        gr.lib._errorText.show(false);
        gr.lib._warningText.show(true);
        gr.lib._warningText.setText(warning.warningMessage);
        gr.lib._warningExitButton.show(true);
        gr.lib._warningContinueButton.show(true);
        gr.lib._errorExitButton.show(false);
        gr.lib._errorTitle.show(false);
    }

    function closeErrorWarn() {
        if (gr.lib._ErrorScene){
            gr.lib._ErrorScene.show(false);
        }
        if (tutorialVisible || resultPlaque) {
            if (tutorialVisible) {
                gr.lib._tutorial.show(true);
                gr.lib._BG_dim.show(true);
                tutorialVisible = false;
            }else{
                resultPlaque.show(true);
                gr.lib._BG_dim.show(false);
                gr.lib._buttonInfo.show(true);
                resultPlaque = null;
                msgBus.publish('tutorialIsHide');
            }
        }else{
            gr.lib._BG_dim.show(false);
            msgBus.publish('tutorialIsHide');
            gr.lib._buttonInfo.show(true);
        }
        audio.play('ButtonBuy',1);
        if(gameError){
            gameError = false;
        }
    }

    function onError(error) {
        gameError = true;
		gr.lib._network.stopPlay();
        gr.lib._network.show(false); 
        gr.lib._BG_dim.show(true);      
        if (gr.lib._tutorial.pixiContainer.visible) {
            gr.lib._tutorial.show(false);
            tutorialVisible = true;
        }
        //When error happend, Sound must be silenced.
        audio.stopAllChannel();
        
        if (error.errorCode === '29000') {
            if (gr.lib._winBoxError) {
                gr.lib._winBoxError.show(true);
            }
			if(SKBeInstant.isWLA()&&!SKBeInstant.isSKB()){
                gr.lib._winBoxExitButton.show(true);
            }else{
                gr.lib._winBoxExitButton.show(false);
            }
        } else {
            if (gr.lib._ErrorScene) {
                gr.lib._ErrorScene.show(true);
            }
            gr.lib._errorTitle.show(true);
            gr.lib._buttonInfo.show(false);
            gr.lib._warningText.show(false);
            gr.lib._errorText.show(true);
            gr.lib._errorText.setText(error.errorCode + ": " + error.errorDescriptionSpecific + "\n" + error.errorDescriptionGeneric);
            gr.lib._warningExitButton.show(false);
            gr.lib._warningContinueButton.show(false);
            gr.lib._errorExitButton.show(true);
        }
        msgBus.publish('tutorialIsShown');
        //destroy if error code is 00000
        //this is a carry-over from jLottery1 where if the game is closed via the confirm prompt
        //rather than the exit button
        if (error.errorCode === '00000' || error.errorCode === '66605') {
            if (document.getElementById(SKBeInstant.config.targetDivId)) {
                document.getElementById(SKBeInstant.config.targetDivId).innerHTML = "";
                document.getElementById(SKBeInstant.config.targetDivId).style.background = '';
                document.getElementById(SKBeInstant.config.targetDivId).style.backgroundSize = '';
                document.getElementById(SKBeInstant.config.targetDivId).style.webkitUserSelect = '';
                document.getElementById(SKBeInstant.config.targetDivId).style.webkitTapHighlightColor = '';
            }
            //clear require cache
            if (window.loadedRequireArray) {
                for (var i = window.loadedRequireArray.length - 1; i >= 0; i--) {
                    requirejs.undef(window.loadedRequireArray[i]);
                }
            }            
        }		
		

    }

    function onEnterResultScreenState(){
        inGame = false;
        if (showWarn) {
            showWarn = false;
            gr.getTimer().setTimeout(function () {
                onWarn(warnMessage);
            }, (Number(SKBeInstant.config.compulsionDelayInSeconds) + 0.3) * 1000);
        }
    }
    
    msgBus.subscribe('jLottery.reInitialize', function () {
        inGame = false;
    });
    
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.error', onError);
	msgBus.subscribe('winboxError', onError);
    msgBus.subscribe('buyOrTryHaveClicked', function(){
        inGame = true;
    });
    msgBus.subscribe('jLottery.playingSessionTimeoutWarning', function (warning) {
        if(SKBeInstant.config.jLotteryPhase === 1 || gameError){
            return;
        }
        if (inGame) {
            warnMessage = warning;
            showWarn = true;
        } else {
            onWarn(warning);
        }
    });

    function onStartUserInteraction(data){
		inGame = true;// gameType is ticketReady
        hasWin = (data.playResult === 'WIN');
    }

    function onReStartUserInteraction(data){
        onStartUserInteraction(data);
    }

    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    
    return {};
});