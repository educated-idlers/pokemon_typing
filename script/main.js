'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
	var id = function id(_id) {
		return document.getElementById(_id);
	};

	function getUrlQuery() {
		var query_params = {};
		var url = window.location.search.slice(1).split('&');
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = url[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var kv = _step.value;

				var _kv$split = kv.split('='),
				    _kv$split2 = _slicedToArray(_kv$split, 2),
				    k = _kv$split2[0],
				    v = _kv$split2[1];

				query_params[k] = v;
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return query_params;
	}

	// https://gist.github.com/kawanet/5553478
	function hiraganaToKatakana(src) {
		return src.replace(/[\u3041-\u3096]/g, function (match) {
			var chr = match.charCodeAt(0) + 0x60;
			return String.fromCharCode(chr);
		});
	}

	// http://qiita.com/fumix/items/a7f66780c728de95558f
	function computeDuration(ms) {
		if (ms < 60000000) {
			var m = String(Math.floor(ms / 60000 + 1000)).substring(1);
			var s = String(Math.floor((ms - parseInt(m) * 60000) / 1000 + 100)).substring(1);
			var ss = String(Math.floor((ms - parseInt(m) * 60000 - parseInt(s) * 1000) / 10 + 100)).substring(1);
			return m + ':' + s + ':' + ss;
		} else {
			return '999:9:99';
		}
	}

	function runTimer() {
		id('timer').textContent = computeDuration(Date.now() - game.startTime);
		timerId = setTimeout(function () {
			runTimer();
		}, 10);
	}

	var ALLOWED_MISS_COUNT = 2;
	var info = id('info');
	var answerArea = id('answer');
	var timerId = void 0;

	var pokemon_range = [[1, 151], [152, 251], [252, 386], [387, 493], [494, 649], [650, 721], [722, 802], [1, 802]];

	var game = {
		reset: function reset(region) {
			var _this = this;

			this.localMissCount = 0;
			this.totalMissCount = 0;
			this.correctCount = 0;
			this.region = parseInt(region);
			this.remain = pokemon_range[this.region][1] - pokemon_range[this.region][0] + 1;
			this.numberSet = Array(this.remain).fill(0).map(function (v, i) {
				return i + pokemon_range[_this.region][0];
			});
			this.isStart = false;
			this.setImage(0);
			id('remain-num').textContent = '\u6B8B\u308A' + this.remain + '\u5339';
			id('timer').textContent = '000:00:00';
			this.setScoreText(0, 0);
			info.innerHTML = '<br>';
			answerArea.value = '';
			answerArea.setAttribute('placeholder', 'ボタンを押してスタート');
			id('start-btn').value = '開始';
			answerArea.setAttribute('disabled', true);
			clearTimeout(timerId);
		},
		determinNextNumber: function determinNextNumber() {
			var num = Math.floor(Math.random() * this.remain);
			this.number = this.numberSet[num];
			this.numberSet.splice(num, 1);
			this.setImage(this.number);
		},
		setImage: function setImage(num) {
			id('image').src = './img/' + num + '.png';
		},
		remainDecrement: function remainDecrement() {
			this.remain--;
			id('remain-num').textContent = '\u6B8B\u308A' + this.remain + '\u5339';
		},
		correctIncrement: function correctIncrement() {
			this.correctCount++;
			this.setScoreText();
		},
		totalMissIncrement: function totalMissIncrement() {
			this.totalMissCount++;
			this.setScoreText();
		},
		setScoreText: function setScoreText() {
			id('score').textContent = '\u6B63\u89E3' + this.correctCount + '\u5339\u3001\u30DF\u30B9' + this.totalMissCount + '\u5339';
		},
		gameStart: function gameStart() {
			this.isStart = true;
			this.startTime = Date.now();
			this.determinNextNumber();
			answerArea.removeAttribute('disabled');
			answerArea.setAttribute('placeholder', 'Enterで判定');
			answerArea.focus();
			runTimer();
		},
		gameOver: function gameOver() {
			this.isStart = false;
			clearTimeout(timerId);
			info.textContent = '終了';
			answerArea.setAttribute('disabled', true);
			answerArea.setAttribute('placeholder', 'ボタンを押してスタート');
			answerArea.value = '';
			id('start-btn').value = '開始';
			this.setImage(0);
		},
		answer: function answer() {
			return pokemon_data[this.number - 1].name;
		}
	};

	id('answer-form').addEventListener('submit', function (e) {
		e.preventDefault();
		var userAnswer = answerArea.value;
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
				info.innerHTML = game.localMissCount < 3 ? '正解！' : '<br>';
				game.localMissCount = 0;
				game.determinNextNumber();
			}
		} else {
			switch (game.localMissCount) {
				case 2:
					info.textContent = '\u7B54\u3048\u306F\u300C' + game.answer() + '\u300D\u3067\u3057\u305F\u3002';
					game.localMissCount++;
					game.totalMissIncrement();
					break;
				case 1:
				case 0:
					info.textContent = '\u300C' + userAnswer + '\u300D\u306F\u9593\u9055\u3044\u3067\u3059\u3002';
					game.localMissCount++;
			}
		}
	}, false);

	id('start-btn').addEventListener('click', function (e) {
		if (!game.isStart) {
			game.reset(game.region);
			this.value = '終了';
			game.gameStart();
		} else {
			game.gameOver();
		}
	}, false);

	var region = getUrlQuery()['region'] || '0';
	document.querySelector('[data-region="' + region + '"]').classList.add('active');
	game.reset(region);
})();
