/**
 * @module game/playAnimationController
 * @description 
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/utils/gladButton',
    './lightFlyAnimation',
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton, LightFlyAnimation) {
    var prizeTable = {}; //To record ticket prize table
    var tutorialIsShown = false;
    var playResult;
    var symbolCh = 2;
    var revealAll = false;
    var jackpot = 0;
    var onlyBonus = 0;
    var baseTransitions,bonusTransitions;
    var clickedNum = 0,clickRuneNum = 0;
    var winValue = 0;
    var BaseGameArray = [],RuneArray = [],Amulet = [],RuneRandomArr = [];
    var runeNum = 0,amuletNum = 0;
    var isRuneBonus = false,isAmuletBonus = false,isInit = true, firstTicket = true;
    let gameError = false;
    let buttonRules = {'avoidMultiTouch': true,'automaticSetImg':true};
    let symbolButton = {},runeButton = {},amuletButton = {};
    let haveReveal = true;
    const lightAnimations = {receptions:[], free:[], used:[]};
    const baseLightAnimations = [];
    const rune2LightAnimations = [];

    function resetAll() {
        tutorialIsShown = false;
        BaseGameArray = [];
        RuneArray = [];
        Amulet = [];
        RuneRandomArr = [];
        symbolCh = 2;
        playResult = null;
        revealAll = false;
        jackpot = 0;
        onlyBonus = 0;
        clickedNum = 0;
        winValue = 0;
        clickRuneNum = 0;
        runeNum = 0;
        amuletNum = 0;
        isRuneBonus = false;
        gameError = false;
        isAmuletBonus = false;
        if(isInit){
            isInit = false;
        }
        initialBaseGame();
        resetSymbols();
        initialRuneBonus();
        initialAmuletBonus();
    }

    function resetSymbols(){
        // for (let i = 1; i < 4; i++) {
        //     for (let j = 1; j < 6; j++) {
        //         let sprite = gr.lib['_runeSymbols_'+i+'_'+j];
        //         let data = sprite.data;
        //         sprite.updateCurrentStyle({
        //             "_top":data._style._top,
        //             "_left":data._style._left,
        //         });
        //     }
        // } 
        gr.animMap._doorResetAnim.play();
    }

    function cloneGladAnim() {
        for (var i = 1; i < 9; i++){
            gr.animMap._bonusStoneRuneAnim_1.clone(['_bonusAStoneBG_'+i], '_bonusStoneRuneAnim_'+i);
        }
        for(var k = 1;k < 7;k++){
            gr.animMap._bonusBwinValueAnim_1.clone(['_bonusBwinNumbleValue_'+k],'_bonusBwinValueAnim_'+k);
        }
        for(var c = 1;c < 5;c++){
            gr.animMap._bonusDoorRuneAnimA_1.clone(['_bonusDoorRuneWin_'+c],'_bonusDoorRuneAnimA_'+c);
            gr.animMap._bonusDoorWinValueAnim_1.clone(['_bonusDoorWinValue_'+c],'_bonusDoorWinValueAnim_'+c);
            gr.animMap._bonusDoorAmuletSymbolsAnim.clone(['_bonusDoorAmuletSymbols_'+c],'_bonusDoorAmuletSymbolsAnim_'+c);
        }
        for(var a = 1;a < 4;a++){
            for(var b = 1;b < 6;b++){
                gr.animMap._noWinSymbolsAnim_1.clone(['_noWinSymbols_'+a+'_'+b],'_noWinSymbolsAnim_'+a+'_'+b);
                gr.animMap._runeSymbolsAnim.clone(['_runeSymbols_'+a+'_'+b],'_runeSymbolsAnim_'+a+'_'+b);
            }
        }
    }

    function onStartUserInteraction(data) {
        var splitArray;
        if (data.scenario) {
            splitArray = data.scenario.split('|');
            BaseGameArray = splitArray[0].split(',');
            RuneArray = splitArray[1].split(',');
            Amulet = splitArray[2];
            playResult = data.playResult;
            winValue = data.prizeValue;
        } else {
            return;
        }
        for (let i = 0; i < data.prizeTable.length; i++) {
            prizeTable[data.prizeTable[i].description] = Number(data.prizeTable[i].prize);
        }
        let index = 0;
        for (var i = 1; i < 4; i++) {
            for (var j = 1; j < 6; j++) {
                gr.lib['_BaseSymbolEffect_'+i+'_'+j].show(true);
                if(firstTicket){
                    symbolButton[index].click(gr.lib['_BaseSymbolEffect_'+i+'_'+j].revealFun);
                }
                gr.lib['_BaseSymbolEffect_'+i+'_'+j].pixiContainer.cursor = "pointer";
                gr.lib['_BaseSymbolEffect_'+i+'_'+j].pixiContainer.interactive = true;
                gr.lib['_BaseSymbolEffect_'+i+'_'+j].on('mouseover', symbolAnimStop);
                gr.lib['_BaseSymbolEffect_'+i+'_'+j].on('mouseout', symbolAnimstart);
                index++;
            }
           
        }
        firstTicket = false;
        symbolAnimstart(true);     
    }

    function symbolAnimStop(){
        for (var i = 1; i < 4; i++) {
            for (var j = 1; j < 6; j++) {
                if(!gr.lib['_BaseSymbolEffect_'+i+'_'+j].reveal){
                    gr.lib['_BaseSymbolEffect_'+i+'_'+j].stopPlay();
                    gr.lib['_BaseSymbolEffect_'+i+'_'+j].show(false);
                }
            }
        }
        gr.lib[this.name].show(true);
        gr.lib[this.name].gotoAndPlay('BaseSymbolEffect',0.2,true);
        hitTriangleAreaButton(gr.lib[this.name]);
    }

    function symbolAnimstart(isTicket){
        if(isTicket){
            for (var i = 1; i < 4; i++) {
                for (var j = 1; j < 6; j++) {
                    if(!gr.lib['_BaseSymbolEffect_'+i+'_'+j].reveal){
                        gr.lib['_BaseSymbolEffect_'+i+'_'+j].show(true);
                        gr.lib['_BaseSymbolEffect_'+i+'_'+j].gotoAndPlay('BaseSymbolEffect',0.15,true);
                        hitTriangleAreaButton(gr.lib['_BaseSymbolEffect_'+i+'_'+j]);
                    }
                }
            }
        }else{
             gr.getTimer().setTimeout(function(){
                for (var i = 1; i < 4; i++) {
                    for (var j = 1; j < 6; j++) {
                        if(!gr.lib['_BaseSymbolEffect_'+i+'_'+j].reveal){
                            gr.lib['_BaseSymbolEffect_'+i+'_'+j].show(true);
                            gr.lib['_BaseSymbolEffect_'+i+'_'+j].gotoAndPlay('BaseSymbolEffect',0.15,true);
                            hitTriangleAreaButton(gr.lib['_BaseSymbolEffect_'+i+'_'+j]);
                        }
                    }
                }
            },300);
        }
       
    }
    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }
    function onReInitialize() {
        resetAll();
    }

    function setSymbolRevealFun(symbol,i,j) {
        symbol.revealFun = function () {
            if(tutorialIsShown){
                return;
            }
            clickedNum++;
            console.log('clickedNum:'+clickedNum);
            symbol.reveal = true;
            if(clickedNum ===15){
                msgBus.publish('hiddenInfo');
                gr.lib._buttonRevealAll.show(false);
                gr.getTimer().setTimeout(function(){
                    allSymbolsRevealed();
                },3600);
            }else{
                if(symbol.needPlayAnim){
                    symbolAnimstart();
                }
            }
            symbolCh++;
            if(symbolCh>6){
                symbolCh = 3;
            }
            symbol.pixiContainer.interactive = false;
            symbol.pixiContainer.$sprite.cursor = "default";
            var index = symbol.gameIndex;
            var prizeDetail = BaseGameArray[index];
            var isWin,Iscollection;
            isWin = prizeDetail.substring(0,1);
            Iscollection = prizeDetail.substring(1,2);
            if(symbol.needPlayAnim){
                if(isWin==="Y"){
                    audio.play('SymbolWinning', symbolCh+4);
                }else{
                    audio.play('SymbolReveal', symbolCh+4);
                }
                if(Iscollection<5){
                    if(Iscollection>0){
                        audio.play('SymbolRune', symbolCh);
                    }
                }else{
                    audio.play('SymbolAmulet', symbolCh);
                }
            }else{
                if(isWin==="Y"){
                    audio.play('SymbolWinningQuick', symbolCh+4);
                }else{
                    audio.play('SymbolRevealQuick', symbolCh+4);
                }
                if(Iscollection<5){
                    if(Iscollection>0){
                        audio.play('SymbolRuneQuick', symbolCh);
                    }
                }else{
                    audio.play('SymbolAmuletQuick', symbolCh);
                }
            }
            gr.lib['_symbolsBase_'+i+'_'+j].show(false);
            gr.lib['_BaseSymbolEffect_'+i+'_'+j].show(false);
            gr.lib['_BaseBoomEffect_'+i+'_'+j].show(true);
            gr.lib['_BaseBoomEffect_'+i+'_'+j].gotoAndPlay('BaseSymbolBoomEffect',1,false);
            gr.lib['_BaseBoomEffect_'+i+'_'+j].onComplete = function(){
                gr.lib['_BaseBoomEffect_'+i+'_'+j].show(false);
                if(isWin==="Y"){
                    gr.lib['_winSymbols_'+i+'_'+j].show(true);
                    gr.lib['_winSymbols_'+i+'_'+j].gotoAndPlay('WinningSymbols',0.5,false);
                    gr.lib['_winSymbols_'+i+'_'+j].onComplete = function(){
                        gr.lib['_winSymbolsLoad_'+i+'_'+j].show(true);
                    };
                    msgBus.publish("WinningSymbolReveal");
                }else{
                    gr.lib['_noWinSymbols_'+i+'_'+j].show(true);
                    gr.animMap['_noWinSymbolsAnim_'+i+'_'+j].play();
                }
                if(Iscollection<5){
                    if(Iscollection>0){
                        gr.lib['_runeSymbols_'+i+'_'+j].show(true);
                        gr.lib['_runeSymbols_'+i+'_'+j].setImage('SymbolsR_'+1); 
                        gr.lib['_runeSymbols_'+i+'_'+j].updateCurrentStyle({'_opacity': 1});
                        gr.animMap['_runeSymbolsAnim_'+i+'_'+j].play();
                        // fadeInAmulet(gr.lib['_runeSymbols_'+i+'_'+j],0.03);
                        if(symbol.needPlayAnim){
                            gr.lib['_RuneSymbolsLight_'+i+'_'+j].show(true);
                            gr.lib['_RuneSymbolsLight_'+i+'_'+j].gotoAndPlay('AmuletMeterBoom',0.3,false);
                            gr.getTimer().setTimeout(function(){
                                fadeOutAmulet(gr.lib['_runeSymbols_'+i+'_'+j],0.08,i,j,Iscollection);
                            },600);
                            gr.lib['_RuneSymbolsLight_'+i+'_'+j].onComplete = function(){
                                gr.lib['_RuneSymbolsLight_'+i+'_'+j].show(false);
                                gr.lib['_runeEffect_'+Iscollection].show(true);
                                gr.animMap._runeBonusMeterAnim.play();
                                gr.lib['_runeEffect_'+Iscollection].gotoAndPlay('AmuletMeterBoom',1,false);
                                gr.lib['_runeEffect_'+Iscollection].onComplete=function(){
                                    gr.lib['_runeEffect_'+Iscollection].show(false);
                                    runeBonusLight(Iscollection);
                                };
                            };
                        }else{
                            gr.getTimer().setTimeout(function(){
                                fadeOutAmulet(gr.lib['_runeSymbols_'+i+'_'+j],0.08);
                            },600);
                            runeBonusLight(Iscollection);
                        }
                    }
                }else{
                    gr.lib['_runeSymbols_'+i+'_'+j].show(true);
                    gr.lib['_runeSymbols_'+i+'_'+j].setImage('SymbolsA_'+1);
                    gr.lib['_runeSymbols_'+i+'_'+j].updateCurrentStyle({'_opacity': 1});
                    // fadeInAmulet(gr.lib['_runeSymbols_'+i+'_'+j],0.03);
                    gr.animMap['_runeSymbolsAnim_'+i+'_'+j].play();
                    if(symbol.needPlayAnim){
                        gr.lib['_RuneSymbolsLight_'+i+'_'+j].show(true);
                        gr.lib['_RuneSymbolsLight_'+i+'_'+j].gotoAndPlay('AmuletMeterBoom',0.3,false);
                        gr.getTimer().setTimeout(function(){
                            fadeOutAmulet(gr.lib['_runeSymbols_'+i+'_'+j],0.08,i,j,Iscollection);
                        },600);
                        gr.lib['_RuneSymbolsLight_'+i+'_'+j].onComplete = function(){
                            gr.lib['_RuneSymbolsLight_'+i+'_'+j].show(false);
                            gr.lib['_amuletEffect_'+(Iscollection-4)].show(true);
                            gr.animMap._amuletBonusMeterAnim.play();
                            gr.lib['_amuletEffect_'+(Iscollection-4)].gotoAndPlay('AmuletMeterBoom',1,false);
                            gr.lib['_amuletEffect_'+(Iscollection-4)].onComplete=function(){
                                gr.lib['_amuletEffect_'+(Iscollection-4)].show(false);
                                amuletBonusLight(Iscollection,1);
                                // gr.lib['_AmuletMeterAnim_2_'+(Iscollection-4)].onComplete = function(){
                                //     gr.lib['_AmuletMeterAnim_2_'+(Iscollection-4)].show(false);
                                   
                                // };
                            };
                        };
                    }else{
                        gr.getTimer().setTimeout(function(){
                            fadeOutAmulet(gr.lib['_runeSymbols_'+i+'_'+j],0.08);
                        },600);
                        gr.lib['_AmuletMeterAnim_2_'+(Iscollection-4)].show(true);
                        gr.lib['_AmuletMeterAnim_2_'+(Iscollection-4)].gotoAndPlay('AmuletMeterAnim',0.6,true);
                        amuletBonusLight(Iscollection,1);
                        // gr.lib['_AmuletMeterAnim_2_'+(Iscollection-4)].onComplete = function(){
                        //     gr.lib['_AmuletMeterAnim_2_'+(Iscollection-4)].show(false);
                        // };
                    }
                    
                }
            };
        };
    }

    function setRuneSymbolRevealFun(symbol) {
        symbol.revealFun = function () {
            if(tutorialIsShown){
                return;
            }
            clickRuneNum++;
            symbol.reveal = true;
            console.log('clickRuneNum:'+clickRuneNum);
            if(clickRuneNum ===4){
                msgBus.publish('allRuneSymbolsRevealed');
                msgBus.publish('hiddenInfo');
                allRuneSymbolsRevealed();
            }
            symbolCh++;
            if(symbolCh>6){
                symbolCh = 3;
            }
            let currentIndex = RuneRandomArr[clickRuneNum-1];
            let prizeDetail = null;
            if(RuneArray[currentIndex-1].length!==1){ //The winning type is money
                audio.play('BonusRuneSelectPrize',symbolCh);
            }else{
                audio.play('BonusRuneSelectAmulet',symbolCh);
            }
            symbol.pixiContainer.interactive = false;
            symbol.pixiContainer.$sprite.cursor = "default";
            gr.lib._numbleText.setText(4-clickRuneNum);
            if(Number(4-clickRuneNum)===0){
                gr.getTimer().setTimeout(function(){
                    gr.lib._numbleText.show(false);
                },900);
            }
            gr.animMap['_pickNumbleAnim'].play();
            gr.lib['_bonusAStoneLight_'+symbol.gameIndex].show(false);
            gr.lib['_bonusAStoneBG_'+symbol.gameIndex].show(true);
            gr.lib['_bonusAStoneBG_'+symbol.gameIndex].setImage('bonusDoorRuneWin_'+currentIndex);
            gr.animMap['_bonusStoneRuneAnim_'+symbol.gameIndex].play();
            gr.animMap['_bonusStoneRuneAnim_'+symbol.gameIndex]._onComplete = function(){
                gr.lib['_bonusAStoneBG_'+symbol.gameIndex].setImage('bonusStone'+currentIndex);
            };
            gr.lib['_bonusDoorRuneWin_'+currentIndex].show(true);
            gr.animMap['_bonusDoorRuneAnimA_'+currentIndex].play();
            gr.lib['_bonusDoorRune_'+currentIndex].show(false);
            gr.getTimer().setTimeout(function(){
                gr.lib['_bonusAStoneAnim_'+symbol.gameIndex].show(true);
                gr.lib['_bonusAStoneAnim_'+symbol.gameIndex].gotoAndPlay('runeBonusDoorEffect1',1,false);
            },500);
            gr.animMap['_bonusDoorRuneAnimA_'+currentIndex]._onComplete = function(){
                gr.lib['_bonusDoorRuneWin_'+currentIndex].show(false);
                gr.lib['_bonusDoorRune_'+currentIndex].show(true);
            };
            gr.lib['_bonusAStoneAnim_'+symbol.gameIndex].onComplete = function(){
                // gr.lib['_bonusAStoneBG_'+symbol.gameIndex].show(false);
                const anim = getAFreeLightAnim();
                if(RuneArray[currentIndex-1].length!==1){ //The winning type is money
                    prizeDetail = prizeTable[RuneArray[currentIndex-1]];
                    jackpot += prizeDetail;
                    onlyBonus += prizeDetail;
                    gr.lib['_bonusDoorWinValue_'+currentIndex+'_1'].setText(SKBeInstant.formatCurrency(prizeDetail).formattedAmount);
                    gr.lib['_bonusDoorWinValue_'+currentIndex+'_2'].setText(SKBeInstant.formatCurrency(prizeDetail).formattedAmount);
                    anim.moveTo(symbol, gr.lib['_doorRuneEffect_'+currentIndex],600,{num:currentIndex},{whetherMoney:false});
                    gr.getTimer().setTimeout(function(){
                        if(jackpot>winValue){
                            msgBus.publish('winboxError', {errorCode: '29000'});
                        }else{
                            msgBus.publish('updateWinValue',{value:jackpot});
                            gr.lib._bonusATotalWinValue_1.setText(SKBeInstant.formatCurrency(onlyBonus).formattedAmount);
                            gr.lib._bonusATotalWinValue_2.setText(SKBeInstant.formatCurrency(onlyBonus).formattedAmount);
                        }
                    },600);
                }else{
                    anim.moveTo(symbol, gr.lib['_doorRuneEffect_'+currentIndex],600,{num:currentIndex},{whetherMoney:true,amuletNum:RuneArray[currentIndex-1]});
                }
                gr.lib['_bonusAStoneAnim_'+symbol.gameIndex].show(false);
            };
        };
    }

    function getRandomSymbol(){
        let arr = [];
        while (arr.length<4){
            let num = Math.floor(4*Math.random()+1);
            if(arr.indexOf(num)==-1){
                arr.push(num);
            }
        }
        return arr;
    }

    function runeBonusLight(num){
        var numParams = Number(num);
        runeNum++;
        gr.lib['_AmuletMeterAnim_1_'+num].show(true);
        gr.lib['_AmuletMeterAnim_1_'+num].gotoAndPlay('AmuletMeterAnim',0.6,true);
        gr.lib['_RuneSymbols_'+numParams].setImage('RuneSymbols_1');
        if(runeNum===4){
            isRuneBonus = true;
            gr.lib._runeBonusWinText.show(true);
            audio.play('BonusTriggeredRune',2);
            gr.lib._AmuletMeterLightEffect_1.show(true);
            gr.lib._AmuletMeterLightEffect_1.gotoAndPlay('AmuletMeterLightAnim',0.15,true);
        }
    }

    function amuletBonusLight(num,type){
        amuletNum++;
        if(amuletNum===4){
            isAmuletBonus = true;
            if(type!==2){
                audio.play('BonusTriggeredAmulet',1);
                gr.lib._amuletBonusWinText.show(true);
                gr.lib._AmuletMeterLightEffect_2.show(true);
                gr.lib._AmuletMeterLightEffect_2.gotoAndPlay('AmuletMeterLightAnim',0.15,true);
                gr.lib._runeBonusAmuletMeterLightEffect_1.show(true);
                gr.lib._runeBonusAmuletMeterLightEffect_1.gotoAndPlay('AmuletMeterLightAnim',0.15,true);
            }
            gr.lib._bonusAmuletWinText.show(true);
        }
        var numParams = Number(num);
        gr.lib['_AmuletMeterAnim_2_'+(numParams-4)].show(true);
        gr.lib['_AmuletMeterAnim_2_'+(numParams-4)].gotoAndPlay('AmuletMeterAnim',0.6,true);
        gr.lib['_runeBonusAmuletMeterAnim_'+(numParams-4)].show(true);
        gr.lib['_runeBonusAmuletMeterAnim_'+(numParams-4)].gotoAndPlay('AmuletMeterAnim',0.6,true);
        if(type!==2){
            gr.lib['_amuletSymbols_'+(numParams-4)].setImage('AmuletSymbols_1');
        }
        gr.lib['_bonusAmuletSymbols_'+(numParams-4)].setImage('AmuletSymbols_1');
       
    }

    function allSymbolsRevealed(){
        if(gameError){
            return;
        }
        if(isRuneBonus){
            gr.lib._baseTransitions.show(true);
            gr.lib._baseTransitions.gotoAndPlay('Sand',baseTransitions,false);
            audio.play('BonusTransitionRune',1);
            audio.play('MusicLoop2',0,true);
            RuneRandomArr = getRandomSymbol();
            gr.lib._baseTransitions.onComplete = function(){
                initRuneAllLightAnims();
                initRune2AllLightAnims();
                msgBus.publish('appearInfo');
                gr.lib._baseTransitions.show(false);
                gr.lib._baseGameSence.show(false);
                if(haveReveal){
                    gr.lib._runeBonusRevealAll.show(true);
                }
                gr.lib._bonusAGameSence.show(true);
            };
        }else if(isAmuletBonus){
            audio.play('BonusTransitionRune',1);
            audio.play('MusicLoop3',0,true);
            gr.lib._baseTransitions.show(true);
            gr.lib._baseTransitions.gotoAndPlay('Sand',baseTransitions,false);
            gr.lib._baseTransitions.onComplete = function(){
                gr.lib._baseTransitions.show(false);
                gr.lib._bonusBTotalWinValue_1.setText(SKBeInstant.formatCurrency(jackpot).formattedAmount);
                gr.lib._bonusBTotalWinValue_2.setText(SKBeInstant.formatCurrency(jackpot).formattedAmount);
                gr.lib._bonusTransitions.show(false);
                gr.lib._bonusAGameSence.show(false);
                msgBus.publish('appearInfo');
                if(haveReveal){
                    gr.lib._amuletBonusRevealAll.show(true);
                }
                gr.lib._bonusBGameSence.show(true);
            };
        }else{
            if(jackpot!==winValue){
                msgBus.publish('winboxError', {errorCode: '29000'});
                return;
            }
            msgBus.publish('allRevealed');
        }
    }

    function initRuneAllLightAnims(){
        if(lightAnimations.receptions.length===0){
            for(let i = 0 ; i < 4; i++){
                lightAnimations["lfa"+i] = new LightFlyAnimation('runeBonusDoorEffect2','runeBonusDoorEffect2_0001','_effectBAnchro_','_doorRuneEffectB_','margin');
                lightAnimations.receptions.push("lfa"+i);
                lightAnimations.free.push("lfa"+i);
            }
        }
        else{
            lightAnimations.free = [...lightAnimations.used];
            lightAnimations.used = [];
        }
    }

    function initBaseAllLightAnims(){
        if(baseLightAnimations.length===0){
            for(let i = 1 ; i < 4; i++){
                for(let k = 1;k < 6; k++){
                    baseLightAnimations["lfa_"+i+'_'+k] = new LightFlyAnimation('feixingtexiao','feixingtexiao_0001','_effectBaseAnchro_','_feixingtexiaoEffect_','complement');
                }
            }
        }
    }

    function initRune2AllLightAnims(){
        if(rune2LightAnimations.length===0){
            for(let i = 1 ; i < 5; i++){
                rune2LightAnimations["Anim_"+i] = new LightFlyAnimation('feixingtexiao','feixingtexiao_0001','_effectCAnchro_','_doorRuneEffectC_','complement');
            }
        }
    }

    function getAFreeLightAnim(){
        if(lightAnimations.free.length !== 0){
            const index = lightAnimations.free.shift();
            lightAnimations.used.push(index);
            return lightAnimations[index];
        }
    }

    function allRuneSymbolsRevealed(){
        gr.lib._runeBonusRevealAll.show(false);
        for(let i = 1; i<9; i++){
            gr.lib['_bonusAStoneButton_'+i].pixiContainer.interactive = false;
            gr.lib['_bonusAStoneButton_'+i].pixiContainer.$sprite.cursor = "default";
            gr.lib['_bonusAStoneLight_'+i].show(false);
            if(!gr.lib['_bonusAStoneButton_'+i].reveal){
                 gr.lib['_bonusStoneRune_'+i].show(true);
            }
        }
        gr.getTimer().setTimeout(function(){
            if(gameError){
                return;
            }
            if(isAmuletBonus){
                gr.lib._numbleText.show(false);
                for(let i = 1; i<9; i++){
                    gr.lib['_bonusStoneRune_'+i].show(false);
                    gr.lib['_bonusAStoneBG_'+i].show(false);
                }
                for(let i = 1; i<5; i++){
                    gr.lib['_bonusDoorAmuletSymbols_'+i].show(false);
                    gr.lib['_bonusDoorWinValue_'+i+'_1'].show(false);
                    gr.lib['_bonusDoorWinValue_'+i+'_2'].show(false);
                }
                gr.lib._doorEffect1.show(true);
                gr.animMap._doorEffectAnim.play();
                audio.play('BonusTransitionAmulet',1);
                gr.getTimer().setTimeout(function(){
                    gr.lib._bonusBGameSence.show(true);
                    gr.lib._bonusBGameSence.updateCurrentStyle({'_opacity': 0});
                    requestAnimationFrame(toAmultSence);
                },2800);
                gr.animMap._doorEffectAnim._onComplete = function(){
                    audio.play('MusicLoop3',0,true);
                    gr.lib._bonusBTotalWinValue_1.setText(SKBeInstant.formatCurrency(jackpot).formattedAmount);
                    gr.lib._bonusBTotalWinValue_2.setText(SKBeInstant.formatCurrency(jackpot).formattedAmount);
                    msgBus.publish('appearInfo');
                    if(haveReveal){
                        gr.lib._amuletBonusRevealAll.show(true);
                    }
                };
                
            }else{
                changeGameSence();
            }
        },4500);
        
    }


    function initialBaseGame(){
        let index = 0;
        for (let i = 1; i < 4; i++) {
            for (let j = 1; j < 6; j++) {
                gr.lib['_symbolsBase_'+i+'_'+j].show(true);
                gr.lib['_BaseSymbolEffect_'+i+'_'+j].needPlayAnim = true;
                gr.lib['_BaseSymbolEffect_'+i+'_'+j].reveal = false;
                gr.lib['_BaseSymbolEffect_'+i+'_'+j].gameIndex = index;
                symbolButton[index] = new gladButton(gr.lib['_BaseSymbolEffect_'+i+'_'+j], "baseSymbol",buttonRules);
                setSymbolRevealFun(gr.lib['_BaseSymbolEffect_'+i+'_'+j],i,j);
                gr.lib['_winSymbols_'+ i+'_'+j].show(false);
                gr.lib['_winSymbolsLoad_'+ i+'_'+j].show(false);
                gr.lib['_winSymbolsLoad_'+ i+'_'+j].gotoAndPlay('WinningSymbolsLoad',0.2,true);
                gr.lib['_noWinSymbols_'+i+'_'+j].show(false);
                gr.lib['_BaseSymbolBoomEffect_'+i+'_'+j].show(false);
                gr.lib['_BaseSymbolEffect_'+i+'_'+j].show(false);
                gr.lib['_RuneSymbolsLight_'+i+'_'+j].show(false);
                gr.lib['_runeSymbols_'+i+'_'+j].show(false);
                gr.lib['_effectBaseAnchro_'+i+'_'+j].show(false);
                index ++;
            }
        } 
        for(let k = 1;k < 5;k++){
            gr.lib['_amuletEffect_'+k].show(false);
            gr.lib['_runeEffect_'+k].show(false);
            gr.lib['_RuneSymbols_'+k].setImage('RuneSymbolsInactive_1');
            gr.lib['_amuletSymbols_'+k].setImage('AmuletSymbolsInactive_1');
        }
        for(let j = 1;j < 3;j++){
            gr.lib['_AmuletMeterLightEffect_'+j].show(false);
            for(let k = 1;k < 5;k++){
                gr.lib['_AmuletMeterAnim_'+j+'_'+k].show(false);
            }
        }  
        gr.lib._amuletBonusWinText.show(false);
        gr.lib._runeBonusWinText.show(false);
        initBaseAllLightAnims();
    }


    function initialRuneBonus(){
        gr.lib._bonusAGameSence.updateCurrentStyle({'_opacity': 1});
        gr.lib._bonusAGameSence.show(false);
        gr.lib._numbleText.setText('4');
        gr.lib._bonusATotalWinValue_1.setText('');
        gr.lib._bonusATotalWinValue_2.setText('');
       
        gr.lib._doorEffect1.show(false);
        gr.lib._runeBonusAmuletMeterLightEffect_1.show(false);
        gr.lib._fire_1.gotoAndPlay('fire',0.2,true);
        if(gr.lib._fire_2){
            gr.lib._fire_2.gotoAndPlay('fire',0.2,true);
        }
        for(let i = 1; i<5; i++){
            gr.lib['_bonusAmuletSymbols_'+i].setImage('AmuletSymbolsInactive_'+i);
            gr.lib['_bonusDoorWinValue_'+i+'_1'].show(false);
            gr.lib['_bonusDoorWinValue_'+i+'_2'].show(false);
            gr.lib['_bonusDoorRune_'+i].show(true);
            gr.lib['_bonusDoorRuneWin_'+i].show(false);
            gr.lib['_bonusDoorAmuletSymbols_'+i].show(false);
            gr.lib['_runeBonusAmuletMeterAnim_'+i].show(false);
            gr.lib['_bonusAmuletEffect_'+i].show(false);
            gr.lib['_doorRuneEffect_'+i].show(false);
            gr.lib['_effectCAnchro_'+i].show(false);
            gr.lib['_bonusAmuletSymbols_'+i].setImage('AmuletSymbolsInactive_1');
        }
        gr.lib._bonusAmuletWinText.show(false);
        for(let i = 1; i<9; i++){
            gr.lib['_bonusStoneRune_'+i].show(false);
            if(gr.lib['_effectBAnchro_'+i]){
                gr.lib['_effectBAnchro_'+i].show(false);
            }
            gr.lib['_bonusAStoneBG_'+i].updateCurrentStyle({'_opacity':1});
            gr.lib['_bonusAStoneButton_'+i].gameIndex = i;
            gr.lib['_bonusAStoneButton_'+i].reveal = false;
            gr.lib['_bonusAStoneButton_'+i].needPlayAnim = true;
            gr.lib['_bonusAStoneButton_'+i].pixiContainer.$sprite.cursor = "pointer";
            gr.lib['_bonusAStoneButton_'+i].pixiContainer.interactive = true;
            runeButton[i] = new gladButton(gr.lib['_bonusAStoneButton_'+i], '',buttonRules);
            setRuneSymbolRevealFun(gr.lib['_bonusAStoneButton_'+i]);
            if(isInit){
                runeButton[i].click(gr.lib['_bonusAStoneButton_'+i].revealFun);
            }
            hitRectangleAreaButton(gr.lib['_bonusAStoneLight_'+i],15,15,42,42);
            gr.lib['_bonusAStoneLight_'+i].show(true);
            gr.lib['_bonusAStoneLight_'+i].gotoAndPlay('bonusDoorLight',0.15,true);
            gr.lib['_bonusAStoneAnim_'+i].show(false);
            gr.lib['_bonusAStoneBG_'+i].show(false);
        }
    }

    function initialAmuletBonus(){
        gr.lib._bonusBGameSence.updateCurrentStyle({'_opacity': 1});
        gr.lib._bonusBGameSence.show(false);
        gr.lib._bonusBTotalWinValue_1.setText('');
        gr.lib._bonusBTotalWinValue_2.setText('');
        gr.lib._amuletBonusWinLight.show(false);
        gr.lib._wave_1.gotoAndPlay('bowen',0.15,true);
        if(gr.lib._wave_2){
            gr.getTimer().setTimeout(function(){
                gr.lib._wave_2.gotoAndPlay('bowen',0.15,true);
            },500);
            gr.getTimer().setTimeout(function(){
                gr.lib._wave_3.gotoAndPlay('bowen',0.15,true);
            },500);
        }
        for(let i = 1; i<7; i++){
            gr.lib['_bonusBwinNumbleValue_'+i].show(false);
            gr.lib['_bonusBallEffcet_'+i].show(true);
            gr.lib['_bonusBallEffcet_'+i].gotoAndPlay('bonus2BallEffcet',0.18,true);
            gr.lib['_bonusBEffectLight_'+i].show(false);
            gr.lib['_symbosS'+i].show(true);
            gr.lib['_symbosS'+i].setImage('S'+i+'_0000');
            gr.lib['_symbosS'+i].gameIndex = i;
            amuletButton[i] = new gladButton(gr.lib['_symbosS'+i],'S'+i+'_0000',buttonRules);
            setAmuletSymbolRevealFun(gr.lib['_symbosS'+i]);
            gr.lib['_symbosS'+i].pixiContainer.$sprite.cursor = "pointer";
            if(isInit){
                amuletButton[i].click(gr.lib['_symbosS'+i].revealFun);
            }
            gr.lib['_symbosS'+i].pixiContainer.interactive = true;
            hitRectangleAreaButton(gr.lib['_symbosS'+i],70,15,160,150);
        }
    }

    function setAmuletSymbolRevealFun(symbol){
        symbol.revealFun = function () {
            if(tutorialIsShown){
                return;
            }
            symbolCh++;
            if(symbolCh>6){
                symbolCh = 3;
            }
            audio.play('BonusAmuletSelect',symbolCh);
            symbol.pixiContainer.interactive = false;
            symbol.pixiContainer.$sprite.cursor = "default";
            let prizeDetail = Number(Amulet.substring(1,2));
            let multiple = amuletbonusLevel(Number(Amulet.substring(1,2)));
            msgBus.publish('hiddenInfo');
            amuletSymbolsRevealed(symbol.gameIndex);
            gr.lib['_symbosS'+symbol.gameIndex].gotoAndPlay('S'+symbol.gameIndex+'',1,false);
            gr.lib['_symbosS'+symbol.gameIndex].onComplete = function(){
                symbol.show(false);
            };
            gr.getTimer().setTimeout(function(){
                gr.lib['_bonusBwinNumbleValue_'+symbol.gameIndex].show(true);
                gr.lib['_bonusBwinNumbleValue_'+symbol.gameIndex].setText(loader.i18n.Game['amuletMultipleText_'+prizeDetail]);
                gr.animMap['_bonusBwinValueAnim_'+symbol.gameIndex].play();
            },400);
            gr.getTimer().setTimeout(function(){
                gr.lib['_bonusBEffectLight_'+symbol.gameIndex].show(true);
                gr.lib['_bonusBEffectLight_'+symbol.gameIndex].gotoAndPlay('doorRuneEffect2',1,false);
            },1200);
            gr.lib['_bonusBEffectLight_'+symbol.gameIndex].onComplete = function(){
                gr.lib['_bonusBEffectLight_'+symbol.gameIndex].show(false);  
                gr.lib._amuletBonusWinLight.show(true);
                gr.lib._amuletBonusWinLight.gotoAndPlay('amuletBonusWinLight',0.3);
                gr.animMap._bonusBTotalWinValueAnim.play();    
                jackpot *= multiple;
                if(jackpot>winValue){
                    msgBus.publish('winboxError', {errorCode: '29000'});
                }else{
                    gr.lib._bonusBTotalWinValue_1.setText(SKBeInstant.formatCurrency(jackpot).formattedAmount);
                    gr.lib._bonusBTotalWinValue_2.setText(SKBeInstant.formatCurrency(jackpot).formattedAmount);
                    msgBus.publish('updateWinValue',{value:jackpot});
                }
            };
            gr.lib._amuletBonusWinLight.onComplete = function(){
               gr.lib._amuletBonusWinLight.show(false);
            };
            symbol.reveal = true;
        };
    }

    function amuletSymbolsRevealed(gameIndex){
        gr.lib._amuletBonusRevealAll.show(false);
        for(let i = 1; i<7; i++){
            gr.lib['_symbosS'+i].pixiContainer.interactive = false;
            gr.lib['_symbosS'+i].pixiContainer.$sprite.cursor = "default";
            gr.lib['_bonusBallEffcet_'+i].stopPlay();
            gr.lib['_bonusBallEffcet_'+i].show(false);
            if(i!==gameIndex){
                gr.lib['_symbosS'+i].setImage('S'+i+'Inactive');
            }
        }
        gr.getTimer().setTimeout(() => {
            if(gameError){
                return;
            }
            changeGameSence();
        }, 4500);
    }

    function amuletbonusLevel(num){
        let level ;
        switch(num) {
            case 1:
                level = 10;
                break;
            case 2:
                level = 5;
                break;
            case 3:
                level = 4;
                break;
            case 4:
                level = 3;
            break;
            case 5:
                level = 2;
            break;
        } 
        return level;
    }

    function fadeOutAmulet(symbol,Opacity,startId1,startId2,targetId){
        function fadeOut(){
            let currentOpacity = symbol._currentStyle._opacity;
            currentOpacity-=Opacity;
            symbol.updateCurrentStyle({'_opacity': currentOpacity});
            if(currentOpacity>0) {
                requestAnimationFrame(fadeOut);
            }else{
                symbol.stopPlay();
                symbol.show(false);
                if(startId1){
                    if(targetId>4){
                        baseLightAnimations["lfa_"+startId1+'_'+startId2].moveTo(symbol, gr.lib['_amuletEffect_'+(targetId-4)],600,{i:startId1,j:startId2});
                    }else{
                        baseLightAnimations["lfa_"+startId1+'_'+startId2].moveTo(symbol, gr.lib['_runeEffect_'+targetId],600,{i:startId1,j:startId2});
                    }
                }
            }
        }
        fadeOut();
    }

    function fadeInAmulet(symbol,Opacity){
        function fadeIn(){
            let currentOpacity = symbol._currentStyle._opacity;
            currentOpacity+=Opacity;
            symbol.updateCurrentStyle({'_opacity': currentOpacity});
            if(currentOpacity<1) {
                requestAnimationFrame(fadeIn);
            }
        }
        fadeIn();
    }



    function toBaseSence(){
        let bonus = null;
        if(isAmuletBonus){
            bonus = gr.lib._bonusBGameSence;
        }else{
            bonus = gr.lib._bonusAGameSence;
        }
        let currentOpacity = bonus._currentStyle._opacity;
        currentOpacity-=0.05;
        bonus.updateCurrentStyle({'_opacity': currentOpacity});
        if(currentOpacity>0) {
            requestAnimationFrame(toBaseSence);
        }
    }
    function changeGameSence(){
        if(jackpot!==winValue){
           msgBus.publish('winboxError', {errorCode: '29000'});
           return;
        }
        gr.lib._baseGameSence.show(true);
        msgBus.publish('allRevealed');
        requestAnimationFrame(toBaseSence); 
    }

    function toAmultSence(){
        const bonus = gr.lib._bonusBGameSence;
        let currentOpacity = bonus._currentStyle._opacity;
        currentOpacity+=bonusTransitions;
        bonus.updateCurrentStyle({'_opacity': currentOpacity});
        if(currentOpacity<1) {
            requestAnimationFrame(toAmultSence);
        }else{
            gr.lib._bonusAGameSence.show(false);
        }
    }

    function onAssetsLoadedAndGameReady(){
        gr.lib._baseTransitions.show(false);
        gr.lib._bonusTransitions.show(false);
        gr.lib._baseTransitionsText.show(false);
        gr.lib._bonusTransitionsText.show(false);
        gr.lib._tutorial.show(false);
        gr.lib._winBoxError.show(false);
        gr.lib._ErrorScene.show(false);
        gr.lib._network.show(false);
        gr.lib._nonWinPlaque.show(false);
        gr.lib._winPlaque.show(false);
        gr.lib._bonusBGameSence.show(false);
        gr.lib._bonusAGameSence.show(false);
    }

    function fillWords(){
        gr.lib._bonusLogo.setText(loader.i18n.Game['GLYPHBONUS']);
        gr.lib._bonusATotalWinText.setText(loader.i18n.Game['bonuswin']);
        gr.lib._bonusAmuletText.setText(loader.i18n.Game['talismanbonus']);
        gr.lib._bonusAmuletWinText.setText(loader.i18n.Game['talismanbonus']);
        gr.lib._bonusAPormptText.setText(loader.i18n.Game['ApormptText']);
        gr.lib._bonusBLogo.setText(loader.i18n.Game['TALISMANBONUS']);
        gr.lib._bonusBPormptText.setText(loader.i18n.Game['BpormptText']);
        gr.lib._bonusBTotalWinText.setText(loader.i18n.Game['totalbonuswin']);
    }


    function onGameParametersUpdated() {
        cloneGladAnim();
        setAutoFontFitText();
        fillWords();
        initialBaseGame();
        initialRuneBonus();
        initialAmuletBonus();
        if(SKBeInstant.config.customBehavior){
           baseTransitions = Number(SKBeInstant.config.customBehavior.baseTransitions) || 0.3;
        }else if(loader.i18n.gameConfig){
           baseTransitions = Number(loader.i18n.gameConfig.baseTransitions) || 0.3;
        }else{
            baseTransitions = 0.3;
        }
        if(SKBeInstant.config.customBehavior){
           bonusTransitions = Number(SKBeInstant.config.customBehavior.bonusTransitions) || 0.02;
        }else if(loader.i18n.gameConfig){
           bonusTransitions = Number(loader.i18n.gameConfig.bonusTransitions) || 0.02;
        }else{
            bonusTransitions = 0.02;
        }
        if(SKBeInstant.config){
           if(!SKBeInstant.config.autoRevealEnabled){
               haveReveal = false;
           }    
        }
    }

    function setAutoFontFitText(){
        gr.lib._bonusLogo.autoFontFitText = true;
        // gr.lib._bonusALogoAnim.autoFontFitText = true;
        gr.lib._bonusAmuletWinText.autoFontFitText = true;
        gr.lib._bonusAmuletText.autoFontFitText = true;
        gr.lib._bonusATotalWinText.autoFontFitText = true;
        gr.lib._bonusATotalWinValue_1.autoFontFitText = true;
        gr.lib._bonusATotalWinValue_2.autoFontFitText = true;
        gr.lib._bonusAPormptText.autoFontFitText = true;
        gr.lib._numbleText.autoFontFitText = true;
        gr.lib._bonusBLogo.autoFontFitText = true;
        gr.lib._bonusBPormptText.autoFontFitText = true;
        gr.lib._bonusBTotalWinText.autoFontFitText = true;
        gr.lib._bonusBTotalWinValue_1.autoFontFitText = true;
        gr.lib._bonusBTotalWinValue_2.autoFontFitText = true;
        gr.lib._baseTransitionsText.autoFontFitText = true;
        gr.lib._bonusTransitionsText.autoFontFitText = true;
        for(let i = 1;i<7;i++){
            gr.lib['_bonusBwinNumbleValue_'+i].autoFontFitText = true;
        }
        for(let i = 1;i<5;i++){
            gr.lib['_bonusDoorWinValue_'+i+'_1'].autoFontFitText = true;
            gr.lib['_bonusDoorWinValue_'+i+'_2'].autoFontFitText = true;
        }

    }

    function hitRectangleAreaButton(button,x,y,width,height){
        button.pixiContainer.$sprite.hitArea = new PIXI.Rectangle(x,
        y,width,height);
    }

    function hitTriangleAreaButton(button){
        button.pixiContainer.$sprite.hitArea = new PIXI.Polygon(
          90,5,155,110,158,140,7,140,85,10
        );
        // const pl = new PIXI.Graphics();
        // pl.lineStyle("#ff0000", 1);
        // pl.beginFill("#00ff00");
        // pl.drawPolygon(button.pixiContainer.$sprite.hitArea.points);
        // pl.endFill();
        // button.pixiContainer.addChild(pl);
    }
    
    function onStartReveallAll(){
        revealAll = true;
    }
    
    function onTutorialIsShown(){
        tutorialIsShown = true;
    }
    
    function onTutorialIsHide(){
        tutorialIsShown = false;
    }
    function getBaseValue(data){
        jackpot = data.value;
    }
    function centerToRightOnComplete(data){
        gr.lib['_bonusAmuletEffect_'+(data.amuletNum-4)].show(true);
		gr.lib['_bonusAmuletEffect_'+(data.amuletNum-4)].gotoAndPlay('AmuletMeterBoom',0.5,false);
		gr.lib['_bonusAmuletEffect_'+(data.amuletNum-4)].onComplete = function(){
            gr.lib['_bonusAmuletEffect_'+(data.amuletNum-4)].show(false);
            amuletBonusLight(data.amuletNum,1);
		};
    }

    function onError() {
        gameError = true;
        gr.getTimer().setTimeout(function(){
            gr.getTicker().stop();
        }, 200);
    }

    function centerToRight(data){
        rune2LightAnimations["Anim_"+data.num].moveTo(data.startObj, data.targetObj,600,{num:data.num},{needPublish:true,amuletNum:data.num});
    }
    
    msgBus.subscribe('getBaseValue', getBaseValue);
    msgBus.subscribe('centerToRight', centerToRight);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
    msgBus.subscribe('jLottery.error', onError);
	msgBus.subscribe('winboxError', onError);
    msgBus.subscribe('startReveallAll', onStartReveallAll);
    msgBus.subscribe('resetAll', resetAll);
    msgBus.subscribe('centerToRightOnComplete', centerToRightOnComplete);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);

    return {};
});