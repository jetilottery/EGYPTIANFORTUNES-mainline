/**
 * @module game/meters
 * @description meters control
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
], function (msgBus, gr, loader, SKBeInstant ) {
    var winningSymbolNum = 0;  var PrizeArr = [];
    let winValue;
	function onGameParametersUpdated(){
        setText();
        gr.lib._runeBonusWinText.show(false);
        gr.lib._amuletBonusWinText.show(false);
        if(gr.animMap._prizeTableLightAnim_1){
            gemFlash();
        }
        for(var i = 1;i<11;i++){
            gr.lib['_multiplierText'+i].autoFontFitText = true;
            gr.lib['_multiplierText'+i].setText(loader.i18n.Game['multiplierText_'+i]);
            gr.lib['_prizeWinBox_'+i].show(false);
        }
	}

    function setText(){
        gr.lib._prizeTitleText1.autoFontFitText = true;
        gr.lib._prizeTitleText2.autoFontFitText = true;
        gr.lib._runeBonusText.autoFontFitText = true;
        gr.lib._amuletBonusText.autoFontFitText = true;
        gr.lib._runeBonusWinText.autoFontFitText = true;
        gr.lib._amuletBonusWinText.autoFontFitText = true;
        gr.lib._prizeTitleText1.setText(loader.i18n.Game.find);
        if(gr.lib._prizeTitleText3){
            gr.lib._prizeTitleText3.autoFontFitText = true;
            gr.lib._prizeTitleText3.setText(loader.i18n.Game.find);
        }
        gr.lib._prizeTitleText2.setText(loader.i18n.Game.win);
        if(gr.lib._prizeTitleText4){
            gr.lib._prizeTitleText4.autoFontFitText = true;
            gr.lib._prizeTitleText4.setText(loader.i18n.Game.win);
        }
        gr.lib._runeBonusText.setText(loader.i18n.Game.bonusLogo);
        gr.lib._amuletBonusText.setText(loader.i18n.Game.talismanbonus);
        gr.lib._runeBonusWinText.setText(loader.i18n.Game.bonusLogo);
        gr.lib._amuletBonusWinText.setText(loader.i18n.Game.talismanbonus);
        
    }

    function gemFlash(){
        gr.animMap._prizeTableLightAnim_1.play();
        gr.animMap._prizeTableLightAnim_1._onComplete = function(){
            gr.getTimer().setTimeout(() => {
                gr.animMap._prizeTableLightAnim_1.play();
            },5000);
        };
    }

    function onTicketCostChanged(prizePoint){
        var rc = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        PrizeArr = [];
		rc.forEach((item,index)=>{
            if(item.price===prizePoint){
                item.prizeTable.forEach((items,indexs)=>{
                    if(indexs<10){
                        PrizeArr.push(items.prize);
                    }
                });
            }
        });
       
        PrizeArr.forEach((item,index)=>{
            gr.lib['_prizeText'+(index+1)].autoFontFitText = true;
            gr.lib['_prizeText'+(index+1)].setText(SKBeInstant.formatCurrency(item).formattedAmount);
        });
    }

    function onWinningSymbolReveal(){
        winningSymbolNum++;
        for(var i = 1;i<11;i++){
            gr.lib['_prizeWinBox_'+i].show(false);
        }
        if(winningSymbolNum>3){
            if(PrizeArr[13-winningSymbolNum]>winValue){
                msgBus.publish('winboxError', {errorCode: '29000'});
            }else{
                msgBus.publish('getBaseValue',{value:PrizeArr[13-winningSymbolNum]});
                msgBus.publish('updateWinValue',{value:PrizeArr[13-winningSymbolNum]});
            }
            gr.lib['_prizeWinBox_'+[winningSymbolNum-3]].show(true);
        }
    }
    function resetAll(){
        winningSymbolNum = 0;
        for(var i = 1;i<11;i++){
            gr.lib['_prizeWinBox_'+i].show(false);
        }
    }

     function onStartUserInteraction(data) {
        if (data.scenario) {
            winValue = data.prizeValue;
        } else {
            return;
        }
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('ticketCostChanged',onTicketCostChanged);
    msgBus.subscribe('jLottery.reInitialize', resetAll);
    msgBus.subscribe('resetAll', resetAll);
    msgBus.subscribe('WinningSymbolReveal',onWinningSymbolReveal);
	return {};
});