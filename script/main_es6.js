(function() {
	const id = (id) => document.getElementById(id);

	function getUrlQuery() {
    let query_params = {};
    const url = window.location.search.slice(1).split('&');
    for (let kv of url) {
			let [k, v] = kv.split('=');
      query_params[k] = v;
    }
    return query_params;
	}

	// https://gist.github.com/kawanet/5553478
	function hiraganaToKatakana(src) {
		return src.replace(/[\u3041-\u3096]/g, function(match) {
			const chr = match.charCodeAt(0) + 0x60;
			return String.fromCharCode(chr);
		});
	}

	// http://qiita.com/fumix/items/a7f66780c728de95558f
	function computeDuration(ms) {
		if (ms < 60000000) {
	    const m = String(Math.floor((ms / 60000) + 1000)).substring(1);
	    const s = String(Math.floor((ms - parseInt(m) * 60000) / 1000 + 100)).substring(1);
			const ss = String(Math.floor((ms - parseInt(m) * 60000 - parseInt(s) * 1000) / 10 + 100)).substring(1);
	    return `${m}:${s}:${ss}`;
		} else {
			return '999:9:99';
		}
	}

	function runTimer() {
		id('timer').textContent = computeDuration(Date.now() - game.startTime);
		timerId = setTimeout(function() {
			runTimer();
		}, 10);
	}

	const ALLOWED_MISS_COUNT = 2;
	const info = id('info');
	const answerArea = id('answer');
	let timerId;

	let pokemon_range = [
		[  1, 151],
		[152, 251],
		[252, 386],
		[387, 493],
		[494, 649],
		[650, 721],
		[722, 802],
		[  1, 802]
	];

	let game = {
		reset(region) {
			this.localMissCount = 0;
			this.totalMissCount = 0;
			this.correctCount = 0;
			this.region = parseInt(region);
			this.remain = pokemon_range[this.region][1] - pokemon_range[this.region][0] + 1;
			this.numberSet = Array(this.remain).fill(0).map((v, i) => i + pokemon_range[this.region][0]);
			this.isStart = false;
			this.setImage(0);
			id('remain-num').textContent = `残り${this.remain}匹`;
			id('timer').textContent = '000:00:00';
			this.setScoreText(0, 0);
			info.innerHTML = '<br>';
			answerArea.value = '';
			answerArea.setAttribute('placeholder', 'ボタンを押してスタート');
			id('start-btn').value = '開始'
			answerArea.setAttribute('disabled', true);
			clearTimeout(timerId);
		},

		determinNextNumber() {
			const num = Math.floor(Math.random() * this.remain);
			this.number = this.numberSet[num];
			this.numberSet.splice(num, 1);
			this.setImage(this.number);
		},

		setImage(num) {
			id('image').src = `./img/${num}.png`;
		},

		remainDecrement() {
			this.remain--;
			id('remain-num').textContent = `残り${this.remain}匹`;
		},

		correctIncrement() {
			this.correctCount++;
			this.setScoreText();
		},

		totalMissIncrement() {
			this.totalMissCount++;
			this.setScoreText();
		},

		setScoreText() {
			id('score').textContent = `正解${this.correctCount}匹、ミス${this.totalMissCount}匹`;
		},

		gameStart() {
			this.isStart = true;
			this.startTime = Date.now();
			this.determinNextNumber();
			answerArea.removeAttribute('disabled')
			answerArea.setAttribute('placeholder', 'Enterで判定');
			answerArea.focus();
			runTimer();
		},

		gameOver() {
			this.isStart = false;
			clearTimeout(timerId);
			info.textContent = '終了';
			answerArea.setAttribute('disabled', true);
			answerArea.setAttribute('placeholder', 'ボタンを押してスタート');
			answerArea.value = '';
			id('start-btn').value = '開始'
			this.setImage(0);
		},

		answer() {
			return pokemon_data[this.number-1].name;
		}
	};

	id('answer-form').addEventListener('submit', function(e) {
		e.preventDefault();
		let userAnswer = answerArea.value;
		answerArea.value = '';
		if (!game.isStart) return 0;
		userAnswer = hiraganaToKatakana(userAnswer);
		userAnswer = userAnswer.replace(/２/, '2').replace(/Ｚ|z|ｚ/, 'Z').replace(/♀/, 'メス').replace(/♂/, 'オス').replace(/：/, ':').replace(/･/, '・');
		if (userAnswer === game.answer()) {
			game.remainDecrement();
			if (game.localMissCount < 3) game.correctIncrement();
			if (game.remain === 0) {
				game.gameOver();
			} else {
				info.innerHTML = (game.localMissCount < 3) ? '正解！' : '<br>';
				game.localMissCount = 0;
				game.determinNextNumber();
			}
		} else {
			switch (game.localMissCount) {
				case 2:
					info.textContent = `答えは「${game.answer()}」でした。`;
					game.localMissCount++;
					game.totalMissIncrement();
					break;
				case 1:
				case 0:
					info.textContent = `「${userAnswer}」は間違いです。`;
					game.localMissCount++;
			}
		}
	}, false);

	id('start-btn').addEventListener('click', function(e) {
		if (!game.isStart) {
			game.reset(game.region);
			this.value = '終了';
			game.gameStart();
		} else {
			game.gameOver();
		}
	}, false);

	const region = getUrlQuery()['region'] || '0'
	document.querySelector(`[data-region="${region}"]`).classList.add('active')
	game.reset(region);
})();
