define([
    'com/pixijs/pixi',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/gameMsgBus/GameMsgBus',
    "com/pixijs/pixi-particles",
    'skbJet/component/gladPixiRenderer/Sprite'
], function (PIXI, gr, msgBus, pixiParticles,Sprite) {

    let bubbleEmitter = null;
    let elapsed = Date.now();
    let renderer = null;
    let particlesConfig = {
					"alpha": {
						"start": 1,
						"end": 0.8
					},
					"scale": {
						"start": 0.8,
						"end": 0.8
					},
					"color": {
						"start": "ffffff",
						"end": "ffffff"
					},
					"speed": {
						"start": 1000,
						"end": 100
					},
					"startRotation": {
						"min": 0,
						"max": 0
					},
					"rotationSpeed": {
						"min": 0,
						"max": 0
					},
					"lifetime": {
						"min": 0.5,
						"max": 0.7
					},
					"frequency": 0.01,
					"emitterLifetime": 0.31,
					"maxParticles": 1000,
					"pos": {
						"x": 0,
						"y": 0
					},
					"addAtBack": false,
					"spawnType": "ring",
					"spawnCircle": {
						"x": 0,
						"y": 0,
						"r": 400,
						"minR": 100
					},
				};

    let update = function () {
        if (!bubbleEmitter) {
            return;
        }
        requestAnimationFrame(update);

        var now = Date.now();

        bubbleEmitter.update((now - elapsed) * 0.001);

        elapsed = now;

        gr.forceRender();
    };

    function onGameParametersUpdated() {
        renderer = gr.getPixiRenderer();
    }

    function createParticle() {
        
        var art = [
            {
				framerate: 20,
				loop: true,
				textures: [
                    'coin_0001',
                    'coin_0002',
                    'coin_0003',
                    'coin_0004',
                    'coin_0005',
                    'coin_0006',
                    'coin_0007',
                    'coin_0008',
                    'coin_0009',
                    'coin_0010',
                ]
			},
			{
				framerate: 20,
				loop: true,
				textures: [
                    'coin_0004',
                    'coin_0005',
                    'coin_0006',
                    'coin_0007',
                    'coin_0008',
                    'coin_0009',
                    'coin_0010',
                    'coin_0001',
                    'coin_0002',
                    'coin_0003',
                ]
			},
            {
				framerate: 20,
				loop: true,
				textures: [
                    'coin_0008',
                    'coin_0009',
                    'coin_0010',
                    'coin_0001',
                    'coin_0002',
                    'coin_0003',
                    'coin_0004',
                    'coin_0005',
                    'coin_0006',
                    'coin_0007',
                ]
			},
            {
				framerate: 20,
				loop: true,
				textures: [
                    'coin_0006',
                    'coin_0007',
                    'coin_0008',
                    'coin_0009',
                    'coin_0010',
                    'coin_0001',
                    'coin_0002',
                    'coin_0003',
                    'coin_0004',
                    'coin_0005',
                ]
			}
        ];
        bubbleEmitter = new pixiParticles.Emitter(
                gr.lib._baseGameSence.pixiContainer,
                art,
                particlesConfig
                );
        bubbleEmitter.particleConstructor = PIXI.particles.AnimatedParticle;
        update();
    }

    function startBubbleEmitter() {
        bubbleEmitter.resetPositionTracking();//This should be used if you made a major position change of your emitter's owner that was not normal movement.
        bubbleEmitter.emit = true;
    }

    function stopBubbleEmitter() {
        if (bubbleEmitter) {
            bubbleEmitter.emit = false;
            bubbleEmitter.destroy();
            bubbleEmitter = null;
            //reset SpriteRenderer's batching to fully release particles for GC
            if (renderer.plugins && renderer.plugins.sprite && renderer.plugins.sprite.sprites) {
                renderer.plugins.sprite.sprites.length = 0;
            }

            gr.forceRender();
        }
    }

    function getBubbleEmitter() {
        if (!bubbleEmitter) {
            createParticle();
        }
        //createParticle();
        return bubbleEmitter;
    }

    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    return {
        getBubbleEmitter: getBubbleEmitter,
        startBubbleEmitter: startBubbleEmitter,
        stopBubbleEmitter: stopBubbleEmitter
    };

});