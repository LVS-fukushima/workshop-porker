const HAND_SIZE = 5;
const ACE_VALUE = 14;
const KING_VALUE = 13;
const QUEEN_VALUE = 12;
const JACK_VALUE = 11;

const STRAIGHT_START_VALUE = 10;
const STRAIGHT_DIFFERENCE = 1;
const LOW_ACE_STRAIGHT = [ACE_VALUE, 5, 4, 3, 2];

const PAIR_COUNT = 2;
const TWO_PAIR_COUNT = 2;
const THREE_CARD_COUNT = 3;
const FOUR_CARD_COUNT = 4;

const ROLE_HIGH_CARD = "ハイカード";
const ROLE_ONE_PAIR = "ワンペア";
const ROLE_TWO_PAIR = "ツーペア";
const ROLE_THREE_OF_A_KIND = "スリーオブアカインド";
const ROLE_STRAIGHT = "ストレート";
const ROLE_FLUSH = "フラッシュ";
const ROLE_FULL_HOUSE = "フルハウス";
const ROLE_FOUR_OF_A_KIND = "フォーカード";
const ROLE_STRAIGHT_FLUSH = "ストレートフラッシュ";
const ROLE_ROYAL_FLUSH = "ロイヤルフラッシュ";

const ROLE_HIGH_CARD_VALUE = 1;
const ROLE_ONE_PAIR_VALUE = 2;
const ROLE_TWO_PAIR_VALUE = 3;
const ROLE_THREE_OF_A_KIND_VALUE = 4;
const ROLE_STRAIGHT_VALUE = 5;
const ROLE_FLUSH_VALUE = 6;
const ROLE_FULL_HOUSE_VALUE = 7;
const ROLE_FOUR_OF_A_KIND_VALUE = 8;
const ROLE_STRAIGHT_FLUSH_VALUE = 9;
const ROLE_ROYAL_FLUSH_VALUE = 10;

const NUMBER_VALUES = {
  A: ACE_VALUE,
  K: KING_VALUE,
  Q: QUEEN_VALUE,
  J: JACK_VALUE,
  10: 10,
  9: 9,
  8: 8,
  7: 7,
  6: 6,
  5: 5,
  4: 4,
  3: 3,
  2: 2
};

const SUITS = [
  "clover",
  "diamond",
  "heart",
  "spade"
];

const NUMBERS = [
  "A",
  "K",
  "Q",
  "J",
  "10",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2"
];

const startButton = document.querySelector(".start");
const resetButton = document.querySelector(".reset-button");
const drawButtons = document.querySelector(".draw-buttons");
const parentDrawButton = document.querySelector(".parent-draw");
const childDrawButton = document.querySelector(".child-draw");
const fightButton = document.querySelector(".fight-button");

const parentCardElements = document.querySelectorAll(".parent-cards .card");
const childCardElements = document.querySelectorAll(".child-cards .card");
const parentRoleElement = document.querySelector(".parent-role");
const childRoleElement = document.querySelector(".child-role");
const parentResultElement = document.querySelector(".parent-result");
const childResultElement = document.querySelector(".child-result");

// 数字ごとの枚数を取得
const getNumberCounts = (hand) => {
  return hand.reduce((counts, card) => {
    counts[card.number] = (counts[card.number] || 0) + 1;
    return counts;
  }, {});
};

// フラッシュか判定
const isFlush = (hand) => {
  return hand.every(
    (card) => card.suit === hand[0].suit
  );
};

// ストレートか判定
const isStraight = (hand) => {
  const values = hand
    .map((card) => card.value)
    .sort((a, b) => b - a);
  const isLowAceStraight = LOW_ACE_STRAIGHT.every(
    (value, index) => values[index] === value
  );
  if (isLowAceStraight) {
    return true;
  }
  return values.every(
    (value, index) => {
      if (index === 0) {
        return true;
      }
      return values[index - 1] - value === STRAIGHT_DIFFERENCE;
    }
  );
};

// ロイヤルフラッシュか判定
const isRoyalFlush = (hand) => {
  const values = hand
    .map((card) => card.value)
    .sort((a, b) => b - a);

  const royalValues = [
    ACE_VALUE,
    KING_VALUE,
    QUEEN_VALUE,
    JACK_VALUE,
    STRAIGHT_START_VALUE
  ];
  return royalValues.every(
    (value, index) => values[index] === value
  );
};

// 役判定
const checkRole = (hand) => {
  const numberCounts = getNumberCounts(hand);
  const counts = Object.values(numberCounts);
  const hasFourCard = counts.includes(FOUR_CARD_COUNT);
  const hasThreeCard = counts.includes(THREE_CARD_COUNT);

  const pairCount = counts.filter(
    (count) => count === PAIR_COUNT
  ).length;

  const straight = isStraight(hand);
  const flush = isFlush(hand);

  const roles = [
    {
      name: ROLE_ROYAL_FLUSH,
      value: ROLE_ROYAL_FLUSH_VALUE,
      condition: isRoyalFlush(hand) && flush
    },
    {
      name: ROLE_STRAIGHT_FLUSH,
      value: ROLE_STRAIGHT_FLUSH_VALUE,
      condition: straight && flush
    },
    {
      name: ROLE_FOUR_OF_A_KIND,
      value: ROLE_FOUR_OF_A_KIND_VALUE,
      condition: hasFourCard
    },
    {
      name: ROLE_FULL_HOUSE,
      value: ROLE_FULL_HOUSE_VALUE,
      condition: hasThreeCard && pairCount === 1
    },
    {
      name: ROLE_FLUSH,
      value: ROLE_FLUSH_VALUE,
      condition: flush
    },
    {
      name: ROLE_STRAIGHT,
      value: ROLE_STRAIGHT_VALUE,
      condition: straight
    },
    {
      name: ROLE_THREE_OF_A_KIND,
      value: ROLE_THREE_OF_A_KIND_VALUE,
      condition: hasThreeCard
    },
    {
      name: ROLE_TWO_PAIR,
      value: ROLE_TWO_PAIR_VALUE,
      condition: pairCount === TWO_PAIR_COUNT
    },
    {
      name: ROLE_ONE_PAIR,
      value: ROLE_ONE_PAIR_VALUE,
      condition: pairCount === 1
    }
  ];
  const role = roles.find(
    (role) => role.condition
  );
  return role || {
    name: ROLE_HIGH_CARD,
    value: ROLE_HIGH_CARD_VALUE
  };
};

