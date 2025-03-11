/**
 * @module winUpToController
 * @description WinUpTo control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/SKBeInstant/SKBeInstant',
	'skbJet/component/rotateReminder/rotateReminder'
], function (msgBus, SKBeInstant, rotateReminder) {
	    
    function onAssetsLoadedAndGameReady(){
		var orientation = SKBeInstant.getGameOrientation();
        if (orientation === "landscape") {
            rotateReminder.setLandscapeOnly();
        } else {
            rotateReminder.setPortraitOnly();
        }
		rotateReminder.init("",function(rotateMsgShowFlag) {
            if (rotateMsgShowFlag) {
                document.getElementById('game').style.visibility = 'hidden';
                document.body.style.backgroundColor = '#000000';
            } else {
                document.getElementById('game').style.visibility = 'visible';
                document.body.style.backgroundColor = '';
            }
        });
    }
    
    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
    return {};	
	
});