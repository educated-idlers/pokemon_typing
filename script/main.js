'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  var id = function id(_id) {
    return document.getElementById(_id);
  };

  var getUrlQuery = function getUrlQuery() {
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
  };

  // https://gist.github.com/kawanet/5553478
  var hiraganaToKatakana = function hiraganaToKatakana(src) {
    return src.replace(/[\u3041-\u3096]/g, function (match) {
      var chr = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(chr);
    });
  };

  // http://qiita.com/fumix/items/a7f66780c728de95558f
  var computeDuration = function computeDuration(ms) {
    if (ms < 60000000) {
      var m = String(Math.floor(ms / 60000 + 1000)).substring(1);
      var s = String(Math.floor((ms - parseInt(m) * 60000) / 1000 + 100)).substring(1);
      var ss = String(Math.floor((ms - parseInt(m) * 60000 - parseInt(s) * 1000) / 10 + 100)).substring(1);
      return m + ':' + s + ':' + ss;
    } else {
      return '999:9:99';
    }
  };

  var timerId = void 0;
  var runTimer = function runTimer() {
    id('timer').textContent = computeDuration(Date.now() - game.startTime);
    timerId = setTimeout(function () {
      runTimer();
    }, 10);
  };

  var Game = function () {
    _createClass(Game, null, [{
      key: 'ALLOWED_MISS_COUNT',
      get: function get() {
        return 2;
      }
    }, {
      key: 'POKEMON_RANGE',
      get: function get() {
        return [[1, 151], [152, 251], [252, 386], [387, 493], [494, 649], [650, 721], [722, 802], [1, 802]];
      }
    }]);

    function Game(region) {
      _classCallCheck(this, Game);

      this.region = parseInt(region);
      this.isStarted = false;
      this.reset();
    }

    _createClass(Game, [{
      key: 'reset',
      value: function reset() {
        var _this = this;

        this.localMissCount = 0;
        this.totalMissCount = 0;
        this.correctCount = 0;
        this.remain = Game.POKEMON_RANGE[this.region][1] - Game.POKEMON_RANGE[this.region][0] + 1;
        this.numberSet = Array(this.remain).fill(0).map(function (v, i) {
          return i + Game.POKEMON_RANGE[_this.region][0];
        });
        this.setImage(0);
        id('remain-num').textContent = '\u6B8B\u308A' + this.remain + '\u5339';
        id('timer').textContent = '000:00:00';
        this.setScoreText(0, 0);
        id('info').innerHTML = '<br>';
        id('answer').value = '';
        id('answer').setAttribute('placeholder', 'ボタンを押してスタート');
        id('start-btn').value = '開始';
        id('answer').setAttribute('disabled', true);
        clearTimeout(timerId);
      }
    }, {
      key: 'setNewProblem',
      value: function setNewProblem() {
        var num = Math.floor(Math.random() * this.remain);
        this.number = this.numberSet[num];
        this.numberSet.splice(num, 1);
        this.setImage(this.number);
      }
    }, {
      key: 'setImage',
      value: function setImage(num) {
        id('image').src = './img/' + num + '.png';
      }
    }, {
      key: 'remainDecrement',
      value: function remainDecrement() {
        this.remain--;
        id('remain-num').textContent = '\u6B8B\u308A' + this.remain + '\u5339';
      }
    }, {
      key: 'correctIncrement',
      value: function correctIncrement() {
        this.correctCount++;
        this.setScoreText();
      }
    }, {
      key: 'totalMissIncrement',
      value: function totalMissIncrement() {
        this.totalMissCount++;
        this.setScoreText();
      }
    }, {
      key: 'setScoreText',
      value: function setScoreText() {
        id('score').textContent = '\u6B63\u89E3' + this.correctCount + '\u5339\u3001\u30DF\u30B9' + this.totalMissCount + '\u5339';
      }
    }, {
      key: 'normalization',
      value: function normalization(answer) {
        return hiraganaToKatakana(answer).replace(/２/, '2').replace(/Ｚ|z|ｚ/, 'Z').replace(/♀/, 'メス').replace(/♂/, 'オス').replace(/：/, ':').replace(/･/, '・');
      }
    }, {
      key: 'checkAnswer',
      value: function checkAnswer() {
        var answer = this.normalization(id('answer').value);
        id('answer').value = '';
        if (!this.isStarted) return false;
        if (answer === this.answer()) {
          if (this.localMissCount <= Game.ALLOWED_MISS_COUNT) this.correctIncrement();
          if (this.remain === 0) {
            this.thisOver();
          } else {
            id('info').innerHTML = this.localMissCount < 3 ? '正解！' : '<br>';
            this.localMissCount = 0;
            this.setNewProblem();
          }
        } else {
          switch (this.localMissCount) {
            case Game.ALLOWED_MISS_COUNT:
              id('info').textContent = '\u7B54\u3048\u306F\u300C' + this.answer() + '\u300D\u3067\u3057\u305F\u3002';
              this.localMissCount++;
              this.totalMissIncrement();
              break;
            case 1:
            case 0:
              id('info').textContent = '\u300C' + answer + '\u300D\u306F\u9593\u9055\u3044\u3067\u3059\u3002';
              this.localMissCount++;
          }
        }
      }
    }, {
      key: 'gameStart',
      value: function gameStart() {
        game.reset();
        this.isStarted = true;
        this.startTime = Date.now();
        this.setNewProblem();
        id('answer').removeAttribute('disabled');
        id('answer').setAttribute('placeholder', 'Enterで判定');
        id('answer').focus();
        id('start-btn').value = '終了';
        runTimer();
      }
    }, {
      key: 'gameOver',
      value: function gameOver() {
        this.isStarted = false;
        clearTimeout(timerId);
        id('info').textContent = '終了';
        id('answer').setAttribute('disabled', true);
        id('answer').setAttribute('placeholder', 'ボタンを押してスタート');
        id('answer').value = '';
        id('start-btn').value = '開始';
        this.setImage(0);
      }
    }, {
      key: 'answer',
      value: function answer() {
        return pokemon_data[this.number - 1].name;
      }
    }]);

    return Game;
  }();

  id('answer-form').addEventListener('submit', function (e) {
    e.preventDefault();
    game.checkAnswer();
  }, false);

  id('start-btn').addEventListener('click', function (e) {
    if (!game.isStarted) {
      game.gameStart();
    } else {
      game.gameOver();
    }
  }, false);

  var region = getUrlQuery()['region'] || '0';
  document.querySelector('[data-region="' + region + '"]').classList.add('active');
  var game = new Game(region);
})();
