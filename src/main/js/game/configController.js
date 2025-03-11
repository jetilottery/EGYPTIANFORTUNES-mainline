/**
 * @module control some game config
 * @description control the customized data of paytable&help page and other customized config
 */
define({
  paytableHelpPreparedDatas : {
      "imageNames":[{
			"searchRegExp":/{WinningSymbols}/g,
			"spriteName":"WinningSymbols_0001"
		},		
		],
	},
  backgroundStyle: {
    "splashSize": "100% 100%",
    "gameSize": "100% 100%"
  },
  predefinedStyle: {
    "swirlName": "activityAnim",
    "splashLogoName": "logoLoader",
    landscape: {
      canvas: {
        width: 1440,
        height: 810
      },
      gameLogoDiv: {
        width: 1050,
        height: 200,
        y: 320,
      },
      progressSwirl: {
        width: 130,
        height: 130,
        animationSpeed: 0.5,
        loop: true,
        y: 600,
        scale: {
          x: 1,
          y: 1
        }
      },
      brandCopyRightDiv: {
        bottom: 20,
        fontSize: 18,
        color: "#70410b",
        fontFamily: '"Arial"'
      },
      progressTextDiv: {
        y: 600,
        style: {
          fontSize: 32,
          fill: "#273e8a",
          fontWeight: 800,
          fontFamily: "Oswald",
        }
      },
      copyRightDiv: {
          bottom: 20,
          fontSize: 20,
          color: "#70410b",
          fontFamily: '"Oswald"'
        },
    },
    portrait: {
      canvas: {
        width: 810,
        height: 1440
      },
      gameLogoDiv: {
        width: 1050,
        height: 200,
        y: 580,
        scale: {
          x: 0.74,
          y: 0.74
        }
      },
      progressSwirl: {
        width: 130,
        height: 130,
        animationSpeed: 0.5,
        loop: true,
        y: 1050,
        scale: {
          x: 1,
          y: 1
        }
      },
      brandCopyRightDiv: {
        bottom: 20,
        fontSize: 18,
        color: "#70410b",
        fontFamily: '"Arial"'
      },
      progressTextDiv: {
        y: 1050,
        style: {
          fontSize: 25,
          fill: "#273e8a",
          fontWeight: 800,
          fontFamily: "Oswald",
        }
      }
    }
  }
});
//# sourceMappingURL=configController.js.map