// ハイカードの勝敗
const getHighCardValue = (hand) => {
  return Math.max(
    ...hand.map((card) => card.value)
  );
};

// 役の強さを比較
const compareValue = (parentValue, childValue) => {
  if (parentValue > childValue) {
    return "親";
  }
  if (parentValue < childValue) {
    return "子";
  }
  return "引分";
};

// 勝敗判定
const checkWinner = (
  parentRole,
  childRole,
  parentHand,
  childHand
) => {
  const roleWinner = compareValue(
    parentRole.value,
    childRole.value
  );
  if (roleWinner !== "引分") {
    return roleWinner;
  }
  if (
    parentRole.value === ROLE_HIGH_CARD_VALUE &&
    childRole.value === ROLE_HIGH_CARD_VALUE
  ) {
    return compareValue(
      getHighCardValue(parentHand),
      getHighCardValue(childHand)
    );
  }
  return "引分";
};

// 山札作成
const createDeck = () => {
  const deck = [];
  SUITS.forEach((suit) => {
    NUMBERS.forEach((number) => {
      deck.push({
        suit,
        number,
        value: NUMBER_VALUES[number],
        image: `images/${suit}_${number}.png`
      });
    });
  });

  return deck;
};

// カードを１枚抽選
const drawCard = (deck) => {
  const randomIndex = Math.floor(
    Math.random() * deck.length
  );
  return deck.splice(randomIndex, 1)[0];
};

// 手札を抽選
const drawHand = (deck) => {
  return Array.from(
    { length: HAND_SIZE },
    () => drawCard(deck)
  );
};

// カード裏面を表示
const showReverseCards = (cardElements) => {
  cardElements.forEach((cardElement) => {
    cardElement.innerHTML =
    `<img src="images/reverse_side.png" alt="カード裏面">`;
  });
};

// カード表面を表示
const showCards = (cards, cardElements) => {
  cards.forEach((card, index) => {
    cardElements[index].innerHTML =
    `<img src="${card.image}" alt="${card.suit}_${card.number}">`;
  });
};

// 抽選処理
const drawCards = (hand, button) => {
  hand.push(...drawHand(deck));
  button.style.display = "none";
  checkFightButton();
};

// 勝負ボタン表示
const checkFightButton = () => {
  if (
    parentHand.length === HAND_SIZE &&
    childHand.length === HAND_SIZE
  ) {
    fightButton.style.display = "block";
  }
};

// 結果表示
const result = {
    "親": ["勝ち", "負け"],
    "子": ["負け", "勝ち"],
    "引分": ["引分", "引分"]
  };
const showResult = () => {
  const parentRole = checkRole(parentHand);
  const childRole = checkRole(childHand);
  const winner = checkWinner(
    parentRole,
    childRole,
    parentHand,
    childHand
  );
  parentRoleElement.textContent = parentRole.name;
  childRoleElement.textContent = childRole.name;
  parentResultElement.textContent = result[winner][0];
  childResultElement.textContent = result[winner][1];
  showCards(
    parentHand,
    parentCardElements
  );
  showCards(
    childHand,
    childCardElements
  );
};

// 初期化
const initializeGame = () => {
  deck.splice(0, deck.length);
  deck.push(...createDeck());
  parentHand.splice(0, parentHand.length);
  childHand.splice(0, childHand.length);

  showReverseCards(parentCardElements);
  showReverseCards(childCardElements);

  parentRoleElement.textContent = "親の役名を表示";
  childRoleElement.textContent = "子の役名を表示";
  parentResultElement.textContent = "勝ちor負けor引分";
  childResultElement.textContent = "勝ちor負けor引分";

  startButton.style.display = "inline-block";
  resetButton.style.display = "none";
  drawButtons.style.display = "none";
  fightButton.style.display = "none";
  parentDrawButton.style.display = "inline-block";
  childDrawButton.style.display = "inline-block";
};

// 場のデータ
const deck = createDeck();
const parentHand = [];
const childHand = [];
showReverseCards(parentCardElements);
showReverseCards(childCardElements);

// ゲームスタート
startButton.addEventListener("click", () => {
  startButton.style.display = "none";
  drawButtons.style.display = "flex";
});

// 親・子のカード抽選
parentDrawButton.addEventListener("click", () => {
  drawCards(
    parentHand,
    parentDrawButton
  );
});
childDrawButton.addEventListener("click", () => {
  drawCards(
    childHand,
    childDrawButton
  );
});

// 勝負
fightButton.addEventListener("click", () => {
  fightButton.style.display = "none";

  showResult();

  resetButton.style.display = "inline-block";
});

// 最初に戻る
resetButton.addEventListener("click", () => {
  initializeGame();
});