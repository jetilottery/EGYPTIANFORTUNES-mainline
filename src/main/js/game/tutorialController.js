/**
 * @module game/tutorialController
 * @description result dialog control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'game/utils/gladButton',
    'skbJet/component/SKBeInstant/SKBeInstant',
], function (msgBus, audio, gr, loader, gladButton, SKBeInstant) {
    var buttonInfo, buttonClose;
    var channelNum = 3;
    var left, right;
    var index = 0, minIndex = 0, maxIndex = 1;
    var ButtonBetDownChannel = 0, ButtonBetUpChannel = 0;
    var shouldShowTutorialWhenReinitial = false;
    var showTutorialAtBeginning = false;
    var warnShown = false;
    var warnReset = false;

    function showTutorial() {
        showTutorialPageByIndex(0);
        gr.lib._BG_dim.off('click');
        buttonInfo.show(false);
		gr.lib._BG_dim.show(true);
        gr.lib._tutorial.show(true);
        msgBus.publish('tutorialIsShown');
    }

    function hideTutorial() {
        gr.lib._tutorial.show(false);  
        buttonInfo.show(true); 
        gr.lib._BG_dim.show(false);
        msgBus.publish('tutorialIsHide');
        index = 0;
    }

    function onGameParametersUpdated() {
        gr.lib._versionText.autoFontFitText = true;
        gr.lib._versionText.setText(window._cacheFlag.gameVersion + ".CL" + window._cacheFlag.changeList + "_" + window._cacheFlag.buildNumber);
        // Prevent click the symbols when tutorial is shown
        gr.lib._BG_dim.on('click', function(event){
            event.stopPropagation();
        });
        if (SKBeInstant.isWLA()) {
            gr.lib._versionText.show(true);
        } else {
            gr.lib._versionText.show(false);
        }
        var options = {'avoidMultiTouch': true, 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92}; 
        buttonInfo = new gladButton(gr.lib._buttonInfo, "tutorialButton", options);
        buttonClose = new gladButton(gr.lib._buttonCloseTutorial, "buttonTictCost", options);
        left = new gladButton(gr.lib._tutorialLeftButton, "tutorialLeftButton", options);
        right = new gladButton(gr.lib._tutorialRightButton, "tutorialRightButton", options);
        if(SKBeInstant.config.customBehavior){
            if(SKBeInstant.config.customBehavior.showTutorialAtBeginning === true){
                showTutorialAtBeginning = true;
            }
        }else if(loader.i18n.gameConfig){
             if(loader.i18n.gameConfig.showTutorialAtBeginning === true){
                showTutorialAtBeginning = true;
            }
        }
        if (showTutorialAtBeginning === false) {
            buttonInfo.show(true);
            gr.lib._BG_dim.show(false);
            gr.lib._tutorial.show(false);
        }else{
            buttonInfo.show(false);
            gr.lib._BG_dim.show(true);
            gr.lib._tutorial.show(true);
        }
        buttonInfo.click(function () {
            showTutorial();
            audio.play('HelpPageOpen',1);
        });
        buttonClose.click(function () {
            hideTutorial();
            audio.play('HelpPageClose',1);
        });
        left.click(function () {
            index--;
            if (index < minIndex){
                index = maxIndex;
            }
            showTutorialPageByIndex(index);
            audio.play('ButtonBuy',1);
        });
        right.click(function () {
            index++;
            if (index > maxIndex){
                index = minIndex;
            }
            showTutorialPageByIndex(index);
            audio.play('ButtonBuy',1);
        });
        showTutorialPageByIndex(0);
        if(SKBeInstant.isWLA()){
            setVerticalCenterTxt(gr.lib._tutorialPage_00,loader.i18n.Game.WLA['tutorialPage']);
            setVerticalCenterTxt(gr.lib._tutorialPage_01,loader.i18n.Game.WLA['tutorialPage01']);
        }else{
            setVerticalCenterTxt(gr.lib._tutorialPage_00,loader.i18n.Game.Commercial['tutorialPage']);
            setVerticalCenterTxt(gr.lib._tutorialPage_01,loader.i18n.Game.Commercial['tutorialPage01']);           
        }
        gr.lib._tutorialTitleText.autoFontFitText = true;
        gr.lib._tutorialTitleText.setText(loader.i18n.Game.tutorial_title);
        gr.lib._closeTutorialText.autoFontFitText = true;
        gr.lib._closeTutorialText.setText(loader.i18n.Game.message_close);
        gr.lib._tutorialPage_01.pixiContainer.$text._style.leading = 10;
    }
    
    function showTutorialPageByIndex(index){
        hideAllTutorialPages();
        gr.lib['_tutorialPage_0' + index].show(true);
        gr.lib['_tutorialLightIconOn'+(index+1)].setImage('tutorialLightIconOn');
    }

    function hideAllTutorialPages(){
        for (var i = 0; i <= maxIndex; i++){
            gr.lib['_tutorialPage_0' + i].show(false);
            gr.lib['_tutorialLightIconOn'+(i+1)].setImage('tutorialLightIconOff');
        }
    }

    function setVerticalCenterTxt(textContainer, textValue) {
        textContainer.setText(textValue);
        var fontSize = parseInt(textContainer._currentStyle._font._size);
        var txtWidth = Number(textContainer.pixiContainer.$text.width);
        var boxWidth = Number(textContainer._currentStyle._width);
        while (txtWidth > boxWidth) {
            fontSize--;
            if (fontSize < 10) {
                break;
            }
            textContainer.updateCurrentStyle({
                '_font': {
                    '_size': fontSize
                }
            });
            txtWidth = Number(textContainer.pixiContainer.$text.width);
        }
        var txtHeight = Number(textContainer.pixiContainer.$text.height);
        var boxHeight = Number(textContainer._currentStyle._height);
        while (txtHeight > boxHeight) {
            fontSize--;
            if (fontSize < 10) {
                break;
            }
            textContainer.updateCurrentStyle({
                '_font': {
                    '_size': fontSize
                }
            });
            txtHeight = Number(textContainer.pixiContainer.$text.height);
        }
    }


    function onReInitialize() {
        if(shouldShowTutorialWhenReinitial){
            shouldShowTutorialWhenReinitial = false;
            if (showTutorialAtBeginning) {
                showTutorial();
            }else{
                msgBus.publish('tutorialIsHide');
            }
        }else{
            gr.lib._tutorial.show(false);
            buttonInfo.show(true);
            buttonInfo.enable(true);
        }
    }

    function hiddenInfo() {
		buttonInfo.enable(false);
	}
    
    function appearInfo(){
        buttonInfo.enable(true);
    }

    function onEnableUI() {
        // gr.lib._buttonInfo.show(true);
        buttonInfo.enable(true);
    }
    
    function showTutorialOnInitial(){
        buttonInfo.show(false);
		gr.lib._BG_dim.show(true);
        gr.lib._tutorial.show(true);
        msgBus.publish('tutorialIsShown');
    }
    
    function onInitialize(){
        if(showTutorialAtBeginning){
            showTutorialOnInitial();
        }else{
            msgBus.publish('tutorialIsHide');
        }
    }
    function onReStartUserInteraction(){
        buttonInfo.show(true);
    }
    function onStartUserInteraction(){
        if(SKBeInstant.config.gameType === 'ticketReady'){
            if (showTutorialAtBeginning) {
                showTutorialOnInitial();
            } else {
                msgBus.publish('tutorialIsHide');
            }
        }else{
            gr.lib._tutorial.show(false);
            buttonInfo.show(true);
        }
    }
    
    function onDisableUI() {
		buttonInfo.enable(false);
	}
    
    function onEnterResultScreenState() {
        gr.getTimer().setTimeout(function () {
            if (warnShown) {
                warnReset = true;
            } else {
                buttonInfo.enable(true);
            }
        }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);		
	}
    
    function onPlayerWantsToMoveToMoneyGame(){
        shouldShowTutorialWhenReinitial = true;
    }
    
    msgBus.subscribe('jLotterySKB.reset', onEnableUI);
	msgBus.subscribe('enableUI', onEnableUI);
    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('hiddenInfo', hiddenInfo);
    msgBus.subscribe('appearInfo', appearInfo);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
    msgBus.subscribe("playerWantsPlayAgain", appearInfo);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    
    msgBus.subscribe('warnIsShown', function () {
        warnShown = true;
    });
    msgBus.subscribe('warnIsHide', function () {
        warnShown = false;
        if (warnReset) {
            warnReset = false;
            buttonInfo.show(true);
        }
    });


    return {};
});