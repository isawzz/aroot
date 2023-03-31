//#region consts
const ALLOW_CALIBRATION = false;
const allPeeps = []
const allPlayerTypes = ['me', 'human', 'AI regular', 'AI random', 'AI pass'];
const ALLTESTSOLUTIONS = {
  0: {},
  1: { "0": { "_1": { "w": 23, "h": 120 }, "_2": { "w": 19, "h": 19 } }, "1": { "_1": { "w": 104, "h": 120 }, "_2": { "w": 19, "h": 19 } }, "2": { "_1": { "w": 104, "h": 120 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 } }, "3": { "_1": { "w": 104, "h": 120 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 } }, "4": { "_1": { "w": 27, "h": 145 }, "_2": { "w": 23, "h": 19 }, "_3": { "w": 23, "h": 19 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "5": { "_1": { "w": 130, "h": 124 }, "_2": { "w": 126, "h": 19 }, "_3": { "w": 126, "h": 19 }, "_4": { "w": 126, "h": 61 }, "_5": { "w": 44, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 40 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "6": { "_1": { "w": 104, "h": 145 }, "_2": { "w": 19, "h": 124 }, "_3": { "w": 19, "h": 124 }, "_4": { "w": 58, "h": 124 }, "_5": { "w": 54, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 54, "h": 19 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } } },
  2: { "0": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "1": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "2": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 65, "h": 19 }, "_3": { "w": 65, "h": 19 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "3": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 65, "h": 19 }, "_3": { "w": 65, "h": 19 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "4": { "_1": { "w": 27, "h": 145 }, "_2": { "w": 23, "h": 19 }, "_3": { "w": 23, "h": 19 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "5": { "_1": { "w": 130, "h": 124 }, "_2": { "w": 126, "h": 19 }, "_3": { "w": 126, "h": 19 }, "_4": { "w": 126, "h": 61 }, "_5": { "w": 44, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 40 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "6": { "_1": { "w": 104, "h": 145 }, "_2": { "w": 19, "h": 124 }, "_3": { "w": 19, "h": 124 }, "_4": { "w": 58, "h": 124 }, "_5": { "w": 54, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 54, "h": 19 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "7": { "_1": { "w": 146, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 100, "h": 82 }, "_5": { "w": 44, "h": 61 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 61 }, "_7": { "w": 28, "h": 61 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 24, "h": 19 } } },
  3: { "0": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "1": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "2": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 65, "h": 19 }, "_3": { "w": 65, "h": 19 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "3": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 65, "h": 19 }, "_3": { "w": 65, "h": 19 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "4": { "_1": { "w": 27, "h": 145 }, "_2": { "w": 23, "h": 19 }, "_3": { "w": 23, "h": 19 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "5": { "_1": { "w": 130, "h": 124 }, "_2": { "w": 126, "h": 19 }, "_3": { "w": 126, "h": 19 }, "_4": { "w": 126, "h": 61 }, "_5": { "w": 44, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 40 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "6": { "_1": { "w": 104, "h": 145 }, "_2": { "w": 19, "h": 124 }, "_3": { "w": 19, "h": 124 }, "_4": { "w": 58, "h": 124 }, "_5": { "w": 54, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 54, "h": 19 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "7": { "_1": { "w": 146, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 100, "h": 82 }, "_5": { "w": 44, "h": 61 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 61 }, "_7": { "w": 28, "h": 61 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 24, "h": 19 } }, "8": { "_1": { "w": 94, "h": 166 }, "_2": { "w": 19, "h": 145 }, "_3": { "w": 19, "h": 145 }, "_4": { "w": 48, "h": 145 }, "_5": { "w": 44, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 44, "h": 19 }, "_7": { "w": 44, "h": 61 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 24, "h": 19 } }, "9": { "_1": { "w": 23, "h": 40 }, "_2": { "w": 19, "h": 19 } }, "10": { "_1": { "w": 23, "h": 23 }, "_2": { "w": 19, "h": 19 } }, "11": { "_1": { "w": 44, "h": 40 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 } }, "12": { "_1": { "w": 23, "h": 61 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 } }, "13": { "_1": { "w": 44, "h": 23 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 } }, "14": { "_1": { "w": 111, "h": 44 }, "_2": { "w": 19, "h": 40 }, "_3": { "w": 19, "h": 40 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "15": { "_1": { "w": 172, "h": 82 }, "_2": { "w": 19, "h": 61 }, "_3": { "w": 19, "h": 61 }, "_4": { "w": 126, "h": 61 }, "_5": { "w": 44, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 40 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "16": { "_1": { "w": 172, "h": 65 }, "_2": { "w": 19, "h": 61 }, "_3": { "w": 19, "h": 61 }, "_4": { "w": 126, "h": 61 }, "_5": { "w": 44, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 40 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "17": { "_1": { "w": 490, "h": 23 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 }, "_4": { "w": 19, "h": 19 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 }, "_12": { "w": 24, "h": 19 }, "_13": { "w": 24, "h": 19 }, "_14": { "w": 24, "h": 19 }, "_15": { "w": 24, "h": 19 }, "_16": { "w": 24, "h": 19 }, "_17": { "w": 24, "h": 19 }, "_18": { "w": 24, "h": 19 }, "_19": { "w": 24, "h": 19 }, "_20": { "w": 24, "h": 19 }, "_21": { "w": 24, "h": 19 } }, "18": { "_1": { "w": 196, "h": 40 }, "_2": { "w": 19, "h": 19 } }, "19": { "_1": { "w": 196, "h": 61 }, "_2": { "w": 19, "h": 40 }, "_3": { "w": 19, "h": 40 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "20": { "_1": { "w": 196, "h": 40 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 }, "_4": { "w": 19, "h": 19 } }, "21": { "_1": { "w": 27, "h": 145 }, "_2": { "w": 23, "h": 19 }, "_3": { "w": 23, "h": 19 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "22": { "_1": { "w": 196, "h": 103 }, "_2": { "w": 65, "h": 19 }, "_3": { "w": 65, "h": 19 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "23": { "_1": { "w": 196, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } } },
  4: {},
  5: { "0": { "_1": { "w": 33, "h": 120 }, "_2": { "w": 19, "h": 19 } }, "1": { "_1": { "w": 104, "h": 120 }, "_2": { "w": 19, "h": 19 } } },
  6: {},
  7: { "0": { "_1": { "w": 22, "h": 46 }, "_2": { "w": 22, "h": 23 }, "_3": { "w": 22, "h": 23 } } },
};
const availablePeeps = []
const beforeActivationMask = 1 << 1;
const BLUE = '#4363d8';
const BLUFF = {
  torank: { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' },
  toword: { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' },
  rankstr: '3456789TJQKA',
};
const BoyNames = ['aaron', 'andy', 'bill', 'blade', 'bob', 'buddy', 'creed', 'dan', 'darryl', 'dagobert', 'david', 'donald', 'dwight', 'felix',
  'gilbert', 'gul', 'jim', 'john', 'kevin', 'leo', 'luis', 'mac', 'max', 'michael', 'mike', 'oscar', 'peter', 'robert', 'ryan',
  'sebastian', 'stanley', 'stitch', 'toby', 'tom', 'vladimir', 'wolf', 'wolfgang'];
const BRAUN = '#331606';
const BROWN = '#96613d';
const CACHE_INITDATA = true;
const CARD_SZ = 80;
const clientData = {};
const CODE = {};
const CODE_VERSION = 1;
const ColorList = ['lightgreen', 'lightblue', 'yellow', 'red', 'green', 'blue', 'purple', 'violet', 'lightyellow',
  'teal', 'orange', 'brown', 'olive', 'deepskyblue', 'deeppink', 'gold', 'black', 'white', 'grey'];
const COLORPARAMNAMES = {
  bg: true,
  fg: true,
  color: true,
  'font-color': true,
  border: true,
  highlight: true,
  highlight1: true,
  highlight1: true,
}
const config = {
  src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/open-peeps-sheet.png',
  rows: 15,
  cols: 7
}
const CORNERS = ['◢', '◣', '◤', '◥'];
const CORNERS0 = ['♠', '♡'];
const CORNERS2 = ['⬔', '⬕'];
const CORNERS3 = ['⮜', '⮝', '⮞', '⮟'];
const CORNERS4 = ['⭐', '⭑'];
const CORNERS5 = ['⬛', '⬜'];
const crowd = []
const DARKBLUE = '#04041b';
const DD = {
  yellow: 'gelb', green: 'grün', blue: 'blau', red: 'rot', pink: 'rosa', orange: 'orange', black: 'schwarz',
  white: 'weiss', violet: 'violett', '1st': 'erste', '2nd': 'zweite', '3rd': 'dritte', '4th': 'vierte', '5th': 'fünfte',
  add: 'addiere', subtract: 'subtrahiere', multiply: 'mutipliziere', plus: 'plus', minus: 'minus', times: 'mal',
  'divided by': 'dividiert durch', excellent: 'sehr gut', very: 'sehr', good: 'gut',
  'to the previous number': 'zur vorhergehenden zahl',
  'from the previous number': 'von der vorhergehenden zahl',
  'multiply the previous number by': 'multipliziere die vorhergehende zahl mit',
  'divide the previous number by': 'dividiere die vorhergehende zahl durch',
  'the previous number': 'die vorhergehende zahl', is: 'ist', what: 'was', equals: 'ist gleich', enter: "tippe",
  'to the power of': 'hoch', or: 'oder', less: 'kleiner', greater: 'grösser', than: 'als', equal: 'gleich', and: 'und',
  not: 'nicht', click: 'click', press: 'tippe', quite: 'ziemlich', 'not quite': 'nicht ganz',
  say: 'sage', write: 'schreibe', complete: 'ergänze', 'unequal': 'ungleich', except: 'ausser', EXCEPT: 'AUSSER',
  number: 'Zahl', color: 'farbe', eliminate: 'eliminiere', all: 'alle', with: 'mit', true: 'wahr', false: 'falsch',
  build: 'bilde', count: 'zähle', 'the red dots': 'die roten Punkte',
};
const DEF_ORIENTATION = 'v';
const DEF_SPLIT = 0.5;
const defaultDeckAreaName = 'deckArea';
const defaultGameplayerAreaName = 'gameplayerArea';
const DEFAULTPICTYPE = 'all';
const defaultTabletopCardsAreaName = 'tabletopCardsArea';
const DOMCATS = { rect: 'g', g: 'g', circle: 'g', text: 'g', polygon: 'g', line: 'g', body: 'd', svg: 'h', div: 'd', p: 'd', table: 'd', button: 'd', a: 'd', span: 'd', image: 'd', paragraph: 'd', anchor: 'd' };
const DSPEC_VERSION = 3;
const EXTENDED_COLORS = ['red', 'green', 'yellow', 'blue', 'pink', 'indigo', 'gray', 'sienna', 'olive'];
const FIELD_SZ = 40;
const FIREBRICK = '#800000';
const FLASK = true;
const GENERATE_EMPTY_MESSAGES = true;
const germanNumbers = {
  ein: 1, eins: 1, zwei: 2, 1: 'eins', 2: 'zwei', 3: 'drei', drei: 3, vier: 4, 4: 'vier', 5: 'fuenf', fuenf: 5, sechs: 6, 6: 'sechs', sex: 6,
  sieben: 7, 7: 'sieben', 8: 'acht', acht: 8, 9: 'neun', neun: 9, zehn: 10, elf: 11, zwoelf: 12, zwanzig: 20, dreissig: 30,
  10: 'zehn', 11: 'elf', 12: 'zwoelf', 20: 'zwanzig', 30: 'dreissig', vierzig: 40, fuenfzig: 50, 40: 'vierzig', 50: 'fuenfzig'
};
const GermanToEnglish = {
  rot: 'red', blau: 'blue', grün: 'green', gelb: 'yellow', violett: 'violet', lila: 'purple',
  braun: 'brown', schwarz: 'black', weiss: 'white', grau: 'grey', rosa: 'pink', orange: 'orange'
};
const GirlNames = ['afia', 'ally', 'amanda', 'angela', 'anna', 'annabel', 'birgit', 'bona', 'carmen', 'cassandra',
  'charlene', 'erin', 'hanna', 'holly', 'jan', 'karen', 'kelly', 'lauren', 'malta', 'maria', 'maurita', 'minnow', 'meredith',
  'milda', 'mimi', 'minna', 'minnow', 'mitra', 'nasi', 'nil', 'nimble', 'nonna', 'pam', 'phyllis', 'poppa', 'rhi', 'sarah',
  'sheeba', 'valerie', 'viola', 'wala'];
const GREEN = '#3cb44b';
const BLUEGREEN = '#004054';
const GT = {};
const hasClickedMask = 1 << 2;
const HEROKU = false;
const img = document.createElement('img')
const immediateStart = true;
const INCREMENTAL_UPDATE = true;
const INIT_CLEAR_LOCALSTORAGE = true;
const INNO = {
  color: { blue: '#89aad7', red: '#da7887', green: '#72b964', yellow: '#e2e57a', purple: '#9b58ba' },
  sym: {
    tower: { key: 'white-tower', fg: 'silver', bg: 'dimgray' },
    leaf: { key: 'leaf', fg: '#96D6BE', bg: '#275D45' },
    tree: { key: 'leaf', fg: '#96D6BE', bg: '#275D45' },
    bulb: { key: 'lightbulb', fg: 'white', bg: '#69224C' },
    crown: { key: 'queen-crown', fg: '#FEE593', bg: '#A27E44' },
    factory: { key: 'i_factory', fg: '#CD5147', bg: '#6D1A12' },
    clock: { key: 'clock', fg: '#3E84B5', bg: '#0B5884' },
    none: { key: 'flamer', fg: 'silver', bg: 'dimgrey' },
    plus: { key: 'plus', fg: 'silver', bg: '#00000020' },
    fountain: { key: 'fountain', fg: 'silver', bg: '#00000020' },
    flag: { key: 'flying-flag', fg: 'silver', bg: '#00000020' },
    up: { key: 'arrow-up', fg: 'silver', bg: '#00000020' },
    left: { key: 'arrow-left', fg: 'silver', bg: '#00000020' },
    right: { key: 'arrow-right', fg: 'silver', bg: '#00000020' },
  },
  symNames: ['tower', 'tree', 'bulb', 'crown', 'factory', 'clock'],
  phases: [
    { key: 'init', message: 'select initial card to meld!' },
    { key: 'just_one_turn', message: 'take your first turn!' },
    { key: 'two_turns', message: 'take your turn!' },
  ],
  special_achievements: {
    MONUMENT: "Claim immediately if you tuck six cards or score six cards during a single turn (May also be claimed via Masonry from Age 1)",
    EMPIRE: "Claim immediately if you have three  or more icons of all six types (May also be claimed via Construction from Age 2)",
    WORLD: "Claim immediately if you have twelve or more clocks on your board (May also be claimed via Translation from Age 3)",
    WONDER: "Claim immediately if you have all five colors on your board, and each is splayed either up or right (May also be claimed via Invention from Age 4)",
    UNIVERSE: "Claim immediately if you have five top cards, and each is of value 8 or higher (May also be claimed via Astronomy from Age 5)",
    LEGEND: "Claim if you meld a city with a left arrow on a color already splayed left",
    REPUTE: "Claim if you meld a city with a right arrow on a color already splayed right",
    FAME: "Claim if you meld a city with a up arrow on a color already splayed up",
    GLORY: "Claim immediately tuck a city with a flag",
    VICTORY: "Claim immediately tuck a city with a fountain",
    SUPREMACY: "Claim immediately if you have 3 or more of one icon in 4 different colors (May also be claimed via Novel from Age 3)",
    DESTINY: "Claim immediately if you have 7 or more cards in your forecast (May also be claimed via Barometer from Age 4)",
    WEALTH: "Claim immediately if you have 8 or more bonuses (May also be claimed via Palampore from Age 5)",
    HERITAGE: "Claim immediately if you have 8 or more numbers in one color (May also be claimed via Loom from Age 6)",
    HISTORY: "Claim immediately if you have 4 or more echoes in one color (May also be claimed via Photography from Age 7)",
  },
};
const INTERACTION = { none: 0, selected: 1, stop: 2, saveLoad: 3, route: 4 };
const IS_MIRROR = false;
const JUST_PERLEN_GAME = true;
const KSKeys = ['action', 'actionPlus', 'all', 'best25', 'best50', 'best75', 'best100', 'emo', 'huge',
  'life', 'life50', 'lifePlus', 'nemo', 'nemo100', 'object', 'object50', 'objectPlus'];
const LABEL_SZ = 40;
const LevelsML = {
  0: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 3, NumMissingLetters: 1, MaxPosMissing: 0, MaxNumTrials: 3 },
  1: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 4, NumMissingLetters: 1, MaxPosMissing: 0, MaxNumTrials: 3 },
  2: { NumPics: 1, NumLabels: 1, MinWordLength: 4, MaxWordLength: 5, NumMissingLetters: 2, MaxPosMissing: 1, MaxNumTrials: 3 },
  3: { NumPics: 1, NumLabels: 0, MinWordLength: 4, MaxWordLength: 6, NumMissingLetters: 1, MaxPosMissing: 0, MaxNumTrials: 3 },
  4: { NumPics: 1, NumLabels: 0, MinWordLength: 4, MaxWordLength: 7, NumMissingLetters: 2, MaxPosMissing: 1, MaxNumTrials: 3 },
  5: { NumPics: 1, NumLabels: 0, MinWordLength: 5, MaxWordLength: 8, NumMissingLetters: 1, MaxPosMissing: 1, MaxNumTrials: 3 },
  6: { NumPics: 1, NumLabels: 0, MinWordLength: 5, MaxWordLength: 9, NumMissingLetters: 2, MaxPosMissing: 2, MaxNumTrials: 3 },
  7: { NumPics: 1, NumLabels: 0, MinWordLength: 5, MaxWordLength: 10, NumMissingLetters: 3, MaxPosMissing: 4, MaxNumTrials: 3 },
  8: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 11, NumMissingLetters: 4, MaxPosMissing: 12, MaxNumTrials: 3 },
  9: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 12, NumMissingLetters: 5, MaxPosMissing: 12, MaxNumTrials: 3 },
  10: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 12, NumMissingLetters: 6, MaxPosMissing: 12, MaxNumTrials: 3 },
}
const LevelsSP = {
  0: { NumPics: 1, NumLabels: 1, MinWordLength: 2, MaxWordLength: 21, MaxNumTrials: 3 },
  1: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 21, MaxNumTrials: 3 },
  2: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 21, MaxNumTrials: 3 },
  3: { NumPics: 1, NumLabels: 0, MinWordLength: 4, MaxWordLength: 21, MaxNumTrials: 3 },
  4: { NumPics: 1, NumLabels: 0, MinWordLength: 4, MaxWordLength: 21, MaxNumTrials: 3 },
  5: { NumPics: 1, NumLabels: 0, MinWordLength: 5, MaxWordLength: 21, MaxNumTrials: 3 },
  6: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 21, MaxNumTrials: 3 },
  7: { NumPics: 1, NumLabels: 0, MinWordLength: 7, MaxWordLength: 21, MaxNumTrials: 3 },
  8: { NumPics: 1, NumLabels: 0, MinWordLength: 8, MaxWordLength: 21, MaxNumTrials: 3 },
  9: { NumPics: 1, NumLabels: 0, MinWordLength: 7, MaxWordLength: 21, MaxNumTrials: 3 },
  10: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 21, MaxNumTrials: 3 },
}
const LevelsSPA = {
  0: { NumPics: 1, NumLabels: 1, MinWordLength: 2, MaxWordLength: 4, MaxNumTrials: 1 },
  1: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 5, MaxNumTrials: 3 },
  2: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 6, MaxNumTrials: 3 },
  3: { NumPics: 1, NumLabels: 0, MinWordLength: 4, MaxWordLength: 7, MaxNumTrials: 3 },
  4: { NumPics: 1, NumLabels: 0, MinWordLength: 4, MaxWordLength: 8, MaxNumTrials: 3 },
  5: { NumPics: 1, NumLabels: 0, MinWordLength: 5, MaxWordLength: 9, MaxNumTrials: 3 },
  6: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 10, MaxNumTrials: 3 },
  7: { NumPics: 1, NumLabels: 0, MinWordLength: 7, MaxWordLength: 11, MaxNumTrials: 3 },
  8: { NumPics: 1, NumLabels: 0, MinWordLength: 8, MaxWordLength: 12, MaxNumTrials: 3 },
  9: { NumPics: 1, NumLabels: 0, MinWordLength: 7, MaxWordLength: 13, MaxNumTrials: 3 },
  10: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 14, MaxNumTrials: 1 },
}
const LevelsTC = {
  0: { NumColors: 2, NumPics: 2, NumLabels: 4, MinWordLength: 2, MaxWordLength: 5, MaxNumTrials: 1 },
  1: { NumColors: 2, NumPics: 3, NumLabels: 6, MinWordLength: 3, MaxWordLength: 6, MaxNumTrials: 1 },
  2: { NumColors: 3, NumPics: 2, NumLabels: 6, MinWordLength: 3, MaxWordLength: 7, MaxNumTrials: 1 },
  3: { NumColors: 3, NumPics: 3, NumLabels: 9, MinWordLength: 4, MaxWordLength: 7, MaxNumTrials: 1 },
  4: { NumColors: 3, NumPics: 3, NumLabels: 0, MinWordLength: 4, MaxWordLength: 14, MaxNumTrials: 2 },
  5: { NumColors: 2, NumPics: 2, NumLabels: 2, MinWordLength: 4, MaxWordLength: 8, MaxNumTrials: 1 },
  6: { NumColors: 2, NumPics: 2, NumLabels: 2, MinWordLength: 4, MaxWordLength: 9, MaxNumTrials: 1 },
  7: { NumColors: 2, NumPics: 2, NumLabels: 2, MinWordLength: 5, MaxWordLength: 10, MaxNumTrials: 2 },
  8: { NumColors: 3, NumPics: 3, NumLabels: 9, MinWordLength: 5, MaxWordLength: 11, MaxNumTrials: 2 },
  9: { NumColors: 3, NumPics: 3, NumLabels: 3, MinWordLength: 6, MaxWordLength: 12, MaxNumTrials: 2 },
  10: { NumColors: 3, NumPics: 3, NumLabels: 0, MinWordLength: 6, MaxWordLength: 13, MaxNumTrials: 3 },
}
const LevelsTP = {
  0: { NumPics: 2, NumLabels: 2, MinWordLength: 2, MaxWordLength: 4, MaxNumTrials: 1 },
  1: { NumPics: 3, NumLabels: 3, MinWordLength: 3, MaxWordLength: 5, MaxNumTrials: 1 },
  2: { NumPics: 2, NumLabels: 1, MinWordLength: 3, MaxWordLength: 6, MaxNumTrials: 1 },
  3: { NumPics: 3, NumLabels: 2, MinWordLength: 4, MaxWordLength: 7, MaxNumTrials: 1 },
  4: { NumPics: 2, NumLabels: 0, MinWordLength: 4, MaxWordLength: 8, MaxNumTrials: 1 },
  5: { NumPics: 4, NumLabels: 4, MinWordLength: 4, MaxWordLength: 9, MaxNumTrials: 1 },
  6: { NumPics: 3, NumLabels: 1, MinWordLength: 5, MaxWordLength: 10, MaxNumTrials: 2 },
  7: { NumPics: 4, NumLabels: 2, MinWordLength: 5, MaxWordLength: 11, MaxNumTrials: 1 },
  8: { NumPics: 5, NumLabels: 5, MinWordLength: 6, MaxWordLength: 12, MaxNumTrials: 1 },
  9: { NumPics: 3, NumLabels: 0, MinWordLength: 6, MaxWordLength: 13, MaxNumTrials: 2 },
  10: { NumPics: 4, NumLabels: 0, MinWordLength: 4, MaxWordLength: 14, MaxNumTrials: 2 },
}
const LevelsWP = {
  0: { NumPics: 1, NumLabels: 1, MinWordLength: 2, MaxWordLength: 3, MaxNumTrials: 3 },
  1: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 4, MaxNumTrials: 3 },
  2: { NumPics: 1, NumLabels: 1, MinWordLength: 3, MaxWordLength: 5, MaxNumTrials: 3 },
  3: { NumPics: 1, NumLabels: 0, MinWordLength: 3, MaxWordLength: 6, MaxNumTrials: 3 },
  4: { NumPics: 1, NumLabels: 0, MinWordLength: 4, MaxWordLength: 7, MaxNumTrials: 3 },
  5: { NumPics: 1, NumLabels: 0, MinWordLength: 5, MaxWordLength: 8, MaxNumTrials: 3 },
  6: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 9, MaxNumTrials: 3 },
  7: { NumPics: 1, NumLabels: 0, MinWordLength: 7, MaxWordLength: 11, MaxNumTrials: 3 },
  8: { NumPics: 1, NumLabels: 0, MinWordLength: 8, MaxWordLength: 12, MaxNumTrials: 3 },
  9: { NumPics: 1, NumLabels: 0, MinWordLength: 7, MaxWordLength: 13, MaxNumTrials: 3 },
  10: { NumPics: 1, NumLabels: 0, MinWordLength: 6, MaxWordLength: 14, MaxNumTrials: 3 },
}
const LIGHTBLUE = '#42d4f4';
const LIGHTGREEN = '#afff45'; //'#bfef45';
const MARGIN_M = '4px 10px';
const MARGIN_S = '3px 6px';
const MARGIN_XS = '2px 4px';
const MarkerId = { SUCCESS: 0, FAIL: 1 };
const MarkerText = ['✔️', '❌'];
const MASTERVOLUME = 0.1;
const MAX_CARD_HEIGHT = 100;
const MAX_PLAYERS_AVAILABLE = 8;
const MAX_RECURSIONS = 200;
const MAXNODES = 5;
const messages = [];
const messageTypes = { LEFT: 'left', RIGHT: 'right', LOGIN: 'login' };
const MIN_CARD_HEIGHT = 60;
const MOUSED = 15;
const myDom = {
  points: {
    text: document.getElementById('points-text'),
    align: document.getElementById('points-align'),
    baseline: document.getElementById('points-baseline'),
    rotation: document.getElementById('points-rotation'),
    font: document.getElementById('points-font'),
    weight: document.getElementById('points-weight'),
    size: document.getElementById('points-size'),
    height: document.getElementById('points-height'),
    offsetX: document.getElementById('points-offset-x'),
    offsetY: document.getElementById('points-offset-y'),
    color: document.getElementById('points-color'),
    outline: document.getElementById('points-outline'),
    outlineWidth: document.getElementById('points-outline-width'),
    maxreso: document.getElementById('points-maxreso'),
  },
  lines: {
    text: document.getElementById('lines-text'),
    align: document.getElementById('lines-align'),
    baseline: document.getElementById('lines-baseline'),
    rotation: document.getElementById('lines-rotation'),
    font: document.getElementById('lines-font'),
    weight: document.getElementById('lines-weight'),
    placement: document.getElementById('lines-placement'),
    maxangle: document.getElementById('lines-maxangle'),
    overflow: document.getElementById('lines-overflow'),
    size: document.getElementById('lines-size'),
    height: document.getElementById('lines-height'),
    offsetX: document.getElementById('lines-offset-x'),
    offsetY: document.getElementById('lines-offset-y'),
    color: document.getElementById('lines-color'),
    outline: document.getElementById('lines-outline'),
    outlineWidth: document.getElementById('lines-outline-width'),
    maxreso: document.getElementById('lines-maxreso'),
  },
  polygons: {
    text: document.getElementById('polygons-text'),
    align: document.getElementById('polygons-align'),
    baseline: document.getElementById('polygons-baseline'),
    rotation: document.getElementById('polygons-rotation'),
    font: document.getElementById('polygons-font'),
    weight: document.getElementById('polygons-weight'),
    placement: document.getElementById('polygons-placement'),
    maxangle: document.getElementById('polygons-maxangle'),
    overflow: document.getElementById('polygons-overflow'),
    size: document.getElementById('polygons-size'),
    height: document.getElementById('polygons-height'),
    offsetX: document.getElementById('polygons-offset-x'),
    offsetY: document.getElementById('polygons-offset-y'),
    color: document.getElementById('polygons-color'),
    outline: document.getElementById('polygons-outline'),
    outlineWidth: document.getElementById('polygons-outline-width'),
    maxreso: document.getElementById('polygons-maxreso'),
  },
};
const MyNames = ['amanda', 'angela', 'erin', 'holly', 'jan', 'karen', 'kelly', 'pam', 'phyllis', 'andy', 'creed', 'darryl', 'david', 'dwight', 'felix', 'gul', 'jim', 'kevin', 'luis', 'michael', 'nil', 'oscar', 'ryan', 'stanley', 'toby', 'wolfgang'];
const names = ['felix', 'amanda', 'sabine', 'tom', 'taka', 'microbe', 'dwight', 'jim', 'michael', 'pam', 'kevin', 'darryl', 'lauren', 'anuj', 'david', 'holly'];
const NATURE = {
  depth: 6,
  branching: [-25, 5, 25],
  lsystems: [
    {
      axiom: 'A',
      rules: [
        { aus: 'A', wird: 'A+[+A-A]' },
      ],
      angle: 25,
      len: 500,
      dlen: .7,
      depth: 6
    },
    {
      axiom: 'F',
      rules: [
        { aus: 'F', wird: 'F[+F]F[-F]F' },
      ],
      angle: 26,
      len: 50,
    },
    {
      axiom: 'F',
      rules: [
        { aus: 'F', wird: 'F[+F]F[-F][F]' },
      ],
      angle: 20,
      len: 200,
    },
    {
      axiom: 'X',
      rules: [
        { aus: 'X', wird: 'F[+X][-X]FX' },
        { aus: 'F', wird: 'FF' },
      ],
      angle: 26,
      len: 200,
    },
    {
      axiom: 'A',
      rules: [{ aus: 'A', wird: 'AA+[+A-A-A]-[-A+A+A]' }],
      angle: 25,
    },
    {
      axiom: 'A',
      rules: [{ aus: 'F', wird: 'FF' }, { aus: 'A', wird: 'F-[[A]+A]+F[+FA]-A' }],
      angle: 23,
    },
    {
      axiom: 'Y',
      rules: [{ aus: 'X', wird: 'X[-FFF][+FFF]FX' }, { aus: 'Y', wird: 'YFX[+Y][-Y]' }, { aus: 'F', wird: 'X' }],
      angle: 25,
      len: 85,
    },
    {
      axiom: 'F',
      rules: [{ aus: 'F', wird: 'F[+FF][-FF]F[-F][+F]F' }],
      angle: 35,
      len: 70,
    },
    {
      axiom: 'VZFFF',
      rules: [{ aus: 'V', wird: '[+++W][---W]YV' },
      { aus: 'W', wird: '+X[-W]Z' },
      { aus: 'Y', wird: 'YZ' },
      { aus: 'F', wird: 'Y' },
      { aus: 'Z', wird: '[-FFF][+FFF]F' },
      { aus: 'X', wird: '-W[+X]Z' }],
      angle: 40,
      len: 100,
    },
    {
      axiom: 'F++F++F',
      rules: [{ aus: 'F', wird: 'F-F++F-F' }],
      angle: 60,
      len: 100,
      depth: 3,
      xstart: 3,
    },
    {
      axiom: 'F+F+F+F',
      rules: [{ aus: 'F', wird: 'FF+F+F+F+FF' }],
      angle: 90,
      len: 100,
      depth: 3,
      xstart: 6,
    },
    {
      axiom: 'F+F+F+F',
      rules: [{ aus: 'F', wird: 'F+F-F-FFF+F+F-F' }],
      angle: 90,
      len: 28,
      depth: 3,
    },
    {
      axiom: 'X',
      rules: [
        { aus: 'X', wird: '-YF+XFX+FY-' },
        { aus: 'Y', wird: '+XF-YFY-FX+' },
        { aus: 'F', wird: 'F' },
      ],
      angle: 90,
      len: 150,
      xstart: 1.3,
      depth: 4,
    },
    {
      axiom: 'X',
      rules: [{ aus: 'F', wird: 'FF' },
      { aus: 'X', wird: 'F[+X]F[-X]+X' }],
      angle: 20,
      len: 200,
    },
  ]
};
const NGROK = false; //'http://849aec381695.ngrok.io/'; // MUSS / am ende!!!
const OLIVE = '#808000';
const ORANGE = '#f58231';
const NEONORANGE = '#ff6700';
const PARAMCSS = {
  bg: 'background-color',
  fg: 'color',
  align: 'text-align',
  rounding: 'border-radius',
};
const PARAMRSG_T = {
  defaultType: false,
  show: false,
  overlap: true,
  orientation: true,
  split: true,
  shape: true,
  field_spacing: true,
  size: true,
  rounding: true,
};
const PERLEN_DATA_PATH = './public/PERLENDATA/';
const PERLENPATH_FRONT = './PERLENDATA/';
const PLAYER_CONFIG_FOR_MULTIPLAYER = ['me', 'human', 'human'];
const playerColors = {
  red: '#D01013',
  blue: '#003399',
  green: '#58A813',
  orange: '#FF6600',
  yellow: '#FAD302',
  violet: '#55038C',
  pink: '#ED527A',
  beige: '#D99559',
  sky: '#049DD9',
  brown: '#A65F46',
  white: '#FFFFFF',
};
const PlayerColors = {
  red: '#D01013',
  blue: '#003399',
  green: '#58A813',
  orange: '#FF6600',
  yellow: '#FAD302',
  violet: '#55038C',
  pink: '#ED527A',
  beige: '#D99559',
  sky: '#049DD9',
  brown: '#A65F46',
  white: '#FFFFFF',
  lightblue: '#42d4f4',
  lightgreen: '#afff45',
};
const PURPLE = '#911eb4';
const RCONTAINERPROP = {
  list: 'elm',
  hand: 'elm',
  panel: 'sub',
}
const RED = '#e6194B';
const DIBOA = {
  home: { link: "../rechnung/index.html", img: 'home.png', align: 'left', pop: false },
  bill: { link: "../rechnung/index.html", img: 'bill.png', align: 'left', pop: false },
  boa: { link: "", img: 'boa.png', align: 'left', pop: false },
  bw: { link: "../rechnung/bwindex.html", img: 'bwicon.png', align: 'right', pop: true },
  authenticator: { link: "../rechnung/boaa.html", img: 'authenticator.png', align: 'right', pop: true },
  authy: { link: "../rechnung/boaa.html", img: 'authy.png', align: 'right', pop: true },
  onedrive: { link: "../rechnung/boaa.html", img: 'onedrive.png', align: 'right', pop: true },
  skype: {
    link: "../rechnung/boaa.html", img: 'skype.png', align: 'right', pop: false,
    contacts: {
      'Julia Oasis': { date: 'Wed', msg: 'Wow', color: BLUEGREEN },
      '+14778991960': { date: 'Thu', msg: 'Missed Call', color: ORANGE },
    }
  },
  bw_info: {
    boa: { userid: 'gleem@gmail.com', pwd: 'asffdghsjdfkhdfjfh' },
    authy: { userid: 'gleem@gmail.com', pwd: 'dfgsgbfgbskdgsbg' },
  },
  boa_data: {
    'AAA-MBNA 5464 3332 3333 5555': { sub: '*5555', logo: 'boa.png' },
    'AMERICAN EXPRESS': { sub: '*4554', logo: 'amex.png' },
    'AT&T Mobility': { sub: '*1331', logo: 'att.png' },
    'AT&T Mobility{AT&T WA}': { sub: '*7575', logo: 'att.png' },
    'AT&T Mobility': { sub: '*8585', logo: 'att.png' },
    'Bank Of Amerika Credit Card': { sub: '*1212', logo: 'boa.png', 'Last Payment': '5-25 $1150.41', brand: 'BofA_rgb' },
    'Bank Of Amerika': { sub: '*0898', logo: 'boa.png' },
    'Bank Of Amerika Mail-in1': { sub: '*6565', logo: 'boa.png' },
    'Bel-Red Oral': { sub: '*2432' },
    'Bellevue Kendo Club': { sub: '*hallo' },
    'CapitalOne': { sub: '*1324', logo: 'capitalOne.png' },
    'CapitalOneVenture': { sub: '*6456', logo: 'capitalOne.png' },
    'CapitalOneVentureF': { sub: '*9789', logo: 'capitalOne.png' },
    'Chase': { sub: '*3131', logo: 'chase.png' },
    'Chase Amazon': { sub: '*0898', 'Last Payment': '5-25 $1150.41', logo: 'chase.png', brand: 'prime' },
    'Chase Card': { sub: '*1432', logo: 'chase.png' },
    'CHASE MANHATTAN BANK-MC': { sub: '*0797', 'Last Payment': '5-25 $110.99', logo: 'chase.png', brand: 'chase_bank' },
    'Chase Sapphire': { sub: '*5132', logo: 'chase.png' },
    'Chase Sapphire': { sub: '*8679', logo: 'chase.png' },
    'City Cards': { sub: '*3124', logo: 'citi.png' },
    'City Cards Divident': { sub: '*9678', logo: 'citi.png' },
    'CITY CARDS Points': { sub: '*7678', logo: 'citi.png' },
    'Citi Costco': { sub: '*8768', 'Last Payment': '6-17 $506.14', logo: 'citi.png', brand: 'citibank' },
    'Citi Costco gu': { sub: '*0890', 'Last Payment': '6-6 $228.92', logo: 'citi.png', brand: 'citibank' },
    'CITI DIVIDENT Platinum': { sub: '*3454', logo: 'citi.png' },
    'CITIBANK VISA NV': { sub: '*7566', logo: 'citi.png' },
    'City of Redmond': { sub: '*4998' },
    'City of Redmond WA': { sub: '*2887', 'Last Payment': '5-17 $214.94', brand: 'redmond' },
    'Comcast': { sub: '*7676', logo: 'comcast.png' },
    'Comcast Perrigo': { sub: '*1324', 'Last Payment': '6-21 $89.44', logo: 'comcast.png', brand: 'comcast' },
    'ComCast WA': { sub: '*6456', logo: 'comcast.png' },
    'DISCOVER CARD SERVICES': { sub: '*8678' },
    'Dr. Ellie Tabaraie': { sub: '*hallo' },
    'Fastenerz.com': { sub: '*000' },
    'Fibonacci': { sub: '*6666' },
    'Fleet Credit Card Service': { sub: '*8798' },
    'FLEET CREDIT CARD0MC/VS (32)': { sub: '*8799' },
    'Frontier': { sub: '*05-5' },
    'Frontier2': { sub: '*5366' },
    'GoodToGo': { sub: '*7767' },
    'Hardford Mutual Funds Inc.': { sub: '*8878' },
    'King County Treasury': { sub: '*0-02' },
    'King County Treasury': { sub: '*0-03' },
    'LabCorp': { sub: '*8899' },
    'Landover Mortgage': { sub: '*hallo' },
    'Lauren Magada': { sub: 'Lauren boa' },
    'Lederman&Pulman': { sub: '*9988' },
    'Liberty Mutual Group': { sub: '*-660' },
    'Liberty Mutual Group': { sub: '*-768' },
    'Liberty Mutual Group': { sub: '*-760' },
    "Macy's Star Rewards": { sub: '*23-0', logo: 'macys.png' },
    'MBNA': { sub: '*3444' },
    'MBNA 6455 6677 7924 5555': { sub: '*5555' },
    'Oachita': { sub: '*6556' },
    'Oasis Condominium CA': { sub: '*889' },
    'Oasis Condominium CA': { sub: '*1889', 'Last Payment': '5-31 $581.54', brand: 'oasis' },
    'Orthodontics Roos': { sub: '*1111' },
    'Overcast Law Office, PS': { sub: '*4423' },
    'Overlake Medical Center': { sub: '*hallo' },
    'Pediatric Associates Inc': { sub: '*8383' },
    'Perrigo Heights HOA': { sub: '*t#98' },
    'Premier Periodontics': { sub: '*9494' },
    'PreventionMD': { sub: '*9566' },
    'Prime Trust LLC': { sub: '*8788' },
    'ProSport': { sub: '*1233' },
    'PSE - Puget Sound Energy': { sub: '*3444', 'Last Payment': '5-25 $70.59', brand: 'PSE' },
    'Puget Sound Energy': { sub: '*66-9' },
    'Real Property Management Eclipse': { sub: '*asss' },
    'Remadina Ridge Family Dentistry': { sub: '*6656' },
    'Sewage Capacity Charge': { sub: '*7575' },
    'Silkroad': { sub: '*788-1' },
    'Suhrco': { sub: '*899' },
    'Target': { sub: '*9789' },
    'Target National Bank': { sub: '*1432' },
    'Univerity Of WA Medical Center': { sub: '*1543' },
    'US Bank Credit Card FlexPerks': { sub: '*0789', 'Last Payment': '5-20 $11.13', brand: 'usbank' },
    'USBank': { sub: '*7567' },
    'USBank-CashPlus': { sub: '*3123' },
    'USBank-FlexPerks': { sub: '*1321' },
    'Verizon': { sub: '*7567' },
    'Waste Management': { sub: '*87-1' },
    'Waste Management': { sub: '*23-9' },
    'Wells Fargo Home Mortgage': { sub: '*1333', 'Last Payment': '6-10 $1625.06', logo: 'wellsfargo.png', brand: 'wellsfargo' },
    'Wells Fargo Mortgage': { sub: '*2444', logo: 'wellsfargo.png' },
    'Williams-Sonoma': { sub: '*9888' },
    'WINDERMERE PROPERTY MGMT/EASTSID': { sub: '*8766' },
    'Windermere Real Estate/East': { sub: '*ntal' },
  }
};
const RSGTYPES = { board: 1, hand: 2, field: 101, edge: 102, corner: 103 };
const RUNTEST = false;
const SEND_MOUSE_MOVE_EVERY = 200;
const SERVER_URL = IS_MIRROR ? 'http://localhost:5555/' : FLASK ? (NGROK ? NGROK : 'http://localhost:' + PORT + '/') : 'http://localhost:5005/';
const SERVERDATA_VERSION = 1;
const SHOW_CODE = false;
const SHOW_CODE_DATA = false;
const SHOW_DEFS = false;
const SHOW_FREEZER = false;
const SHOW_SERVER_RETURN = false;
const SHOW_SERVER_ROUTE = false;
const SHOW_SERVERDATA = false;
const SHOW_TRACE = false;
const SIMPLE_COLORS = ['red', 'green', 'yellow', 'blue'];
const soloTypes = ['me', 'AI regular', 'AI random', 'AI pass'];
const stage = {
  width: 0,
  height: 0,
}
const ARI = {
  sz_hand: 7,
  stage: {
    1: 'journey',
    2: 'tax',
    3: 'auto market',
    4: 'stall selection',
    1004: 'TEST_starts_in_stall_selection_complete',
    5: 'action: command',
    6: 'action step 2',
    7: 'action 3',
    8: 'action 4',
    9: 'action 5',
    10: 'end game?',
    11: 'ball',
    12: 'auction: bid',
    13: 'auction: buy',
    14: 'complementing_market_after_church',
    15: 'commission',
    16: 'commission new',
    17: 'church',
    18: 'church_minplayer_tithe',
    19: 'church_newcards',
    20: 'payment action',
    21: 'church_minplayer_tithe_add',
    22: 'church_minplayer_tithe_downgrade',
    23: 'comm_weitergeben',
    24: 'rumors_weitergeben',
    25: 'rumor',
    26: 'blackmail',
    blackmail: 26,
    27: 'inspect',
    rumor: 25,
    28: 'buy rumor',
    'buy rumor': 28,
    29: 'rumor discard',
    30: 'pick luxury or journey cards',
    31: 'add new journey',
    32: 'rumor_both',
    33: 'blackmail_owner',
    34: 'accept_blackmail',
    35: 'blackmail_complete',
    36: 'reject_blackmail',
    37: 'commission_stall',
    38: 'pick_schwein',
    40: 'trade',
    41: 'build',
    42: 'visit',
    43: 'buy',
    44: 'upgrade',
    45: 'downgrade',
    46: 'visit destroy',
    build: 41,
    upgrade: 44,
    downgrade: 45,
    visit: 42,
    buy: 43,
    100: 'pickup end',
    101: 'build end',
    102: 'select building to upgrade',
    103: 'select downgrade cards',
    104: 'next_comm_setup_stage',
    105: 'next_rumor_setup_stage',
  }
};
const EMOFONTLIST = ['emoOpen', 'openmoBlack', 'segoe ui emoji', 'segoe ui symbol'];
const SHERIFF = {
  color: {
    legal: GREEN, //'lime',
    contraband: 'crimson',
    royal: 'orangered'
  },
  cards: {
    apples: { ksym: 'green apple', kcenter: 'red apple', label: 'apple', type: 'legal', value: 2, penalty: 2 },
    cheese: { ksym: 'cheese wedge', kcenter: 'cheese wedge', label: 'cheese', type: 'legal', value: 3, penalty: 2 },
    pineapple: { ksym: 'pineapple', kcenter: 'pineapple', label: 'pineapple', type: 'legal', value: 4, penalty: 2 },
    chicken: { ksym: 'poultry leg', kcenter: 'poultry leg', label: 'chicken', type: 'legal', value: 4, penalty: 2 },
    bread: { ksym: 'bread', kcenter: 'bread', label: 'bread', type: 'legal', value: 3, penalty: 2 },
    pepper: { ksym: 'hot pepper', kcenter: 'hot pepper', label: 'pepper', type: 'contraband', value: 6, penalty: 4 },
    mead: { ksym: 'beer mug', kcenter: 'beer mug', label: 'mead', type: 'contraband', value: 7, penalty: 4 },
    silk: { ksym: 'sari', kcenter: 'kimono', label: 'silk', type: 'contraband', value: 8, penalty: 4 },
    crossbow: { ksym: 'crossbow', kcenter: 'crossbow', label: 'crossbow', type: 'contraband', value: 9, penalty: 4 },
    chestnut: { ksym: 'chestnut', kcenter: 'chestnut', label: 'chestnut', type: 'royal', value: 4, penalty: 3 },
    pear: { ksym: 'pear', kcenter: 'pear', label: 'pear', type: 'royal', value: 6, penalty: 4 },
    pie: { ksym: 'pie', kcenter: 'pie', label: 'pie', type: 'royal', value: 6, penalty: 4 },
    squid: { ksym: 'squid', kcenter: 'squid', label: 'squid', type: 'royal', value: 9, penalty: 5 },
    shortcake: { ksym: 'shortcake', kcenter: 'shortcake', label: 'shortcake', type: 'royal', value: 9, penalty: 5 },
    grapes: { ksym: 'grapes', kcenter: 'grapes', label: 'grapes', type: 'royal', value: 9, penalty: 5 },
    pretzel: { ksym: 'pretzel', kcenter: 'pretzel', label: 'pretzel', type: 'royal', value: 9, penalty: 5 },
    baguette: { ksym: 'baguette bread', kcenter: 'baguette bread', label: 'bread', type: 'royal', value: 6, penalty: 4 },
    cherries: { ksym: 'cherries', kcenter: 'cherries', label: 'cherries', type: 'royal', value: 8, penalty: 4 },
  },
  cardtypes: {
    legal: ['apples', 'cheese', 'pineapple', 'bread'],
    contraband: ['pepper', 'mead', 'silk', 'crossbow'],
    royal: ['chestnut', 'pear', 'pie', 'shortcake', 'pretzel', 'grapes', 'baguette', 'cherries']
  },
  stage: {
    1: 'exchange',
  }
}
const STARTING_TAB_OPEN = 'bPlayers';
const STYLE_PARAMS = {
  align: 'text-align',
  acontent: 'align-content',
  aitems: 'align-items',
  aspectRatio: 'aspect-ratio',
  bg: 'background-color',
  dir: 'flex-direction',
  fg: 'color',
  hgap: 'column-gap',
  vgap: 'row-gap',
  jcontent: 'justify-content',
  jitems: 'justify-items',
  justify: 'justify-content',
  matop: 'margin-top',
  maleft: 'margin-left',
  mabottom: 'margin-bottom',
  maright: 'margin-right',
  origin: 'transform-origin',
  overx: 'overflow-x',
  overy: 'overflow-y',
  patop: 'padding-top',
  paleft: 'padding-left',
  pabottom: 'padding-bottom',
  paright: 'padding-right',
  place: 'place-items',
  rounding: 'border-radius',
  w: 'width',
  h: 'height',
  wmin: 'min-width',
  hmin: 'min-height',
  hline: 'line-height',
  wmax: 'max-width',
  hmax: 'max-height',
  fontSize: 'font-size',
  fz: 'font-size',
  family: 'font-family',
  weight: 'font-weight',
  x: 'left',
  y: 'top',
  z: 'z-index'
};
const TEAL = '#469990';
const TEST_PATH = '/zdata/';
const TEST_VERSION = '17';
const THEMES = ['#c9af98', '#2F4F4F', '#6B7A8F', '#00303F', 'rgb(3, 74, 166)', '#458766', '#7A9D96'];
const TIMIT_SHOW = false;
const uiHaltedMask = 1 << 0;
const UITEST = false;
const UnicodeSymbols = {
  menu: '☰',
};
const USE_ALL_GAMES_ROUTE = false;
const USE_BACKEND_AI = true;
const USE_MAX_PLAYER_NUM = false;
const USE_NON_TESTING_DATA = true;
const USE_OLD_GRID_FUNCTIONS = false;
const USE_SOCKETIO = false;
const USER_SERVERDATA_STUB = false;
const USERNAME_SELECTION = 'random';
const USPEC_VERSION = '2a';
const VERBOSE = true;
const VerboseSocket = false;
const voiceNames = {
  david: 'Microsoft David Desktop - English',
  zira: 'Microsoft Zira Desktop - English',
  us: 'Google US English',
  ukFemale: 'Google UK English Female',
  ukMale: 'Google UK English Male',
  deutsch: 'Google Deutsch',
};
const wamber = '#ffc107';
const waqua = '#00ffff';
const wblack = '#000000';
const wblue = '#2196f3';
const wbluegray = '#607d8b';
const wbluegrey = '#607d8b';
const wbrown = '#795548';
const wcyan = '#00bcd4';
const wdarkgrey = '#616161';
const wdeeporange = '#ff5722';
const wdeeppurple = '#673ab7';
const wgreen = '#4caf50';
const wgrey = '#9e9e9e';
const windigo = '#3f51b5';
const wkhaki = '#f0e68c';
const wlight = '#f1f1f1';
const wlightblue = '#87ceeb';
const wlightgreen = '#8bc34a';
const wlime = '#cddc39';
const worange = '#ff9800';
const wpaleblue = '#ddffff';
const wpalegreen = '#ddffdd';
const wpalered = '#ffdddd';
const wpaleyellow = '#ffffcc';
const wpink = '#e91e63';
const wpurple = '#9c27b0';
const wred = '#f44336';
const wsand = '#fdf5e6';
const wteal = '#009688';
const wwhite = '#ffffff';
const wyellow = '#ffeb3b';
const YELLOW = '#ffe119';
const NEONYELLOW = '#efff04';
const YELLOW2 = '#fff620';
const levelColors = [LIGHTGREEN, LIGHTBLUE, YELLOW, 'orange', RED,
  GREEN, BLUE, PURPLE, YELLOW2, 'deepskyblue',
  'deeppink', TEAL, ORANGE, 'seagreen', FIREBRICK, OLIVE,
  '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000', 'gold', 'orangered', 'skyblue', 'pink', 'deeppink',
  'palegreen', '#e6194B'];
const YELLOW3 = '#ffed01';
const ColorDict = {
  black: { c: 'black', E: 'black', D: 'schwarz' },
  blue: { c: 'blue', E: 'blue', D: 'blau' },
  BLUE: { c: '#4363d8', E: 'blue', D: 'blau' },
  BLUEGREEN: { c: BLUEGREEN, E: 'bluegreen', D: 'blaugrün' },
  blue1: { c: BLUE, E: 'blue', D: 'blau' },
  BRAUN: { c: BRAUN, E: 'brown', D: 'braun' },
  BROWN: { c: BROWN, E: 'brown', D: 'braun' },
  brown: { c: BRAUN, E: 'brown', D: 'braun' },
  deepyellow: { c: YELLOW3, E: 'yellow', D: 'gelb' },
  FIREBRICK: { c: '#800000', E: 'darkred', D: 'rotbraun' },
  gold: { c: 'gold', E: 'gold', D: 'golden' },
  green: { c: 'green', E: 'green', D: 'grün' },
  GREEN: { c: '#3cb44b', E: 'green', D: 'grün' },
  green1: { c: GREEN, E: 'green', D: 'grün' },
  grey: { c: 'grey', E: 'grey', D: 'grau' },
  lightblue: { c: LIGHTBLUE, E: 'lightblue', D: 'hellblau' },
  LIGHTBLUE: { c: '#42d4f4', E: 'lightblue', D: 'hellblau' },
  lightgreen: { c: LIGHTGREEN, E: 'lightgreen', D: 'hellgrün' },
  LIGHTGREEN: { c: '#afff45', E: 'lightgreen', D: 'hellgrün' },
  lightyellow: { c: YELLOW2, E: 'lightyellow', D: 'gelb' },
  olive: { c: OLIVE, E: 'olive', D: 'oliv' },
  OLIVE: { c: '#808000', E: 'olive', D: 'oliv' },
  orange: { c: ORANGE, E: 'orange', D: 'orange' },
  ORANGE: { c: '#f58231', E: 'orange', D: 'orange' },
  pink: { c: 'deeppink', E: 'pink', D: 'rosa' },
  purple: { c: PURPLE, E: 'purple', D: 'lila' },
  PURPLE: { c: '#911eb4', E: 'purple', D: 'lila' },
  red: { c: 'red', E: 'red', D: 'rot' },
  RED: { c: '#e6194B', E: 'red', D: 'rot' },
  red1: { c: RED, E: 'red', D: 'rot' },
  skyblue: { c: 'deepskyblue', E: 'skyblue', D: 'himmelblau' },
  teal: { c: TEAL, E: 'teal', D: 'blaugrün' },
  TEAL: { c: '#469990', E: 'teal', D: 'blaugrün' },
  violet: { c: 'indigo', E: 'violet', D: 'violett' },
  white: { c: 'white', E: 'white', D: 'weiss' },
  yellow: { c: 'yellow', E: 'yellow', D: 'gelb' },
  YELLOW: { c: '#ffe119', E: 'yellow', D: 'gelb' },
  YELLOW2: { c: YELLOW2, E: 'yellow', D: 'gelb' },
  YELLOW3: { c: YELLOW3, E: 'yellow', D: 'gelb' },
};
//#endregion

