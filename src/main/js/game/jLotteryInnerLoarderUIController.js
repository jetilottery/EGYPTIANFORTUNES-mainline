define([
        'skbJet/component/gameMsgBus/GameMsgBus',
        'skbJet/component/SKBeInstant/SKBeInstant',
        'game/configController',
		'skbJet/component/resourceLoader/resourceLib',
        'skbJet/componentCRDC/splash/splashUtil',
        'com/pixijs/pixi'
    ], function(msgBus, SKBeInstant, config, resLib,splashUtil, PIXI){
	
	var orientation = 'landscape';
	var gce;
    var gameWidth = 0;
    var gameHeight = 0;
    var brandTextDiv = document.createElement('div');

    var logoSprite, swirlAnim, progressText;
    var spriteSheetAnimationMap;

	function setBgImageFromResLib(elem, imgName){
		if(resLib&&resLib.splash&&resLib.splash[imgName]){
			var bgImgUrl = resLib.splash[imgName].src;
			if(bgImgUrl){
				elem.style.backgroundImage = 'url('+bgImgUrl+')';
			}
		}
	}
    
	function updateSize(winW, winH){
        gce.style.width = winW + 'px';
        gce.style.height = winH + 'px';
    }
    function getGameSize() {
        if (SKBeInstant.config.assetPack === 'desktop') {
            gameHeight = SKBeInstant.config.revealHeightToUse;
            gameWidth = SKBeInstant.config.revealWidthToUse;
        } else {
            var targetDiv = document.getElementById(SKBeInstant.config.targetDivId);
            var parentElem = targetDiv.parentElement;
            if (parentElem !== document.body) {
                parentElem.style.height = '100%';
                parentElem.style.width = '100%';
            }
            gameWidth = targetDiv.clientWidth;
            gameHeight = targetDiv.clientHeight;
        }
    }
    function getOrientation() {
        if (gameHeight > gameWidth) {
            orientation = 'portrait';
        } else {
            orientation = 'landscape';
        }
    }
	function onWindowResized(){
        getGameSize();
		getOrientation();
		setBgImageFromResLib(gce, orientation+'Loading');
        updateSize(gameWidth, gameHeight);
		
		var pdd = config.predefinedStyle[orientation];
        applyCanvas(pdd);
        applyLogoStyle(pdd);
        applySwirlStyle(pdd);
        applyProgressStyle(pdd);
//        applyBrandCopyrightStyle(pdd);
        splashUtil.fitSize(gameWidth, gameHeight);
        
        if (pdd.brandCopyRightDiv) {
            splashUtil.applyDomStyle(brandTextDiv, pdd.brandCopyRightDiv);
            var scaleRate = 1;
            if (gameWidth / pdd.canvas.width > gameHeight / pdd.canvas.height) {
                scaleRate = gameHeight / pdd.canvas.height;
            } else {
                scaleRate = gameWidth / pdd.canvas.width;
            }
            brandTextDiv.style.bottom = Math.round(pdd.brandCopyRightDiv.bottom * scaleRate) + 'px';
            brandTextDiv.style.fontSize = Math.round(pdd.brandCopyRightDiv.fontSize * scaleRate) + 'px';
        }
	}
    
  
    function applyLogoStyle(style){
        if(!logoSprite){
            return;
        }
        splashUtil.applyStyle(logoSprite,style.gameLogoDiv);
        logoSprite.pivot.x = Number(style.gameLogoDiv.width/2);
        logoSprite.pivot.y = Number(style.gameLogoDiv.height/2);
        logoSprite.x = Math.round(Number(style.canvas.width)/2);
        
        window.logoSprite = logoSprite;
    }
    function applySwirlStyle(style){
        if(!swirlAnim){
            return;
        }
        splashUtil.applyStyle(swirlAnim,style.progressSwirl);
        swirlAnim.pivot.x = Number(style.progressSwirl.width/2);
        swirlAnim.pivot.y = Number(style.progressSwirl.height/2);
        swirlAnim.x = Math.round(Number(style.canvas.width) /2);
        swirlAnim.gotoAndPlay(0);
        window.swirlAnim = swirlAnim;
    }
    
    function applyProgressStyle(style){
        if(!progressText){
            return;
        }
        progressText.x = Math.round(Number(style.canvas.width) /2);

        splashUtil.applyStyle(progressText,style.progressTextDiv);
        progressText.style.align = 'center';
        window.progressText = progressText;
    }
//    function applyBrandCopyrightStyle(style){
//        if(!brandText){
//            return;
//        }
//        brandText.x = Math.round(Number(style.canvas.width) /2);
//
//        splashUtil.applyStyle(brandText,style.brandCopyRightDiv);
//
//        brandText.style.align = 'center';
//        if (resLib.i18n.splash.splashScreen.brand) {
//            brandText.text = resLib.i18n.splash.splashScreen.brand;
//            brandText.pivot.x = brandText.width/2;
//            brandText.pivot.y = brandText.height/2;
//        }
//        window.brandText = brandText;
//    }
    function applyCanvas(pdd){
        splashUtil.getSplashRender().resize(pdd.canvas.width,pdd.canvas.height);
    }
	
	function onSplashLoadDone(){
		if(SKBeInstant.isSKB()){
			return;
		}
        getGameSize();
		getOrientation();
        var pdd = config.predefinedStyle[orientation];
        setBgImageFromResLib(gce, orientation+'Loading');
        updateSize(gameWidth, gameHeight);
        applyCanvas(pdd);
        
        if (!spriteSheetAnimationMap) {
            spriteSheetAnimationMap = splashUtil.searchSplashSpriteSheetAnimationFromTextureCache();
        }
       
		if(spriteSheetAnimationMap[config.predefinedStyle.splashLogoName]){
			logoSprite=PIXI.extras.AnimatedSprite.fromFrames(spriteSheetAnimationMap[config.predefinedStyle.splashLogoName]);
			logoSprite.animName=config.predefinedStyle.splashLogoName;
		}else{
			logoSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(config.predefinedStyle.splashLogoName));
		}
		applyLogoStyle(pdd);
        //logoSprite.texture = PIXI.Texture.fromFrame(config.predefinedStyle.splashLogoName);
        splashUtil.getSplashPixiContainer().addChild(logoSprite);
        swirlAnim = PIXI.extras.AnimatedSprite.fromFrames(spriteSheetAnimationMap[config.predefinedStyle.swirlName]);
        swirlAnim.animName = config.predefinedStyle.swirlName;
		
        progressText = new PIXI.Text();
        applySwirlStyle(pdd);
        applyProgressStyle(pdd);
		progressText.text = "1%";
        progressText.pivot.x = progressText.width/2;
        progressText.pivot.y = progressText.height/2;
        splashUtil.getSplashPixiContainer().addChild(swirlAnim);
        splashUtil.getSplashPixiContainer().addChild(progressText);
//        if (pdd.brandCopyRightDiv) {
//            brandText = new PIXI.Text();
//            applyBrandCopyrightStyle(pdd);
//            splashUtil.getSplashPixiContainer().addChild(brandText);
//        }
        splashUtil.fitSize(gameWidth, gameHeight);
        splashUtil.getTicker().start();
        
        if (resLib.i18n.splash.splashScreen.brand) {
            brandTextDiv.innerHTML = resLib.i18n.splash.splashScreen.brand;
        }
	}
	
	function initUI(){
		gce = SKBeInstant.getGameContainerElem();

        if (SKBeInstant.config.screenEnvironment === 'device') {
            gameWidth = document.getElementById(SKBeInstant.config.targetDivId).clientWidth;
            gameHeight = document.getElementById(SKBeInstant.config.targetDivId).clientHeight;            
        } else {
            gameHeight = SKBeInstant.config.revealHeightToUse;
            gameWidth = SKBeInstant.config.revealWidthToUse;
        }

        getOrientation();

		var pdd = config.predefinedStyle[orientation];
        splashUtil.addCanvas(pdd.canvas.width, pdd.canvas.height, gce);
		
        if (pdd.brandCopyRightDiv) {
            splashUtil.applyDomStyle(brandTextDiv, pdd.brandCopyRightDiv);
            brandTextDiv.style.position = 'absolute';
            brandTextDiv.style.width = '100%';
            brandTextDiv.style.textAlign = 'center';
            gce.appendChild(brandTextDiv);
        }
		if(SKBeInstant.config.assetPack !== 'desktop'){
			window.addEventListener('resize', onWindowResized);
		}
		onWindowResized();
		
		
		gce.style.backgroundSize = '100% 100%';
		gce.style.backgroundPosition = 'center';
		if(config.backgroundStyle){
			if(config.backgroundStyle.splashSize){
				gce.style.backgroundSize = config.backgroundStyle.splashSize;
			}
		}
		
		gce.style.position = "relative";
	}
	
	function clearDivFormatting() {
		var targetDiv = document.getElementById(SKBeInstant.config.targetDivId);
        targetDiv.innerHTML = "";
        targetDiv.style.background = '';
        targetDiv.style.backgroundSize = '';
        targetDiv.style.webkitUserSelect = '';
        targetDiv.style.webkitTapHighlightColor = '';
    }

    function onStartAssetLoading(){
		if(SKBeInstant.isSKB()){
			return;
		}
        clearDivFormatting();
		initUI();
	}
	
	function updateLoadingProgress(data){
		if(SKBeInstant.isSKB()){
			return;
		}
        if(progressText){
            progressText.text = Math.round((data.current / data.items) * 100)+"%";
            progressText.pivot.x = progressText.width/2;
            progressText.pivot.y = progressText.height/2;
        }
	}
	
	function onAssetsLoadedAndGameReady(){
        if (SKBeInstant.config.assetPack !== 'desktop' && !SKBeInstant.isSKB()) {
            window.removeEventListener('resize', onWindowResized);
        }
    }
	
	msgBus.subscribe('jLottery.startAssetLoading', onStartAssetLoading);
	msgBus.subscribe('jLotteryGame.updateLoadingProgress', updateLoadingProgress);
	msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
	msgBus.subscribe('loadController.jLotteryEnvSplashLoadDone', onSplashLoadDone);
    return {};
});