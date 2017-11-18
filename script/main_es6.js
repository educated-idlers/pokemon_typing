(function() {
  const id = (id) => document.getElementById(id);

  const getUrlQuery = () => {
    let query_params = {};
    const url = window.location.search.slice(1).split('&');
    for (let kv of url) {
      let [k, v] = kv.split('=');
      query_params[k] = v;
    }
    return query_params;
  };

  // https://gist.github.com/kawanet/5553478
  const hiraganaToKatakana = (src) => {
    return src.replace(/[\u3041-\u3096]/g, function(match) {
      const chr = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(chr);
    });
  };

  // http://qiita.com/fumix/items/a7f66780c728de95558f
  const computeDuration = (ms) => {
    if (ms < 60000000) {
      const m = String(Math.floor((ms / 60000) + 1000)).substring(1);
      const s = String(Math.floor((ms - parseInt(m) * 60000) / 1000 + 100)).substring(1);
      const ss = String(Math.floor((ms - parseInt(m) * 60000 - parseInt(s) * 1000) / 10 + 100)).substring(1);
      return `${m}:${s}:${ss}`;
    } else {
      return '999:9:99';
    }
  };

  let timerId;
  const runTimer = () => {
    id('timer').textContent = computeDuration(Date.now() - game.startTime);
    timerId = setTimeout(function() {
      runTimer();
    }, 10);
  }

  class Game {
    static get ALLOWED_MISS_COUNT() { return 2 }
    static get POKEMON_RANGE() {
      return [
        [  1, 151],
        [152, 251],
        [252, 386],
        [387, 493],
        [494, 649],
        [650, 721],
        [722, 802],
        [  1, 802]
      ];
    };

    constructor(region) {
      this.region = parseInt(region);
      this.isStarted = false;
      this.reset();
    }

    reset() {
      this.localMissCount = 0;
      this.totalMissCount = 0;
      this.correctCount = 0;
      this.remain = Game.POKEMON_RANGE[this.region][1] - Game.POKEMON_RANGE[this.region][0] + 1;
      this.numberSet = Array(this.remain).fill(0).map((v, i) => i + Game.POKEMON_RANGE[this.region][0]);
      this.setImage(0);
      id('remain-num').textContent = `残り${this.remain}匹`;
      id('timer').textContent = '000:00:00';
      this.setScoreText(0, 0);
      id('info').innerHTML = '<br>';
      id('answer').value = '';
      id('answer').setAttribute('placeholder', 'ボタンを押してスタート');
      id('start-btn').value = '開始'
      id('answer').setAttribute('disabled', true);
      clearTimeout(timerId);
    }

    setNewProblem() {
      const num = Math.floor(Math.random() * this.remain);
      this.number = this.numberSet[num];
      this.numberSet.splice(num, 1);
      this.setImage(this.number);
    }

    setImage(num) {
      id('image').src = `./img/${num}.png`;
    }

    remainDecrement() {
      this.remain--;
      id('remain-num').textContent = `残り${this.remain}匹`;
    }

    correctIncrement() {
      this.correctCount++;
      this.setScoreText();
    }

    totalMissIncrement() {
      this.totalMissCount++;
      this.setScoreText();
    }

    setScoreText() {
      id('score').textContent = `正解${this.correctCount}匹、ミス${this.totalMissCount}匹`;
    }

    normalization(answer) {
      return hiraganaToKatakana(answer).replace(/２/, '2').replace(/Ｚ|z|ｚ/, 'Z').replace(/♀/, 'メス').replace(/♂/, 'オス').replace(/：/, ':').replace(/･/, '・');
    }

    checkAnswer() {
      let answer = this.normalization(id('answer').value);
      id('answer').value = '';
      if (!this.isStarted) return false;
      if (answer === this.answer()) {
        if (this.localMissCount <= Game.ALLOWED_MISS_COUNT) this.correctIncrement();
        if (this.remain === 0) {
          this.thisOver();
        } else {
          id('info').innerHTML = (this.localMissCount < 3) ? '正解！' : '<br>';
          this.localMissCount = 0;
          this.setNewProblem();
        }
      } else {
        switch (this.localMissCount) {
          case Game.ALLOWED_MISS_COUNT:
            id('info').textContent = `答えは「${this.answer()}」でした。`;
            this.localMissCount++;
            this.totalMissIncrement();
            break;
          case 1:
          case 0:
            id('info').textContent = `「${answer}」は間違いです。`;
            this.localMissCount++;
        }
      }
    }

    gameStart() {
      game.reset();
      this.isStarted = true;
      this.startTime = Date.now();
      this.setNewProblem();
      id('answer').removeAttribute('disabled')
      id('answer').setAttribute('placeholder', 'Enterで判定');
      id('answer').focus();
      id('start-btn').value = '終了';
      runTimer();
    }

    gameOver() {
      this.isStarted = false;
      clearTimeout(timerId);
      id('info').textContent = '終了';
      id('answer').setAttribute('disabled', true);
      id('answer').setAttribute('placeholder', 'ボタンを押してスタート');
      id('answer').value = '';
      id('start-btn').value = '開始';
      this.setImage(0);
    }

    answer() {
      return pokemon_data[this.number - 1].name;
    }
  }

  id('answer-form').addEventListener('submit', function(e) {
    e.preventDefault();
    game.checkAnswer();
  }, false);

  id('start-btn').addEventListener('click', function(e) {
    if (!game.isStarted) {
      game.gameStart();
    } else {
      game.gameOver();
    }
  }, false);

  const region = getUrlQuery()['region'] || '0';
  document.querySelector(`[data-region="${region}"]`).classList.add('active');
  const game = new Game(region);
})();
