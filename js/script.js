(function() {
	'use strict';

	function id(id) {
		return document.getElementById(id);
	}

	// https://gist.github.com/kawanet/5553478
	function hiraganaToKatakana(src) {
		return src.replace(/[\u3041-\u3096]/g, function(match) {
			var chr = match.charCodeAt(0) + 0x60;
			return String.fromCharCode(chr);
		});
	};

	// http://qiita.com/fumix/items/a7f66780c728de95558f
	function computeDuration(ms){
	    var m = String(Math.floor((ms / 60000) + 1000)).substring(1);
	    var s = String(Math.floor((ms - m * 60000) / 1000 + 100)).substring(1);
		var ss = String(Math.floor((ms - m * 60000 - s * 1000) / 10 + 100)).substring(1);
	    return `${m}:${s}:${ss}`;
	}

	function runTimer() {
		id('timer').textContent = computeDuration(Date.now() - game.startTime);
		let timerId = setTimeout(function() {
			runTimer();
		}, 10);
	}

	function submitAnswer(e) {
		e.preventDefault();
		var userAnswer = answerArea.value;
		answerArea.value = '';
		if (!game.isStart) return 0;
		userAnswer = hiraganaToKatakana(userAnswer);
		userAnswer = userAnswer.replace(/２/, '2');
		userAnswer = userAnswer.replace(/Ｚ|z|ｚ/, 'Z');
		userAnswer = userAnswer.replace(/♀/, 'メス');
		userAnswer = userAnswer.replace(/♂/, 'オス');
		if (userAnswer === game.answer()) {
			info.textContent = '正解！';
			game.remain--;
			if (game.number === game.lastNumber) {
				game.finish();
			} else {
				game.number++;
				game.localMissCount = 0;
				game.updateImage();
			};
		} else {
			switch (game.localMissCount) {
				case 2:
					info.textContent = `答えは「${game.answer()}」でした。`;
					game.totalMissCount++;
					break;
				case 1:
				case 0:
					info.textContent = `「${userAnswer}」は間違いです。`;
					game.localMissCount++;
			}
		};
	}

	const ALLOWED_MISS_COUNT = 2;
	const IMAGE_ROOT = './img/'
	var pokemonImage = id('image');
	var info = id('info');
	var answerArea = id('answer');

	var pokemon_range = {
		"Kanto" : [  1, 151],
		"Johto" : [152, 251],
		"Hoenn" : [252, 386],
		"Sinnoh": [387, 493],
		"Unova" : [494, 649],
		"Kalos" : [650, 719],
		"Alola" : [722, 802],
		"All"   : [  1, 802]
	};


	var game = {
		reset(region) {
			this.localMissCount = 0;
			this.totalMissCount = 0;
			this.region = region;
			this.number = pokemon_range[region][0];
			this.lastNumber = pokemon_range[region][1];
			this.remain = pokemon_range[region][1] - pokemon_range[region][0] + 1;
			this.isStart = false;
			this.updateImage();
			info.innerHTML = '<br>'
		},

		answer() {
			return pokemon_data[this.number-1].name;
		},

		updateImage() {
			pokemonImage.src = IMAGE_ROOT + ('00' + this.number).slice(-3) + '.png'
		},

		start() {
			this.isStart = true;
			this.startTime = Date.now();
			runTimer();
		},

		finish() {
			return 0;
		}
	};

	document.getElementById('answer-form').addEventListener('submit', submitAnswer, false);

	var chengeRegionButtons = document.getElementsByClassName('change-region')
	for (const changeRegionButton of chengeRegionButtons) {
		changeRegionButton.addEventListener('click', function() {
			game.reset(this.id);
		}, false)
	}

	id('start-btn').addEventListener('click', function(e) {
		if (!game.isStart) {
			this.value = '終了';
			game.start();
		} else {
			game.finish();
		}
	}, false)

	game.reset("Kanto");
})();
