define([
		'skbJet/component/gameMsgBus/GameMsgBus',
		'skbJet/component/gladPixiRenderer/gladPixiRenderer',
        'skbJet/component/pixiResourceLoader/pixiResourceLoader',
		'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
        'skbJet/component/SKBeInstant/SKBeInstant',
        'game/configController'
	], function(msgBus, gr, loader, audio, SKBeInstant, config){

    let imageNames = config.paytableHelpPreparedDatas.imageNames;
    var headerHeight = 48;
    var buttonHeight = 27;
    var buttonBottom = 3;

    function onSystemInit(){
        var articles=document.getElementsByTagName('article');
        for(var i=0;i<articles.length;i++){
            articles[i].addEventListener('mousedown',preventDefault,false);
        }
        document.addEventListener('mousemove',preventDefault,false);
	}

    function preventDefault(e){
        var ev=e||window.event;
        ev.returnValue=false;
        ev.preventDefault();
    }

    function onGameInit(){
        registerConsole();   
    }

    function onBeforeShowStage(){
        fillHeaders();
        fillContent();
        fillCloseBtn();
        if(config.helpClickList){
            registerHelpList();
        }
        setStyle();
        window.addEventListener('resize',onWindowResize);
    }

    function setStyle(){
        var height = window.innerHeight;

        document.getElementById("gameRulesHeader").style.height = headerHeight+'px';
        document.getElementById("paytableHeader").style.height = headerHeight+'px';
        var bodyHeight = height - (headerHeight + buttonHeight + 2*buttonBottom);
        document.getElementById("gameRulesArticle").style.height = bodyHeight+'px';
        document.getElementById("gameRulesArticle").style.top = headerHeight+'px';
        document.getElementById("paytableArticle").style.height = bodyHeight+'px';
        document.getElementById("paytableArticle").style.top = headerHeight+'px';

        var buttons = document.getElementsByClassName("closeBtn");
        for(var i=0; i< buttons.length; i++){
            buttons[i].style.height = buttonHeight + 'px';
            buttons[i].style.bottom = buttonBottom + 'px';
        }
    }

    function onWindowResize(){
        var height = window.innerHeight;
        var bodyHeight = height - (headerHeight + buttonHeight + 2*buttonBottom);
        document.getElementById("gameRulesArticle").style.height = bodyHeight+'px';
        document.getElementById("paytableArticle").style.height = bodyHeight+'px';
    }
    
    function onStartUserInteraction(){
        disableConsole();       
    }
    
    function onReStartUserInteraction(){
        disableConsole();        
    }
    
    function onReInitialize(){
         enableConsole();  
    }

    function registerConsole(){
        var paytableText, howToPlayText;
        if(SKBeInstant.isWLA()){
            paytableText = loader.i18n.MenuCommand.WLA.payTable;
            howToPlayText = loader.i18n.MenuCommand.WLA.howToPlay;
        }else{
            paytableText = loader.i18n.MenuCommand.Commercial.payTable;
            howToPlayText = loader.i18n.MenuCommand.Commercial.howToPlay;
        }
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Register",
            data:{
                options:[{
                    type:'command',
                    name:'paytable',
                    text:paytableText,
                    enabled:1
                }]
            }
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Register",
            data:{
                options:[{
                    type:'command',
                    name:'howToPlay',
                    text:howToPlayText,
                    enabled:1
                }]
            }
        });
    }

    function enableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"howToPlay","event":"enable","params":[1]}
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"paytable","event":"enable","params":[1]}
        });
    }  
    
    function disableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"howToPlay","event":"enable","params":[0]}
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"paytable","event":"enable","params":[0]}
        });
    }

    function fillHeaders(){
        var gameRulesHeader = document.getElementById('gameRulesHeader');
        var payTableHeader = document.getElementById('paytableHeader');
        var paytableText, howToPlayText;
        if (SKBeInstant.isWLA()) {
            paytableText = loader.i18n.MenuCommand.WLA.payTable;
            howToPlayText = loader.i18n.MenuCommand.WLA.howToPlay;
        } else {
            paytableText = loader.i18n.MenuCommand.Commercial.payTable;
            howToPlayText = loader.i18n.MenuCommand.Commercial.howToPlay;
        }
        gameRulesHeader.innerHTML = howToPlayText;
        payTableHeader.innerHTML = paytableText;
    }

    function fillContent(){
        //fill paytable
        var paytableText = loader.i18n.paytableHTML.replace(/\"/g,"'");
        // var name;
        // if (SKBeInstant.isWLA()) {
        //     name = loader.i18n.MenuCommand.WLA.payTable;
        // } else {
        //     name = loader.i18n.MenuCommand.Commercial.payTable;
        // }
        paytableText = paytableText.replace('{name}','');
        // paytableText = paytableText.replace('{name}','<section><h1>'+ loader.i18n.title+ '</h1></section>');
		var tHead = '';
        var tBody = '';
        
        var showOddsPerTier = true;
        var additionalText = "";
        var links = "";
        if (SKBeInstant.isWLA()) {
            if (SKBeInstant.config.customBehavior) {
                if (SKBeInstant.config.customBehavior.paytableShow_OddsPerTier !== undefined ) {
                    showOddsPerTier = SKBeInstant.config.customBehavior.paytableShow_OddsPerTier;
                }
                if (SKBeInstant.config.customBehavior.paytable_AdditionalText !== undefined ) {
                    if(SKBeInstant.config.customBehavior.paytable_AdditionalText.trim().length > 0){
                        additionalText = SKBeInstant.config.customBehavior.paytable_AdditionalText;
                    }
                }
                if (SKBeInstant.config.customBehavior.paytable_Links !== undefined ) {
                    if(SKBeInstant.config.customBehavior.paytable_Links.trim().length >0){
                        links = SKBeInstant.config.customBehavior.paytable_Links;
                    }
                }
            } else if (loader.i18n.gameConfig) {
                if (loader.i18n.gameConfig.paytableShow_OddsPerTier !== undefined ) {
                    showOddsPerTier = loader.i18n.gameConfig.paytableShow_OddsPerTier;
                }
                if (loader.i18n.gameConfig.paytable_AdditionalText !== undefined ) {
                    if(loader.i18n.gameConfig.paytable_AdditionalText.trim().length > 0){
                        additionalText = loader.i18n.gameConfig.paytable_AdditionalText;
                    }
                }
                if (loader.i18n.gameConfig.paytable_Links !== undefined ) {
                    if(loader.i18n.gameConfig.paytable_Links.trim().length >0){
                        links = loader.i18n.gameConfig.paytable_Links;
                    }
                }
            }
            tHead = '<table><thead><th>'+ loader.i18n.MenuCommand.WLA.prizeDivision + '</th><th>' + loader.i18n.MenuCommand.WLA.prizeValue + '</th><th>' + loader.i18n.MenuCommand.WLA.approximatePrize + '</th>';
            tHead += showOddsPerTier ? '<th>' + loader.i18n.MenuCommand.WLA.oddsPerPlay + '</th></thead>': '</thead>';
        } else {
            tHead = '<table><thead><th>'+ loader.i18n.Game.prizeLevel + '</th><th>'+ loader.i18n.Game.prizeDescription + '</th><th>' + loader.i18n.Game.prizeValue + '</th></thead>';
        }
		
        var revealConfigurations = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        var i, j;
		
        if (SKBeInstant.isWLA()) {
            tBody += '<section><p style=\"font-size:14px;\">'+loader.i18n.MenuCommand.WLA.availablePrices+'</p></section>';
            var availablePrices = "";
			for (i = 0; i < revealConfigurations.length; i++) {
                var numberOfRemainingWinners = 0;
                var price = SKBeInstant.formatCurrency(revealConfigurations[i].price).formattedAmount;
                availablePrices += i === 0 ?  price : ", "+ price; 
				tBody += '<section><h2>' + loader.i18n.Game.paytableWager +"" +price + '</h2><p> </p>';
				// tBody += '<p>' + loader.i18n.MenuCommand.WLA.overAllOdds.replace('{oddNum}', (SKBeInstant.config.gameConfigurationDetails.numberOfUnsoldWagers/SKBeInstant.config.gameConfigurationDetails.numberOfRemainingWinners).toFixed(2)) + '</p><p> </p>';
				tBody += '<p>' + loader.i18n.MenuCommand.WLA.overAllOdds + '</p><p> </p>';
				tBody += tHead;
				tBody += '<tbody>';
				var prizeStructure = revealConfigurations[i].prizeStructure;
				var prizeDivision, prizeValue, prizeRemaining, perPlay;
				for(j=0; j< prizeStructure.length-1; j++){
					prizeDivision = prizeStructure[j].division;
					prizeValue = SKBeInstant.formatCurrency(prizeStructure[j].prize).formattedAmount;
                    prizeRemaining = prizeStructure[j].numberOfRemainingWinners;
                    numberOfRemainingWinners += prizeStructure[j].numberOfRemainingWinners;
                    if(showOddsPerTier){
                        perPlay = '1:' + (prizeStructure[j].numberOfUnsoldWagers/prizeStructure[j].numberOfRemainingWinners).toFixed(2);
                        tBody += '<tr><td nowrap="nowrap">' + prizeDivision + '</td><td nowrap="nowrap">' + prizeValue + '</td><td nowrap="nowrap">' + prizeRemaining + '</td><td nowrap="nowrap">' + perPlay + '</td></tr>';                
                    }else{
                        tBody += '<tr><td nowrap="nowrap">' + prizeDivision + '</td><td nowrap="nowrap">' + prizeValue + '</td><td nowrap="nowrap">' + prizeRemaining + '</td></tr>';                
                    }
                }
                tBody = tBody.replace('{oddNum}', (SKBeInstant.config.gameConfigurationDetails.numberOfUnsoldWagers/numberOfRemainingWinners).toFixed(2));
				tBody += '</tbody></table></section>';            
            }
            tBody = tBody.replace('{prices}', availablePrices);
            if(additionalText.length > 0){
                tBody += additionalText;
            }      
            if(links.length > 0){
                tBody += links;
            }      
		} else {
			for (i = 0; i < revealConfigurations.length; i++) {
				tBody += '<h2>' + loader.i18n.Game.paytableWager + SKBeInstant.formatCurrency(revealConfigurations[i].price).formattedAmount + '</h2><p> </p>';
				tBody += tHead;
				tBody += '<tbody>';
				var prizeTable = revealConfigurations[i].prizeTable;
                for(j=0; j< prizeTable.length; j++){
                    if(prizeTable[j].description.slice(0,1)==="M"){
                        tBody += '<tr><td nowrap="nowrap">' + (j+1) + '</td><td nowrap="nowrap"><div>' + prizeTable[j].description.substr(1) + '{WinningSymbols}</div></td><td nowrap="nowrap">' + SKBeInstant.formatCurrency(prizeTable[j].prize).formattedAmount + '</td></tr>';                
                    }else{
                        tBody += '<tr><td nowrap="nowrap">' + (j+1) + '</td><td nowrap="nowrap">' + loader.i18n.MenuCommand.Commercial.description+prizeTable[j].description.substr(1) + '</td><td nowrap="nowrap">' + SKBeInstant.formatCurrency(prizeTable[j].prize).formattedAmount + '</td></tr>';                
                    }
                }
				tBody += '</tbody></table>';               
			}        
			
		}
         if(SKBeInstant.isWLA()){
            paytableText = paytableText.replace('{payback}','');
         }else{
            var minRTP = SKBeInstant.config.gameConfigurationDetails.minRTP;
            var maxRTP = SKBeInstant.config.gameConfigurationDetails.maxRTP;
            var paybackRTP = "";
			//RGS5.2 doesn't support RTP value, so hard-code RTP for game rules.
			if(!minRTP || !maxRTP){
                paybackRTP = loader.i18n.Paytable.hardCodeRTP;
			}else{
				if(minRTP === maxRTP){
					loader.i18n.Paytable.RTPvalue = loader.i18n.Paytable.RTPvalue.replace('{@minRTP}',minRTP);
					paybackRTP = loader.i18n.Paytable.RTPvalue;
				}else{
					loader.i18n.Paytable.RTPrange = loader.i18n.Paytable.RTPrange.replace('{@minRTP}',minRTP);
					loader.i18n.Paytable.RTPrange = loader.i18n.Paytable.RTPrange.replace('{@maxRTP}',maxRTP);
					paybackRTP = loader.i18n.Paytable.RTPrange;
				}	
			}
            loader.i18n.Paytable.paybackBody = loader.i18n.Paytable.paybackBody.replace('{RTP}',paybackRTP);
            var payback = '<h3>'+ loader.i18n.Paytable.paybackTitle +'</h3><p>'+loader.i18n.Paytable.paybackBody+'</p>';
            paytableText = paytableText.replace('{payback}',payback);
         }
        
        paytableText = paytableText.replace('{paytableBody}',tBody);
        paytableText = fillImages(paytableText);

        var paytableBox = document.getElementById('paytableArticle');
        paytableBox.innerHTML = paytableText;
        
        var howToPlayText = loader.i18n.helpHTML.replace(/\"/g,"'");
        
        var howToPlayBox = document.getElementById('gameRulesArticle');
        howToPlayBox.innerHTML = howToPlayText;
    }
     function fillImages(data){
        imageNames.forEach(function(unit){
            if(unit.spriteName){
                data = data.replace(unit.searchRegExp,loader.getImgObj(unit.spriteName).outerHTML);
            }
        });
        return data;
    }
    function fillCloseBtn(){
        var buttons=document.getElementsByClassName('closeBtn');
        Array.prototype.forEach.call(buttons,function(item){
            item.innerHTML = loader.i18n.Game.buttonClose;
            item.onclick=function(){showOne('game');};
        });
    }
	
	function registerHelpList(){
        var titleList;
        var helpClickTitle = [];
        var gameRulesSection = document.getElementsByTagName("section")[0];
        var backToTop = document.getElementsByClassName("top");
		function gameRulsTitle(index){
			return function(){
				gameRulesSection.scrollTop = helpClickTitle[index].offsetTop - helpClickTitle[index].offsetHeight*4;
			};
		}
		function topBackUp(){
			return function(){
				gameRulesSection.scrollTop = 0;
			};
        }
        
        if(config.helpClickList.titleList){
            titleList = document.getElementById("titleList").getElementsByTagName("li");
        }else{
            titleList = document.getElementsByTagName("li");
        }
        if(config.helpClickList.titleContent){
            var content = config.helpClickList.titleContent;
            for(var key in content){
				var currentNode = document.getElementById(content[key]);
                helpClickTitle.push(currentNode);
            }
        }
        
        for (var i = 0; i < titleList.length; i++) {
			titleList[i].onclick = gameRulsTitle(i);
        }
        for (i = 0; i < backToTop.length; i++) {  
			backToTop[i].onclick = topBackUp();
        }
    }

    function showOne(id){
        var tabs=document.getElementsByClassName('tab');
        for(var i=0;i<tabs.length;i++){
            tabs[i].style.display='none';
        }
		if(id === 'game'){
            if(config.audio && config.audio.PaytableClose){
                audio.play(config.audio.PaytableClose.name, config.audio.PaytableClose.channel);                
            }
		}else{
            if (config.audio && config.audio.PaytableOpen) {
                audio.play(config.audio.PaytableOpen.name, config.audio.PaytableOpen.channel);
            }
		}
        document.getElementById(id).style.display='block';
    }

    //retrigger clickbtn
    function onGameControl(data){
        if(data.option==='paytable'||data.option==='howToPlay'){
            var id = data.option==='howToPlay'? 'gameRules' : 'paytable';
            if(document.getElementById(id).style.display==='block'){
                showOne('game');
            }else{
                showOne(id);
            }
        }
    }

    function onAbortNextStage(){
        disableConsole();
    }

    function onResetNextStage(){
        enableConsole();
    }
    
    function onEnterResultScreenState(){
        enableConsole();
    }
    
 	msgBus.subscribe('platformMsg/Kernel/System.Init', onSystemInit);
    msgBus.subscribe('platformMsg/ClientService/Game.Init', onGameInit);
    msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
    msgBus.subscribe('onAbortNextStage', onAbortNextStage);
    msgBus.subscribe('onResetNextStage', onResetNextStage);
    msgBus.subscribe('platformMsg/ConsoleService/Game.Control', onGameControl);
       
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	return {};
});

