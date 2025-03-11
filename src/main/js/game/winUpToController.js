/**
 * @module game/winUpToController
 * @description WinUpTo control
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
    '../game/gameUtils'
], function (msgBus, gr, loader, SKBeInstant,gameUtils) {
    
	function onGameParametersUpdated(){
		gr.lib._winUpToText.autoFontFitText = true;
        gr.lib._winUpToText.setText(loader.i18n.Game.win_up_to);
        gr.lib._winUpToValue.autoFontFitText = true;
    }
    function onTicketCostChanged(prizePoint){
        var rc = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
		for (var i = 0; i < rc.length; i++) {
			if (Number(prizePoint) === Number(rc[i].price)) {
				var ps = rc[i].prizeStructure;
				var maxPrize = 0;
				for (var j = 0; j < ps.length; j++) {
					var prize = Number(ps[j].prize);
					if (maxPrize < prize) {
						maxPrize = prize;
					}
				}
				if(gr.lib._winUpToValue.getText()!==SKBeInstant.formatCurrency(maxPrize).formattedAmount + loader.i18n.Game.win_up_to_mark){
					gr.animMap._winUpToAnim.play();
                	gr.lib._winUpToValue.setText(SKBeInstant.formatCurrency(maxPrize).formattedAmount + loader.i18n.Game.win_up_to_mark);
				}
 				break;
			}
		}        
    }
    
    msgBus.subscribe('ticketCostChanged',onTicketCostChanged);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

	return {};
});