define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/utils/gladButton',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader'
], function (msgBus, audio, gr, SKBeInstant, gladButton, loader) {
    var audioDisabled = false;
    var audioOn, audioOff;
    var playResult;
    var MTMReinitial = false;
    var popUpDialog = false;
    var first = true;
    var hidden = false;
    var playResultAudio = false;

    function isEnableAudioDialog() {
        if (SKBeInstant.config.customBehavior) {
            if (SKBeInstant.config.customBehavior.enableAudioDialog === true || SKBeInstant.config.customBehavior.enableAudioDialog === "true" || SKBeInstant.config.customBehavior.enableAudioDialog === 1) {
                popUpDialog = true;
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.enableAudioDialog === true || loader.i18n.gameConfig.enableAudioDialog === "true" || loader.i18n.gameConfig.enableAudioDialog === 1) {
                popUpDialog = true;
            }
        }
    }

    function audioSwitch() {
        if (audioDisabled) {
            gr.lib._buttonAudioOn.show(true);
            gr.lib._buttonAudioOff.show(false);
            audioDisabled = false;
        } else {
            gr.lib._buttonAudioOn.show(false);
            gr.lib._buttonAudioOff.show(true);
            audioDisabled = true;
        }
        audio.muteAll(audioDisabled);
        audio.gameAudioControlChanged(audioDisabled);
        if (!audioDisabled&&!first) {  
            audio.play('ButtonBuy', 1);
        }
    }

    function onConsoleControlChanged(data) {
        if (data.option === 'sound') {
            var isMuted = audio.consoleAudioControlChanged(data);
            if (isMuted) {
                gr.lib._buttonAudioOn.show(false);
                gr.lib._buttonAudioOff.show(true);
                audioDisabled = true;
            } else {
                gr.lib._buttonAudioOn.show(true);
                gr.lib._buttonAudioOff.show(false);
                audioDisabled = false;
            }
            audio.muteAll(audioDisabled);
        }
    }

    function onGameParametersUpdated() {
        var scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true };
        if (SKBeInstant.isSKB()) {
            isEnableAudioDialog();
            if (popUpDialog) {
                audio.enableAudioDialog(true);  //set enable the dialog
            }
        }

        audioDisabled = SKBeInstant.config.soundStartDisabled;
        if (SKBeInstant.config.assetPack !== 'desktop' && popUpDialog) {
            audioDisabled = true;
        }
        audioOn = new gladButton(gr.lib._buttonAudioOn, "buttonAudioOn", scaleType);
        audioOff = new gladButton(gr.lib._buttonAudioOff, "buttonAudioOff", scaleType);

        if (audioDisabled) {
            gr.lib._buttonAudioOn.show(false);
            gr.lib._buttonAudioOff.show(true);
        } else {
            gr.lib._buttonAudioOn.show(true);
            gr.lib._buttonAudioOff.show(false);
        }
        audio.muteAll(audioDisabled);
        audioOn.click(audioSwitch);
        audioOff.click(audioSwitch);
    }

    function onStartUserInteraction(data) {
        playResult = data.playResult;
        if (SKBeInstant.config.gameType === 'ticketReady') {
            return;
        } else {
            gr.getTimer().setTimeout(function () {
                audio.play('MusicLoop1', 0, true);
            }, 0);
        }
    }

    function onEnterResultScreenState() {
        if (hidden) {
            playResultAudio = true;
        } else {
            playResultAudio = false;
            if (playResult === 'WIN') {
                audio.play('MusicLoopTermWin', 0);
            } else {
                audio.play('MusicLoopTermLose', 0);
            }
        }
    }

    function reset() {
        audio.stopAllChannel();
    }

    function onReInitialize() {
        audio.stopAllChannel();
        if (MTMReinitial) {
            MTMReinitial = false;
        }
    }

    //    function onInitialize(){
    //		if (SKBeInstant.config.screenEnvironment !== 'desktop'){
    //			return;
    //		}else{
    //			// this for screenEnvironment device and tablet
    //			if (config.audio && config.audio.gameInit) {
    //                gr.getTimer().setTimeout(function() {
    //                    audio.play(config.audio.gameInit.name, config.audio.gameInit.channel);
    //                }, 0);
    //			}
    //		}
    //    }

    function onPlayerSelectedAudioWhenGameLaunch(data) {
        // retreve the rgs sound config parameter for desktop.
        //        if (SKBeInstant.config.screenEnvironment === 'desktop'){
        //			audio.muteAll(audioDisabled);
        //			audio.gameAudioControlChanged(audioDisabled);
        //            return;
        //        }else{
        if (popUpDialog) {
            audioDisabled = data;
            audioSwitch();
        } else {
            audio.muteAll(audioDisabled);
        }
        first = false;
        //        }

        if (SKBeInstant.config.gameType === 'ticketReady') {
            gr.getTimer().setTimeout(function () {
                audio.play('MusicLoop1', 0, true);
            }, 0);
        }
    }

    function onPlayerWantsToMoveToMoneyGame() {
        MTMReinitial = true;
    }

    msgBus.subscribe('jLotteryGame.playerWantsToExit', function () {
        audio.stopAllChannel();
    });

    function onReStartUserInteraction(data) {
        playResult = data.playResult;
		audio.play('MusicLoop1', 0, true);
    }

    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
    msgBus.subscribe('jLotterySKB.reset', reset);
    //    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('audioPlayer.playerSelectedWhenGameLaunch', onPlayerSelectedAudioWhenGameLaunch);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoneyGame);

    msgBus.subscribe('resourceLoaded', function () {
        if (!SKBeInstant.isSKB()) {
            isEnableAudioDialog();
            if (popUpDialog) {
                audio.enableAudioDialog(true);  //set enable the dialog
            }
        }
    });


    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            hidden = true;
        } else {
            hidden = false;
            if (playResultAudio) {
                onEnterResultScreenState();
            }
        }
    });

    return {};
});