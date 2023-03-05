

//#region vars (basemin)
var Pollmode = 'auto', Globals;
var Info, ColorDi, Items = {}, DA = {}, Card = {}, TO = {};
var Counter = { server: 0 };
var SERVERURL, Socket = null, SERVER = 'localhost', PORT = 3000, LIVE_SERVER, NODEJS, SINGLECLIENT;
var uiActivated = false, Selected, Turn, Prevturn;
var DB, M = {}, S = {}, Z, U = null, PL, G = null, C = null, UI = {}, Users, Tables, Basepath, Serverdata = {}, Clientdata = {};
var dBottom, dButtons, dCenter, dCode, dConsole, dContent, dFiddle, dFooter, dHeader, dLeft, dMap, dMain, dMenu, dMessage, dPage, dPuppet;
var dRight, dSidebar, dTable, dTitle, dTop;
var Config, Syms, SymKeys, ByGroupSubgroup, KeySets, C52, Cinno, C52Cards;
var FORCE_REDRAW = false, TESTING = false;
var ColorThiefObject, SelectedItem, SelectedColor;
var FR = 50, CX, CV, AU = {}, CONTEXT = null;
var UIDCounter = 0;
var FRUIDCounter = -1;
var TOFleetingMessage, dFleetingMessage, Animation1;
const SHAPEFUNCS = { 'circle': agCircle, 'hex': agHex, 'rect': agRect, };
const MyEasing = 'cubic-bezier(1,-0.03,.86,.68)';
//#endregion

//#region STYLE (basemin)
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
//#endregion

//#region title (basemin)
var WhichCorner = 0;
const CORNERS0 = ['♠', '♡'];
const CORNERS = ['◢', '◣', '◤', '◥'];
const CORNERS2 = ['⬔', '⬕'];
const CORNERS3 = ['⮜', '⮝', '⮞', '⮟'];
const CORNERS4 = ['⭐', '⭑'];
const CORNERS5 = ['⬛', '⬜'];
//#endregion

//#region audio (basemin)
var _audioSources = {
	incorrect1: '../base/assets/sounds/incorrect1.wav',
	incorrect3: '../base/assets/sounds/incorrect3.mp3',
	goodBye: "../base/assets/sounds/level1.wav",
	down: "../base/assets/sounds/down.mp3",
	levelComplete: "../base/assets/sounds/sound1.wav",
	rubberBand: "../base/assets/sounds/sound2.wav",
	hit: "../base/assets/sounds/hit.wav",
	mozart: "../base/assets/music/mozart_s39_4.mp3",
};
var _TOSound, _sndPlayer, _loaded = false, _qSound, _idleSound = true, _sndCounter = 0;
var _AUDIOCONTEXT;
//#endregion

//#region color (basemin)
const BLUE = '#4363d8';
const BLUEGREEN = '#004054';
const DARKBLUE = '#04041b';
const BROWN = '#96613d';
const GREEN = '#3cb44b';
const FIREBRICK = '#800000';
const LIGHTGREEN = '#afff45'; //'#bfef45';
const LIGHTBLUE = '#42d4f4';
const NEONORANGE = '#ff6700';
const NEONYELLOW = '#efff04';
const OLIVE = '#808000';
const ORANGE = '#f58231';
const PURPLE = '#911eb4';
const RED = '#e6194B';
const TEAL = '#469990';
const YELLOW = '#ffe119';
const YELLOW2 = '#fff620';
const YELLOW3 = '#ffed01';
//#endregion

//#region game (basemin)
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
const BLUFF = {
	torank: { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' },
	toword: { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' },
	rankstr: '3456789TJQKA',
};
const CODE = {
	paths: [],
	funcs: {},
	consts: {},
	index: [],
};
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
		boa: { userid: 'gleem@gmail.com', pwd: rPassword(20) },
		authy: { userid: 'gleem@gmail.com', pwd: rPassword(20) },
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
const EMO = {
	emoscale: {
		freedom: { list: 'joyful, empowered, loving, free', key: 'smiling face with hearts', n: 4, color: 'violet', E: 'joy', D: 'freiheit', stage: 'open heart', danger: 'arrogance', advice: 'be quiet', loc: 'airport', locd: 'flughafen', syn: 'joy,appreciation,empowerment,love', rem: 'let go' },
		zone: { list: "energetic, creative, enthusiastic, in the zone", key: 'nerd face', n: 3, color: 'indigo', E: 'energy', D: 'energie', stage: 'constant flow', danger: 'greed', advice: 'now', loc: 'airport', locd: 'flughafen', syn: 'passion', rem: 'remain watchful' },
		grateful: { list: 'peaceful, grateful, happy, playful', key: 'smiling face with halo', n: 2, color: 'blue', syn: 'eagerness,happiness', rem: 'stick to plan', E: 'energy', D: 'energie', stage: 'energy', danger: 'planlos verpuffen lassen, being overly confident', advice: 'make a plan, stick to the plan', loc: 'airport', locd: 'flughafen' },
		contentment: { list: 'calm, centered, content, trusting', key: 'relieved face', n: 1, color: 'green', rem: 'abide', E: 'serene', D: 'zufriedenheit', stage: 'gelassenheit', danger: 'passivity', advice: 'stay active', loc: 'airport', locd: 'flughafen' },
		boredom: { list: 'tired, bored, aimless, empty', key: 'slightly frowning face', n: 0, color: 'sienna', rem: 'oracle', E: 'bored', D: 'langeweile', stage: 'gelassenheit', danger: 'passivity', advice: 'stay active', loc: 'airport', locd: 'flughafen' },
		pessimism: { list: 'indecisive, confused, doubting, worried', key: 'worried face', n: -1, color: 'yellow', rem: 'last day', E: 'serene', D: 'langeweile', stage: 'gelassenheit', danger: 'passivity', advice: 'stay active', loc: 'airport', locd: 'flughafen' },
		overwhelm: { list: 'irritated, anxious, stressed, overwhelmed', key: 'anxious face with sweat', n: -2, color: 'orange', rem: 'pause', E: 'irritated', D: 'irritiert', stage: 'damage control', danger: 'losing contenance', advice: 'retreat', loc: 'airport', locd: 'flughafen' },
		blame: { list: 'impatient, resentful, blaming, angry', key: 'face with symbols on mouth', n: -3, color: 'red', syn: 'discouragement,anger,revenge', rem: 'robot', E: 'blaming', D: 'schuld zuweisend', stage: 'damage control', danger: 'toxicity', advice: 'surrender', loc: 'airport', locd: 'flughafen' },
		hatred: { list: 'ruthless, aggressive, jealous, hateful', key: 'black heart', n: -4, color: 'black', syn: 'rage,jealousy', rem: 'robot', E: 'hateful', D: 'hass', stage: 'damage control', danger: 'toxicity', advice: 'surrender', loc: 'airport', locd: 'flughafen' },
		guilt: { list: 'guilty, powerless, frozen, suicidal', key: 'cold face', n: -5, color: 'grey', syn: 'insecurity,unworthiness', rem: 'robot', E: 'guilty', D: 'wertlos', stage: 'damage control', danger: 'toxicity', advice: 'surrender', loc: 'airport', locd: 'flughafen' },
	},
	remedy: {
		sleep: { list: 'rest, close your eyes, deep breath' },
		distraction: { list: 'read, movie, docu, audiobook' },
		walk: { list: 'music, tm, library, walk' },
		babystep: { list: 'veggies, fruit, haushalt, wae, wasser, tee' },
		work: { list: 'post, box, shelf, people, todolist' },
		action: { list: 'piano, violin, game' },
		choices: { list: 'dice, todolist, openlist, choices' },
		retreat: { list: 'flight, dimension change' },
		cafe: { list: 'renew, plan' },
		inside: { list: 'watch, freeze, meditate' }
	},
	attitude: {
		disziplin: { max: 1 },
		gelassenheit: { min: 1, max: 4 },
		energie: { min: 3, max: 5 },
		ausgelassenheit: { min: 5, max: 7 },
		friede: { min: 5, max: 7 },
		freude: { min: 5, max: 7 },
		freiheit: { min: 5, max: 7 },
		liebe: { min: 5, max: 7 },
	}
};
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
const Geo = {
	layerInfo: {
		empty: {
			url: '',
			options: { maxZoom: 22 }
		},
		ru: {
			url: 'https:/' + '/core-sat.maps.yandex.net/tiles?l=sat&v=3.1025.0&x={x}&y={y}&z={z}&scale=1&lang=ru_RU',
			options: { minZoom: 0, maxZoom: 19, }
		},
		satellite: {
			url: 'http:/' + '/server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			options: { maxZoom: 19, attribution: '&copy; <a href="http:/"+"www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' }
		},
		gsatellite: {
			url: 'http:/' + '/{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
			options: { maxZoom: 22, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }
		},
		gstreets: {
			url: 'http:/' + '/{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
			options: { maxZoom: 22, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }
		},
		ghybrid: {
			url: 'http:/' + '/{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
			options: { maxZoom: 22, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }
		},
		gterrain: {
			url: 'http:/' + '/{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
			options: { maxZoom: 22, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }
		},
		mbsat: {
			url: 'https:/' + '/api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
			options: { attribution: 'Map data &copy; <a href="https:/"+"/www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https:/"+"/www.mapbox.com/">Mapbox</a>', id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1 }
		},
		mbstreets: {
			url: 'https:/' + '/api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
			options: { attribution: 'Map data &copy; <a href="https:/"+"/www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https:/"+"/www.mapbox.com/">Mapbox</a>', id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1 }
		},
		mb1: {
			url: 'https:/' + '/api.mapbox.com/styles/v1/mapbox-map-design/cl4whev1w002w16s9mgoliotw/static/-90,35,2.5,0/840x464?access_token=pk.eyJ1IjoibWFwYm94LW1hcC1kZXNpZ24iLCJhIjoiY2syeHpiaHlrMDJvODNidDR5azU5NWcwdiJ9.x0uSqSWGXdoFKuHZC5Eo_Q',
			options: { attribution: 'Map data &copy; <a href="https:/"+"/www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https:/"+"/www.mapbox.com/">Mapbox</a>', tileSize: 512, zoomOffset: -1 }
		},
		cartolabels: {
			url: 'https:/' + '/{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
			options: {
				attribution: '&copy; <a href="https:/"+"/www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https:/"+"/carto.com/attributions">CARTO</a>',
				subdomains: 'abcd',
				maxZoom: 20
			}
		},
		cartonolabels: {
			url: 'https:/' + '/{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
			options: {
				attribution: '&copy; <a href="https:/"+"/www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https:/"+"/carto.com/attributions">CARTO</a>',
				subdomains: 'abcd',
				maxZoom: 20
			}
		},
		cartodark: {
			url: 'https:/' + '/{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
			options: {
				attribution: '&copy; <a href="https:/"+"/www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https:/"+"/carto.com/attributions">CARTO</a>',
				subdomains: 'abcd',
				maxZoom: 20
			}
		},
		osm: {
			url: 'https:/' + '/tile.openstreetmap.org/{z}/{x}/{y}.png',
			options: { attribution: '&copy; <a href="https:/"+"/www.openstreetmap.org/copyright">OpenStreetMap</a>', subdomains: ['a', 'b', 'c'] }
		},
		osmg: {
			url: 'https:/' + '/{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
			options: { attribution: '&copy; <a href="https:/"+"/www.openstreetmap.org/copyright">OpenStreetMap</a>', subdomains: ['a', 'b', 'c'] }
		},
		watercolor: {
			url: 'http:/' + '/{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg',
			options: { attribution: 'Map tiles by <a href="http:/"+"stamen.com">Stamen Design</a>, under <a href="http:/"+"creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http:/"+"openstreetmap.org">OpenStreetMap</a>, under <a href="http:/"+"creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.', maxZoom: 18, subdomains: 'abcd', }
		},
		labels: {
			url: "http:/" + "tile.stamen.com/toner-labels/{z}/{x}/{y}.png",
			options: { attribution: 'Map tiles by <a href="http:/"+"stamen.com">Stamen Design</a>, under <a href="http:/"+"creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http:/"+"openstreetmap.org">OpenStreetMap</a>, under <a href="http:/"+"www.openstreetmap.org/copyright">ODbL</a>.', maxZoom: 18 }
		},
		terrain: {
			url: 'http:/' + '/{s}.tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
			options: { attribution: 'Map tiles by <a href="http:/"+"stamen.com">Stamen Design</a>, under <a href="http:/"+"creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http:/"+"openstreetmap.org">OpenStreetMap</a>, under <a href="http:/"+"creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.', maxZoom: 18, }
		},
		terrainbg: {
			url: 'http:/' + '/{s}.tile.stamen.com/terrain-background/{z}/{x}/{y}.jpg',
			options: { attribution: 'Map tiles by <a href="http:/"+"stamen.com">Stamen Design</a>, under <a href="http:/"+"creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http:/"+"openstreetmap.org">OpenStreetMap</a>, under <a href="http:/"+"creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.', maxZoom: 18, }
		},
		topo: {
			url: 'https:/' + '/{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
			options: {
				maxZoom: 17,
				attribution: 'Map data: &copy; <a href="https:/"+"/www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http:/"+"viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https:/"+"/opentopomap.org">OpenTopoMap</a> (<a href="https:/"+"/creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
			}
		}
	},
	places: {
		tuerkenschanzpark: [48.23562171298636, 16.337871551513675],
		sievering: [48.245368124489204, 16.342549324035648],
		zehenthofgasse: [48.24522522864384, 16.34572505950928],
		vegagasse: [48.23413529351023, 16.346755027771],
	},
	continents: {
		Africa: ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Democratic Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Mayotte', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Reunion', 'Rwanda', 'Sao Tome And Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Saint Helena', 'Sudan', 'Swaziland', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'],
		Asia: ['Afghanistan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Myanmar', 'Cambodia', 'China', 'East Timor', 'Hong Kong', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan', 'Macau', 'North Korea', 'South Korea', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia', 'Nepal', 'Oman', 'Pakistan', 'Philippines', 'Qatar', 'Russia', 'Saudi Arabia', 'Singapore', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand', 'Turkey', 'Turkmenistan', 'United Arab Emirates', 'Uzbekistan', 'Vietnam', 'Yemen'],
		Europe: ['Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia And Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany', 'Gibraltar', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Isle Of Man', 'Italy', 'Jersey', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City'],
		'North America': ['Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Bermuda', 'Cayman Islands', 'Canada', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guadeloupe', 'Guatemala', 'Haiti', 'Honduras', 'Jamaica', 'Martinique', 'Mexico', 'Nicaragua', 'Panama', 'Puerto Rico', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent And The Grenadines', 'Trinidad And Tobago', 'United States'],
		Oceania: ['Australia', 'Fiji', 'French Polynesia', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Caledonia', 'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'],
		'South America': ['Argentina', 'Aruba', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Curacao', 'Ecuador', 'French Guiana', 'Guam', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela']
	}
};
const Perlin = {
	PERLIN_YWRAPB: 4,
	PERLIN_YWRAP: 1 << 4,
	PERLIN_ZWRAPB: 8,
	PERLIN_ZWRAP: 1 << 8,
	PERLIN_SIZE: 4095,
	perlin_octaves: 4,
	perlin_amp_falloff: 0.5,
	scaled_cosine: i => 0.5 * (1.0 - Math.cos(i * Math.PI)),
	perlin: null,
	lastx: 0,
	speed: 0.02,
	channels: {},
}
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
const GirlNames = ['afia', 'ally', 'amanda', 'angela', 'anna', 'annabel', 'birgit', 'bona', 'carmen', 'cassandra',
	'charlene', 'erin', 'hanna', 'holly', 'jan', 'karen', 'kelly', 'lauren', 'malta', 'maria', 'maurita', 'minnow', 'meredith',
	'milda', 'mimi', 'minna', 'minnow', 'mitra', 'nasi', 'nil', 'nimble', 'nonna', 'pam', 'phyllis', 'poppa', 'rhi', 'sarah',
	'sheeba', 'valerie', 'viola', 'wala'];
const BoyNames = ['aaron', 'andy', 'bill', 'blade', 'bob', 'buddy', 'creed', 'dan', 'darryl', 'dagobert', 'david', 'donald', 'dwight', 'felix',
	'gilbert', 'gul', 'jim', 'john', 'kevin', 'leo', 'luis', 'mac', 'max', 'michael', 'mike', 'oscar', 'peter', 'robert', 'ryan',
	'sebastian', 'stanley', 'stitch', 'toby', 'tom', 'vladimir', 'wolf', 'wolfgang'];
const MyNames = ['amanda', 'angela', 'erin', 'holly', 'jan', 'karen', 'kelly', 'pam', 'phyllis', 'andy', 'creed', 'darryl', 'david', 'dwight', 'felix', 'gul', 'jim', 'kevin', 'luis', 'michael', 'nil', 'oscar', 'ryan', 'stanley', 'toby', 'wolfgang'];
//#endregion globals

//#region CLEANUP (basemin)
function _selectText(el) {
	var sel, range;
	if (window.getSelection && document.createRange) {
		sel = window.getSelection();
		if (sel.toString() == '') {
			window.setTimeout(function () {
				range = document.createRange();
				range.selectNodeContents(el);
				sel.removeAllRanges();
				sel.addRange(range);
			}, 1);
		}
	} else if (document.selection) {
		sel = document.selection.createRange();
		if (sel.text == '') {
			range = document.body.createTextRange();
			range.moveToElementText(el);
			range.select();
		}
	}
}
function _unfocusOnEnter(ev) { if (ev.key === 'Enter') { ev.preventDefault(); mBy('dummy').focus(); } }
function incInput(inp, n = 1) {
	let val = Number(inp.innerHTML);
	val += n;
	inp.innerHTML = val;
}
function mEdit(label, value, dParent, handler, styles, classes, id) {
	let d = mDiv(dParent, styles);
	let hpad = valf(styles.hpadding, 4);
	let dLabel = mDiv(d, { w: '50%', align: 'right', hpadding: hpad, display: 'inline-block' }, null, label);
	let inp = mCreateFrom(`<div contenteditable="true" spellcheck="false">${value}</div>  `)
	mAppend(d, inp);
	mStyle(inp, { display: 'inline-block', w: '50%', align: 'left', hpadding: hpad });
	inp.addEventListener('keydown', unfocusOnEnter);
	inp.addEventListener('focusout', ev => { handler(inp.innerHTML, ev); });
	inp.onclick = ev => selectText(ev.target);
	if (isdef(classes)) mClass(inp, classes);
	if (isdef(id)) inp.id = id;
	return inp;
}
function mEditableInput(dParent, label, val, styles, classes, id) {
	let labelElem = mCreateFrom(`<span>${label}</span>  `)
	let elem = mCreateFrom(`<span contenteditable="true" spellcheck="false">${val}</span>  `)
	elem.addEventListener('keydown', (ev) => {
		if (ev.key === 'Enter') {
			ev.preventDefault();
			mBy('dummy').focus();
		}
	});
	let dui = mDiv(dParent, { margin: 2 });
	mAppend(dui, labelElem);
	mAppend(dui, elem);
	if (isdef(styles)) {
		if (isdef(styles.wInput)) mStyle(elem, { wmin: styles.wInput });
		mStyle(elem, styles);
	}
	if (isdef(classes)) mStyle(elem, classes);
	if (isdef(id)) elem.id = id;
	return elem;
}
function mEditableOnEdited(id, dParent, label, initialVal, onEdited, onOpening, styles, classes) {
	let inp = mEditableInput(dParent, label, initialVal, styles, classes);
	inp.id = id;
	if (isdef(onOpening)) { inp.addEventListener('focus', ev => onOpening(ev)); }
	inp.addEventListener('focusout', ev => {
		window.getSelection().removeAllRanges();
		if (isdef(onEdited)) onEdited(inp.innerHTML, ev);
	});
	return inp;
}
function mEditNumber(label, value, dParent, handler, styles, classes, id, triggerOnChange = false) {
	let d = mDiv(dParent, styles);
	let hpad = valf(styles.hpadding, 4);
	let dLabel = mDiv(d, { w: '50%', align: 'right', hpadding: hpad, display: 'inline-block' }, null, label);
	if (nundef(handler)) handler = x => console.log(x);
	let inp = mCreateFrom(`<div contenteditable="true" spellcheck="false">${value}</div>  `)
	mAppend(d, inp);
	mStyle(inp, { display: 'inline-block', w: '40%', align: 'left', hpadding: hpad });
	inp.addEventListener('keydown', unfocusOnEnter);
	inp.addEventListener('focusout', ev => { handler(inp.innerHTML, ev); });
	inp.onclick = ev => selectText(ev.target);
	if (isdef(classes)) mClass(inp, classes);
	if (isdef(id)) inp.id = id;
	return inp;
}
function mEditRange(label, value, min, max, step, dParent, handler, styles, classes, id, triggerOnChange = true) {
	let d = mDiv(dParent, styles);
	let hpad = valf(styles.hpadding, 4);
	let dLabel = mDiv(d, { w: '30%', align: 'right', hpadding: hpad, display: 'inline-block' }, null, label);
	let inpText = mCreateFrom(`<input type='number'  step=${step} min="${min}" max="${max}" value="${value}" ></input>`);
	let inp = mCreateFrom(`<input type="range" step=${step} min="${min}" max="${max}" value="${value}" ></input>`);
	mAppend(d, inpText);
	mAppend(d, inp);
	mStyle(inpText, { display: 'inline', w: '20%', align: 'left', hpadding: hpad });
	mStyle(inp, { display: 'inline', w: '40%', hpadding: hpad });
	inpText.onchange = (ev) => { inp.value = inpText.value; handler(inpText.value, ev); };
	inpText.onclick = ev => selectText(ev.target);
	inp.onchange = (ev) => { inpText.value = inp.value; handler(inpText.value, ev); };
	if (isdef(classes)) mClass(inp, classes);
	if (isdef(id)) inp.id = id;
	return inpText;
}
function mEditX(label, val, dParent, styles, classes, handler, id, opt = {}) {
	let defOptions = {
		alignLabel: 'right',
		fgLabel: 'silver',
		wminLabel: 120,
		alignInput: 'left',
		fgInput: 'white',
		wminInput: 50,
		wminRight: 120,
		align: 'center',
	}
	addKeys(defOptions, opt);
	let wminTotal = wminLabel + wminRight;
	if (nundef(styles)) styles = {};
	if (nundef(styles.wmin)) styles.wmin = 0;
	styles.wmin = Math.max(styles.wmin, wminTotal);
	styles.align = opt.align;
	let dOuter = mDiv(dParent, styles, id, null, classes);
	let dLabel = mDiv(dOuter, { fg: opt.fgLabel, wmin: opt.wminLabel, align: opt.alignLabel }, null, label);
	let dInput = mDiv(dOuter, { contenteditable: true, spellcheck: false, fg: opt.fgInput, wmin: opt.wminInput, align: opt.alignInput }, null, val);
	dInput.onfocusout = ev => handler(dInput.innerHTML, ev);
	dInput.onkeydown = (ev) => {
		if (ev.key === 'Enter') {
			ev.preventDefault();
			mBy('dummy').focus();
		}
	}
	return dInput;
}
//#endregion CLEANUP (basemin)

//#region autocomplete (basemin)
function autocomplete(inp, arr) {
	/* inp...input element, arr...array of possible autocompleted values:*/
	var currentFocus;
	inp = toElem(inp);
	inp.addEventListener('input', e => { /*execute a func when someone writes in the text field:*/
		var a, b, i, val = this.value;    /*close any already open lists of autocompleted values*/
		autocomplete_closeAllLists();
		if (!val) { return false; }
		currentFocus = -1;
		a = document.createElement('DIV'); /*create a DIV element that will contain the items (values):*/
		a.setAttribute('id', this.id + 'autocomplete-list');
		a.setAttribute('class', 'autocomplete-items');
		this.parentNode.appendChild(a); /*append the DIV element as a child of the autocomplete container:*/
		for (i = 0; i < arr.length; i++) {
			if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
				b = document.createElement('DIV'); /*create a DIV element for each matching element:*/
				b.innerHTML = '<strong>' + arr[i].substr(0, val.length) + '</strong>'; /*make the matching letters bold:*/
				b.innerHTML += arr[i].substr(val.length);
				b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>"; /*insert a input field that will hold the current array item's value:*/
				b.addEventListener('click', e => {
					inp.value = this.getElementsByTagName('input')[0].value; /*insert the value for the autocomplete text field:*/
					autocomplete_closeAllLists();
				});
				a.appendChild(b);
			}
		}
	});
	inp.addEventListener('keydown', e => {
		var x = document.getElementById(this.id + 'autocomplete-list');
		if (x) x = x.getElementsByTagName('div');
		if (e.keyCode == 40) {
			currentFocus++;
			autocomplete_addActive(x);
		} else if (e.keyCode == 38) {
			currentFocus--;
			autocomplete_addActive(x);
		} else if (e.keyCode == 13) {
			e.preventDefault();
			if (currentFocus > -1) {
				if (x) x[currentFocus].click();
			}
		}
	});
	inp.addEventListener('dblclick', e => { evNoBubble(e); });
	document.addEventListener('click', e => {
		autocomplete_closeAllLists(e.target);
	});
}
function autocomplete_addActive(x) {
	if (!x) return false;
	autocomplete_removeActive(x);
	if (currentFocus >= x.length) currentFocus = 0;
	if (currentFocus < 0) currentFocus = x.length - 1;
	x[currentFocus].classList.add('autocomplete-active');
}
function autocomplete_closeAllLists(elmnt) {
	var x = document.getElementsByClassName('autocomplete-items');
	for (var i = 0; i < x.length; i++) {
		if (elmnt != x[i] && elmnt != inp) {
			x[i].parentNode.removeChild(x[i]);
		}
	}
}
function autocomplete_removeActive(x) {
	for (var i = 0; i < x.length; i++) {
		x[i].classList.remove('autocomplete-active');
	}
}
//#endregion autocomplete (basemin)

//#region m (basemin)
function _gCreate(tag) { return document.createElementNS('http:/' + '/www.w3.org/2000/svg', tag); }
function _mStamp(d1, text, color, sz) {
	mStyle(d1, { position: 'relative' });
	let r = getRect(d1);
	let [w, h] = [r.w, r.h];
	color = ['green', 'red', 'blue'].includes(color) ? color : 'black';
	sz = valf(sz, r.h / 7);
	console.log('r', r, 'sz', sz);
	let [padding, border, rounding, angle] = [sz / 10, sz / 6, sz / 8, rNumber(-25, 25)];
	let d2 = mDiv(d1, {
		fg: color,
		position: 'absolute', top: 25, left: 5,
		transform: `rotate(${angle}deg)`,
		fz: sz,
		hpadding: 2,
		vpadding: 0,
		rounding: rounding,
		weight: 400,
		display: 'inline-block',
		'text-transform': 'uppercase',
		family: 'fredericka',
		'mix-blend-mode': 'multiply',
	}, null, text);
	mClass(d2, `${color}stamp`);
}
function aFlip(d, ms = 300) {
	return anime({ targets: d, scaleX: -1, duration: ms, easing: 'easeInOutSine' });
}
function aJumpby(elem, h = 40, ms = 1000) {
	anime({
		targets: elem,
		keyframes: [
			{ translateY: 2, scaleX: 1.05, scaleY: .95 },
			{ translateY: 2, scaleX: 1.05, scaleY: .95 },
			{ translateY: -h, scaleX: .9, scaleY: 1.1 },
			{ translateY: -h, scaleX: .9, scaleY: 1.1 },
			{ translateY: 0, scaleX: 1, scaleY: 1 },
			{ translateY: -7, scaleX: 1, scaleY: 1 },
			{ translateY: 0, scaleX: 1, scaleY: 1 },
			{ translateY: 0, scaleX: 1, scaleY: 1 },
			{ translateY: 0, scaleX: 1, scaleY: 1 },
			{ translateY: 0, scaleX: 1, scaleY: 1 },
		],
		duration: 1000,
		easing: 'easeInOutSine', //'easeOutElastic(1, .8)',
	});
}
function aMove(d, dSource, dTarget, callback, offset, ms, easing, fade) {
	let b1 = getRect(dSource);
	let b2 = getRect(dTarget);
	if (nundef(offset)) offset = { x: 0, y: 0 };
	let dist = { x: b2.x - b1.x + offset.x, y: b2.y - b1.y + offset.y };
	d.style.zIndex = 100;
	let a = d.animate({ opacity: valf(fade, 1), transform: `translate(${dist.x}px,${dist.y}px)` }, { easing: valf(easing, 'EASE'), duration: ms });
	a.onfinish = () => { d.style.zIndex = iZMax(); if (isdef(callback)) callback(); };
}
function animateProperty(elem, prop, start, middle, end, msDuration, forwards) {
	let kflist = [];
	for (const v of [start, middle, end]) {
		let o = {};
		o[prop] = isString(v) || prop == 'opacity' ? v : '' + v + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration };
	if (isdef(forwards)) opts.fill = forwards;
	elem.animate(kflist, opts);
}
function animatePropertyX(elem, prop, start_middle_end, msDuration, forwards, easing, delay) {
	let kflist = [];
	for (const perc in start_middle_end) {
		let o = {};
		let val = start_middle_end[perc];
		o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration, fill: valf(forwards, 'none'), easing: valf(easing, 'ease-it-out'), delay: valf(delay, 0) };
	elem.animate(kflist, opts);
}
function aRestore(elem) { elem.style.transform = ''; }
function aRollby(elem, dx = 100, ms = 3000) {
	anime({ targets: elem, translateX: dx, rotate: '1turn', duration: ms });
}
function aRotate(d, ms = 2000) { return d.animate({ transform: `rotate(360deg)` }, ms); }
function aRotateAccel(d, ms) { return d.animate({ transform: `rotate(1200deg)` }, { easing: 'cubic-bezier(.72, 0, 1, 1)', duration: ms }); }
function aTranslateBy(d, x, y, ms) { return d.animate({ transform: `translate(${x}px,${y}px)` }, ms); }
function aTranslateByEase(d, x, y, ms, easing = 'cubic-bezier(1,-0.03,.27,1)') {
	return d.animate({ transform: `translate(${x}px,${y}px)` }, { easing: easing, duration: ms });
}
function aTranslateFadeBy(d, x, y, ms) { return d.animate({ opacity: .5, transform: `translate(${x}px,${y}px)` }, { easing: MyEasing, duration: ms }); }
function default_allowDrop(ev) { ev.preventDefault(); }
function getStyleProp(elem, prop) { return getComputedStyle(elem).getPropertyValue(prop); }
function getTextWidth(text, font) {
	var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
	var context = canvas.getContext('2d');
	context.font = font;
	var metrics = context.measureText(text);
	return metrics.width;
}
function gSizeToContent(svg) {
	var bbox = svg.getBBox();
	svg.setAttribute("width", bbox.x + bbox.width + bbox.x);
	svg.setAttribute("height", bbox.y + bbox.height + bbox.y);
}
function maButton(caption, handler, dParent, styles) {
	let a = mLink("javascript:void(0)", dParent, {}, null, caption, 'a');
	a.onclick = handler;
	if (isdef(styles)) mStyle(a, styles);
	return a;
}
function mAnimate(elem, prop, valist, callback, msDuration = 1000, easing = 'cubic-bezier(1,-0.03,.86,.68)', delay = 0, forwards = 'none') {
	let kflist = [];
	for (const perc in valist) {
		let o = {};
		let val = valist[perc];
		o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration, fill: forwards, easing: easing, delay: delay };
	let a = toElem(elem).animate(kflist, opts);
	if (isdef(callback)) { a.onfinish = callback; }
	return a;
}
function mAnimateList(elem, ogoal, callback, msDuration = 1000, easing = 'cubic-bezier(1,-0.03,.86,.68)', delay = 0) {
	for (const k in ogoal) {
		ogoal[k] = isString(ogoal[k]) || k == 'opacity' ? ogoal[k] : '' + ogoal[k] + 'px';
	}
	let kflist = [ogoal];
	let opts = { duration: msDuration, fill: 'forwards', easing: easing, delay: delay };
	let a = toElem(elem).animate(kflist, opts);
	if (isdef(callback)) { a.onfinish = callback; }
	return a;
}
function mAnimateTo(elem, prop, val, callback, msDuration = 1000, easing = 'cubic-bezier(1,-0.03,.86,.68)', delay = 0) {
	let o = {};
	o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
	let kflist = [o];
	let opts = { duration: msDuration, fill: 'forwards', easing: easing, delay: delay };
	let a = toElem(elem).animate(kflist, opts);
	if (isdef(callback)) { a.onfinish = callback; }
	return a;
}
function mAppear(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 1, callback, ms); }
function mAppend(d, child) { toElem(d).appendChild(child); return child; }
function mAutocomplete(dParent) {
	let form = mCreateFrom(`
    <form class='form' autocomplete="off" action="javascript:void(0);">
      <div class="autocomplete" style="width: 200px">
        <input id="myInput" type="text" name="myCity" placeholder="City" onclick="select()" />
      </div>
      <input style="margin-left:-15px" type="submit" value="Go!" />
    </form>
  `  );
	form.onsubmit = () => {
		let c = mBy('myInput').value.toLowerCase();
		let o = Geo.cities[c];
		if (nundef(o)) { c = toUmlaut(c); o = Geo.cities[c]; }
		console.log('c', c);
		let center = o.center;
		M.map.flyTo(center, M.map.getZoom(), { animate: false })
	}
	let d = mAppend(dParent, form);
	autocomplete('myInput', get_values(Geo.cities).map(x => x.name));
}
function mButton(caption, handler, dParent, styles, classes, id) {
	let x = mCreate('button');
	x.innerHTML = caption;
	if (isdef(handler)) x.onclick = handler;
	if (isdef(dParent)) toElem(dParent).appendChild(x);
	if (isdef(styles)) mStyle(x, styles);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(id)) x.id = id;
	return x;
}
function mButtonX(dParent, handler, pos = 'tr', sz = 25, color = 'white') {
	let d2 = mDiv(dParent, { fg: color, w: sz, h: sz, cursor: 'pointer' }, null, `<i class="fa fa-times" style="font-size:${sz}px;"></i>`, 'btnX');
	mPlace(d2, pos, 2);
	d2.onclick = handler;
	return d2;
}
function mBy(id) { return document.getElementById(id); }
function mCanvas(dParent, styles = {}, bstyles = {}, play = null, pause = null, origin = 'tl') {
	let cv = mCreate('canvas');
	mAppend(toElem(dParent), cv);
	addKeys({ w: 500, h: 500, bg: '#222', rounding: 10 }, styles);
	mStyle(cv, styles);
	let [w, h] = [cv.width, cv.height] = [styles.w, styles.h];
	let cx = cv.getContext('2d');
	let [x, y] = posToPoint(origin, w, h);
	cx.translate(x, y);
	if (!play) return { cv: cv, cx: cx, origin: { x: x, y: y }, x: 0, y: 0, w: w, h: h };
	mLinebreak(dParent)
	addKeys({ fz: 28, fg: 'skyblue', display: 'flex', ajcenter: true, w: styles.w }, bstyles)
	let controls = mPlayPause(dParent, bstyles, play, pause);
	return { cv: cv, cx: cx, origin: { x: x, y: y }, x: 0, y: 0, w: w, h: h, controls: controls.ui, play: controls.play, pause: controls.pause, stop: controls.play, stop: controls.pause };
}
function mCard(dParent, styles, classtr = '', id = null) {
	let classes = toWords("card300 wb " + classtr);
	return mDiv(dParent, styles, id, null, classes);
}
function mCardButton(caption, handler, dParent, styles, classtr = '', id = null) {
	let classes = toWords("card300 wb fett no_outline btn" + classtr);
	return mButton(caption, handler, dParent, styles, classes, id);
}
function mCardText(ckey, sz, color) { return is_jolly(ckey) ? '<span style="font-family:Algerian">jolly</span>' : `${ckey[0]}${mSuit(ckey, sz, color)}`; }
function mCenter(d, gap) { mCenterFlex(d, true, false, true, gap); }
function mCenterCenter(d, gap) { mCenterCenterFlex(d, gap); }
function mCenterCenterFlex(d, gap) { mCenterFlex(d, true, true, true, gap); }
function mCenterFlex(d, hCenter = true, vCenter = false, wrap = true, gap = null) {
	let styles = { display: 'flex' };
	if (hCenter) styles['justify-content'] = 'center';
	styles['align-content'] = vCenter ? 'center' : 'flex-start';
	if (wrap) styles['flex-wrap'] = 'wrap';
	if (gap) styles.gap = gap;
	mStyle(d, styles);
}
function mClass(d) {
	d = toElem(d);
	if (arguments.length == 2) {
		let arg = arguments[1];
		if (isString(arg) && arg.indexOf(' ') > 0) { arg = [toWords(arg)]; }
		else if (isString(arg)) arg = [arg];
		if (isList(arg)) {
			for (let i = 0; i < arg.length; i++) {
				d.classList.add(arg[i]);
			}
		}
	} else for (let i = 1; i < arguments.length; i++) d.classList.add(arguments[i]);
}
function mClass0(d) { d = toElem(d); d.className = ''; }
function mClassRemove(d) { d = toElem(d); for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }
function mClassReplace(d, weg, her) { mClassRemove(d, weg); mClass(d, her); }
function mClassToggle(d, classes) {
	let wlist = toWords(classes);
	d = toElem(d);
	for (const c of wlist) if (d.classList.contains(c)) mClassRemove(d, c); else mClass(d, c);
}
function mClear(d) { clearElement(toElem(d)); }
function mColFlex(dParent, chflex = [1, 5, 1], bgs) {
	let styles = { opacity: 1, display: 'flex', aitems: 'stretch', 'flex-flow': 'nowrap' };
	mStyle(dParent, styles);
	let res = [];
	for (let i = 0; i < chflex.length; i++) {
		let bg = isdef(bgs) ? bgs[i] : null;
		let d1 = mDiv(dParent, { flex: chflex[i], bg: bg });
		res.push(d1);
	}
	return res;
}
function mColorLetters(s, brightness) {
	return toLetters(s).map(x => `<div style='display:inline-block;transform:rotate(${rChoose([10, 5, -10, -5])}deg);color:${rColor(brightness)}'>${x == ' ' ? '&nbsp;' : x}</div>`).join('');
}
function mColorPickerBehavior(value, targetImage, elem, handler) {
	let hues = arrTake(colorHueWheel(value), 10);
	let colorPalette = hues.map(x => colorFrom(colorHSLBuild(x)));
	let palette = isdef(targetImage) ? colorPaletteFromImage(targetImage) : colorPalette;
	mStyle(elem, { bg: value });
	let inp = new JSColor(elem, { alpha: 'ff', closeButton: true, value: value, palette: palette, });
	inp.onInput = () => { let c = inp.toHEXAString(); handler(c); }
	return inp;
}
function mColorPickerControl(label, value, targetImage, dParent, handler, styles = { hpadding: 25 }) {
	let d = mDiv(dParent, styles);
	let hpad = valf(styles.hpadding, 6);
	let dLabel = mDiv(d, { 'vertical-align': 'top', w: '35%', align: 'right', hpadding: hpad, display: 'inline-block' }, null, label);
	let hues = arrTake(colorHueWheel(value), 10);
	let colorPalette = hues.map(x => colorFrom(colorHSLBuild(x)));
	let palette = isdef(targetImage) ? colorPaletteFromImage(targetImage) : colorPalette;
	let elem = mDiv(d, { w: '55%', hpadding: hpad, h: 24, rounding: hpad, display: 'inline-block' });
	let inp = new JSColor(elem, {
		alpha: 'ff',
		closeButton: true,
		value: value,
		palette: palette,
	});
	inp.onInput = () => { let c = inp.toHEXAString(); handler(c); }
	return inp;
}
function mCreate(tag, styles, id) { let d = document.createElement(tag); if (isdef(id)) d.id = id; if (isdef(styles)) mStyle(d, styles); return d; }
function mCreateFrom(htmlString) {
	var div = document.createElement('div');
	div.innerHTML = htmlString.trim();
	return div.firstChild;
}
function mDataTable(reclist, dParent, rowstylefunc, headers, id, showheaders = true) {
	if (nundef(headers)) headers = get_keys(reclist[0]);
	let t = mTable(dParent, headers, showheaders);
	if (isdef(id)) t.id = `t${id}`;
	let rowitems = [];
	let i = 0;
	for (const u of reclist) {
		let rid = isdef(id) ? `r${id}_${i}` : null;
		r = mTableRow(t, u, headers, rid);
		if (isdef(rowstylefunc)) mStyle(r.div, rowstylefunc(u));
		rowitems.push({ div: r.div, colitems: r.colitems, o: u, id: rid, index: i });
		i++;
	}
	return { div: t, rowitems: rowitems };
}
function mDiv(dParent, styles, id, inner, classes, sizing) {
	dParent = toElem(dParent);
	let d = mCreate('div');
	if (dParent) mAppend(dParent, d);
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	if (isdef(id)) d.id = id;
	if (isdef(inner)) d.innerHTML = inner;
	if (isdef(sizing)) { setRect(d, sizing); }
	return d;
}
function mDiv100(dParent, styles, id, sizing = true) { let d = mDiv(dParent, styles, id); mSize(d, 100, 100, '%', sizing); return d; }
function mDivItem(dParent, styles, id, content) {
	if (nundef(id)) id = getUID();
	let d = mDiv(dParent, styles, id, content);
	return mItem(id, { div: d });
}
function mDivLine(dParent, styles = {}, id = null, innerlist = ['', '', ''], classes = null) {
	addKeys({ w: '100%', box: true, padding: 4 }, styles);
	let d = mDiv(dParent, styles, id, `<div>${innerlist[0]}</div><div>${innerlist[1]}</div><div>${innerlist[2]}</div>`, classes);
	mStyle(d, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' });
	return d;
}
function mDivLR(dParent, styles, id, innerlist, classes) {
	let d = mDiv(dParent, styles, id, `<div>${innerlist[0]}</div><div>${innerlist[1]}</div>`, classes);
	mStyle(d, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' });
	return d;
}
function mDover(dParent, styles = {}, sizing = true) {
	let d = mDiv(dParent, styles);
	mIfNotRelative(dParent);
	mStyle(d, { position: 'absolute', left: 0, top: 0, w: '100%', h: '100%' });
	setRect(d, sizing);
	return d;
}
function mDraggable(item) {
	let d = iDiv(item);
	d.draggable = true;
	d.ondragstart = drag;
}
function mDroppable(item, handler, dragoverhandler) {
	let d = iDiv(item);
	d.ondragover = isdef(dragoverhandler) ? dragoverhandler : default_allowDrop;
	d.ondrop = handler;
}
function measureText(text, styles = {}, cx = null) {
	if (!cx) {
		var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
		cx = canvas.getContext('2d');
	}
	cx.font = isdef(styles.font) ? styles.font : `${styles.fz}px ${styles.family}`;
	var metrics = cx.measureText(text);
	return { w: metrics.width, h: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent };
}
function mFade(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 0, callback, ms); }
function mFadeClear(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 0, () => { mClear(d); if (callback) callback(); }, ms); }
function mFadeClearShow(d, ms = 800, callback = null) { return mAnimate(d, 'opacity', [1, 0], () => { mClear(d); if (callback) callback(); }, ms); }
function mFadeRemove(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 0, () => { mRemove(d); if (callback) callback(); }, ms); }
function mFall(d, ms = 800, dist = 50) { toElem(d).animate([{ opacity: 0, transform: `translateY(-${dist}px)` }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: ms, easing: 'ease' }); }
function mFleeting(inner, d, ms = 3000, styles = {}, classes = null) {
	d = toElem(d);
	addKeys({ transition: 'all .5s ease', padding: 10, box: true, fg: 'red' }, styles)
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	d.innerHTML = inner;
	TO.fleeting = setTimeout(() => mClear(d), ms);
}
function mFlex(d, or = 'h') {
	d = toElem(d);
	d.style.display = 'flex';
	d.style.flexFlow = (or == 'v' ? 'column' : 'row') + ' ' + (or == 'w' ? 'wrap' : 'nowrap');
}
function mFlexColumn(d, or = 'h') {
	d = toElem(d);
	d.style.display = 'flex';
	d.style.flexFlow = (or == 'v' ? 'column' : 'row') + ' ' + (or == 'w' ? 'wrap' : 'nowrap');
	d.style.alignItems = 'stretch';
	d.style.alignContent = 'stretch';
	d.style.justiifyItems = 'stretch';
	d.style.justifyContent = 'stretch';
}
function mFlexEvenly(d) {
	let styles = { display: 'flex' };
	styles['justify-content'] = 'space-evenly';
	mStyle(d, styles);
}
function mFlexLR(d) { mStyle(d, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }); }
function mFlexSpacebetween(d) { mFlexLR(d); }
function mFlexWrap(d) { mFlex(d, 'w'); }
function mForm(dParent) {
	return mAppend(dParent, mCreate('form'));
}
function mFromPoint(x, y) {
	var element, elements = [];
	var old_visibility = [];
	while (true) {
		element = document.elementFromPoint(x, y);
		if (!element || element === document.documentElement) {
			break;
		}
		elements.push(element);
		old_visibility.push(element.style.visibility);
		element.style.visibility = 'hidden';
	}
	for (var k = 0; k < elements.length; k++) {
		elements[k].style.visibility = old_visibility[k];
	}
	elements.reverse();
	return elements;
}
function mGetStyle(elem, prop) {
	let val;
	elem = toElem(elem);
	if (prop == 'bg') { val = getStyleProp(elem, 'background-color'); if (isEmpty(val)) return getStyleProp(elem, 'background'); }
	else if (isdef(STYLE_PARAMS[prop])) { val = getStyleProp(elem, STYLE_PARAMS[prop]); }
	else {
		switch (prop) {
			case 'vmargin': val = stringBefore(elem.style.margin, ' '); break;
			case 'hmargin': val = stringAfter(elem.style.margin, ' '); break;
			case 'vpadding': val = stringBefore(elem.style.padding, ' '); break;
			case 'hpadding': val = stringAfter(elem.style.padding, ' '); break;
			case 'box': val = elem.style.boxSizing; break;
			case 'dir': val = elem.style.flexDirection; break;
		}
	}
	if (nundef(val)) val = getStyleProp(elem, prop);
	if (val.endsWith('px')) return firstNumber(val); else return val;
}
function mGrid(rows, cols, dParent, styles = {}) {
	let d = mDiv(dParent, styles);
	d.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
	d.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
	d.style.display = 'inline-grid';
	d.style.padding = valf(styles.padding, styles.gap) + 'px';
	return d;
}
function mHide(d, ms = 0) { if (ms > 0) mFade(d, ms); else mStyle(d, { opacity: 0 }); }
function mIfNotRelative(d) { if (isEmpty(d.style.position)) d.style.position = 'relative'; }
function mImage() { return mImg(...arguments); }
function mImg(path, dParent, styles, classes, callback) {
	let d = mCreate('img');
	if (isdef(callback)) d.onload = callback;
	d.src = path;
	if (isdef(dParent)) mAppend(dParent, d);
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	if (isdef(styles.w)) d.setAttribute('width', styles.w + 'px');
	if (isdef(styles.h)) d.setAttribute('height', styles.h + 'px');
	return d;
}
function mInput(dParent, styles, id, placeholder, classtr = 'input', tabindex = null, value = '') {
	let html = `<input type="text" id=${id} class="${classtr}" placeholder="${valf(placeholder, '')}" tabindex="${tabindex}" value="${value}">`;
	let d = mAppend(dParent, mCreateFrom(html));
	if (isdef(styles)) mStyle(d, styles);
	return d;
}
function mInsert(dParent, el, index = 0) { dParent.insertBefore(el, dParent.childNodes[index]); return el; }
function mInsertAfter(dParent, el, index = 0) {
	if (dParent.childNodes.length == index) mAppend(dParent, el);
	else mInsert(dParent, el, index + 1);
}
function mInsertAt(dParent, el, index = 0) { mInsert(dParent, el, index); }
function mInsertFirst(dParent, el) { mInsert(dParent, el, 0); }
function miPic(item, dParent, styles, classes) {
	let info = isString(item) ? Syms[item] : isdef(item.info) ? item.info : item;
	let d = mDiv(dParent);
	d.innerHTML = info.text;
	if (nundef(styles)) styles = {};
	let family = info.family;
	addKeys({ family: family, fz: 50, display: 'inline-block' }, styles);
	mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	mCenterCenterFlex(d);
	return d;
}
function mItem(id, diDOM, di = {}, addSizing = false) {
	let item = di;
	id = isdef(id) ? id : isdef(diDOM) && isdef(diDOM.div) && !isEmpty(diDOM.div.id) ? diDOM.div.id : getUID();
	item.id = iRegister(item, id);
	if (isdef(diDOM) && isdef(diDOM.div)) { diDOM.div.id = id; iAdd(item, diDOM); }
	if (addSizing) {
		if (nundef(item.sizing)) item.sizing = 'sizeToContent';
		if (nundef(item.positioning)) { item.positioning = 'absolute'; }
		if (nundef(item.posType)) { item.posType = 'center'; }
		if (isdef(diDOM) && item.sizing == 'sizeToContent') iMeasure(item, item.sizingOptions);
	}
	return item;
}
function mLine(dParent, styles) { return mDiv(dParent, styles, null, '<hr>'); }
function mLinebreak(dParent, gap) {
	dParent = toElem(dParent);
	let d;
	let display = getComputedStyle(dParent).display;
	if (display == 'flex') {
		d = mDiv(dParent, { fz: 2, 'flex-basis': '100%', h: 0, w: '100%' }, null, ' &nbsp; ');
	} else {
		d = mDiv(dParent, {}, null, '<br>');
	}
	if (isdef(gap)) { d.style.minHeight = gap + 'px'; d.innerHTML = ' &nbsp; '; d.style.opacity = .2; }
	return d;
}
function mLinebreakFlex(dParent, gap) {
	dParent = toElem(dParent);
	let d = mDiv(dParent, { fz: 2, 'flex-basis': '100%', h: 0, w: '100%' }, null, ' &nbsp; ');
	if (isdef(gap)) { d.style.minHeight = gap + 'px'; d.innerHTML = ' &nbsp; '; d.style.opacity = .2; }
	return d;
}
function mLink(href, dParent, styles, id, inner, classes, sizing) {
	let d = mCreate('a');
	if (dParent) mAppend(dParent, d);
	d.href = valf(href, '#');
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	if (isdef(id)) d.id = id;
	if (isdef(inner)) d.innerHTML = inner;
	if (isdef(sizing)) { setRect(d, sizing); }
	return d;
}
function mMagnifyOnHoverControl(elem) {
	elem.onmouseenter = ev => { if (ev.ctrlKey) mClass(elem, 'magnify_on_hover'); }
	elem.onmouseleave = ev => mClassRemove(elem, 'magnify_on_hover');
}
function mMagnifyOnHoverControlPopup(elem) {
	elem.onmouseenter = ev => {
		if (ev.ctrlKey) {
			let r = getRect(elem, document.body);
			let popup = mDiv(document.body, { rounding: 4, position: 'absolute', top: r.y, left: r.x }, 'popup');
			let clone = elem.cloneNode(true);
			popup.appendChild(clone);
			mClass(popup, 'doublesize')
			popup.onmouseleave = () => popup.remove();
		}
	}
}
function mMagnifyOnHoverControlRemove(elem) {
	elem.onmouseenter = elem.onmouseleave = null;
	mClassRemove(elem, 'magnify_on_hover');
}
function mMeasure(d) { let r = getRect(d); mStyle(d, { w: r.w, h: r.h }); return r; }
function mNode(o, dParent, title) {
	recConvertLists(o);
	console.log('mNode o', o);
	let d = mCreate('div');
	mYaml(d, o);
	let pre = d.getElementsByTagName('pre')[0];
	pre.style.fontFamily = 'inherit';
	if (isdef(title)) mInsert(d, mText(title));
	if (isdef(dParent)) mAppend(dParent, d);
	if (isDict(o)) d.style.textAlign = 'left';
	return d;
}
function mPlace(elem, pos, offx, offy) {
	elem = toElem(elem);
	pos = pos.toLowerCase();
	let dParent = elem.parentNode; if (dParent.style.position != 'absolute') dParent.style.position = 'relative';
	let vert = valf(offx, 0);
	let hor = isdef(offy) ? offy : vert;
	if (pos[0] == 'c' || pos[1] == 'c') {
		let rParent = getRect(dParent);
		let [wParent, hParent] = [rParent.w, rParent.h];
		let rElem = getRect(elem);
		let [wElem, hElem] = [rElem.w, rElem.h];
		switch (pos) {
			case 'cc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, top: vert + (hParent - hElem) / 2 }); break;
			case 'tc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, top: vert }); break;
			case 'bc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, bottom: vert }); break;
			case 'cl': mStyle(elem, { position: 'absolute', left: hor, top: vert + (hParent - hElem) / 2 }); break;
			case 'cr': mStyle(elem, { position: 'absolute', right: hor, top: vert + (hParent - hElem) / 2 }); break;
		}
		return;
	}
	let di = { t: 'top', b: 'bottom', r: 'right', l: 'left' };
	elem.style.position = 'absolute';
	elem.style[di[pos[0]]] = hor + 'px'; elem.style[di[pos[1]]] = vert + 'px';
}
function mPlayPause(dParent, styles = {}, handle_play = null, handle_pause = null) {
	if (!handle_play) handle_play = audio_onclick_pp;
	if (!handle_pause) handle_pause = handle_play;
	let html = `
    <div id="dButtons">
      <a id="bPlay" href="#">
        <i class="fa fa-play fa-2x"></i>
      </a>
      <a id="bPause" href="#" style="display: none">
        <i class="fa fa-pause fa-2x"></i>
      </a>
    </div>
  `;
	let pp = mCreateFrom(html);
	mAppend(dParent, pp);
	addKeys({ fz: 28, fg: 'lightgreen', display: 'flex', ajcenter: true, w: getRect(dParent).w }, styles);
	mStyle(pp, styles);
	mBy('bPlay').onclick = () => { hide0('bPlay'); show0('bPause'); handle_play(); }
	mBy('bPause').onclick = () => { hide0('bPause'); show0('bPlay'); handle_pause(); }
	let [fg, fz] = [styles.fg, styles.fz];
	mStyle(mBy('bPlay'), { fg: fg, fz: fz })
	mStyle(mBy('bPause'), { fg: fg, fz: fz })
	return { ui: pp, play: () => fireClick(mBy('bPlay')), pause: () => fireClick(mBy('bPause')) };
}
function mPopup(content, dParent, styles, id) {
	if (isdef(mBy(id))) mRemove(id);
	mIfNotRelative(dParent);
	if (nundef(styles)) styles = { top: 0, left: 0 };
	styles.position = 'absolute';
	let d1 = mDiv(dParent, styles, valf(id, getUID()), content);
	return d1;
}
function mPos(d, x, y, unit = 'px') { mStyle(d, { left: x, top: y, position: 'absolute' }, unit); }
function mPulse(d, ms, callback = null) { mClass(d, 'onPulse'); TO[getUID()] = setTimeout(() => { mClassRemove(d, 'onPulse'); if (callback) callback(); }, ms); }
function mPulse1(d, callback) { mPulse(d, 1000, callback); }
function mPulse2(d, callback) { mPulse(d, 2000, callback); }
function mPulse3(d, callback) { mPulse(d, 3000, callback); }
function mPuppet(key, dParent, styles = {}, dist = 250) {
	if (nundef(dParent)) dParent = document.body; else dParent = toElem(dParent);
	addKeys({ position: 'fixed', fz: 40, left: 40, top: 40 }, styles);
	dPuppet = miPic(key, dParent, styles);
	aRollby(dPuppet, dist);
}
function mRadio(label, val, name, dParent, styles = {}, handler, group_id, is_on) {
	let cursor = styles.cursor; delete styles.cursor;
	let d = mDiv(dParent, styles, group_id + '_' + val);
	let id = isdef(group_id) ? `i_${group_id}_${val}` : getUID();
	let type = isdef(group_id) ? 'radio' : 'checkbox';
	let checked = isdef(is_on) ? is_on : false;
	let inp = mCreateFrom(`<input class='radio' id='${id}' type="${type}" name="${name}" value="${val}">`);
	if (checked) inp.checked = true;
	let text = mCreateFrom(`<label for='${inp.id}'>${label}</label>`);
	if (isdef(cursor)) { inp.style.cursor = text.style.cursor = cursor; }
	mAppend(d, inp);
	mAppend(d, text);
	if (isdef(handler)) {
		inp.onclick = ev => {
			ev.cancelBubble = true;
			if (handler == 'toggle') {
			} else if (isdef(handler)) {
				handler(val);
			}
		};
	}
	return d;
}
function mRadio1(label, val, dParent, styles = {}, handler, group_id) {
	let cursor = styles.cursor; delete styles.cursor;
	let d = mDiv(dParent, styles, group_id + '_' + val);
	let inp = mCreateFrom(`<input class='radio' id='i_${group_id}_${val}' type="radio" name="${group_id}" value="${val}" >`);
	let text = mCreateFrom(`<label for='${inp.id}'>${label}</label>`);
	if (isdef(cursor)) { inp.style.cursor = text.style.cursor = cursor; }
	mAppend(d, inp);
	mAppend(d, text);
	if (isdef(handler)) d.onclick = () => handler(val);
	return d;
}
function mRadioGroup(dParent, styles, id, legend, legendstyles) {
	let f = mCreate('fieldset');
	f.id = id;
	if (isdef(styles)) mStyle(f, styles);
	if (isdef(legend)) {
		let l = mCreate('legend');
		l.innerHTML = legend;
		mAppend(f, l);
		if (isdef(legendstyles)) { mStyle(l, legendstyles); }
	}
	mAppend(dParent, f);
	return f;
}
function mRadioToggle(label, val, dParent, styles = {}, is_on = true) {
	let cursor = styles.cursor; delete styles.cursor;
	let d = mDiv(dParent, styles);
	let id = getUID();
	let inp = mCreateFrom(`<input class='radio' id='${id}' type="checkbox" checked="${is_on}" value="${val}" >`);
	let text = mCreateFrom(`<label for='${id}'>${label}</label>`);
	if (isdef(cursor)) { inp.style.cursor = text.style.cursor = cursor; }
	mAppend(d, inp);
	mAppend(d, text);
	return d;
}
function mRemove(elem) {
	elem = toElem(elem);
	var a = elem.attributes, i, l, n;
	if (a) {
		for (i = a.length - 1; i >= 0; i -= 1) {
			n = a[i].name;
			if (typeof elem[n] === 'function') {
				elem[n] = null;
			}
		}
	}
	a = elem.childNodes;
	if (a) {
		l = a.length;
		for (i = a.length - 1; i >= 0; i -= 1) {
			mRemove(elem.childNodes[i]);
		}
	}
	elem.remove();
}
function mRemoveChildrenFromIndex(dParent, i) { while (dParent.children[i]) { mRemove(dParent.children[i]); } }
function mRise(d, ms = 800) {
	toElem(d).animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: ms, easing: 'ease' });
}
function mScale(d, scale) { mStyle(d, { 'transform-origin': 'top', transform: `scale(${scale})` }); }
function mSearch(handler, dParent, styles, classes) {
	let html = `
    <form id="fSearch" action="javascript:void(0);" class='form'>
      <label>Keywords:</label>
      <input id="iKeywords" type="text" name="keywords" style="flex-grow:1" />
      <button type="submit" class='hop1' >Search</button>
    </form>
  `;
	let elem = mCreateFrom(html);
	mAppend(dParent, elem);
	elem.onsubmit = handler;
	return elem;
}
function mSection(styles = {}, id, inner, tag, classes) {
	let d = mBy(id);
	addKeys({ position: 'relative' }, styles);
	mStyle(d, styles);
	if (isdef(tag) && isdef(inner)) inner = `<${tag}>${inner}</${tag}>`;
	if (isdef(inner)) d.innerHTML = inner;
	if (isdef(classes)) mClass(d, classes);
	return d;
}
function mSelectTableRow(r, color = 'pink') {
	let t = r.parentNode;
	for (const ch of t.children) mStyle(ch, { background: 'transparent' });
	mStyle(r, { background: color });
}
function mShield(dParent, styles = { bg: '#00000020' }, id = null, classnames = null, hideonclick = false) {
	dParent = toElem(dParent);
	let d = mDiv(dParent, styles, id, classnames);
	lookupAddIfToList(DA, ['shields'], d);
	mIfNotRelative(dParent);
	mStyle(d, { position: 'absolute', left: 0, top: 0, w: '100%', h: '100%' });
	if (hideonclick) d.onclick = ev => { evNoBubble(ev); d.remove(); };
	else d.onclick = ev => { evNoBubble(ev); };
	mClass(d, 'topmost');
	return d;
}
function mShieldsOff() { if (nundef(DA.shields)) return; for (const d of DA.shields) d.remove(); }
function mShow(d, ms = 0) { if (ms > 0) mAppear(d, ms); else mStyle(d, { opacity: 1 }); }
function mShrink(d, x = .75, y = .75, ms = 800, callback = null) {
	let anim = toElem(d).animate([{ transform: `scale(${1},${1})` }, { transform: `scale(${x},${y})` },], { fill: 'both', duration: ms, easing: 'ease' });
	anim.onfinish = callback;
}
function mShrinkTranslate(child, scale, newParent, ms = 800, callback) {
	let [dx, dy] = get_screen_distance(child, newParent);
	mAnimate(child, 'transform', [`translateX(${dx}px) translateY(${dy}px) scale(${scale})`], callback, ms, 'ease');
}
function mShrinkUp(d, x = .75, y = 0, ms = 800, callback = null) {
	let anim = toElem(d).animate([{ transform: `scale(${1},${1})`, opacity: 1 }, { transform: `scale(${x},${y})`, opacity: 0 },], { fill: 'none', duration: ms, easing: 'ease' });
	anim.onfinish = mClear(d);
}
function mSize(d, w, h, unit = 'px', sizing) { if (nundef(h)) h = w; mStyle(d, { width: w, height: h }, unit); if (isdef(sizing)) setRect(d, sizing); }
function mSpan(dParent, styles, innerHTML) {
	let d = mCreate('span');
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(innerHTML)) d.innerHTML = innerHTML;
	if (isdef(dParent)) mAppend(dParent, d);
	return d;
}
function mStamp(d1, text, color, sz) {
	mStyle(d1, { position: 'relative' });
	let r = getRect(d1);
	let [w, h] = [r.w, r.h];
	color = valf(color, 'black');
	sz = valf(sz, r.h / 7);
	let [padding, border, rounding, angle] = [sz / 10, sz / 6, sz / 8, rChoose([-16, -14, -10, 10, 14])];
	let d2 = mDiv(d1, {
		fg: color,
		position: 'absolute', top: 25, left: 5,
		transform: `rotate(${angle}deg)`,
		fz: sz,
		hpadding: 2,
		vpadding: 0,
		rounding: rounding,
		border: `${border}px solid ${colorTrans(color, .8)}`,
		'-webkit-mask-size': `${w}px ${h}px`,
		'-webkit-mask-position': `50% 50%`,
		'-webkit-mask-image': 'url("../base/assets/images/textures/grunge.png")',
		weight: 400,
		display: 'inline-block',
		'text-transform': 'uppercase',
		family: 'blackops',
		'mix-blend-mode': 'multiply',
	}, null, text);
}
function mStyle(elem, styles, unit = 'px') {
	elem = toElem(elem);
	let bg, fg;
	if (isdef(styles.bg) || isdef(styles.fg)) {
		[bg, fg] = colorsFromBFA(styles.bg, styles.fg, styles.alpha);
	}
	if (isdef(styles.vpadding) || isdef(styles.hpadding)) {
		styles.padding = valf(styles.vpadding, 0) + unit + ' ' + valf(styles.hpadding, 0) + unit;
	}
	if (isdef(styles.vmargin) || isdef(styles.hmargin)) {
		styles.margin = valf(styles.vmargin, 0) + unit + ' ' + valf(styles.hmargin, 0) + unit;
	}
	if (isdef(styles.upperRounding) || isdef(styles.lowerRounding)) {
		let rtop = '' + valf(styles.upperRounding, 0) + unit;
		let rbot = '' + valf(styles.lowerRounding, 0) + unit;
		styles['border-radius'] = rtop + ' ' + rtop + ' ' + rbot + ' ' + rbot;
	}
	if (isdef(styles.box)) styles['box-sizing'] = 'border-box';
	if (isdef(styles.round)) styles['border-radius'] = '50%';
	for (const k in styles) {
		let val = styles[k];
		let key = k;
		if (isdef(STYLE_PARAMS[k])) key = STYLE_PARAMS[k];
		else if (k == 'font' && !isString(val)) {
			let fz = f.size; if (isNumber(fz)) fz = '' + fz + 'px';
			let ff = f.family;
			let fv = f.variant;
			let fw = isdef(f.bold) ? 'bold' : isdef(f.light) ? 'light' : f.weight;
			let fs = isdef(f.italic) ? 'italic' : f.style;
			if (nundef(fz) || nundef(ff)) return null;
			let s = fz + ' ' + ff;
			if (isdef(fw)) s = fw + ' ' + s;
			if (isdef(fv)) s = fv + ' ' + s;
			if (isdef(fs)) s = fs + ' ' + s;
			elem.style.setProperty(k, s);
			continue;
		} else if (k == 'classname') {
			mClass(elem, styles[k]);
		} else if (k == 'border') {
			if (isNumber(val)) val = `solid ${val}px ${isdef(styles.fg) ? styles.fg : '#ffffff80'}`;
			if (val.indexOf(' ') < 0) val = 'solid 1px ' + val;
		} else if (k == 'ajcenter') {
			elem.style.setProperty('justify-content', 'center');
			elem.style.setProperty('align-items', 'center');
		} else if (k == 'layout') {
			if (val[0] == 'f') {
				val = val.slice(1);
				elem.style.setProperty('display', 'flex');
				elem.style.setProperty('flex-wrap', 'wrap');
				let hor, vert;
				if (val.length == 1) hor = vert = 'center';
				else {
					let di = { c: 'center', s: 'start', e: 'end' };
					hor = di[val[1]];
					vert = di[val[2]];
				}
				let justStyle = val[0] == 'v' ? vert : hor;
				let alignStyle = val[0] == 'v' ? hor : vert;
				elem.style.setProperty('justify-content', justStyle);
				elem.style.setProperty('align-items', alignStyle);
				switch (val[0]) {
					case 'v': elem.style.setProperty('flex-direction', 'column'); break;
					case 'h': elem.style.setProperty('flex-direction', 'row'); break;
				}
			} else if (val[0] == 'g') {
				val = val.slice(1);
				elem.style.setProperty('display', 'grid');
				let n = allNumbers(val);
				let cols = n[0];
				let w = n.length > 1 ? '' + n[1] + 'px' : 'auto';
				elem.style.setProperty('grid-template-columns', `repeat(${cols}, ${w})`);
				elem.style.setProperty('place-content', 'center');
			}
		} else if (k == 'layflex') {
			elem.style.setProperty('display', 'flex');
			elem.style.setProperty('flex', '0 1 auto');
			elem.style.setProperty('flex-wrap', 'wrap');
			if (val == 'v') { elem.style.setProperty('writing-mode', 'vertical-lr'); }
		} else if (k == 'laygrid') {
			elem.style.setProperty('display', 'grid');
			let n = allNumbers(val);
			let cols = n[0];
			let w = n.length > 1 ? '' + n[1] + 'px' : 'auto';
			elem.style.setProperty('grid-template-columns', `repeat(${cols}, ${w})`);
			elem.style.setProperty('place-content', 'center');
		}
		if (key == 'font-weight') { elem.style.setProperty(key, val); continue; }
		else if (key == 'background-color') elem.style.background = bg;
		else if (key == 'color') elem.style.color = fg;
		else if (key == 'opacity') elem.style.opacity = val;
		else if (key == 'wrap') elem.style.flexWrap = 'wrap';
		else if (startsWith(k, 'dir')) {
			isCol = val[0] == 'c';
			elem.style.setProperty('flex-direction', 'column');
		} else if (key == 'flex') {
			if (isNumber(val)) val = '' + val + ' 1 0%';
			elem.style.setProperty(key, makeUnitString(val, unit));
		} else {
			elem.style.setProperty(key, makeUnitString(val, unit));
		}
	}
}
function mStyleGet(elem, prop) { return mGetStyle(elem, prop); }
function mStyleOrClass(elem, st) { if (isString(st)) mClass(elem, st); else mStyle(elem, st); }
function mStyleRemove(elem, prop) {
	if (isdef(STYLE_PARAMS[prop])) prop = STYLE_PARAMS[prop];
	elem.style.removeProperty(prop);
}
function mStyleUndo(ui, styles = {}) {
	for (const k in styles) {
		let key = valf(STYLE_PARAMS[k], k);
		ui.style[key] = null;
	}
}
function mSuit(ckey, sz = 20, color = null) {
	let suit = ckey.length == 1 ? ckey : ckey[1];
	let di = { S: '&spades;', H: '&hearts;', D: '&diams;', C: '&clubs;' };
	color = valf(color, suit == 'H' || suit == 'D' ? 'red' : 'black');
	let html = `<span style='color:${color};font-size:${sz}px'>${di[suit]}</span>`;
	return html;
}
function mSym(key, dParent, styles = {}, pos, classes) {
	let info = Syms[key];
	styles.display = 'inline-block';
	let family = info.family;
	styles.family = family;
	let sizes;
	if (isdef(styles.sz)) { sizes = mSymSizeToBox(info, styles.sz, styles.sz); }
	else if (isdef(styles.w) && isdef(styles.h)) { sizes = mSymSizeToBox(info, styles.w, styles.h); }
	else if (isdef(styles.fz)) { sizes = mSymSizeToFz(info, styles.fz); }
	else if (isdef(styles.h)) { sizes = mSymSizeToH(info, styles.h); }
	else if (isdef(styles.w)) { sizes = mSymSizeToW(info, styles.w); }
	else { sizes = mSymSizeToFz(info, 25); }
	styles.fz = sizes.fz;
	styles.w = sizes.w;
	styles.h = sizes.h;
	styles.align = 'center';
	if (isdef(styles.bg) && info.family != 'emoNoto') { styles.fg = styles.bg; delete styles.bg; }
	let x = mDiv(dParent, styles, null, info.text);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(pos)) { mPlace(x, pos); }
	return x;
}
function mSymSizeToBox(info, w, h) {
	let fw = w / info.w;
	let fh = h / info.h;
	let f = Math.min(fw, fh);
	return { fz: 100 * f, w: info.w * f, h: info.h * f };
}
function mSymSizeToFz(info, fz) { let f = fz / 100; return { fz: fz, w: info.w * f, h: info.h * f }; }
function mSymSizeToH(info, h) { let f = h / info.h; return { fz: 100 * f, w: info.w * f, h: h }; }
function mSymSizeToW(info, w) { let f = w / info.w; return { fz: 100 * f, w: w, h: info.h * f }; }
function mSymText(s, dParent, styles = {}, pos, classes) {
	styles.display = 'inline-block';
	styles.w = valfi(styles.w, styles.sz, styles.h, '25%');
	styles.h = valfi(styles.h, styles.sz, styles.w, styles.fz, '25%');
	styles.fz = valfi(styles.fz, styles.sz * 4 / 5, styles.h * 4 / 5, styles.w * 2, '20%');
	styles.align = 'center';
	let x = mDiv(dParent, styles, null, s); mCenterCenterFlex(x);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(pos)) { mPlace(x, pos); }
	return x;
}
function mTable(dParent, headers, showheaders, styles = { mabottom: 0 }, className = 'table') {
	let d = mDiv(dParent);
	let t = mCreate('table');
	mAppend(d, t);
	if (isdef(className)) mClass(t, className);
	if (isdef(styles)) mStyle(t, styles);
	if (showheaders) {
		let code = `<tr>`;
		for (const h of headers) {
			code += `<th>${h}</th>`
		}
		code += `</tr>`;
		t.innerHTML = code;
	}
	return t;
}
function mTableCol(r, val) {
	let col = mCreate('td');
	mAppend(r, col);
	if (isdef(val)) col.innerHTML = val;
	return col;
}
function mTableCommandify(rowitems, di) {
	for (const item of rowitems) {
		for (const index in di) {
			let colitem = item.colitems[index];
			colitem.div.innerHTML = di[index](item, colitem.val);
		}
	}
}
function mTableCommandifyList(rowitem, val, func) {
	let names = isString(val) ? val.replaceAll(' ', ',').split(',') : val;
	let html = '';
	for (const name of names) {
		html += func(rowitem, name);
	}
	return html;
}
function mTableHeader(t, val) {
	let col = mCreate('th');
	mAppend(t.firstChild, col);
	col.innerHTML = val;
	return col;
}
function mTableRow(t, o, headers, id) {
	let elem = mCreate('tr');
	if (isdef(id)) elem.id = id;
	mAppend(t, elem);
	let colitems = [];
	for (const k of headers) {
		let val = isdef(o[k]) ? isDict(o[k]) ? JSON.stringify(o[k]) : isList(o[k]) ? o[k].join(', ') : o[k] : '';
		let col = mTableCol(elem, val);
		colitems.push({ div: col, key: k, val: val });
	}
	return { div: elem, colitems: colitems };
}
function mTableTransition(d, ms = 800) {
	toElem(d).animate([{ opacity: .25 }, { opacity: 1 },], { fill: 'both', duration: ms, easing: 'ease' });
}
function mTag(tag, inner = null, dParent = null, styles = {}, id = null, classes = null) {
	let el = mCreate(tag);
	if (inner) el.innerHTML = inner; //'Descriptive Text goes here';
	if (dParent) mAppend(dParent, el);
	if (styles) mStyle(el, styles);
	if (id) el.id = id;
	if (classes) mClass(el, classes);
	return el;
}
function mText(text, dParent, styles, classes) {
	if (!isString(text)) text = text.toString();
	let d = mDiv(dParent);
	if (!isEmpty(text)) { d.innerHTML = text; }
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	return d;
}
function mTextarea(rows, cols, dParent, styles = {}, id) {
	let html = `<textarea id="${id}"`;
	if (isdef(rows)) html += ` rows="${rows}"`;
	if (isdef(cols)) html += ` cols="${cols}"`;
	html += ` wrap="hard"></textarea>`;
	let t = mCreateFrom(html);
	mAppend(dParent, t);
	mStyle(t, styles);
	return t;
}
function mTextWidth(txt, fz = 16) {
	let len = txt.length;
	let wprox = (len + 1.5) * fz / 2;
	return wprox;
}
function mToggle(label, dParent, styles = {}, handler, is_on, styleyes, styleno, classes = null) {
	let cursor = styles.cursor; delete styles.cursor;
	let name = replaceWhite(label);
	let checked = isdef(is_on) ? is_on : false;
	let b = mButton(label, null, dParent, styles, classes);
	mClass(b, 'noactive');
	b.setAttribute('checked', checked);
	b.onclick = ev => {
		ev.cancelBubble = true;
		let b = ev.target;
		assertion(b == ev.target, 'NOOOOOOOOOOOOOOOOOOOOOOO')
		let oldval = b.getAttribute('checked') == 'false' ? false : true;
		let newval = oldval ? false : true;
		if (newval === true) {
			mStyle(b, styleyes);
		} else {
			mStyle(b, styleno);
		}
		b.setAttribute('checked', newval);
		handler(name, newval);
	};
	return b;
}
function mTogglebar(di, handler, styleyes, styleno, dParent, styles, bstyles, id, classes, bclasses) {
	let d = mDiv(dParent, styles, id, classes);
	for (const k in di) {
		mToggle(k, d, bstyles, handler, di[k], styleyes, styleno, bclasses);
	}
}
function mToolbar(buttons, handler, dParent, styles = {}, bstyles = {}, id = null, classes = null, bclasses = null) {
	let d = mDiv(dParent, styles, id, classes);
	for (const arg of buttons) {
		let funcname = replaceWhite(arg);
		mButton(arg, () => handler(arg), d, bstyles, bclasses, `b${funcname}`);
	}
	return d;
}
function mTranslate(child, newParent, ms = 800, callback = null) {
	let [dx, dy] = get_screen_distance(child, newParent);
	onend = () => { mAppend(newParent, child); if (callback) callback(); };
	mAnimate(child, 'transform', [`translateX(${dx}px) translateY(${dy}px)`], onend, ms, 'ease');
}
function mTranslateBy(elem, x, y, ms = 800, callback = null) {
	mAnimate(elem, 'transform', [`translateX(${x}px) translateY(${y}px)`], callback, ms, 'ease');
}
function mTranslateByFade(elem, x, y, ms = 800, callback = null) {
	mAnimate(elem, 'transform', [`translateX(${x}px) translateY(${y}px)`], callback, ms, 'ease');
	let a = toElem(elem).animate([{ opacity: .25 }, { opacity: 1 },], { fill: 'both', duration: ms, easing: 'ease' });
}
function mYaml(d, js) {
	d.innerHTML = '<pre>' + jsonToYaml(js) + '</pre>';
	return d;
}
function old_mButtonX(dParent, pos = 'tr', handler = null, defaultBehavior = 'hide', sz = 40) {
	dParent = toElem(dParent);
	let styles = { cursor: 'pointer', w: sz, h: sz };
	let d2 = mDiv(dParent, styles, null, `<svg width='100%' height='100%' ><use xlink:href="#Times" /></svg>`);
	mClass(d2, 'svgbtnX');
	d2.onclick = isdef(handler) ? handler : defaultBehavior == 'hide' ? () => hide(dParent) : () => dParent.remove();
	mPlace(d2, pos, 10);
	return d2;
}
function valfi() {
	for (const arg of arguments) {
		if (isdef(arg)) return arg;
	}
	return null;
}
//#endregion m (basemin)

//#region canvas (basemin)
function cCenterOrigin(cnv, ctx) {
	cSetOrigin(ctx, cnv.width / 2, cnv.height / 2);
}
function cClear(cnv = null, ctx = null) {
	if (nundef(cnv)) { cnv = CV; ctx = CX; if (!ctx) return; }
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, cnv.width, cnv.height);
	ctx.restore();
}
function cColor(fill, cvx) { if (nundef(cvx)) cvx = CX; CX.fillStyle = fill; }
function cEllipse(x, y, w, h, styles = null, angle = 0, ctx = null) {
	if (nundef(ctx)) { ctx = CX; if (!ctx) return; }
	if (styles) cStyle(styles, ctx);
	ctx.beginPath();
	ctx.ellipse(x, y, w / 2, h / 2, -angle, 0, 2 * Math.PI);
	if (isdef(styles.bg) || nundef(styles.fg)) ctx.fill();
	if (isdef(styles.fg)) ctx.stroke();
}
function cLine(x1, y1, x2, y2, styles = null, ctx = null) {
	if (nundef(ctx)) { ctx = CX; if (!ctx) return; }
	if (styles) cStyle(styles, ctx);
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2)
	ctx.stroke();
}
function cRect(x, y, w, h, styles = null, ctx = null) {
	if (nundef(ctx)) { ctx = CX; if (!ctx) return; }
	if (styles) cStyle(styles, ctx);
	if (isdef(styles.bg) || nundef(styles.fg)) ctx.fillRect(x, y, w, h);
	if (isdef(styles.fg)) ctx.strokeRect(x, y, w, h);
}
function cSetOrigin(ctx, x, y) {
	ctx.translate(x, y);
}
function cShadow(ctx, color, offx, offy, blur) {
	ctx.shadowColor = color;
	ctx.shadowOffsetX = offx;
	ctx.shadowOffsetY = offy;
	ctx.shadowBlur = blur;
}
function cStyle(styles, ctx) {
	if (nundef(ctx)) { ctx = CX; if (nundef(ctx)) { console.log('ctx undefined!!!!!!!'); return; } }
	const di = { bg: 'fillStyle', fill: 'fillStyle', stroke: 'strokeStyle', fg: 'strokeStyle', thickness: 'lineWidth', thick: 'lineWidth', cap: 'lineCap', ending: 'lineCap' };
	if (isdef(styles)) {
		for (const k in styles) { ctx[isdef(di[k]) ? di[k] : k] = styles[k]; }
	}
}
function cStyle_dep(cvx, fill, stroke, wline, cap) {
	cvx.fillStyle = fill;
	if (isdef(stroke)) cvx.strokeStyle = stroke;
	if (isdef(wline)) cvx.lineWidth = wline;
	if (isdef(cap)) cvx.lineCap = cap;
}
//#endregion canvas (basemin)

//#region i (basemin)
function iAdd(item, liveprops, addprops) {
	let id, l;
	if (isString(item)) { id = item; item = valf(Items[id], {}); }
	let el = valf(liveprops.div, liveprops.ui, iDiv(item), null);
	id = valnwhite(item.id, (el ? el.id : getUID()), getUID());
	item.id = id; if (nundef(Items[id])) Items[id] = item; if (el) el.id = id;
	if (nundef(item.live)) item.live = {};
	l = item.live;
	for (const k in liveprops) {
		let val = liveprops[k];
		if (nundef(val)) { continue; }
		l[k] = val;
		if (isdef(val.id) && val.id != id) { lookupAddIfToList(val, ['memberOf'], id); }
	}
	if (isdef(addprops)) copyKeys(addprops, item);
	return item;
}
function iClear(item) {
	if (nundef(item)) return;
	if (isString(item)) { let id = item; if (isdef(Items[id])) item = Items[id]; else item = toElem(id); }
	let d = iDiv(item);
	if (isdef(d)) {
		let desc = Array.from(d.querySelectorAll('[id]:not([id=""])')); //'[id]:not([id]="")');
		desc = desc.filter(x => isdef(Items[x.id]))
		for (const item1 of desc) iDelete(item1.id);
		mClear(d);
	}
}
function iDelete(id) {
	delete Items[id];
}
function iDiv(i) { return isdef(i.live) ? i.live.div : isdef(i.div) ? i.div : i; }
function iMeasure(item, sizingOptions) {
	if (nundef(iDiv(item))) return;
	setRect(iDiv(item), valf(sizingOptions, { hgrow: true, wgrow: true }));
}
function iReg(item, liveprops, addprops) {
	iRepair(item);
	if (isdef(liveprops)) for (const k in liveprops) { lookupSetOverride(item, ['live', k], liveprops[k]) }
	if (isdef(addprops)) copyKeys(addprops, item);
	let umain = iDiv(item); if (nundef(umain) && isdef(item.live)) { umain = get_values(item.live)[0]; }
	let id = item.id;
	if (nundef(id) && umain) { id = valnwhite(umain.id, getUID()); item.id = id; }
	else if (nundef(id)) { id = getUID(); item.id = id; }
	if (umain) { umain.id = id; }
	if (nundef(Items[id])) Items[id] = item;
	return item;
}
function iRegister(item, id) { let uid = isdef(id) ? id : getUID(); Items[uid] = item; return uid; }
function iRepair(item) {
	let todelete = [];
	delete item.funcs;
	for (const k in item) {
		let val = item[k];
		if (isDOM(val) || k == 'cx') {
			lookupSetOverride(item, ['live', k], val);
			todelete.push(k);
		} else if (typeof val == 'function') {
			lookupSet(item, ['funcs', k], true);
		}
	}
	for (const k of todelete) delete item[k];
	return item;
}
function iTrim(item, serialize = true) {
	let todelete = [];
	for (const k in item) {
		let val = item[k];
		if (isDOM(val)) {
			if (!serialize) { if (isEmptyOrWhiteSpace(val.id)) val.id = getUID(); lookupSetOverride(item, ['live', val.id], val); }
			todelete.push(k);
		} else if (typeof val == 'function') {
			console.log('funcname', val.name);
			if (serialize) item[k] = val.name;
			else { lookupSetOverride(item, ['funcs', val.name], val); todelete.push(k); }
		}
	}
	if (serialize) { delete item.live; delete item.funcs };
	for (const k of todelete) delete item[k];
	return item;
}
//#endregion i (basemin)

//#region from (basemin)
function iG(i) { return isdef(i.live) ? i.live.g : isdef(i.g) ? i.g : i; }
function iSvg(i) { return isdef(i.live) ? i.live.svg : isdef(i.svg) ? i.svg : i; }
function mAttrs(elem, attrs) { for (const k in attrs) { elem.setAttribute(k, attrs[k]); } }
function mBackground(bg, fg) { mStyle(document.body, { bg: bg, fg: fg }); }
function mBoxFromMargins(dParent, t, r, b, l, styles, id, inner, classes) {
	let d = mDiv(dParent, { position: 'absolute', top: t, right: r, bottom: b, left: l }, id, inner, classes);
	let pos = dParent.style.position;
	if (pos != 'absolute') dParent.style.position = 'relative';
	if (isdef(styles)) mStyle(d, styles);
	return d;
}
function mgSvg(dParent, attrs) { return mgTag('svg', dParent, attrs); }
function mgTag(tag, dParent, attrs, styles = {}, innerHTML) {
	let elem = gCreate(tag);
	mStyle(elem, styles);
	mAttrs(elem, attrs);
	if (isdef(innerHTML)) elem.innerHTML = innerHTML;
	if (isdef(dParent)) mAppend(dParent, elem);
	return elem;
}
function mgText(text, dParent, attrs, styles) { return mgTag('text', dParent, attrs, styles, text); }
//#endregion from (basemin)

//#region SVG (basemin)
function _gSizeToContent(svg) {
	var bbox = svg.getBBox();
	svg.setAttribute("width", bbox.x + bbox.width + bbox.x);
	svg.setAttribute("height", bbox.y + bbox.height + bbox.y);
}
function agCircle(g, sz) { let r = gEllipse(sz, sz); g.appendChild(r); return r; }
function agColoredShape(g, shape, w, h, color) {
	SHAPEFUNCS[shape](g, w, h);
	gBg(g, color);
}
function agEllipse(g, w, h) { let r = gEllipse(w, h); g.appendChild(r); return r; }
function agG(g) { let g1 = gG(); g.appendChild(g1); return g1; }
function agHex(g, w, h) { let pts = size2hex(w, h); return agPoly(g, pts); }
function agLine(g, x1, y1, x2, y2) { let r = gLine(x1, y1, x2, y2); g.appendChild(r); return r; }
function agPoly(g, pts) { let r = gPoly(pts); g.appendChild(r); return r; }
function agRect(g, w, h) { let r = gRect(w, h); g.appendChild(r); return r; }
function agShape(g, shape, w, h, color, rounding) {
	let sh = gShape(shape, w, h, color, rounding);
	g.appendChild(sh);
	return sh;
}
function aSvg(dParent) {
	if (!dParent.style.position) dParent.style.position = 'relative';
	let svg1 = gSvg();
	svg1.setAttribute('width', '100%');
	svg1.setAttribute('height', '100%');
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);
	return svg1;
}
function aSvgg(dParent, originInCenter = true) {
	if (!dParent.style.position) dParent.style.position = 'relative';
	let svg1 = gSvg();
	svg1.setAttribute('width', '100%');
	svg1.setAttribute('height', '100%');
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);
	let g1 = document.createElementNS('http:/' + '/www.w3.org/2000/svg', 'g');
	svg1.appendChild(g1);
	if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; }
	return g1;
}
function drawFlatHex(dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 100, h: 100, bg: 'blue' };
	if (nundef(classes)) classes = ['frameOnHover'];
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	mStyle(d, { 'clip-path': 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' });
	return d;
}
function drawHex(dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 100, h: 100, bg: 'blue' };
	if (nundef(classes)) classes = ['frameOnHover'];
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	mStyle(d, { 'clip-path': 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' });
	return d;
}
function drawPlainCircle(c) {
	let item = mPic('heart', dMain, { fz: 8, bg: 'red', rounding: '50%', padding: 1 });
	mPos(iDiv(item), c.x, c.y);
	return item;
}
function drawShape(key, dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 96, h: 96, bg: 'random' };
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	if (key == 'circle' || key == 'ellipse') mStyle(d, { rounding: '50%' });
	else mStyle(d, { 'clip-path': PolyClips[key] });
	return d;
}
function drawSym(sym, c) {
	let item = mPic(sym, dMain, { fz: 25, bg: 'skyblue', rounding: '50%', padding: 4 });
	mPos(iDiv(item), c.x, c.y);
	return item;
}
function drawText(text, c) {
	let item = mText(text, dMain, { fz: 16, bg: 'skyblue', rounding: '50%', padding: 4 });
	mPos(iDiv(item), c.x, c.y);
	return item;
}
function drawTriangle(dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 100, h: 100, bg: 'blue' };
	if (nundef(classes)) classes = ['frameOnHover'];
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	mStyle(d, { 'clip-path': 'polygon(50% 0%, 100% 100%, 0% 100%)' });
	return d;
}
function gBg(g, color) { g.setAttribute('fill', color); }
function gCanvas(area, w, h, color, originInCenter = true) {
	let dParent = mBy(area);
	let div = stage3_prepContainer(dParent);
	div.style.width = w + 'px';
	div.style.height = h + 'px';
	let svg = gSvg();
	let style = `margin:0;padding:0;position:absolute;top:0px;left:0px;width:100%;height:100%;`
	svg.setAttribute('style', style);
	mColor(svg, color);
	div.appendChild(svg);
	let g = gG();
	if (originInCenter) g.style.transform = "translate(50%, 50%)";
	svg.appendChild(g);
	return g;
}
function gCreate(tag) { return document.createElementNS('http:/' + '/www.w3.org/2000/svg', tag); }
function gEllipse(w, h) { let r = gCreate('ellipse'); r.setAttribute('rx', w / 2); r.setAttribute('ry', h / 2); return r; }
function gFg(g, color, thickness) { g.setAttribute('stroke', color); if (thickness) g.setAttribute('stroke-width', thickness); }
function gG() { return gCreate('g'); }
function gHex(w, h) { let pts = size2hex(w, h); return gPoly(pts); }
function gLine(x1, y1, x2, y2) { let r = gCreate('line'); r.setAttribute('x1', x1); r.setAttribute('y1', y1); r.setAttribute('x2', x2); r.setAttribute('y2', y2); return r; }
function gPoly(pts) { let r = gCreate('polygon'); if (pts) r.setAttribute('points', pts); return r; }
function gPos(g, x, y) { g.style.transform = `translate(${x}px, ${y}px)`; }
function gRect(w, h) { let r = gCreate('rect'); r.setAttribute('width', w); r.setAttribute('height', h); r.setAttribute('x', -w / 2); r.setAttribute('y', -h / 2); return r; }
function gRounding(r, rounding) {
	r.setAttribute('rx', rounding);
	r.setAttribute('ry', rounding);
}
function gShape(shape, w = 20, h = 20, color = 'green', rounding) {
	let el = gG();
	if (nundef(shape)) shape = 'rect';
	if (shape != 'line') agColoredShape(el, shape, w, h, color);
	else gStroke(el, color, w);
	if (isdef(rounding) && shape == 'rect') {
		let r = el.children[0];
		gRounding(r, rounding);
	}
	return el;
}
function gSize(g, w, h, shape = null, iChild = 0) {
	let el = (getTypeOf(g) != 'g') ? g : g.children[iChild];
	let t = getTypeOf(el);
	switch (t) {
		case 'rect': el.setAttribute('width', w); el.setAttribute('height', h); el.setAttribute('x', -w / 2); el.setAttribute('y', -h / 2); break;
		case 'ellipse': el.setAttribute('rx', w / 2); el.setAttribute('ry', h / 2); break;
		default:
			if (shape) {
				switch (shape) {
					case 'hex': let pts = size2hex(w, h); el.setAttribute('points', pts); break;
				}
			}
	}
	return el;
}
function gStroke(g, color, thickness) { g.setAttribute('stroke', color); if (thickness) g.setAttribute('stroke-width', thickness); }
function gSvg() { return gCreate('svg'); }
//#endregion SVG (basemin)

//#region audio (basemin)
function _deqSound() {
	let key = _qSound.shift();
	let url = _audioSources[key];
	_sndPlayer = new Audio(url);
	_sndPlayer.onended = _whenSoundPaused;
	_sndPlayer.onloadeddata = () => { _loaded = true; _sndPlayer.play(); };
	_sndPlayer.load();
}
function _enqSound(key) { if (nundef(_qSound)) _qSound = []; _qSound.push(key); }
function _whenSoundPaused() {
	_sndPlayer = null;
	_sndPlayerIdle = true;
	_loaded = false;
	if (!isEmpty(_qSound)) { _deqSound(); } else { _idleSound = true; }
}
function audio_beep(vol, freq, duration) {
	console.log('sollte beepen!!!');
	if (nundef(_AUDIOCONTEXT)) _AUDIOCONTEXT = new AudioContext();
	let a = _AUDIOCONTEXT;
	v = a.createOscillator()
	u = a.createGain()
	v.connect(u)
	v.frequency.value = freq
	v.type = "square";
	u.connect(a.destination)
	u.gain.value = vol * 0.01
	v.start(a.currentTime)
	v.stop(a.currentTime + duration * 0.001);
}
function audio_onclick_pp() {
	audio_toggle('mozart');
	if (audio_playing()) { hide0('bPlay'); show0('bPause'); } else { hide0('bPause'); show0('bPlay'); }
}
function audio_pause() {
	_qSound = [];
	if (_loaded && isdef(_sndPlayer)) {
		clearTimeout(_TOSound);
		_sndPlayer.onended = null;
		_sndPlayer.onpause = _whenSoundPaused;
		_sndPlayer.pause();
	}
}
function audio_play(key, wait = true) {
	if (!wait) _qSound = [];
	_enqSound(key);
	if (_idleSound) { _idleSound = false; _deqSound(); }
}
function audio_playing() { return DA.isSound; }
function audio_toggle(key) {
	if (DA.isSound == true) { audio_pause(); DA.isSound = false; return; }
	audio_play(key);
	DA.isSound = true;
}
//#endregion audio (basemin)

//#region arr (basemin)
function addIf(arr, el) { if (!arr.includes(el)) arr.push(el); }
function addKeys(ofrom, oto) { for (const k in ofrom) if (nundef(oto[k])) oto[k] = ofrom[k]; return oto; }
function arr_get_max(arr, func) {
	if (isEmpty(arr)) return null;
	if (nundef(func)) func = x => x;
	let i = 0; let aug = arr.map(x => ({ el: jsCopy(x), val: func(x), i: i++ }));
	sortByDescending(aug, 'val');
	let max = aug[0].val;
	let res = arrTakeWhile(aug, x => x.val == max); return res.map(x => arr[x.i]);
}
function arr_get_min(arr, func) {
	if (isEmpty(arr)) return null;
	if (nundef(func)) func = x => x;
	let i = 0; let aug = arr.map(x => ({ el: jsCopy(x), val: func(x), i: i++ }));
	sortBy(aug, 'val');
	let min = aug[0].val;
	let res = arrTakeWhile(aug, x => x.val == min); return res.map(x => arr[x.i]);
}
function arrAdd(arr1, arr2) {
	let i = 0; return arr1.map(x => x + arr2[i++]);
}
function arrBuckets(arr, func, sortbystr) {
	let di = {};
	for (const a of arr) {
		let val = func(a);
		if (nundef(di[val])) di[val] = { val: val, list: [] };
		di[val].list.push(a);
	}
	let res = []
	let keys = get_keys(di);
	if (isdef(sortbystr)) {
		keys.sort((a, b) => sortbystr.indexOf(a) - sortbystr.indexOf(b));
	}
	return keys.map(x => di[x]);
}
function arrChildren(elem) { return [...toElem(elem).children]; }
function arrClear(arr) { arr.length = 0; }
function arrCount(arr, func) { return arr.filter(func).length; }
function arrCycle(arr, count) { return arrRotate(arr, count); }
function arrExtend(arr, list) { list.map(x => arr.push(x)); return arr; }
function arrFirst(arr) { return arr.length > 0 ? arr[0] : null; }
function arrFlatten(arr) {
	let res = [];
	for (let i = 0; i < arr.length; i++) {
		for (let j = 0; j < arr[i].length; j++) {
			res.push(arr[i][j]);
		}
	}
	return res;
}
function arrFromIndex(arr, i) { return arr.slice(i); }
function arrFromTo(arr, iFrom, iTo) { return takeFromTo(arr, iFrom, iTo); }
function arrFunc(n, func) { let res = []; for (let i = 0; i < n; i++) res.push(func()); return res; }
function arrIndices(arr, func) {
	let indices = [];
	for (let i = 0; i < arr.length; i++) { if (func(arr[i])) indices.push(i); }
	return indices;
}
function arrLast(arr) { return arr.length > 0 ? arr[arr.length - 1] : null; }
function arrLastOfLast(arr) { if (arr.length > 0) { let l = arrLast(arr); return isList(l) ? arrLast(l) : null; } else return null; }
function arrMax(arr, f) { return arr_get_max(arr, f); }
function arrMin(arr, f) { return arr_get_min(arr, f); }
function arrMinMax(arr, func) {
	if (nundef(func)) func = x => x;
	let min = func(arr[0]), max = func(arr[0]), imin = 0, imax = 0;
	for (let i = 1, len = arr.length; i < len; i++) {
		let v = func(arr[i]);
		if (v < min) {
			min = v; imin = i;
		} else if (v > max) {
			max = v; imax = i;
		}
	}
	return { min: min, imin: imin, max: max, imax: imax, elmin: arr[imin], elmax: arr[imax] };
}
function arrMinus(a, b) { if (isList(b)) return a.filter(x => !b.includes(x)); else return a.filter(x => x != b); }
function arrNoDuplicates(arr) {
	let di = {};
	let arrNew = [];
	for (const el of arr) {
		if (!isLiteral(el)) continue;
		if (isdef(di[el])) continue;
		di[el] = true;
		arrNew.push(el);
	}
	return arrNew;
}
function arrPlus(a, b) { b.map(x => a.push(x)); return a; }
function arrRange(from = 1, to = 10, step = 1) { let res = []; for (let i = from; i <= to; i += step)res.push(i); return res; }
function arrRemove(arr, listweg) {
	arrReplace(arr, listweg, []);
}
function arrRemoveLast(arr) { arr.length -= 1; }
function arrRemovip(arr, el) {
	let i = arr.indexOf(el);
	if (i > -1) arr.splice(i, 1);
	return i;
}
function arrRepeat(n, el) { let res = []; for (let i = 0; i < n; i++) res.push(el); return res; }
function arrReplace(arr, listweg, listdazu) {
	arrExtend(arr, listdazu);
	listweg.map(x => arrRemovip(arr, x));
	return arr;
}
function arrReplace1(arr, elweg, eldazu) {
	let i = arr.indexOf(elweg);
	arr[i] = eldazu;
	return arr;
}
function arrReverse(arr) { return jsCopy(arr).reverse(); }
function arrRotate(arr, count) {
	var unshift = Array.prototype.unshift,
		splice = Array.prototype.splice;
	var len = arr.length >>> 0, count = count >> 0;
	let arr1 = jsCopy(arr);
	unshift.apply(arr1, splice.call(arr1, count % len, len));
	return arr1;
}
function arrShufflip(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }
function arrSplitAtIndex(arr, i) {
	return [arr.slice(0, i), arr.slice(i)];
}
function arrSplitByIndices(arr, indices) {
	let [a1, a2] = [[], jsCopy(arr)];
	for (let i = 0; i < indices.length; i++) {
		let el = arr[indices[i]];
		a1.push(el);
		removeInPlace(a2, el);
	}
	return [a1, a2];
}
function arrSum(arr, props) {
	if (nundef(props)) return arr.reduce((a, b) => a + b);
	if (!isList(props)) props = [props];
	return arr.reduce((a, b) => a + (lookup(b, props) || 0), 0);
}
function arrSwap(arr, i, j) { let h = arr[i]; arr[i] = arr[j]; arr[j] = h; }
function arrTake(arr, n = 0, from = 0) {
	if (isDict(arr)) {
		let keys = Object.keys(arr);
		return n > 0 ? keys.slice(from, from + n).map(x => (arr[x])) : keys.slice(from).map(x => (arr[x]));
	} else return n > 0 ? arr.slice(from, from + n) : arr.slice(from);
}
function arrTakeLast(arr, n, from = 0) {
	let res = [];
	if (isDict(arr)) {
		let keys = Object.keys(arr);
		let ilast = keys.length - 1; for (let i = ilast - from; i >= 0 && i > ilast - from - n; i--) { res.unshift(arr[keys[i]]); }
	} else {
		let ilast = arr.length - 1; for (let i = ilast - from; i >= 0 && i > ilast - from - n; i--) { res.unshift(arr[i]); }
	}
	return res;
}
function arrTakeWhile(arr, func) {
	let res = [];
	for (const a of arr) {
		if (func(a)) res.push(a); else break;
	}
	return res;
}
function arrWithout(arr, b) { return arrMinus(arr, b); }
function arrZip(arr1, arr2) {
	let res = [];
	for (let i = 0; i < Math.min(arr1, arr2); i++) {
		let o = {};
		addKeys(arr1[i], o);
		addKeys(arr2[i], o);
		res.push(o);
	}
	return res;
}
function bottom_elem_from_to(arr1, arr2) { last_elem_from_to(arr1, arr2); }
function bottom_elem_from_to_top(arr1, arr2) { arr2.unshift(arr1.pop()); }
function copyKeys(ofrom, oto, except = {}, only = null) {
	let keys = isdef(only) ? only : Object.keys(ofrom);
	for (const k of keys) {
		if (isdef(except[k])) continue;
		oto[k] = ofrom[k];
	}
	return oto;
}
function dict2list(d, keyName = 'id') {
	let res = [];
	for (const key in d) {
		let val = d[key];
		let o;
		if (isDict(val)) { o = jsCopy(val); } else { o = { value: val }; }
		o[keyName] = key;
		res.push(o);
	}
	return res;
}
function draw_from_deck_to(deck, arr) { top_elem_from_to(deck, arr); }
function draw_from_deck_to_board(deck, arr) { top_elem_from_to_top(deck, arr); }
function elem_from_to(el, arr1, arr2) { removeInPlace(arr1, el); arr2.push(el); }
function elem_from_to_top(el, arr1, arr2) { removeInPlace(arr1, el); arr2.unshift(el); }
function find_minimum(array) {
	let min = array[0];
	for (let i = 1; i < array.length; i++) {
		if (array[i] < min) min = array[i];
	}
	return min;
}
function find_minimum_by_function(array, func) {
	let min = func(array[0]);
	for (let i = 1; i < array.length; i++) {
		if (func(array[i]) < func(min)) min = array[i];
	}
	return min;
}
function firstCond(arr, func) {
	if (nundef(arr)) return null;
	for (const a of arr) {
		if (func(a)) return a;
	}
	return null;
}
function firstCondDict(dict, func) {
	for (const k in dict) { if (func(dict[k])) return k; }
	return null;
}
function firstCondDictKey() { return firstCondDictKeys(...arguments); }
function firstCondDictKeys(dict, func) {
	for (const k in dict) { if (func(k)) return k; }
	return null;
}
function firstNCond(n, arr, func) {
	if (nundef(arr)) return [];
	let result = [];
	let cnt = 0;
	for (const a of arr) {
		cnt += 1; if (cnt > n) break;
		if (func(a)) result.push(a);
	}
	return result;
}
function fisherYates(arr) {
	if (arr.length == 2 && coin()) { return arr; }
	var rnd, temp;
	let last = arr[0];
	for (var i = arr.length - 1; i; i--) {
		rnd = Math.random() * i | 0;
		temp = arr[i];
		arr[i] = arr[rnd];
		arr[rnd] = temp;
	}
	return arr;
}
function forAll(arr, func) { for (const a of arr) if (!func(a)) return false; return true; }
function get_keys(o) { return Object.keys(o); }
function get_values(o) { return Object.values(o); }
function last_elem_from_to(arr1, arr2) { arr2.push(arr1.pop()); }
function lastCond(arr, func) {
	if (nundef(arr)) return null;
	for (let i = arr.length - 1; i >= 0; i--) { let a = arr[i]; if (func(a)) return a; }
	return null;
}
function list2dict(arr, keyprop = 'id', uniqueKeys = true) {
	let di = {};
	for (const a of arr) {
		if (uniqueKeys) lookupSet(di, [a[keyprop]], a);
		else lookupAddToList(di, [a[keyprop]], a);
	}
	return di;
}
function lookup(dict, keys) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (k === undefined) break;
		let e = d[k];
		if (e === undefined || e === null) return null;
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupAddIfToList(dict, keys, val) {
	let lst = lookup(dict, keys);
	if (isList(lst) && lst.includes(val)) return;
	lookupAddToList(dict, keys, val);
}
function lookupAddToList(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (i == ilast) {
			if (nundef(k)) {
				console.assert(false, 'lookupAddToList: last key indefined!' + keys.join(' '));
				return null;
			} else if (isList(d[k])) {
				d[k].push(val);
			} else {
				d[k] = [val];
			}
			return d[k];
		}
		if (nundef(k)) continue;
		if (d[k] === undefined) d[k] = {};
		d = d[k];
		i += 1;
	}
	return d;
}
function lookupSet(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (nundef(k)) continue;
		if (d[k] === undefined) d[k] = (i == ilast ? val : {});
		if (nundef(d[k])) d[k] = (i == ilast ? val : {});
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupSetOverride(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (i == ilast) {
			if (nundef(k)) {
				return null;
			} else {
				d[k] = val;
			}
			return d[k];
		}
		if (nundef(k)) continue;
		if (nundef(d[k])) d[k] = {};
		d = d[k];
		i += 1;
	}
	return d;
}
function removeInPlace(arr, el) {
	arrRemovip(arr, el);
}
function return_elem_to_deck_from(el, arr, deck) { elem_from_to(el, arr, deck); }
function sameList(l1, l2) {
	if (l1.length != l2.length) return false;
	for (const s of l1) {
		if (!l2.includes(s)) return false;
	}
	return true;
}
function shuffle(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }
function shuffle_children(d) {
	let arr = Array.from(d.children);
	shuffle(arr);
	for (const ch of arr) { mAppend(d, ch); }
}
function shuffleChildren(dParent) { shuffle_children(dParent); }
function sortCaseInsensitive(list) {
	list.sort((a, b) => { return a.toLowerCase().localeCompare(b.toLowerCase()); });
	return list;
}
function sortBy(arr, key) { arr.sort((a, b) => (a[key] < b[key] ? -1 : 1)); return arr; }
function sortByDescending(arr, key) { arr.sort((a, b) => (a[key] > b[key] ? -1 : 1)); return arr; }
function sortByFunc(arr, func) { arr.sort((a, b) => (func(a) < func(b) ? -1 : 1)); return arr; }
function sortByFuncDescending(arr, func) { arr.sort((a, b) => (func(a) > func(b) ? -1 : 1)); return arr; }
function sortNumbers(ilist) { ilist.sort(function (a, b) { return a - b }); return ilist; }
function stripToKeys(o, di) {
	let res = {};
	for (const k in o) {
		if (isdef(di[k])) res[k] = o[k];
	}
	return res;
}
function top_elem_from_to(arr1, arr2) { arr2.push(arr1.shift()); }
function top_elem_from_to_top(arr1, arr2) { arr2.unshift(arr1.shift()); }
//#endregion arr (basemin)

//#region color (basemin)
function alphaToHex(zero1) {
	zero1 = Math.round(zero1 * 100) / 100;
	var alpha = Math.round(zero1 * 255);
	var hex = (alpha + 0x10000)
		.toString(16)
		.slice(-2)
		.toUpperCase();
	var perc = Math.round(zero1 * 100);
	return hex;
}
function colorChannelMixer(colorChannelA, colorChannelB, amountToMix) {
	var channelA = colorChannelA * amountToMix;
	var channelB = colorChannelB * (1 - amountToMix);
	return parseInt(channelA + channelB);
}
function colorDark(c, percent = 50, log = true) {
	if (nundef(c)) c = rColor(); else c = colorFrom(c);
	let zero1 = -percent / 100;
	return pSBC(zero1, c, undefined, !log);
}
function colorFrom(cAny, a, allowHsl = false) {
	if (isString(cAny)) {
		if (cAny[0] == '#') {
			if (a == undefined) return cAny;
			cAny = cAny.substring(0, 7);
			return cAny + (a == 1 ? '' : alphaToHex(a));
		} else if (isdef(ColorDi) && lookup(ColorDi, [cAny])) {
			let c = ColorDi[cAny].c;
			if (a == undefined) return c;
			c = c.substring(0, 7);
			return c + (a == 1 ? '' : alphaToHex(a));
		} else if (startsWith(cAny, 'rand')) {
			let spec = capitalize(cAny.substring(4));
			if (isdef(window['color' + spec])) {
				c = window['color' + spec]();
			} else c = rColor();
			if (a == undefined) return c;
			return c + (a == 1 ? '' : alphaToHex(a));
		} else if (startsWith(cAny, 'linear')) {
			return cAny;
		} else if (cAny[0] == 'r' && cAny[1] == 'g') {
			if (a == undefined) return cAny;
			if (cAny[3] == 'a') {
				if (a < 1) {
					return stringBeforeLast(cAny, ',') + ',' + a + ')';
				} else {
					let parts = cAny.split(',');
					let r = firstNumber(parts[0]);
					return 'rgb(' + r + ',' + parts[1] + ',' + parts[2] + ')';
				}
			} else {
				if (a < 1) {
					return 'rgba' + cAny.substring(3, cAny.length - 1) + ',' + a + ')';
				} else {
					return cAny;
				}
			}
		} else if (cAny[0] == 'h' && cAny[1] == 's') {
			if (allowHsl) {
				if (a == undefined) return cAny;
				if (cAny[3] == 'a') {
					if (a < 1) {
						return stringBeforeLast(cAny, ',') + ',' + a + ')';
					} else {
						let parts = cAny.split(',');
						let r = firstNumber(parts[0]);
						return 'hsl(' + r + ',' + parts[1] + ',' + parts[2] + ')';
					}
				} else {
					return a == 1 ? cAny : 'hsla' + cAny.substring(3, cAny.length - 1) + ',' + a + ')';
				}
			} else {
				if (cAny[3] == 'a') {
					cAny = HSLAToRGBA(cAny);
				} else {
					cAny = HSLToRGB(cAny);
				}
				return colorFrom(cAny, a, false);
			}
		} else {
			ensureColorDict();
			let c = ColorDi[cAny];
			if (nundef(c)) {
				if (startsWith(cAny, 'rand')) {
					let spec = cAny.substring(4);
					if (isdef(window['color' + spec])) {
						c = window['color' + spec](res);
					} else c = rColor();
				} else {
					console.log('color not available:', cAny);
					throw new Error('color not found: ' + cAny)
					return '#00000000';
				}
			} else c = c.c;
			if (a == undefined) return c;
			c = c.substring(0, 7);
			return c + (a == 1 ? '' : alphaToHex(a));
		}
	} else if (Array.isArray(cAny)) {
		if (cAny.length == 3 && isNumber(cAny[0])) {
			let r = cAny[0];
			let g = cAny[1];
			let b = cAny[2];
			return a == undefined || a == 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
		} else {
			return rChoose(cAny);
		}
	} else if (typeof cAny == 'object') {
		if ('h' in cAny) {
			let hslString = '';
			if (a == undefined || a == 1) {
				hslString = `hsl(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%)`;
			} else {
				hslString = `hsla(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%,${a})`;
			}
			if (allowHsl) {
				return hslString;
			} else {
				return colorFrom(hslString, a, allowHsl);
			}
		} else if ('r' in cAny) {
			if (a !== undefined && a < 1) {
				return `rgba(${cAny.r},${cAny.g},${cAny.b},${a})`;
			} else {
				return `rgb(${cAny.r},${cAny.g},${cAny.b})`;
			}
		}
	}
}
function colorFromHSL(hue, sat = 100, lum = 50) {
	return hslToHex(valf(hue, rHue()), sat, lum);
}
function colorHex(cAny) {
	let c = colorFrom(cAny);
	if (c[0] == '#') {
		return c;
	} else {
		let res = pSBC(0, c, 'c');
		return res;
	}
}
function colorHSL(cAny, asObject = false) {
	let res = colorFrom(cAny, undefined, true);
	let shsl = res;
	if (res[0] == '#') {
		if (res.length == 9) {
			shsl = hexAToHSLA(res);
		} else if (res.length == 7) {
			shsl = hexToHSL(res);
		}
	} else if (res[0] == 'r') {
		if (res[3] == 'a') {
			shsl = RGBAToHSLA(res);
		} else {
			shsl = RGBToHSL(res);
		}
	}
	let n = allNumbers(shsl);
	if (asObject) {
		return { h: n[0], s: n[1] / 100, l: n[2] / 100, a: n.length > 3 ? n[3] : 1 };
	} else {
		return shsl;
	}
}
function colorHSLBuild(hue, sat = 100, lum = 50) { let result = "hsl(" + hue + ',' + sat + '%,' + lum + '%)'; return result; }
function colorHue(cAny) { let hsl = colorHSL(cAny, true); return hsl.h; }
function colorHueWheel(contrastTo, minDiff = 25, mod = 30, start = 0) {
	let hc = colorHue(contrastTo);
	let wheel = [];
	while (start < 360) {
		let d1 = Math.abs((start + 360) - hc);
		let d2 = Math.abs((start) - hc);
		let d3 = Math.abs((start - 360) - hc);
		let min = Math.min(d1, d2, d3);
		if (min > minDiff) wheel.push(start);
		start += mod;
	}
	return wheel;
}
function colorIdealText(bg, grayPreferred = false) {
	let rgb = colorRGB(bg, true);
	const nThreshold = 105;
	let r = rgb.r;
	let g = rgb.g;
	let b = rgb.b;
	var bgDelta = r * 0.299 + g * 0.587 + b * 0.114;
	var foreColor = 255 - bgDelta < nThreshold ? 'black' : 'white';
	if (grayPreferred) foreColor = 255 - bgDelta < nThreshold ? 'dimgray' : 'snow';
	return foreColor;
}
function colorLight(c, percent = 20, log = true) {
	if (nundef(c)) {
		return colorFromHSL(rHue(), 100, 85);
	} else c = colorFrom(c);
	let zero1 = percent / 100;
	return pSBC(zero1, c, undefined, !log);
}
function colorMap(spec) {
	const Colormap = {
		"jet": [{ "index": 0, "rgb": [0, 0, 131] }, { "index": 0.125, "rgb": [0, 60, 170] }, { "index": 0.375, "rgb": [5, 255, 255] }, { "index": 0.625, "rgb": [255, 255, 0] }, { "index": 0.875, "rgb": [250, 0, 0] }, { "index": 1, "rgb": [128, 0, 0] }],
		"hsv": [{ "index": 0, "rgb": [255, 0, 0] }, { "index": 0.169, "rgb": [253, 255, 2] }, { "index": 0.173, "rgb": [247, 255, 2] }, { "index": 0.337, "rgb": [0, 252, 4] }, { "index": 0.341, "rgb": [0, 252, 10] }, { "index": 0.506, "rgb": [1, 249, 255] }, { "index": 0.671, "rgb": [2, 0, 253] }, { "index": 0.675, "rgb": [8, 0, 253] }, { "index": 0.839, "rgb": [255, 0, 251] }, { "index": 0.843, "rgb": [255, 0, 245] }, { "index": 1, "rgb": [255, 0, 6] }],
		"hot": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 0.3, "rgb": [230, 0, 0] }, { "index": 0.6, "rgb": [255, 210, 0] }, { "index": 1, "rgb": [255, 255, 255] }],
		"spring": [{ "index": 0, "rgb": [255, 0, 255] }, { "index": 1, "rgb": [255, 255, 0] }],
		"summer": [{ "index": 0, "rgb": [0, 128, 102] }, { "index": 1, "rgb": [255, 255, 102] }],
		"autumn": [{ "index": 0, "rgb": [255, 0, 0] }, { "index": 1, "rgb": [255, 255, 0] }],
		"winter": [{ "index": 0, "rgb": [0, 0, 255] }, { "index": 1, "rgb": [0, 255, 128] }],
		"bone": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 0.376, "rgb": [84, 84, 116] }, { "index": 0.753, "rgb": [169, 200, 200] }, { "index": 1, "rgb": [255, 255, 255] }],
		"copper": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 0.804, "rgb": [255, 160, 102] }, { "index": 1, "rgb": [255, 199, 127] }],
		"greys": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 1, "rgb": [255, 255, 255] }],
		"yignbu": [{ "index": 0, "rgb": [8, 29, 88] }, { "index": 0.125, "rgb": [37, 52, 148] }, { "index": 0.25, "rgb": [34, 94, 168] }, { "index": 0.375, "rgb": [29, 145, 192] }, { "index": 0.5, "rgb": [65, 182, 196] }, { "index": 0.625, "rgb": [127, 205, 187] }, { "index": 0.75, "rgb": [199, 233, 180] }, { "index": 0.875, "rgb": [237, 248, 217] }, { "index": 1, "rgb": [255, 255, 217] }],
		"greens": [{ "index": 0, "rgb": [0, 68, 27] }, { "index": 0.125, "rgb": [0, 109, 44] }, { "index": 0.25, "rgb": [35, 139, 69] }, { "index": 0.375, "rgb": [65, 171, 93] }, { "index": 0.5, "rgb": [116, 196, 118] }, { "index": 0.625, "rgb": [161, 217, 155] }, { "index": 0.75, "rgb": [199, 233, 192] }, { "index": 0.875, "rgb": [229, 245, 224] }, { "index": 1, "rgb": [247, 252, 245] }],
		"yiorrd": [{ "index": 0, "rgb": [128, 0, 38] }, { "index": 0.125, "rgb": [189, 0, 38] }, { "index": 0.25, "rgb": [227, 26, 28] }, { "index": 0.375, "rgb": [252, 78, 42] }, { "index": 0.5, "rgb": [253, 141, 60] }, { "index": 0.625, "rgb": [254, 178, 76] }, { "index": 0.75, "rgb": [254, 217, 118] }, { "index": 0.875, "rgb": [255, 237, 160] }, { "index": 1, "rgb": [255, 255, 204] }],
		"bluered": [{ "index": 0, "rgb": [0, 0, 255] }, { "index": 1, "rgb": [255, 0, 0] }],
		"rdbu": [{ "index": 0, "rgb": [5, 10, 172] }, { "index": 0.35, "rgb": [106, 137, 247] }, { "index": 0.5, "rgb": [190, 190, 190] }, { "index": 0.6, "rgb": [220, 170, 132] }, { "index": 0.7, "rgb": [230, 145, 90] }, { "index": 1, "rgb": [178, 10, 28] }],
		"picnic": [{ "index": 0, "rgb": [0, 0, 255] }, { "index": 0.1, "rgb": [51, 153, 255] }, { "index": 0.2, "rgb": [102, 204, 255] }, { "index": 0.3, "rgb": [153, 204, 255] }, { "index": 0.4, "rgb": [204, 204, 255] }, { "index": 0.5, "rgb": [255, 255, 255] }, { "index": 0.6, "rgb": [255, 204, 255] }, { "index": 0.7, "rgb": [255, 153, 255] }, { "index": 0.8, "rgb": [255, 102, 204] }, { "index": 0.9, "rgb": [255, 102, 102] }, { "index": 1, "rgb": [255, 0, 0] }],
		"rainbow": [{ "index": 0, "rgb": [150, 0, 90] }, { "index": 0.125, "rgb": [0, 0, 200] }, { "index": 0.25, "rgb": [0, 25, 255] }, { "index": 0.375, "rgb": [0, 152, 255] }, { "index": 0.5, "rgb": [44, 255, 150] }, { "index": 0.625, "rgb": [151, 255, 0] }, { "index": 0.75, "rgb": [255, 234, 0] }, { "index": 0.875, "rgb": [255, 111, 0] }, { "index": 1, "rgb": [255, 0, 0] }],
		"portland": [{ "index": 0, "rgb": [12, 51, 131] }, { "index": 0.25, "rgb": [10, 136, 186] }, { "index": 0.5, "rgb": [242, 211, 56] }, { "index": 0.75, "rgb": [242, 143, 56] }, { "index": 1, "rgb": [217, 30, 30] }],
		"blackbody": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 0.2, "rgb": [230, 0, 0] }, { "index": 0.4, "rgb": [230, 210, 0] }, { "index": 0.7, "rgb": [255, 255, 255] }, { "index": 1, "rgb": [160, 200, 255] }],
		"earth": [{ "index": 0, "rgb": [0, 0, 130] }, { "index": 0.1, "rgb": [0, 180, 180] }, { "index": 0.2, "rgb": [40, 210, 40] }, { "index": 0.4, "rgb": [230, 230, 50] }, { "index": 0.6, "rgb": [120, 70, 20] }, { "index": 1, "rgb": [255, 255, 255] }],
		"electric": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 0.15, "rgb": [30, 0, 100] }, { "index": 0.4, "rgb": [120, 0, 100] }, { "index": 0.6, "rgb": [160, 90, 0] }, { "index": 0.8, "rgb": [230, 200, 0] }, { "index": 1, "rgb": [255, 250, 220] }],
		"alpha": [{ "index": 0, "rgb": [255, 255, 255, 0] }, { "index": 1, "rgb": [255, 255, 255, 1] }],
		"viridis": [{ "index": 0, "rgb": [68, 1, 84] }, { "index": 0.13, "rgb": [71, 44, 122] }, { "index": 0.25, "rgb": [59, 81, 139] }, { "index": 0.38, "rgb": [44, 113, 142] }, { "index": 0.5, "rgb": [33, 144, 141] }, { "index": 0.63, "rgb": [39, 173, 129] }, { "index": 0.75, "rgb": [92, 200, 99] }, { "index": 0.88, "rgb": [170, 220, 50] }, { "index": 1, "rgb": [253, 231, 37] }],
		"inferno": [{ "index": 0, "rgb": [0, 0, 4] }, { "index": 0.13, "rgb": [31, 12, 72] }, { "index": 0.25, "rgb": [85, 15, 109] }, { "index": 0.38, "rgb": [136, 34, 106] }, { "index": 0.5, "rgb": [186, 54, 85] }, { "index": 0.63, "rgb": [227, 89, 51] }, { "index": 0.75, "rgb": [249, 140, 10] }, { "index": 0.88, "rgb": [249, 201, 50] }, { "index": 1, "rgb": [252, 255, 164] }],
		"magma": [{ "index": 0, "rgb": [0, 0, 4] }, { "index": 0.13, "rgb": [28, 16, 68] }, { "index": 0.25, "rgb": [79, 18, 123] }, { "index": 0.38, "rgb": [129, 37, 129] }, { "index": 0.5, "rgb": [181, 54, 122] }, { "index": 0.63, "rgb": [229, 80, 100] }, { "index": 0.75, "rgb": [251, 135, 97] }, { "index": 0.88, "rgb": [254, 194, 135] }, { "index": 1, "rgb": [252, 253, 191] }],
		"plasma": [{ "index": 0, "rgb": [13, 8, 135] }, { "index": 0.13, "rgb": [75, 3, 161] }, { "index": 0.25, "rgb": [125, 3, 168] }, { "index": 0.38, "rgb": [168, 34, 150] }, { "index": 0.5, "rgb": [203, 70, 121] }, { "index": 0.63, "rgb": [229, 107, 93] }, { "index": 0.75, "rgb": [248, 148, 65] }, { "index": 0.88, "rgb": [253, 195, 40] }, { "index": 1, "rgb": [240, 249, 33] }],
		"warm": [{ "index": 0, "rgb": [125, 0, 179] }, { "index": 0.13, "rgb": [172, 0, 187] }, { "index": 0.25, "rgb": [219, 0, 170] }, { "index": 0.38, "rgb": [255, 0, 130] }, { "index": 0.5, "rgb": [255, 63, 74] }, { "index": 0.63, "rgb": [255, 123, 0] }, { "index": 0.75, "rgb": [234, 176, 0] }, { "index": 0.88, "rgb": [190, 228, 0] }, { "index": 1, "rgb": [147, 255, 0] }],
		"cool": [{ "index": 0, "rgb": [125, 0, 179] }, { "index": 0.13, "rgb": [116, 0, 218] }, { "index": 0.25, "rgb": [98, 74, 237] }, { "index": 0.38, "rgb": [68, 146, 231] }, { "index": 0.5, "rgb": [0, 204, 197] }, { "index": 0.63, "rgb": [0, 247, 146] }, { "index": 0.75, "rgb": [0, 255, 88] }, { "index": 0.88, "rgb": [40, 255, 8] }, { "index": 1, "rgb": [147, 255, 0] }],
		"rainbow-soft": [{ "index": 0, "rgb": [125, 0, 179] }, { "index": 0.1, "rgb": [199, 0, 180] }, { "index": 0.2, "rgb": [255, 0, 121] }, { "index": 0.3, "rgb": [255, 108, 0] }, { "index": 0.4, "rgb": [222, 194, 0] }, { "index": 0.5, "rgb": [150, 255, 0] }, { "index": 0.6, "rgb": [0, 255, 55] }, { "index": 0.7, "rgb": [0, 246, 150] }, { "index": 0.8, "rgb": [50, 167, 222] }, { "index": 0.9, "rgb": [103, 51, 235] }, { "index": 1, "rgb": [124, 0, 186] }],
		"bathymetry": [{ "index": 0, "rgb": [40, 26, 44] }, { "index": 0.13, "rgb": [59, 49, 90] }, { "index": 0.25, "rgb": [64, 76, 139] }, { "index": 0.38, "rgb": [63, 110, 151] }, { "index": 0.5, "rgb": [72, 142, 158] }, { "index": 0.63, "rgb": [85, 174, 163] }, { "index": 0.75, "rgb": [120, 206, 163] }, { "index": 0.88, "rgb": [187, 230, 172] }, { "index": 1, "rgb": [253, 254, 204] }],
		"cdom": [{ "index": 0, "rgb": [47, 15, 62] }, { "index": 0.13, "rgb": [87, 23, 86] }, { "index": 0.25, "rgb": [130, 28, 99] }, { "index": 0.38, "rgb": [171, 41, 96] }, { "index": 0.5, "rgb": [206, 67, 86] }, { "index": 0.63, "rgb": [230, 106, 84] }, { "index": 0.75, "rgb": [242, 149, 103] }, { "index": 0.88, "rgb": [249, 193, 135] }, { "index": 1, "rgb": [254, 237, 176] }],
		"chlorophyll": [{ "index": 0, "rgb": [18, 36, 20] }, { "index": 0.13, "rgb": [25, 63, 41] }, { "index": 0.25, "rgb": [24, 91, 59] }, { "index": 0.38, "rgb": [13, 119, 72] }, { "index": 0.5, "rgb": [18, 148, 80] }, { "index": 0.63, "rgb": [80, 173, 89] }, { "index": 0.75, "rgb": [132, 196, 122] }, { "index": 0.88, "rgb": [175, 221, 162] }, { "index": 1, "rgb": [215, 249, 208] }],
		"density": [{ "index": 0, "rgb": [54, 14, 36] }, { "index": 0.13, "rgb": [89, 23, 80] }, { "index": 0.25, "rgb": [110, 45, 132] }, { "index": 0.38, "rgb": [120, 77, 178] }, { "index": 0.5, "rgb": [120, 113, 213] }, { "index": 0.63, "rgb": [115, 151, 228] }, { "index": 0.75, "rgb": [134, 185, 227] }, { "index": 0.88, "rgb": [177, 214, 227] }, { "index": 1, "rgb": [230, 241, 241] }],
		"freesurface-blue": [{ "index": 0, "rgb": [30, 4, 110] }, { "index": 0.13, "rgb": [47, 14, 176] }, { "index": 0.25, "rgb": [41, 45, 236] }, { "index": 0.38, "rgb": [25, 99, 212] }, { "index": 0.5, "rgb": [68, 131, 200] }, { "index": 0.63, "rgb": [114, 156, 197] }, { "index": 0.75, "rgb": [157, 181, 203] }, { "index": 0.88, "rgb": [200, 208, 216] }, { "index": 1, "rgb": [241, 237, 236] }],
		"freesurface-red": [{ "index": 0, "rgb": [60, 9, 18] }, { "index": 0.13, "rgb": [100, 17, 27] }, { "index": 0.25, "rgb": [142, 20, 29] }, { "index": 0.38, "rgb": [177, 43, 27] }, { "index": 0.5, "rgb": [192, 87, 63] }, { "index": 0.63, "rgb": [205, 125, 105] }, { "index": 0.75, "rgb": [216, 162, 148] }, { "index": 0.88, "rgb": [227, 199, 193] }, { "index": 1, "rgb": [241, 237, 236] }],
		"oxygen": [{ "index": 0, "rgb": [64, 5, 5] }, { "index": 0.13, "rgb": [106, 6, 15] }, { "index": 0.25, "rgb": [144, 26, 7] }, { "index": 0.38, "rgb": [168, 64, 3] }, { "index": 0.5, "rgb": [188, 100, 4] }, { "index": 0.63, "rgb": [206, 136, 11] }, { "index": 0.75, "rgb": [220, 174, 25] }, { "index": 0.88, "rgb": [231, 215, 44] }, { "index": 1, "rgb": [248, 254, 105] }],
		"par": [{ "index": 0, "rgb": [51, 20, 24] }, { "index": 0.13, "rgb": [90, 32, 35] }, { "index": 0.25, "rgb": [129, 44, 34] }, { "index": 0.38, "rgb": [159, 68, 25] }, { "index": 0.5, "rgb": [182, 99, 19] }, { "index": 0.63, "rgb": [199, 134, 22] }, { "index": 0.75, "rgb": [212, 171, 35] }, { "index": 0.88, "rgb": [221, 210, 54] }, { "index": 1, "rgb": [225, 253, 75] }],
		"phase": [{ "index": 0, "rgb": [145, 105, 18] }, { "index": 0.13, "rgb": [184, 71, 38] }, { "index": 0.25, "rgb": [186, 58, 115] }, { "index": 0.38, "rgb": [160, 71, 185] }, { "index": 0.5, "rgb": [110, 97, 218] }, { "index": 0.63, "rgb": [50, 123, 164] }, { "index": 0.75, "rgb": [31, 131, 110] }, { "index": 0.88, "rgb": [77, 129, 34] }, { "index": 1, "rgb": [145, 105, 18] }],
		"salinity": [{ "index": 0, "rgb": [42, 24, 108] }, { "index": 0.13, "rgb": [33, 50, 162] }, { "index": 0.25, "rgb": [15, 90, 145] }, { "index": 0.38, "rgb": [40, 118, 137] }, { "index": 0.5, "rgb": [59, 146, 135] }, { "index": 0.63, "rgb": [79, 175, 126] }, { "index": 0.75, "rgb": [120, 203, 104] }, { "index": 0.88, "rgb": [193, 221, 100] }, { "index": 1, "rgb": [253, 239, 154] }],
		"temperature": [{ "index": 0, "rgb": [4, 35, 51] }, { "index": 0.13, "rgb": [23, 51, 122] }, { "index": 0.25, "rgb": [85, 59, 157] }, { "index": 0.38, "rgb": [129, 79, 143] }, { "index": 0.5, "rgb": [175, 95, 130] }, { "index": 0.63, "rgb": [222, 112, 101] }, { "index": 0.75, "rgb": [249, 146, 66] }, { "index": 0.88, "rgb": [249, 196, 65] }, { "index": 1, "rgb": [232, 250, 91] }],
		"turbidity": [{ "index": 0, "rgb": [34, 31, 27] }, { "index": 0.13, "rgb": [65, 50, 41] }, { "index": 0.25, "rgb": [98, 69, 52] }, { "index": 0.38, "rgb": [131, 89, 57] }, { "index": 0.5, "rgb": [161, 112, 59] }, { "index": 0.63, "rgb": [185, 140, 66] }, { "index": 0.75, "rgb": [202, 174, 88] }, { "index": 0.88, "rgb": [216, 209, 126] }, { "index": 1, "rgb": [233, 246, 171] }],
		"velocity-blue": [{ "index": 0, "rgb": [17, 32, 64] }, { "index": 0.13, "rgb": [35, 52, 116] }, { "index": 0.25, "rgb": [29, 81, 156] }, { "index": 0.38, "rgb": [31, 113, 162] }, { "index": 0.5, "rgb": [50, 144, 169] }, { "index": 0.63, "rgb": [87, 173, 176] }, { "index": 0.75, "rgb": [149, 196, 189] }, { "index": 0.88, "rgb": [203, 221, 211] }, { "index": 1, "rgb": [254, 251, 230] }],
		"velocity-green": [{ "index": 0, "rgb": [23, 35, 19] }, { "index": 0.13, "rgb": [24, 64, 38] }, { "index": 0.25, "rgb": [11, 95, 45] }, { "index": 0.38, "rgb": [39, 123, 35] }, { "index": 0.5, "rgb": [95, 146, 12] }, { "index": 0.63, "rgb": [152, 165, 18] }, { "index": 0.75, "rgb": [201, 186, 69] }, { "index": 0.88, "rgb": [233, 216, 137] }, { "index": 1, "rgb": [255, 253, 205] }],
		"cubehelix": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 0.07, "rgb": [22, 5, 59] }, { "index": 0.13, "rgb": [60, 4, 105] }, { "index": 0.2, "rgb": [109, 1, 135] }, { "index": 0.27, "rgb": [161, 0, 147] }, { "index": 0.33, "rgb": [210, 2, 142] }, { "index": 0.4, "rgb": [251, 11, 123] }, { "index": 0.47, "rgb": [255, 29, 97] }, { "index": 0.53, "rgb": [255, 54, 69] }, { "index": 0.6, "rgb": [255, 85, 46] }, { "index": 0.67, "rgb": [255, 120, 34] }, { "index": 0.73, "rgb": [255, 157, 37] }, { "index": 0.8, "rgb": [241, 191, 57] }, { "index": 0.87, "rgb": [224, 220, 93] }, { "index": 0.93, "rgb": [218, 241, 142] }, { "index": 1, "rgb": [227, 253, 198] }]
	};
	var indicies, fromrgba, torgba, nsteps, cmap, colormap, format, nshades, colors, alpha, i;
	if (!spec) spec = {};
	nshades = (spec.nshades || 72) - 1;
	format = spec.format || 'hex';
	colormap = spec.colormap;
	if (!colormap) colormap = 'jet';
	if (typeof colormap === 'string') {
		colormap = colormap.toLowerCase();
		if (!Colormap[colormap]) {
			throw Error(colormap + ' not a supported colorscale');
		}
		cmap = Colormap[colormap];
	} else if (Array.isArray(colormap)) {
		cmap = colormap.slice();
	} else {
		throw Error('unsupported colormap option', colormap);
	}
	if (cmap.length > nshades + 1) {
		throw new Error(
			colormap + ' map requires nshades to be at least size ' + cmap.length
		);
	}
	if (!Array.isArray(spec.alpha)) {
		if (typeof spec.alpha === 'number') {
			alpha = [spec.alpha, spec.alpha];
		} else {
			alpha = [1, 1];
		}
	} else if (spec.alpha.length !== 2) {
		alpha = [1, 1];
	} else {
		alpha = spec.alpha.slice();
	}
	indicies = cmap.map(c => {
		return Math.round(c.index * nshades);
	});
	alpha[0] = Math.min(Math.max(alpha[0], 0), 1);
	alpha[1] = Math.min(Math.max(alpha[1], 0), 1);
	var steps = cmap.map((c, i) => {
		var index = cmap[i].index
		var rgba = cmap[i].rgb.slice();
		if (rgba.length === 4 && rgba[3] >= 0 && rgba[3] <= 1) {
			return rgba
		}
		rgba[3] = alpha[0] + (alpha[1] - alpha[0]) * index;
		return rgba
	})
	var colors = []
	for (i = 0; i < indicies.length - 1; ++i) {
		nsteps = indicies[i + 1] - indicies[i];
		fromrgba = steps[i];
		torgba = steps[i + 1];
		for (var j = 0; j < nsteps; j++) {
			var amt = j / nsteps
			colors.push([
				Math.round(lerp(fromrgba[0], torgba[0], amt)),
				Math.round(lerp(fromrgba[1], torgba[1], amt)),
				Math.round(lerp(fromrgba[2], torgba[2], amt)),
				lerp(fromrgba[3], torgba[3], amt)
			])
		}
	}
	colors.push(cmap[cmap.length - 1].rgb.concat(alpha[1]))
	if (format === 'hex') colors = colors.map(rgb2hex);
	else if (format === 'rgbaString') colors = colors.map(rgbaStr);
	else if (format === 'float') colors = colors.map(rgb2float);
	return colors;
}
function colorMix(c1, c2, percent = 50) {
	return pSBC(percent / 100, colorHex(c1), colorHex(c2), true);
	let o1 = colorRGB(c1, true); let rgbA = [o1.r, o1.g, o1.b];
	let o2 = colorRGB(c2, true); let rgbB = [o2.r, o2.g, o2.b];
	amountToMix = percent / 100;
	var r = colorChannelMixer(rgbA[0], rgbB[0], amountToMix);
	var g = colorChannelMixer(rgbA[1], rgbB[1], amountToMix);
	var b = colorChannelMixer(rgbA[2], rgbB[2], amountToMix);
	return "rgb(" + r + "," + g + "," + b + ")";
}
function colorMixer(rgbA, rgbB, amountToMix) {
	var r = colorChannelMixer(rgbA[0], rgbB[0], amountToMix);
	var g = colorChannelMixer(rgbA[1], rgbB[1], amountToMix);
	var b = colorChannelMixer(rgbA[2], rgbB[2], amountToMix);
	return "rgb(" + r + "," + g + "," + b + ")";
}
function colorPalette(color, type = 'shade') {
	color = colorFrom(color);
	return colorShades(color);
}
function colorPaletteFromImage(img) {
	if (nundef(ColorThiefObject)) ColorThiefObject = new ColorThief();
	let palette0 = ColorThiefObject.getPalette(img);
	let palette = [];
	for (const pal of palette0) {
		let color = colorFrom(pal);
		palette.push(color);
	}
	return palette;
}
function colorPaletteFromUrl(path) {
	let img = mCreateFrom(`<img src='${path}' />`);
	let pal = colorPaletteFromImage(img);
	return pal;
}
function colorRGB(cAny, asObject = false) {
	let res = colorFrom(cAny);
	let srgb = res;
	if (res[0] == '#') {
		srgb = pSBC(0, res, 'c');
	}
	let n = allNumbers(srgb);
	if (asObject) {
		return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
	} else {
		return srgb;
	}
}
function colorsFromBFA(bg, fg, alpha) {
	if (fg == 'contrast') {
		if (bg != 'inherit') bg = colorFrom(bg, alpha);
		fg = colorIdealText(bg);
	} else if (bg == 'contrast') {
		fg = colorFrom(fg);
		bg = colorIdealText(fg);
	} else {
		if (isdef(bg) && bg != 'inherit') bg = colorFrom(bg, alpha);
		if (isdef(fg) && fg != 'inherit') fg = colorFrom(fg);
	}
	return [bg, fg];
}
function colorShades(color) {
	let res = [];
	for (let frac = -0.8; frac <= 0.8; frac += 0.2) {
		let c = pSBC(frac, color, undefined, true);
		res.push(c);
	}
	return res;
}
function colorTrans(cAny, alpha = 0.5) {
	return colorFrom(cAny, alpha);
}
function colorTransPalette(color = '#000000') {
	let res = [];
	for (const alpha of [.0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1]) res.push(colorTrans(color, alpha));
	return res;
}
function colorWheel(contrastTo, n) {
	let hc = colorHue(contrastTo);
	let wheel = [];
	let start = hc;
	let inc = Math.round(360 / (n + 1));
	start += inc;
	for (let i = 0; i < n; i++) {
		wheel.push(start % 360);
		start += inc;
	}
	return wheel.map(x => colorHSLBuild(x));
}
function ensureColorDict() {
	if (isdef(ColorDi)) return;
	ColorDi = {};
	let names = getColorNames();
	let hexes = getColorHexes();
	for (let i = 0; i < names.length; i++) {
		ColorDi[names[i].toLowerCase()] = { c: '#' + hexes[i] };
	}
	const newcolors = {
		black: { c: '#000000', D: 'schwarz' },
		blue: { c: '#0000ff', D: 'blau' },
		BLUE: { c: '#4363d8', E: 'blue', D: 'blau' },
		BLUEGREEN: { c: '#004054', E: 'bluegreen', D: 'blaugrün' },
		BROWN: { c: '#96613d', E: 'brown', D: 'braun' },
		deepyellow: { c: '#ffed01', E: 'yellow', D: 'gelb' },
		FIREBRICK: { c: '#800000', E: 'darkred', D: 'rotbraun' },
		gold: { c: 'gold', D: 'golden' },
		green: { c: 'green', D: 'grün' },
		GREEN: { c: '#3cb44b', E: 'green', D: 'grün' },
		grey: { c: 'grey', D: 'grau' },
		lightblue: { c: 'lightblue', D: 'hellblau' },
		LIGHTBLUE: { c: '#42d4f4', E: 'lightblue', D: 'hellblau' },
		lightgreen: { c: 'lightgreen', D: 'hellgrün' },
		LIGHTGREEN: { c: '#afff45', E: 'lightgreen', D: 'hellgrün' },
		lightyellow: { c: '#fff620', E: 'lightyellow', D: 'gelb' },
		NEONORANGE: { c: '#ff6700', E: 'neonorange', D: 'neonorange' },
		NEONYELLOW: { c: '#efff04', E: 'neonyellow', D: 'neongelb' },
		olive: { c: 'olive', D: 'oliv' },
		OLIVE: { c: '#808000', E: 'olive', D: 'oliv' },
		orange: { c: 'orange', D: 'orange' },
		ORANGE: { c: '#f58231', E: 'orange', D: 'orange' },
		PINK: { c: 'deeppink', D: 'rosa' },
		pink: { c: 'pink', D: 'rosa' },
		purple: { c: 'purple', D: 'lila' },
		PURPLE: { c: '#911eb4', E: 'purple', D: 'lila' },
		red: { c: 'red', D: 'rot' },
		RED: { c: '#e6194B', E: 'red', D: 'rot' },
		skyblue: { c: 'skyblue', D: 'himmelblau' },
		SKYBLUE: { c: 'deepskyblue', D: 'himmelblau' },
		teal: { c: '#469990', D: 'blaugrün' },
		TEAL: { c: '#469990', E: 'teal', D: 'blaugrün' },
		transparent: { c: '#00000000', E: 'transparent', D: 'transparent' },
		violet: { c: 'violet', E: 'violet', D: 'violett' },
		VIOLET: { c: 'indigo', E: 'violet', D: 'violett' },
		white: { c: 'white', D: 'weiss' },
		yellow: { c: 'yellow', D: 'gelb' },
		yelloworange: { c: '#ffc300', E: 'yellow', D: 'gelb' },
		YELLOW: { c: '#ffe119', E: 'yellow', D: 'gelb' },
	};
	for (const k in newcolors) {
		let cnew = newcolors[k];
		if (cnew.c[0] != '#' && isdef(ColorDi[cnew.c])) cnew.c = ColorDi[cnew.c].c;
		ColorDi[k] = cnew;
	}
}
function getColorHexes(x) {
	return [
		'f0f8ff',
		'faebd7',
		'00ffff',
		'7fffd4',
		'f0ffff',
		'f5f5dc',
		'ffe4c4',
		'000000',
		'ffebcd',
		'0000ff',
		'8a2be2',
		'a52a2a',
		'deb887',
		'5f9ea0',
		'7fff00',
		'd2691e',
		'ff7f50',
		'6495ed',
		'fff8dc',
		'dc143c',
		'00ffff',
		'00008b',
		'008b8b',
		'b8860b',
		'a9a9a9',
		'a9a9a9',
		'006400',
		'bdb76b',
		'8b008b',
		'556b2f',
		'ff8c00',
		'9932cc',
		'8b0000',
		'e9967a',
		'8fbc8f',
		'483d8b',
		'2f4f4f',
		'2f4f4f',
		'00ced1',
		'9400d3',
		'ff1493',
		'00bfff',
		'696969',
		'696969',
		'1e90ff',
		'b22222',
		'fffaf0',
		'228b22',
		'ff00ff',
		'dcdcdc',
		'f8f8ff',
		'ffd700',
		'daa520',
		'808080',
		'808080',
		'008000',
		'adff2f',
		'f0fff0',
		'ff69b4',
		'cd5c5c',
		'4b0082',
		'fffff0',
		'f0e68c',
		'e6e6fa',
		'fff0f5',
		'7cfc00',
		'fffacd',
		'add8e6',
		'f08080',
		'e0ffff',
		'fafad2',
		'd3d3d3',
		'd3d3d3',
		'90ee90',
		'ffb6c1',
		'ffa07a',
		'20b2aa',
		'87cefa',
		'778899',
		'778899',
		'b0c4de',
		'ffffe0',
		'00ff00',
		'32cd32',
		'faf0e6',
		'ff00ff',
		'800000',
		'66cdaa',
		'0000cd',
		'ba55d3',
		'9370db',
		'3cb371',
		'7b68ee',
		'00fa9a',
		'48d1cc',
		'c71585',
		'191970',
		'f5fffa',
		'ffe4e1',
		'ffe4b5',
		'ffdead',
		'000080',
		'fdf5e6',
		'808000',
		'6b8e23',
		'ffa500',
		'ff4500',
		'da70d6',
		'eee8aa',
		'98fb98',
		'afeeee',
		'db7093',
		'ffefd5',
		'ffdab9',
		'cd853f',
		'ffc0cb',
		'dda0dd',
		'b0e0e6',
		'800080',
		'663399',
		'ff0000',
		'bc8f8f',
		'4169e1',
		'8b4513',
		'fa8072',
		'f4a460',
		'2e8b57',
		'fff5ee',
		'a0522d',
		'c0c0c0',
		'87ceeb',
		'6a5acd',
		'708090',
		'708090',
		'fffafa',
		'00ff7f',
		'4682b4',
		'd2b48c',
		'008080',
		'd8bfd8',
		'ff6347',
		'40e0d0',
		'ee82ee',
		'f5deb3',
		'ffffff',
		'f5f5f5',
		'ffff00',
		'9acd32'
	];
}
function getColorNames() {
	return [
		'AliceBlue',
		'AntiqueWhite',
		'Aqua',
		'Aquamarine',
		'Azure',
		'Beige',
		'Bisque',
		'Black',
		'BlanchedAlmond',
		'Blue',
		'BlueViolet',
		'Brown',
		'BurlyWood',
		'CadetBlue',
		'Chartreuse',
		'Chocolate',
		'Coral',
		'CornflowerBlue',
		'Cornsilk',
		'Crimson',
		'Cyan',
		'DarkBlue',
		'DarkCyan',
		'DarkGoldenRod',
		'DarkGray',
		'DarkGrey',
		'DarkGreen',
		'DarkKhaki',
		'DarkMagenta',
		'DarkOliveGreen',
		'DarkOrange',
		'DarkOrchid',
		'DarkRed',
		'DarkSalmon',
		'DarkSeaGreen',
		'DarkSlateBlue',
		'DarkSlateGray',
		'DarkSlateGrey',
		'DarkTurquoise',
		'DarkViolet',
		'DeepPink',
		'DeepSkyBlue',
		'DimGray',
		'DimGrey',
		'DodgerBlue',
		'FireBrick',
		'FloralWhite',
		'ForestGreen',
		'Fuchsia',
		'Gainsboro',
		'GhostWhite',
		'Gold',
		'GoldenRod',
		'Gray',
		'Grey',
		'Green',
		'GreenYellow',
		'HoneyDew',
		'HotPink',
		'IndianRed',
		'Indigo',
		'Ivory',
		'Khaki',
		'Lavender',
		'LavenderBlush',
		'LawnGreen',
		'LemonChiffon',
		'LightBlue',
		'LightCoral',
		'LightCyan',
		'LightGoldenRodYellow',
		'LightGray',
		'LightGrey',
		'LightGreen',
		'LightPink',
		'LightSalmon',
		'LightSeaGreen',
		'LightSkyBlue',
		'LightSlateGray',
		'LightSlateGrey',
		'LightSteelBlue',
		'LightYellow',
		'Lime',
		'LimeGreen',
		'Linen',
		'Magenta',
		'Maroon',
		'MediumAquaMarine',
		'MediumBlue',
		'MediumOrchid',
		'MediumPurple',
		'MediumSeaGreen',
		'MediumSlateBlue',
		'MediumSpringGreen',
		'MediumTurquoise',
		'MediumVioletRed',
		'MidnightBlue',
		'MintCream',
		'MistyRose',
		'Moccasin',
		'NavajoWhite',
		'Navy',
		'OldLace',
		'Olive',
		'OliveDrab',
		'Orange',
		'OrangeRed',
		'Orchid',
		'PaleGoldenRod',
		'PaleGreen',
		'PaleTurquoise',
		'PaleVioletRed',
		'PapayaWhip',
		'PeachPuff',
		'Peru',
		'Pink',
		'Plum',
		'PowderBlue',
		'Purple',
		'RebeccaPurple',
		'Red',
		'RosyBrown',
		'RoyalBlue',
		'SaddleBrown',
		'Salmon',
		'SandyBrown',
		'SeaGreen',
		'SeaShell',
		'Sienna',
		'Silver',
		'SkyBlue',
		'SlateBlue',
		'SlateGray',
		'SlateGrey',
		'Snow',
		'SpringGreen',
		'SteelBlue',
		'Tan',
		'Teal',
		'Thistle',
		'Tomato',
		'Turquoise',
		'Violet',
		'Wheat',
		'White',
		'WhiteSmoke',
		'Yellow',
		'YellowGreen'
	];
}
function hexAToHSLA(H) {
	let ex = /^#([\da-f]{4}){1,2}$/i;
	if (ex.test(H)) {
		let r = 0,
			g = 0,
			b = 0,
			a = 1;
		if (H.length == 5) {
			r = '0x' + H[1] + H[1];
			g = '0x' + H[2] + H[2];
			b = '0x' + H[3] + H[3];
			a = '0x' + H[4] + H[4];
		} else if (H.length == 9) {
			r = '0x' + H[1] + H[2];
			g = '0x' + H[3] + H[4];
			b = '0x' + H[5] + H[6];
			a = '0x' + H[7] + H[8];
		}
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;
		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;
		h = Math.round(h * 60);
		if (h < 0) h += 360;
		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);
		a = (a / 255).toFixed(3);
		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	} else {
		return 'Invalid input color';
	}
}
function hexToHSL(H) {
	let ex = /^#([\da-f]{3}){1,2}$/i;
	if (ex.test(H)) {
		let r = 0,
			g = 0,
			b = 0;
		if (H.length == 4) {
			r = '0x' + H[1] + H[1];
			g = '0x' + H[2] + H[2];
			b = '0x' + H[3] + H[3];
		} else if (H.length == 7) {
			r = '0x' + H[1] + H[2];
			g = '0x' + H[3] + H[4];
			b = '0x' + H[5] + H[6];
		}
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;
		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;
		h = Math.round(h * 60);
		if (h < 0) h += 360;
		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);
		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	} else {
		return 'Invalid input color';
	}
}
function HSLAToRGBA(hsla, isPct) {
	let ex = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(hsla)) {
		let sep = hsla.indexOf(',') > -1 ? ',' : ' ';
		hsla = hsla
			.substr(5)
			.split(')')[0]
			.split(sep);
		if (hsla.indexOf('/') > -1) hsla.splice(3, 1);
		isPct = isPct === true;
		let h = hsla[0],
			s = hsla[1].substr(0, hsla[1].length - 1) / 100,
			l = hsla[2].substr(0, hsla[2].length - 1) / 100,
			a = hsla[3];
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;
		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;
		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}
		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);
		let pctFound = a.indexOf('%') > -1;
		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
			if (!pctFound) {
				a *= 100;
			} else {
				a = a.substr(0, a.length - 1);
			}
		} else if (pctFound) {
			a = a.substr(0, a.length - 1) / 100;
		}
		return 'rgba(' + (isPct ? r + '%,' + g + '%,' + b + '%,' + a + '%' : +r + ',' + +g + ',' + +b + ',' + +a) + ')';
	} else {
		return 'Invalid input color';
	}
}
function hslToHex(h, s, l) {
	l /= 100;
	const a = s * Math.min(l, 1 - l) / 100;
	const f = n => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color).toString(16).padStart(2, '0');
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}
function HSLToRGB(hsl, isPct) {
	let ex = /^hsl\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}|(\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2})\)$/i;
	if (ex.test(hsl)) {
		let sep = hsl.indexOf(',') > -1 ? ',' : ' ';
		hsl = hsl
			.substr(4)
			.split(')')[0]
			.split(sep);
		isPct = isPct === true;
		let h = hsl[0],
			s = hsl[1].substr(0, hsl[1].length - 1) / 100,
			l = hsl[2].substr(0, hsl[2].length - 1) / 100;
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;
		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;
		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}
		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);
		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
		}
		return 'rgb(' + (isPct ? r + '%,' + g + '%,' + b + '%' : +r + ',' + +g + ',' + +b) + ')';
	} else {
		return 'Invalid input color';
	}
}
function pSBC(p, c0, c1, l) {
	let r,
		g,
		b,
		P,
		f,
		t,
		h,
		i = parseInt,
		m = Math.round,
		a = typeof c1 == 'string';
	if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
	if (!this.pSBCr)
		this.pSBCr = d => {
			let n = d.length,
				x = {};
			if (n > 9) {
				([r, g, b, a] = d = d.split(',')), (n = d.length);
				if (n < 3 || n > 4) return null;
				(x.r = i(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = i(g)), (x.b = i(b)), (x.a = a ? parseFloat(a) : -1);
			} else {
				if (n == 8 || n == 6 || n < 4) return null;
				if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
				d = i(d.slice(1), 16);
				if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
				else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
			}
			return x;
		};
	(h = c0.length > 9),
		(h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h),
		(f = pSBCr(c0)),
		(P = p < 0),
		(t = c1 && c1 != 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }),
		(p = P ? p * -1 : p),
		(P = 1 - p);
	if (!f || !t) return null;
	if (l) (r = m(P * f.r + p * t.r)), (g = m(P * f.g + p * t.g)), (b = m(P * f.b + p * t.b));
	else (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)), (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)), (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
	(a = f.a), (t = t.a), (f = a >= 0 || t >= 0), (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
	if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
	else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
}
function rgb2float(rgba) {
	return [
		rgba[0] / 255,
		rgba[1] / 255,
		rgba[2] / 255,
		rgba[3]
	]
}
function rgb2hex(rgba) {
	var dig, hex = '#';
	for (var i = 0; i < 3; ++i) {
		dig = rgba[i];
		dig = dig.toString(16);
		hex += ('00' + dig).substr(dig.length);
	}
	return hex;
}
function rgbaStr(rgba) {
	return 'rgba(' + rgba.join(',') + ')';
}
function RGBAToHex9(rgba) {
	let n = allNumbers(rgba);
	if (n.length < 3) {
		return randomHexColor();
	}
	let a = n.length > 3 ? n[3] : 1;
	let sa = alphaToHex(a);
	if (rgba.includes('%')) {
		n[0] = Math.round((n[0] * 255) / 100);
		n[1] = Math.round((n[1] * 255) / 100);
		n[2] = Math.round((n[2] * 255) / 100);
	}
	return '#' + ((1 << 24) + (n[0] << 16) + (n[1] << 8) + n[2]).toString(16).slice(1) + sa;
}
function RGBAToHSLA(rgba) {
	let ex = /^rgba\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){3}))|(((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){3}))\/\s)((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(rgba)) {
		let sep = rgba.indexOf(',') > -1 ? ',' : ' ';
		rgba = rgba
			.substr(5)
			.split(')')[0]
			.split(sep);
		if (rgba.indexOf('/') > -1) rgba.splice(3, 1);
		for (let R in rgba) {
			let r = rgba[R];
			if (r.indexOf('%') > -1) {
				let p = r.substr(0, r.length - 1) / 100;
				if (R < 3) {
					rgba[R] = Math.round(p * 255);
				}
			}
		}
		let r = rgba[0] / 255,
			g = rgba[1] / 255,
			b = rgba[2] / 255,
			a = rgba[3],
			cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;
		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;
		h = Math.round(h * 60);
		if (h < 0) h += 360;
		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);
		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	} else {
		return 'Invalid input color';
	}
}
function rgbToHex(rgbStr) { return rgbStr && '#' + rgbStr.slice(4, -1).split(',').map(x => (+x).toString(16).padStart(2, '0')).join(''); }
function RGBToHex7(c) {
	let n = allNumbers(c);
	if (c.includes('%')) {
		n[0] = Math.round((n[0] * 255) / 100);
		n[1] = Math.round((n[1] * 255) / 100);
		n[2] = Math.round((n[2] * 255) / 100);
	}
	return '#' + ((1 << 24) + (n[0] << 16) + (n[1] << 8) + n[2]).toString(16).slice(1);
}
function RGBToHSL(rgb) {
	let ex = /^rgb\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){2}|((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s)){2})((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]))|((((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){2}|((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){2})(([1-9]?\d(\.\d+)?)|100|(\.\d+))%))\)$/i;
	if (ex.test(rgb)) {
		let sep = rgb.indexOf(',') > -1 ? ',' : ' ';
		rgb = rgb
			.substr(4)
			.split(')')[0]
			.split(sep);
		for (let R in rgb) {
			let r = rgb[R];
			if (r.indexOf('%') > -1) rgb[R] = Math.round((r.substr(0, r.length - 1) / 100) * 255);
		}
		let r = rgb[0] / 255,
			g = rgb[1] / 255,
			b = rgb[2] / 255,
			cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;
		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;
		h = Math.round(h * 60);
		if (h < 0) h += 360;
		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);
		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	} else {
		return 'Invalid input color';
	}
}
//#endregion color (basemin)

//#region date (basemin)
function addMonthToDate(date, months) {
	let d = new Date(date);
	d.setMonth(d.getMonth() + months);
	return d;
}
function addWeekToDate(date, weeks) {
	let d = new Date(date);
	d.setDate(d.getDate() + (weeks * 7));
	return d;
}
function calculateDaysBetweenDates(begin, end) {
	var oneDay = 24 * 60 * 60 * 1000;
	var firstDate = new Date(begin);
	var secondDate = new Date(end);
	var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
	return diffDays;
}
function date2locale(date) { return date.toLocaleDateString(); }
function format_date(date) {
	let d = new Date(date);
	let month = '' + (d.getMonth() + 1);
	let day = '' + d.getDate();
	let year = d.getFullYear();
	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;
	return [month, day, year].join('/');
}
function get_weekday(date) {
	let d = new Date(date);
	return d.getDay();
}
//#endregion date (basemin)

//#region file (basemin)
function csv2list(allText, hasHeadings = true) {
	var numHeadings = 11;
	var allTextLines = allText.split(/\r\n|\n/);
	var headings = allTextLines[0].split(',');
	numHeadings = headings.length;
	let entries = allTextLines.splice(1);
	var records = [];
	for (const e of entries) {
		let o = {};
		let values = e.split(',');
		for (let i = 0; i < numHeadings; i++) {
			let k = headings[i];
			o[k] = values[i];
		}
		records.push(o);
	}
	return records;
}
function download_all_functions() { downloadAsText(CODE.text, 'hallo', 'js'); }
function downloadAsText(s, filename, ext = 'txt') {
	saveFileAtClient(
		filename + "." + ext,
		"data:application/text",
		new Blob([s], { type: "" }));
}
function downloadAsYaml(o, filename) {
	let y = jsyaml.dump(o);
	downloadAsText(y, filename, 'yaml');
}
function downloadJson(o, filename) {
	if (filename.indexOf('.') < 0) filename = filename.json;
	let txt = (typeof o == 'object') ? encodeURIComponent(JSON.stringify(o)) : o;
	let dl = document.getElementById('downloadAnchorElement');
	if (nundef(dl)) dl = mCreateFrom(`<a id="downloadAnchorElem" style="display:none"></a>`);
	var dataStr = "data:text/json;charset=utf-8," + txt;
	dl.setAttribute("href", dataStr);
	dl.setAttribute("download", "_aaa\\scene.json");
	dl.click();
}
function fireClick(elem) {
	const evt = new Event("click", { "bubbles": true, "cancelable": false });
	elem.dispatchEvent(evt);
}
function fireKey(k, { control, alt, shift } = {}) {
	console.log('fireKey called!' + document.createEvent)
	if (document.createEvent) {
		console.log('fireKey: createEvent and node.dispatchEvent exist!!!', k, control, alt, shift);
		window.dispatchEvent(new KeyboardEvent('keypress', { key: '+', ctrlKey: true }));
	} else if (document.createEventObject) {
		console.log('fireClick: createEventObject and node.fireEvent exist!!!', node)
		node.fireEvent('onclick');
	} else if (typeof node.onclick == 'function') {
		console.log('fireClick: node.onclick exists!!!', node)
		node.onclick();
	}
}
function fireWheel(node) {
	if (document.createEvent) {
		var evt = document.createEvent('MouseEvents');
		evt.initEvent('wheel', true, false);
		console.log('fireClick: createEvent and node.dispatchEvent exist!!!', node)
		node.dispatchEvent(evt);
	} else if (document.createEventObject) {
		console.log('fireClick: createEventObject and node.fireEvent exist!!!', node)
		node.fireEvent('onclick');
	} else if (typeof node.onclick == 'function') {
		console.log('fireClick: node.onclick exists!!!', node)
		node.onclick();
	}
}
function fromLocalStorage(name = '_all') { return JSON.parse(localStorage.getItem(name)); }
function is_key_down(key) {
	if (nundef(DA.keystate)) {
		DA.keystate = {};
		window.addEventListener('keyup', (e) => DA.keystate[e.key] = false);
		window.addEventListener('keydown', (e) => { DA.keystate[e.key] = true; });
	}
	return DA.keystate.hasOwnProperty(key) && DA.keystate[key] || false;
}
function saveFileAtClient(name, type, data) {
	if (data != null && navigator.msSaveBlob) return navigator.msSaveBlob(new Blob([data], { type: type }), name);
	let a = document.createElement('a');
	a.style.display = 'none';
	let url = window.URL.createObjectURL(new Blob([data], { type: type }));
	a.href = url;
	a.download = name;
	document.body.appendChild(a);
	simulateClick(a);
	setTimeout(function () {
		window.URL.revokeObjectURL(url);
		a.remove();
	}, 500);
}
function simulateClick(elem) {
	var evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
	var canceled = !elem.dispatchEvent(evt);
}
function toLocalStorage(o, name = '_all') { localStorage.setItem(name, JSON.stringify(o)); }
//#endregion file (basemin)

//#region fleetingMessage (basemin)
function clearFleetingMessage() {
	if (isdef(dFleetingMessage)) {
		dFleetingMessage.remove();
		dFleetingMessage = null;
	}
}
function fleetingMessage(msg, d, styles, ms, fade) {
	if (isString(msg)) {
		dFleetingMessage.innerHTML = msg;
		mStyle(dFleetingMessage, styles);
	} else {
		mAppend(dFleetingMessage, msg);
	}
	if (fade) Animation1 = mAnimate(dFleetingMessage, 'opacity', [1, .4, 0], null, ms, 'ease-in', 0, 'both');
	return dFleetingMessage;
}
function showFleetingMessage(msg, dParent, styles = {}, ms = 3000, msDelay = 0, fade = true) {
	clearFleetingMessage();
	dFleetingMessage = mDiv(dParent);
	if (msDelay) {
		TOFleetingMessage = setTimeout(() => fleetingMessage(msg, dFleetingMessage, styles, ms, fade), msDelay);
	} else {
		TOFleetingMessage = setTimeout(() => fleetingMessage(msg, dFleetingMessage, styles, ms, fade), 10);
	}
}
//#endregion fleetingMessage (basemin)

//#region funcs (basemin)
function getFunctionCallerName() {
	return new Error().stack.match(/at (\S+)/g)[1].slice(3);
}
function getFunctionsNameThatCalledThisFunction() {
	let c1 = getFunctionsNameThatCalledThisFunction.caller;
	if (nundef(c1)) return 'no caller!';
	let c2 = c1.caller;
	if (nundef(c2)) return 'no caller!';
	return c2.name;
}
//#endregion funcs (basemin)

//#region geo (basemin)
function correctPolys(polys, approx = 10) {
	let clusters = [];
	for (const p of polys) {
		for (const pt of p) {
			let found = false;
			for (const cl of clusters) {
				for (const v of cl) {
					let dx = Math.abs(v.x - pt.x);
					let dy = Math.abs(v.y - pt.y);
					if (dx < approx && dy < approx) {
						cl.push(pt);
						found = true;
						break;
					}
				}
				if (found) break;
			}
			if (!found) {
				clusters.push([pt]);
			}
		}
	}
	let vertices = [];
	for (const cl of clusters) {
		let sumx = 0;
		let sumy = 0;
		let len = cl.length;
		for (const pt of cl) {
			sumx += pt.x;
			sumy += pt.y;
		}
		vertices.push({ x: Math.round(sumx / len), y: Math.round(sumy / len) });
	}
	for (const p of polys) {
		for (const pt of p) {
			let found = false;
			for (const v of vertices) {
				let dx = Math.abs(v.x - pt.x);
				let dy = Math.abs(v.y - pt.y);
				if (dx < approx && dy < approx) {
					if (dx != 0 || dy != 0) {
						pt.x = v.x;
						pt.y = v.y;
					}
					found = true;
				}
				if (found) break;
			}
			if (!found) {
				error('point not found in vertices!!! ' + pt.x + ' ' + pt.y);
			}
		}
	}
	return vertices;
}
function distance(x1, y1, x2, y2) { return Math.sqrt(dSquare({ x: x1, y: y1 }, { x: x2, y: y2 })); }
function dSquare(pos1, pos2) {
	let dx = pos1.x - pos2.x;
	dx *= dx;
	let dy = pos1.y - pos2.y;
	dy *= dy;
	return dx + dy;
}
function getCirclePoints(rad, n, disp = 0) {
	let pts = [];
	let i = 0;
	let da = 360 / n;
	let angle = disp;
	while (i < n) {
		let px = rad * Math.cos(toRadian(angle));
		let py = rad * Math.sin(toRadian(angle));
		pts.push({ X: px, Y: py });
		angle += da;
		i++;
	}
	return pts;
}
function getEllipsePoints(radx, rady, n, disp = 0) {
	let pts = [];
	let i = 0;
	let da = 360 / n;
	let angle = disp;
	while (i < n) {
		let px = radx * Math.cos(toRadian(angle));
		let py = rady * Math.sin(toRadian(angle));
		pts.push({ X: px, Y: py });
		angle += da;
		i++;
	}
	return pts;
}
function getHexPoly(x, y, w, h) {
	let hex = [[0, -0.5], [0.5, -0.25], [0.5, 0.25], [0, 0.5], [-0.5, 0.25], [-0.5, -0.25]];
	return getPoly(hex, x, y, w, h);
}
function getPoly(offsets, x, y, w, h) {
	let poly = [];
	for (let p of offsets) {
		let px = Math.round(x + p[0] * w);
		let py = Math.round(y + p[1] * h);
		poly.push({ x: px, y: py });
	}
	return poly;
}
function getQuadPoly(x, y, w, h) {
	q = [[0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5]];
	return getPoly(q, x, y, w, h);
}
function getTriangleDownPoly(x, y, w, h) {
	let tridown = [[-0.5, 0.5], [0.5, 0.5], [-0.5, 0.5]];
	return getPoly(tridown, x, y, w, h);
}
function getTriangleUpPoly(x, y, w, h) {
	let triup = [[0, -0.5], [0.5, 0.5], [-0.5, 0.5]];
	return getPoly(triup, x, y, w, h);
}
function isCloseTo(n, m, acc = 10) { return Math.abs(n - m) <= acc + 1; }
function polyPointsFrom(w, h, x, y, pointArr) {
	x -= w / 2;
	y -= h / 2;
	let pts = pointArr.map(p => [p.X * w + x, p.Y * h + y]);
	let newpts = [];
	for (const p of pts) {
		newp = { X: p[0], Y: Math.round(p[1]) };
		newpts.push(newp);
	}
	pts = newpts;
	let sPoints = pts.map(p => '' + p.X + ',' + p.Y).join(' '); //'0,0 100,0 50,80',
	return sPoints;
}
function size2hex(w = 100, h = 0, x = 0, y = 0) {
	let hexPoints = [{ X: 0.5, Y: 0 }, { X: 1, Y: 0.25 }, { X: 1, Y: 0.75 }, { X: 0.5, Y: 1 }, { X: 0, Y: 0.75 }, { X: 0, Y: 0.25 }];
	if (h == 0) {
		h = (2 * w) / 1.73;
	}
	return polyPointsFrom(w, h, x, y, hexPoints);
}
function size2tridown(w = 100, h = 0, x = 0, y = 0) {
	let triPoints = [{ X: 1, Y: 0 }, { X: 0.5, Y: 1 }, { X: 0, Y: 0 }];
	if (h == 0) { h = w; }
	return polyPointsFrom(w, h, x, y, triPoints);
}
function size2triup(w = 100, h = 0, x = 0, y = 0) {
	let triPoints = [{ X: 0.5, Y: 0 }, { X: 1, Y: 1 }, { X: 0, Y: 1 }];
	if (h == 0) { h = w; }
	return polyPointsFrom(w, h, x, y, triPoints);
}
function toDegree(rad) { return Math.floor(180 * rad / Math.PI); }
function toRadian(deg) { return deg * (Math.PI / 180); }
//#endregion geo (basemin)

//#region keys (basemin)
function arrRemoveDuplicates(items, prop) {
	let di = {};
	let res = [];
	for (const item of items) {
		if (isdef(di[item[prop].toLowerCase()])) { continue; }
		res.push(item);
		di[item[prop].toLowerCase()] = true;
	}
	return res;
}
function genCats(n) {
	let di = {};
	let cats = Object.keys(Categories);
	for (let i = 0; i < n; i++) {
		let cat = chooseRandom(cats);
		let incompat = DA.incompatibleCats[cat];
		cats = arrMinus(cats, incompat);
		removeInPlace(cats, cat);
		di[cat] = Categories[cat];
	}
	return di;
}
function getAnimals() {
	let gr = 'Animals & Nature';
	let result = [];
	for (const sg in ByGroupSubgroup[gr]) {
		if (startsWith(sg, 'anim')) result = result.concat(ByGroupSubgroup[gr][sg]);
	}
	return result;
}
function getGSGElements(gCond, sCond) {
	let keys = [];
	let byg = ByGroupSubgroup;
	for (const gKey in byg) {
		if (!gCond(gKey)) continue;
		for (const sKey in byg[gKey]) {
			if (!sCond(sKey)) continue;
			keys = keys.concat(byg[gKey][sKey]);
		}
	}
	return keys.sort();
}
function getKeySets() {
	makeCategories();
	let res = {};
	for (const k in Syms) {
		let info = Syms[k];
		if (nundef(info.cats)) continue;
		for (const ksk of info.cats) {
			lookupAddIfToList(res, [ksk], k);
		}
	}
	res.animals = getAnimals();
	res.nature = getNature();
	localStorage.setItem('KeySets', JSON.stringify(res));
	return res;
}
function getNature() {
	let gr = 'Animals & Nature';
	let result = [];
	for (const sg in ByGroupSubgroup[gr]) {
		result = result.concat(ByGroupSubgroup[gr][sg]);
	}
	return result;
}
function makeCategories() {
	let keys = Categories = {
		animal: getGSGElements(g => g == 'Animals & Nature', s => startsWith(s, 'animal')),
		clothing: getGSGElements(g => g == 'Objects', s => s == 'clothing'),
		emotion: getGSGElements(g => g == 'Smileys & Emotion', s => startsWith(s, 'face') && !['face-costume', 'face-hat'].includes(s)),
		food: getGSGElements(g => g == 'Food & Drink', s => startsWith(s, 'food')),
		'game/toy': (['sparkler', 'firecracker', 'artist palette', 'balloon', 'confetti ball'].concat(ByGroupSubgroup['Activities']['game'])).sort(),
		gesture: getGSGElements(g => g == 'People & Body', s => startsWith(s, 'hand')),
		job: ByGroupSubgroup['People & Body']['job'],
		mammal: ByGroupSubgroup['Animals & Nature']['animal-mammal'],
		music: getGSGElements(g => g == 'Objects', s => startsWith(s, 'musi')),
		object: getGSGElements(g => g == 'Objects', s => true),
		place: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'place')),
		plant: getGSGElements(g => g == 'Animals & Nature' || g == 'Food & Drink', s => startsWith(s, 'plant') || s == 'food-vegetable' || s == 'food-fruit'),
		sport: ByGroupSubgroup['Activities']['sport'],
		tool: getGSGElements(g => g == 'Objects', s => s == 'tool'),
		transport: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'transport')),
	};
	let incompatible = DA.incompatibleCats = {
		animal: ['mammal'],
		clothing: ['object'],
		emotion: ['gesture'],
		food: ['plant', 'animal'],
		'game/toy': ['object', 'music'],
		gesture: ['emotion'],
		job: ['sport'],
		mammal: ['animal'],
		music: ['object', 'game/toy'],
		object: ['music', 'clothing', 'game/toy', 'tool'],
		place: [],
		plant: ['food'],
		sport: ['job'],
		tool: ['object'],
		transport: [],
	}
}
function oneWordKeys(keys) { return keys.filter(x => !x.includes(' ')); }
function removeDuplicates(keys, prop) {
	let di = {};
	let res = [];
	let items = keys.map(x => Syms[x]);
	for (const item of items) {
		if (isdef(di[item.best])) { continue; }
		res.push(item);
		di[item.key] = true;
	}
	return res.map(x => x.key);
}
function setKeys({ allowDuplicates, nMin = 25, lang, key, keySets, filterFunc, param, confidence, sortByFunc } = {}) {
	let keys = jsCopy(keySets[key]);
	if (isdef(nMin)) {
		let diff = nMin - keys.length;
		let additionalSet = diff > 0 ? nMin > 100 ? firstCondDictKeys(keySets, k => k != key && keySets[k].length > diff) : 'best100' : null;
		if (additionalSet) KeySets[additionalSet].map(x => addIf(keys, x));
	}
	let primary = [];
	let spare = [];
	for (const k of keys) {
		let info = Syms[k];
		info.best = info[lang];
		if (nundef(info.best)) {
			let ersatzLang = (lang == 'D' ? 'D' : 'E');
			let klang = 'best' + ersatzLang;
			if (nundef(info[klang])) info[klang] = lastOfLanguage(k, ersatzLang);
		}
		let isMatch = true;
		if (isdef(filterFunc)) isMatch = isMatch && filterFunc(param, k, info.best);
		if (isdef(confidence)) isMatch = info[klang + 'Conf'] >= confidence;
		if (isMatch) { primary.push(k); } else { spare.push(k); }
	}
	if (isdef(nMin)) {
		let len = primary.length;
		let nMissing = nMin - len;
		if (nMissing > 0) { let list = choose(spare, nMissing); spare = arrMinus(spare, list); primary = primary.concat(list); }
	}
	if (isdef(sortByFunc)) { sortBy(primary, sortByFunc); }
	if (isdef(nMin)) console.assert(primary.length >= nMin);
	if (nundef(allowDuplicates)) {
		primary = removeDuplicates(primary);
	}
	return primary;
}
//#endregion keys (basemin)

//#region math (basemin)
function clamp(x, min, max) { return Math.min(Math.max(x, min), max); }
function convert_to_range(x, min1, max1, min2, max2) {
	return (x - min1) * ((max2 - min2) / (max1 - min1)) + min2;
}
function cycle(x, min, max) { let d = max - min; return (x - min) % d + min; }
function lerp(a, b, t) { return a + (b - a) * t; }
function map_range(x, min1, max1, min2, max2) { return convert_to_range(x, min1, max1, min2, max2); }
//#endregion math (basemin)

//#region random (basemin)
function _rChoose(arr, n = 1, func = null, exceptIndices = null) {
	let arr1 = jsCopy(arr);
	if (isdef(exceptIndices)) {
		for (const i of exceptIndices) removeInPlace(arr1, arr[i]);
	}
	if (isdef(func)) arr1 = arr1.filter(func);
	if (n == 1) {
		let idx = Math.floor(Math.random() * arr1.length);
		return arr1[idx];
	}
	arrShufflip(arr1);
	return arr1.slice(0, n);
}
function choose(arr, n, excepti) { return rChoose(arr, n, null, excepti); }
function chooseRandom(arr) { return rChoose(arr); }
function coin(percent = 50) { return Math.random() * 100 < percent; }
function rAdd(dmin = -1, dmax = 1) { return x => x + dmin + Math.random() * (dmax - dmin); }
function rAddSub(d) { return x => x + (coin() ? d : -d); }
function rAddSubRange(d) { return x => x + (Math.random() * 2 * d - d); }
function rAlphanums(n) { return rChoose(toLetters('0123456789abcdefghijklmnopq'), n); }
function randomColor() { return rColor(); }
function rCard(postfix = 'n', ranks = '*A23456789TJQK', suits = 'HSDC') { return rChoose(ranks) + rChoose(suits) + postfix; }
function rChoose(arr, n = 1, func = null, exceptIndices = null) {
	let indices = arrRange(0, arr.length - 1);
	if (isdef(exceptIndices)) {
		for (const i of exceptIndices) removeInPlace(indices, i);
	}
	if (isdef(func)) indices = indices.filter(x => func(arr[x]));
	if (n == 1) {
		let idx = Math.floor(Math.random() * indices.length);
		return arr[indices[idx]];
	}
	arrShufflip(indices);
	return indices.slice(0, n).map(x => arr[x]);
}
function rCoin(percent = 50) {
	let r = Math.random();
	r *= 100;
	return r < percent;
}
function rColor(cbrightness, c2, alpha = null) {
	if (isdef(c2)) {
		let c = colorMix(cbrightness, c2, rNumber(0, 100));
		return colorTrans(c, alpha ?? Math.random());
	}
	if (isdef(cbrightness)) {
		let hue = rHue();
		let sat = 100;
		let b = isNumber(cbrightness) ? cbrightness : cbrightness == 'dark' ? 25 : cbrightness == 'light' ? 75 : 50;
		return colorFromHSL(hue, sat, b);
	}
	let s = '#';
	for (let i = 0; i < 6; i++) {
		s += rChoose(['f', 'c', '9', '6', '3', '0']);
	}
	return s;
}
function rConsonant(w, except = []) { let vowels = w ? getConsonants(w, except) : toLetters('aeiouy'); return chooseRandom(vowels); }
function rDate(before, after) {
	let after_date = new Date(after);
	let before_date = new Date(before);
	let random_date = new Date(Math.random() * (before_date.getTime() - after_date.getTime()) + after_date.getTime());
	return random_date;
}
function rDigits(n) { return rChoose(toLetters('0123456789'), n); }
function rFloat(min = -1, max = 1) { return Math.random() * (max - min) + min; }
function rGaussian(min, max, int = false) {
	function rGauss() {
		var rand = 0;
		for (var i = 0; i < 6; i += 1) { rand += Math.random(); }
		return rand / 6;
	}
	return int ? Math.floor(min + rGauss() * (max - min + 1)) : min + rGauss() * (max - min);
}
function rHue() { return (rNumber(0, 36) * 10) % 360; }
function rLetter(except) { return rLetters(1, except)[0]; }
function rLetters(n, except = []) {
	let all = 'abcdefghijklmnopqrstuvwxyz';
	for (const l of except) all = all.replace(l, '');
	console.log('all', all, except)
	return rChoose(toLetters(all), n);
}
function rNumber(min = 0, max = 100) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function rPassword(n) { return rChoose(toLetters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!.?*&%$#@:;_'), n).join(''); }
function rPerlin(x, y = 0, z = 0) {
	Perlin.lastx = x;
	if (Perlin.perlin == null) {
		Perlin.perlin = new Array(Perlin.PERLIN_SIZE + 1);
		for (let i = 0; i < Perlin.PERLIN_SIZE + 1; i++) {
			Perlin.perlin[i] = Math.random();
		}
	}
	if (x < 0) { x = -x; }
	if (y < 0) { y = -y; }
	if (z < 0) { z = -z; }
	let xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
	let xf = x - xi;
	let yf = y - yi;
	let zf = z - zi;
	let rxf, ryf;
	let r = 0;
	let ampl = 0.5;
	let n1, n2, n3;
	for (let o = 0; o < Perlin.perlin_octaves; o++) {
		let of = xi + (yi << Perlin.PERLIN_YWRAPB) + (zi << Perlin.PERLIN_ZWRAPB);
		rxf = Perlin.scaled_cosine(xf);
		ryf = Perlin.scaled_cosine(yf);
		n1 = Perlin.perlin[of & Perlin.PERLIN_SIZE];
		n1 += rxf * (Perlin.perlin[(of + 1) & Perlin.PERLIN_SIZE] - n1);
		n2 = Perlin.perlin[(of + Perlin.PERLIN_YWRAP) & Perlin.PERLIN_SIZE];
		n2 += rxf * (Perlin.perlin[(of + Perlin.PERLIN_YWRAP + 1) & Perlin.PERLIN_SIZE] - n2);
		n1 += ryf * (n2 - n1);
		of += Perlin.PERLIN_ZWRAP;
		n2 = Perlin.perlin[of & Perlin.PERLIN_SIZE];
		n2 += rxf * (Perlin.perlin[(of + 1) & Perlin.PERLIN_SIZE] - n2);
		n3 = Perlin.perlin[(of + Perlin.PERLIN_YWRAP) & Perlin.PERLIN_SIZE];
		n3 += rxf * (Perlin.perlin[(of + Perlin.PERLIN_YWRAP + 1) & Perlin.PERLIN_SIZE] - n3);
		n2 += ryf * (n3 - n2);
		n1 += Perlin.scaled_cosine(zf) * (n2 - n1);
		r += n1 * ampl;
		ampl *= Perlin.perlin_amp_falloff;
		xi <<= 1;
		xf *= 2;
		yi <<= 1;
		yf *= 2;
		zi <<= 1;
		zf *= 2;
		if (xf >= 1.0) { xi++; xf--; }
		if (yf >= 1.0) { yi++; yf--; }
		if (zf >= 1.0) { zi++; zf--; }
	}
	return r;
};
function rPrimaryColor() { let c = '#' + rChoose(['ff', '00']) + rChoose(['ff', '00']); c += c == '#0000' ? 'ff' : c == '#ffff' ? '00' : rChoose(['ff', '00']); return c; }
function rRank(ranks = 'A23456789TJQK') { return rChoose(ranks); }
function rSuit(suit = 'HSDC') { return rChoose(suit); }
function rVowel(w, except = []) { let vowels = w ? getVowels(w, except) : toLetters('aeiouy'); return chooseRandom(vowels); }
function rWheel(n = 1, hue = null, sat = 100, bri = 50) {
	let d = 360 / n;
	let h = valf(hue, rHue());
	let arr = [];
	for (let i = 0; i < n; i++) {
		console.log('h', h)
		let r = colorFromHSL(h, sat, bri);
		h = (h + d) % 360;
		arr.push(r);
	}
	return arr;
}
//#endregion random (basemin)

//#region string (basemin)
function allNumbers(s) {
	let m = s.match(/\-.\d+|\-\d+|\.\d+|\d+\.\d+|\d+\b|\d+(?=\w)/g);
	if (m) return m.map(v => Number(v)); else return null;
}
function cap_each_word(s) {
	let arr = s.split(' ');
	let res = '';
	for (const a of arr) { res += capitalize(a) + ' '; }
	return res.slice(0, -1);
}
function capitalize(s) {
	if (typeof s !== 'string') return '';
	return s.charAt(0).toUpperCase() + s.slice(1);
}
function contains(s, sSub) { return s.toLowerCase().includes(sSub.toLowerCase()); }
function endsWith(s, sSub) { let i = s.indexOf(sSub); return i >= 0 && i == s.length - sSub.length; }
function firstNumber(s) {
	if (s) {
		let m = s.match(/-?\d+/);
		if (m) {
			let sh = m.shift();
			if (sh) { return Number(sh); }
		}
	}
	return null;
}
function firstWord(s, allow_ = false) { return toWords(s, allow_)[0]; }
function firstWordAfter(s, sub, allow_ = false) {
	let s1 = stringAfter(s, sub);
	let s2 = toWords(s1, allow_)[0]
	return s2;
}
function fromUmlaut(w) {
	if (isList(w)) {
		let res = [];
		for (const w1 of w) res.push(fromUmlaut(w1));
		return res;
	} else {
		w = replaceAll(w, 'ü', 'ue');
		w = replaceAll(w, 'ä', 'ae');
		w = replaceAll(w, 'ö', 'oe');
		w = replaceAll(w, 'Ü', 'UE');
		w = replaceAll(w, 'Ä', 'AE');
		w = replaceAll(w, 'Ö', 'OE');
		return w;
	}
}
function germanize(s) { return toUmlaut(s); }
function indexOfAny(s, list, pos) {
	let min = 1000000;
	let match = null;
	for (const w of list) {
		let i = s.indexOf(w, pos);
		if (i >= 0 && i < min) { min = i; match = w; }
	}
	return match ? [min, match] : [-1, null];
}
function lastIndexOfAny(s, list, pos) {
	let min = -1;
	let match = null;
	for (const w of list) {
		let i = s.lastIndexOf(w, pos);
		if (i >= 0 && i > min) { min = i; match = w; }
	}
	return match ? [min, match] : [-1, null];
}
function normalize_string(s, sep = '_') {
	s = s.toLowerCase().trim();
	let res = '';
	for (let i = 0; i < s.length; i++) { if (isAlphaNum(s[i])) res += s[i]; else if (s[i] == ' ') res += sep; }
	return res;
}
function plural(n) { return n == 0 || n > 1 ? 's' : ''; }
function replaceAll(str, sSub, sBy) {
	let regex = new RegExp(sSub, 'g');
	return str.replace(regex, sBy);
}
function replaceAllFast(str, sSub, sBy) { return replaceAll(str, sSub, sBy); }
function replaceAllSafe(str, sSub, sBy) { return replaceAllSpecialChars(str, sSub, sBy); }
function replaceAllSpecialChars(str, sSub, sBy) { return str.split(sSub).join(sBy); }
function replaceAllX(str, sSub, sBy) { return replaceAllSpecialChars(str, sSub, sBy); }
function replaceAtString(s, i, ssub) { return s.substring(0, i) + ssub + s.substring(i + 1); }
function replaceEvery(w, letter, nth) {
	let res = '';
	for (let i = 1; i < w.length; i += 2) {
		res += letter;
		res += w[i];
	}
	if (w.length % 2) res += w[0];
	return res;
}
function replaceWhite(s, sby = '_') { let w = toWords(s); return w.join(sby); }
function splitAtAnyOf(s, sep) {
	let arr = [], w = '';
	for (let i = 0; i < s.length; i++) {
		let ch = s[i];
		if (sep.includes(ch)) {
			if (!isEmpty(w)) arr.push(w);
			w = '';
		} else {
			w += ch;
		}
	}
	if (!isEmpty(w)) arr.push(w);
	return arr;
}
function splitIntoNumbersAndWords(s) {
	let arr = [], i = 0;
	while (i < s.length) {
		let ch = s[i];
		let w = '';
		if (isDigit(ch)) while (i < s.length && isDigit(ch)) { w += ch; i++; ch = s[i]; }
		else if (isLetter(ch)) while (i < s.length && isLetter(ch)) { w += ch; i++; ch = s[i]; }
		else { i++; continue; }
		arr.push(w);
	}
	return arr;
}
function startsWith(s, sSub) {
	return s.substring(0, sSub.length) == sSub;
}
function stringAfter(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return '';
	return sFull.substring(idx + sSub.length);
}
function stringAfterLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return arrLast(parts);
}
function stringBefore(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return sFull;
	return sFull.substring(0, idx);
}
function stringBeforeLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return sFull.substring(0, sFull.length - arrLast(parts).length - 1);
}
function stringBetween(sFull, sStart, sEnd) {
	return stringBefore(stringAfter(sFull, sStart), isdef(sEnd) ? sEnd : sStart);
}
function stringBetweenLast(sFull, sStart, sEnd) {
	let s1 = stringBeforeLast(sFull, isdef(sEnd) ? sEnd : sStart);
	return stringAfterLast(s1, sStart);
}
function toLetters(s) { return [...s]; }
function toUmlaut(w) {
	if (isList(w)) {
		let res = [];
		for (const w1 of w) res.push(toUmlaut(w1));
		return res;
	} else {
		w = replaceAll(w, 'ue', 'ü');
		w = replaceAll(w, 'ae', 'ä');
		w = replaceAll(w, 'oe', 'ö');
		w = replaceAll(w, 'UE', 'Ü');
		w = replaceAll(w, 'AE', 'Ä');
		w = replaceAll(w, 'OE', 'Ö');
		return w;
	}
}
function toWords(s, allow_ = false) {
	let arr = allow_ ? s.split(/[\W]+/) : s.split(/[\W|_]+/);
	return arr.filter(x => !isEmpty(x));
}
//#endregion string (basemin)

//#region simepl (basemin)
function start_simple_timer(dtimer, msInterval, onTick, msTotal, onElapsed) {
	if (isdef(DA.timer)) { DA.timer.clear(); DA.timer = null; }
	let timer = DA.timer = new SimpleTimer(dtimer, msInterval, onTick, msTotal, onElapsed);
	timer.start();
}
function stop_simple_timer() { if (isdef(DA.timer)) { DA.timer.clear(); DA.timer = null; } }
function timeConversion(duration, format = 'Hmsh') {
	const portions = [];
	const msInHour = 1000 * 60 * 60;
	const hours = Math.trunc(duration / msInHour);
	if (format.includes('H')) portions.push((hours < 10 ? '0' : '') + hours);
	duration = duration - (hours * msInHour);
	const msInMinute = 1000 * 60;
	const minutes = Math.trunc(duration / msInMinute);
	if (format.includes('m')) portions.push((minutes < 10 ? '0' : '') + minutes);
	duration = duration - (minutes * msInMinute);
	const msInSecond = 1000;
	const seconds = Math.trunc(duration / 1000);
	if (format.includes('s')) portions.push((seconds < 10 ? '0' : '') + seconds);
	duration = duration - (seconds * msInSecond);
	const hundreds = duration / 10;
	if (format.includes('h')) portions.push((hundreds < 10 ? '0' : '') + hundreds);
	return portions.join(':');
}
//#endregion simepl (basemin)

//#region misc (basemin)
function _evToClass(ev, className) {
	let elem = findParentWithClass(ev.target, className);
	return elem;
}
function _valf(val, def) { return isdef(val) ? val : def; }
function arrNext(el, list) {
	let i = list.indexOf(el);
	let nextplayer = list[(i + 1) % list.length];
	return nextplayer;
}
function assertion(cond) {
	if (!cond) {
		let args = [...arguments];
		for (const a of args) {
			console.log('\n', a);
		}
		throw new Error('TERMINATING!!!')
	}
}
function clear_select(selected, selstyle = 'selected') {
	for (const item of selected) {
		item.isSelected = false;
		let ui = iDiv(item);
		if (isString(selstyle)) {
			mClassRemove(ui, selstyle);
		} else if (isdef(item.style)) {
			mStyle(ui, item.style);
		} else {
			mStyleUndo(ui, selstyle);
		}
	}
	return [];
}
function clear_timeouts() {
	for (const k in TO) clearTimeout(TO[k]);
	stop_simple_timer();
}
function clearElement(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (window.jQuery == undefined) { elem.innerHTML = ''; return elem; }
	while (elem.firstChild) {
		$(elem.firstChild).remove();
	}
	return elem;
}
function countAll(s, scount) {
	let letters = toLetters(scount);
	function counter(total, ch) { if (letters.includes(ch)) return total + 1; else return total; }
	let res = [...s].reduce(counter, 0);
	return res;
}
function divInt(a, b) { return Math.trunc(a / b); }
function errlog() { console.log('ERROR!', ...arguments); }
function evNoBubble(ev) { ev.preventDefault(); ev.cancelBubble = true; }
function evStop(ev) {
	ev.preventDefault();
	ev.stopPropagation();
	ev.stopImmediatePropagation();
	ev.cancelBubble = true;
}
function evToClass(ev, className) {
	let elem = findParentWithClass(className);
	return elem;
}
function evToClosestId(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evToId(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evToItem(ev) {
	let id = evToId(ev);
	let item = Items[id];
	return item;
}
function evToProp(ev, prop) {
	let x = ev.target;
	while (isdef(x) && nundef(x.getAttribute(prop))) x = x.parentNode;
	return isdef(x) ? x.getAttribute(prop) : null;
}
function evToTargetAttribute(ev, attr) {
	let val = ev.target.getAttribute(attr);
	if (nundef(val)) { val = ev.target.parentNode.getAttribute(attr); }
	return val;
}
function findAncestorElemOfType(el, type) {
	while (el) {
		let t = getTypeOf(el);
		if (t == type) break;
		el = el.parentNode;
	}
	return el;
}
function findAncestorElemWithParentOfType(el, type) {
	while (el && el.parentNode) {
		let t = getTypeOf(el);
		let tParent = getTypeOf(el.parentNode);
		if (tParent == type) break;
		el = el.parentNode;
	}
	return el;
}
function findAttributeInAncestors(elem, attr) {
	let val;
	while (elem && nundef(val = elem.getAttribute(attr))) { elem = elem.parentNode; }
	return val;
}
function findChildOfType(type, parentElem) {
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (getTypeOf(ch) == type) return ch;
	}
	return null;
}
function findChildrenOfType(type, parentElem) {
	let children = arrChildren(parentElem);
	let res = [];
	for (const ch of children) {
		if (getTypeOf(ch) == type) res.push(ch);
	}
	return res;
}
function findChildWithClass(className, parentElem) {
	testHelpers(parentElem);
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (ch.classList.includes(className)) return ch;
	}
	return null;
}
function findChildWithId(id, parentElem) {
	testHelpers(parentElem);
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (ch.id == id) return ch;
	}
	return null;
}
function findDescendantOfType(type, parent) {
	if (getTypeOf(parent) == type) return parent;
	let children = arrChildren(parent);
	if (isEmpty(children)) return null;
	for (const ch of children) {
		let res = findDescendantOfType(type, ch);
		if (res) return res;
	}
	return null;
}
function findDescendantWithId(id, parent) {
	if (parent.id == id) return parent;
	let children = arrChildren(parent);
	if (isEmpty(children)) return null;
	for (const ch of children) {
		let res = findDescendantWithId(id, ch);
		if (res) return res;
	}
	return null;
}
function findKeys(s) { return SymKeys.filter(x => contains(x, s) || contains(Syms[x].E, s) || isdef(Syms[x].D) && contains(Syms[x].D, s)); }
function findParentWithClass(elem, className) { while (elem && !mHasClass(elem, className)) { elem = elem.parentNode; } return elem; }
function findParentWithId(elem) { while (elem && !(elem.id)) { elem = elem.parentNode; } return elem; }
function format_currency(num) {
	return '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function fromYaml(x) { return jsyaml.load(x); }
function get_checked_radios(rg) {
	let inputs = rg.getElementsByTagName('INPUT');
	let list = [];
	for (const ch of inputs) {
		let checked = ch.getAttribute('checked');
		if (ch.checked) list.push(ch.value);
	}
	return list;
}
function get_mouse_pos(ev) {
	let x = ev.pageX - document.body.scrollLeft;
	let y = ev.pageY - document.body.scrollTop;
	return ({ x: x, y: y });
}
function getConsonants(w, except = []) {
	w = w.toLowerCase();
	let vowels = 'aeiouy' + except.join('');
	let res = [];
	for (let i = 0; i < w.length; i++) {
		if (!vowels.includes(w[i])) res.push({ i: i, letter: w[i] });
	}
	return res;
}
function getFruid(pref = '') {
	const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	FRUIDCounter += 1;
	if (FRUIDCounter < alpha.length) return pref + alpha[FRUIDCounter];
	return pref + FRUIDCounter - alpha.length;
}
function getLettersExcept(w, except = []) {
	w = w.toLowerCase();
	let res = [];
	for (let i = 0; i < w.length; i++) {
		if (!except.includes(w[i])) res.push({ i: i, letter: w[i] });
	}
	return res;
}
function getRandomLetter(w, except = []) { let cons = getLettersExcept(w, except); return chooseRandom(cons); }
function getRect(elem, relto) {
	if (isString(elem)) elem = document.getElementById(elem);
	let res = elem.getBoundingClientRect();
	if (isdef(relto)) {
		let b2 = relto.getBoundingClientRect();
		let b1 = res;
		res = {
			x: b1.x - b2.x,
			y: b1.y - b2.y,
			left: b1.left - b2.left,
			top: b1.top - b2.top,
			right: b1.right - b2.right,
			bottom: b1.bottom - b2.bottom,
			width: b1.width,
			height: b1.height
		};
	}
	let r = { x: res.left, y: res.top, w: res.width, h: res.height };
	addKeys({ l: r.x, t: r.y, r: r.x + r.w, b: r.t + r.h }, r);
	return r;
}
function getSizeNeeded(elem) {
	var d = elem.cloneNode(true);
	d.style.width = 'auto';
	document.body.appendChild(d);
	let cStyles = {};
	cStyles.position = 'fixed';
	cStyles.opacity = 0;
	cStyles.top = '-9999px';
	mStyle(d, cStyles);
	height = d.clientHeight;
	width = d.clientWidth;
	d.parentNode.removeChild(d);
	return { w: Math.round(width), h: Math.round(height) };
}
function getTypeOf(param) {
	let type = typeof param;
	if (type == 'string') {
		return 'string';
	}
	if (type == 'object') {
		type = param.constructor.name;
		if (startsWith(type, 'SVG')) type = stringBefore(stringAfter(type, 'SVG'), 'Element').toLowerCase();
		else if (startsWith(type, 'HTML')) type = stringBefore(stringAfter(type, 'HTML'), 'Element').toLowerCase();
	}
	let lType = type.toLowerCase();
	if (lType.includes('event')) type = 'event';
	return type;
}
function getUID(pref = '') {
	UIDCounter += 1;
	return pref + '_' + UIDCounter;
}
function getVowels(w, except = []) {
	w = w.toLowerCase();
	let vowels = 'aeiouy';
	let res = [];
	for (let i = 0; i < w.length; i++) {
		if (vowels.includes(w[i]) && !except.includes(w[i])) res.push({ i: i, letter: w[i] });
	}
	return res;
}
function hasWhiteSpace(s) { return /\s/g.test(s); }
function hide(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (nundef(elem)) return;
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:hidden;display:none');
	} else {
		elem.style.display = 'none';
	}
}
function hide0(id) { mBy(id).style.display = "none"; }
function isAlphaNum(s) { query = /^[a-zA-Z0-9]+$/; return query.test(s); }
function isdef(x) { return x !== null && x !== undefined; }
function isDict(d) { let res = (d !== null) && (typeof (d) == 'object') && !isList(d); return res; }
function isDictOrList(d) { return typeof (d) == 'object'; }
function isDigit(s) { return /^[0-9]$/i.test(s); }
function isDOM(x) { let c = lookup(x, ['constructor', 'name']); return c ? startsWith(c, 'HTML') || startsWith(c, 'SVG') : false; }
function isEmpty(arr) {
	return arr === undefined || !arr
		|| (isString(arr) && (arr == 'undefined' || arr == ''))
		|| (Array.isArray(arr) && arr.length == 0)
		|| Object.entries(arr).length === 0;
}
function isEmptyOrWhiteSpace(s) { return isEmpty(s.trim()); }
function isLetter(s) { return /^[a-zA-Z]$/i.test(s); }
function isList(arr) { return Array.isArray(arr); }
function isListOf(arr, predfunc) { return Array.isArray(arr) && !firstCond(arr, x => !predfunc(x)); }
function isLiteral(x) { return isString(x) || isNumber(x); }
function isNumber(x) { return x !== ' ' && x !== true && x !== false && isdef(x) && (x == 0 || !isNaN(+x)); }
function isOverflown(element) {
	return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}
function isString(param) { return typeof param == 'string'; }
function isSvg(elem) { return startsWith(elem.constructor.name, 'SVG'); }
function isVisible(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	let x = elem.style.flex;
	return (elem.style.display != 'none' || elem.offsetParent !== null) && (nundef(elem.style.flex) || !endsWith(elem.style.flex, '0%'));
}
function isWhiteSpace(ch) { return /\s/.test(ch) }
function isWhiteSpace2(ch) {
	const alphanum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
	return !alphanum.includes(ch);
}
function isWhiteSpaceString(s) { return isEmptyOrWhiteSpace(s); }
function jsClean(o) {
	if (nundef(o)) return o;
	else if (isDOM(o)) return null;
	else if (isLiteral(o)) return o;
	else if (isList(o)) {
		let onew = o.map(x => jsClean(x));
		return onew.filter(x => x !== null);
	} else if (isDict(o)) {
		for (const k in o) o[k] = jsClean(o[k]);
		let onew = {};
		for (const k in o) if (o[k] !== null) onew[k] = o[k];
		return onew;
	}
}
function jsCopy(o) { return JSON.parse(JSON.stringify(o)); }
function jsCopySafe(o) { return JSON.parse(JSON.stringify(jsClean(o))); }
function jsonToYaml(o) { let y = jsyaml.dump(o); return y; }
function lastDescendantOfType(type, parent) {
	if (getTypeOf(parent) == type) return parent;
	let children = arrChildren(parent);
	if (isEmpty(children)) return null;
	for (const ch of children.reverse()) {
		let res = lastDescendantOfType(type, ch);
		if (res) return res;
	}
	return null;
}
function load_assets_direct(obj) {
	Config = jsyaml.load(obj.config);
	Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	Info = jsyaml.load(obj.info);
	KeySets = getKeySets();
	console.assert(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');
}
async function load_assets_fetch(basepath, baseminpath) {
	let path = basepath + 'assets/';
	Config = await route_path_yaml_dict(baseminpath + 'config.yaml');
	DB = await route_path_yaml_dict(basepath + 'DB.yaml');
	Syms = await route_path_yaml_dict(path + 'allSyms.yaml');
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = await route_path_yaml_dict(path + 'symGSG.yaml');
	C52 = await route_path_yaml_dict(path + 'c52.yaml');
	Cinno = await route_path_yaml_dict(path + 'fe/inno.yaml');
	Info = await route_path_yaml_dict(path + 'lists/info.yaml');
	create_card_assets_c52();
	KeySets = getKeySets();
	console.assert(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');
	return { users: dict2list(DB.users, 'name'), games: dict2list(Config.games, 'name'), tables: [] };
}
async function load_config(port = 3000, apps = true, tables = false) {
	Config = await route_path_yaml_dict('../y/config.yaml');
	let server = 'http:/' + '/localhost:' + port;
	if (apps) {
		let files = await route_path_json(server + '/files?dir=appdata');
		console.log('apps', files)
		for (const f of files) {
			let appname = stringBefore(f, '.');
			Config.apps[appname].data = await route_path_yaml_dict(`../y/appdata/${appname}.yaml`);
		}
	}
	if (tables) {
		let files = await route_path_json(server + '/files?dir=tables');
		console.log('tables', files)
		Tables = {};
		for (const f of files) {
			let id = stringBefore(f, '.');
			Tables[id] = await route_path_yaml_dict(`../y/tables/${id}.yaml`);
		}
	}
}
async function load_config_fast(applist = [], tablelist = []) {
	Config = await route_path_yaml_dict('../y/config.yaml');
	for (const appname of applist) {
		Config.apps[appname].data = await route_path_yaml_dict(`../y/appdata/${appname}.yaml`);
		Config.apps[appname].name = appname;
	}
	Tables = {};
	for (const tableid of tablelist) {
		Tables[tableid] = await route_path_yaml_dict(`../y/tables/${tableid}.yaml`);
		Tables[tableid].name = tableid;
	}
}
async function load_config_new() {
	Config = await route_path_yaml_dict('../y/config.yaml');
	let data = await route_path_yaml_dict('../y/appdata.yaml');
	for (const k in data) {
		Config.apps[k].data = data[k];
	}
}
async function load_db() { DB = await route_path_yaml_dict('../y/db.yaml'); Config = DB; }
async function load_syms(path) {
	if (nundef(path)) path = '../base/assets/';
	Syms = await route_path_yaml_dict(path + 'allSyms.yaml');
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = await route_path_yaml_dict(path + 'symGSG.yaml');
	KeySets = getKeySets();
	Info = await route_path_yaml_dict(path + 'lists/info.yaml');
	C52 = await route_path_yaml_dict(path + 'c52.yaml');
	create_card_assets_c52();
	assertion(Syms, 'Syms undefined!');
}
function loader_off() { let d = mBy('loader_holder'); if (isdef(d)) d.className = 'loader_off'; }
function loader_on() { let d = mBy('loader_holder'); if (isdef(d)) d.className = 'loader_on'; }
function log_array(arr) {
	arr.map(x => console.log(x));
}
function log_object(o = {}, msg = '', props = [], indent = 0) {
	console.log(indent ? '.'.repeat(indent) : '____', msg, indent ? '' : `(caller:${getFunctionsNameThatCalledThisFunction()})`);
	let keys = get_keys(o); keys.sort();
	for (const k of keys) {
		if (isEmpty(props) || props.includes(k)) {
			if (isDict(o[k])) { log_object(o[k], k, get_keys(o[k]).join(' '), indent + 1); console.log(); }
			else if (isListOf(o[k], isLiteral)) console.log(' '.repeat(indent), k + ':', o[k].join(','));
			else console.log(' '.repeat(indent), k + ':', o[k]);
		}
	}
}
function makeUnitString(nOrString, unit = 'px', defaultVal = '100%') {
	if (nundef(nOrString)) return defaultVal;
	if (isNumber(nOrString)) nOrString = '' + nOrString + unit;
	return nOrString;
}
function mConfine(n, modul, min, max) {
	rem = n % modul; n = n - rem;
	while (n < min) n += modul;
	while (n > max) n -= modul;
	return n;
}
function measure_fieldset(fs) {
	let legend = fs.firstChild;
	let r = getRect(legend);
	let labels = fs.getElementsByTagName('label');
	let wmax = 0;
	for (const l of labels) {
		let r1 = getRect(l);
		wmax = Math.max(wmax, r1.w);
	}
	let wt = r.w;
	let wo = wmax + 24;
	let diff = wt - wo;
	if (diff >= 10) {
		for (const l of labels) { let d = l.parentNode; mStyle(d, { maleft: diff / 2 }); }
	}
	let wneeded = Math.max(wt, wo) + 10;
	mStyle(fs, { wmin: wneeded });
	for (const l of labels) { let d = l.parentNode; mStyle(l, { display: 'inline-block', wmin: 50 }); mStyle(d, { wmin: wneeded - 40 }); }
}
function nundef(x) { return x === null || x === undefined; }
function onpagedeactivated(handler) {
	document.addEventListener('visibilitychange',
		() => {
			console.log('visibilityState', document.visibilityState);
			if (document.visibilityState !== 'visible') handler();
		});
}
function oscillate_between(x, min, max, step) {
	x += step;
	if (x <= min || x >= max) step = -step;
	return [x, step];
}
function post_json(url, o, callback) {
	fetch(url, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(o)
	}).then(response => response.json()).then(response => callback(response));
}
function posToPoint(pos = 'cc', w, h, offx = 0, offy = 0) {
	let di = { t: 0, b: h, l: 0, r: w };
	let py = pos[0] == 'c' ? h / 2 : di[pos[0]];
	let px = pos[1] == 'c' ? w / 2 : di[pos[1]];
	return [px + offx, py + offy];
}
function range(f, t, st = 1) {
	if (nundef(t)) {
		t = f - 1;
		f = 0;
	}
	let arr = [];
	for (let i = f; i <= t; i += st) {
		arr.push(i);
	}
	return arr;
}
function recConvertLists(o, maxlen = 25) {
	for (const k in o) {
		let val = o[k];
		if (isList(val)) {
			if (val.length > maxlen) val = val.slice(0, maxlen).toString() + '...';
			else val = val.toString();
			o[k] = val;
		} else if (isDict(val)) recConvertLists(val);
	}
}
function resetUIDs() { UIDCounter = 0; FRUIDCounter = -1; }
function reverse(x) {
	if (isString(x)) {
		var newString = "";
		for (var i = x.length - 1; i >= 0; i--) {
			newString += x[i];
		}
		return newString;
	}
	if (isList(x)) return x.reverse();
	if (isDict(x)) return dict2list(x, 'value').reverse();
	return x;
}
async function route_path_json(url) {
	let data = await fetch(url);
	let o = await data.json();
	return o;
}
async function route_path_text(url) {
	let data = await fetch(url);
	let text = await data.text();
	return text;
}
async function route_path_yaml_dict(url) {
	let data = await fetch(url);
	let text = await data.text();
	let dict = jsyaml.load(text);
	return dict;
}
function route_post_json(url, o, callback) { post_json(url, o, callback); }
function selectText(el) {
	if (el instanceof HTMLTextAreaElement) { el.select(); return; }
	var sel, range;
	if (window.getSelection && document.createRange) {
		sel = window.getSelection();
		if (sel.toString() == '') {
			window.setTimeout(function () {
				range = document.createRange();
				range.selectNodeContents(el);
				sel.removeAllRanges();
				sel.addRange(range);
			}, 1);
		}
	} else if (document.selection) {
		sel = document.selection.createRange();
		if (sel.text == '') {
			range = document.body.createTextRange();
			range.moveToElementText(el);
			range.select();
		}
	}
}
function set_run_state(singleclient = true, sockets = false, port = 3000, localhost = true, testing = true, liveserver = true, nodejs = true) {
	SERVER = localhost ? '127.0.0.1' : '216.250.112.218';
	PORT = port;
	SERVERURL = `http:/` + `${SERVER}:${PORT}`;
	NODEJS = nodejs;
	LIVE_SERVER = liveserver;
	TESTING = testing;
	SINGLECLIENT = singleclient;
	if (sockets) {
		Socket = liveserver ? io(SERVERURL) : io();
		Socket.on('message', x => console.log('got message', x));
		Socket.on('disconnect', x => console.log('got disconnect', x));
		Socket.on('update', x => console.log('got update', x));
	}
	console.log('SERVER:' + SERVERURL, 'LIVE:' + LIVE_SERVER, 'Socket:' + Socket, TESTING ? 'TESTING' : '', SINGLECLIENT ? 'SINGLE' : '');
}
function set_run_state_local() {
	set_run_state(true, false, 3000, true, false, true, true);
}
function set_run_state_no_server() {
	set_run_state(true, false, 3000, true, true, true, false);
}
function set_run_state_vps() {
	set_run_state(false, false, 3000, false, false, false, true);
}
function setRect(elem, options) {
	let r = getRect(elem);
	elem.rect = r;
	elem.setAttribute('rect', `${r.w} ${r.h} ${r.t} ${r.l} ${r.b} ${r.r}`);
	if (isDict(options)) {
		if (options.hgrow) mStyle(elem, { hmin: r.h });
		else if (options.hfix) mStyle(elem, { h: r.h });
		else if (options.hshrink) mStyle(elem, { hmax: r.h });
		if (options.wgrow) mStyle(elem, { wmin: r.w });
		else if (options.wfix) mStyle(elem, { w: r.w });
		else if (options.wshrink) mStyle(elem, { wmax: r.w });
	}
	return r;
}
function show(elem, isInline = false) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:visible');
	} else {
		elem.style.display = isInline ? 'inline-block' : null;
	}
	return elem;
}
function show_special_message(msg, stay = false, ms = 3000, delay = 0, styles = {}, callback = null) {
	let dParent = mBy('dBandMessage');
	if (nundef(dParent)) dParent = mDiv(document.body, {}, 'dBandMessage');
	show(dParent);
	clearElement(dParent);
	addKeys({ position: 'fixed', top: 200, classname: 'slow_gradient_blink', vpadding: 10, align: 'center', position: 'absolute', fg: 'white', fz: 24, w: '100vw' }, styles);
	if (!isEmpty(styles.classname)) { mClass(dParent, styles.classname); }
	delete styles.classname;
	mStyle(dParent, styles);
	dParent.innerHTML = msg;
	if (delay > 0) TO.special = setTimeout(() => { mFadeRemove(dParent, ms, callback); }, delay);
	else mFadeRemove(dParent, ms, callback);
}
function show0(id) { mBy(id).style.display = "block"; }
function toElem(d) { return isString(d) ? mBy(d) : d; }
function toggle_select(item, selected, selstyle = 'selected') {
	let ui = iDiv(item);
	item.isSelected = !item.isSelected;
	if (item.isSelected) {
		mStyleOrClass(ui, selstyle);
	} else if (isString(selstyle)) {
		mClassRemove(ui, selstyle);
	} else if (isdef(item.style)) {
		mStyle(ui, item.style);
	} else {
		mStyleUndo(ui, selstyle);
	}
	if (isdef(selected)) {
		if (isList(selected)) {
			if (item.isSelected) {
				console.assert(!selected.includes(item), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
				selected.push(item);
			} else {
				console.assert(selected.includes(item), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
				removeInPlace(selected, item);
			}
		} else {
			mStyle(iDiv(selected), selected.style);
			selected.isSelected = false;
		}
	}
	return item.isSelected ? item : null;
}
function toggleSelection(pic, selected, clSelected = 'framedPicture', clUnselected = null) {
	let ui = iDiv(pic);
	pic.isSelected = !pic.isSelected;
	if (pic.isSelected) {
		if (isdef(clUnselected)) mClassRemove(ui, clUnselected);
		mClass(ui, clSelected);
	} else {
		mClassRemove(ui, clSelected);
		if (isdef(clUnselected)) mClass(ui, clUnselected);
	}
	if (isdef(selected)) {
		if (isList(selected)) {
			if (pic.isSelected) {
				console.assert(!selected.includes(pic), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
				selected.push(pic);
			} else {
				console.assert(selected.includes(pic), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
				removeInPlace(selected, pic);
			}
		} else {
			mClassRemove(iDiv(selected), clSelected);
			if (isdef(clUnselected)) mClass(iDiv(selected), clUnselected);
			selected.isSelected = false;
		}
	}
	return pic.isSelected ? pic : null;
}
function toggleSelectionOfPicture(pic, selectedPics, className = 'framedPicture') {
	let ui = iDiv(pic);
	pic.isSelected = !pic.isSelected;
	if (pic.isSelected) mClass(ui, className); else mClassRemove(ui, className);
	if (isdef(selectedPics)) {
		if (pic.isSelected) {
			console.assert(!selectedPics.includes(pic), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
			selectedPics.push(pic);
		} else {
			console.assert(selectedPics.includes(pic), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
			removeInPlace(selectedPics, pic);
		}
	}
}
function toModulo(n, modul) { rem = n % modul; n = n - rem; if (n < 0) n = 0; return n; }
function toYaml(o) { return jsonToYaml(o); }
function unfocusOnEnter(ev) {
	if (ev.key === 'Enter') {
		ev.preventDefault();
		mBy('dummy').focus();
	}
}
function valf() {
	for (const arg of arguments) if (isdef(arg)) return arg;
	return null;
}
function valnwhite() {
	for (const arg of arguments) if (isdef(arg) && !isEmptyOrWhiteSpace(arg)) return arg;
	return null;
}
//#endregion misc (basemin)

//#region new (basemin)
function aggregate_elements(list_of_object, propname) {
	let result = [];
	for (let i = 0; i < list_of_object.length; i++) {
		let obj = list_of_object[i];
		let arr = obj[propname];
		for (let j = 0; j < arr.length; j++) {
			result.push(arr[j]);
		}
	}
	return result;
}
function arrAverage(arr, prop) {
	let n = arr.length; if (!n) return 0;
	let sum = arrSum(arr, prop);
	return sum / n;
}
function complexCompare(obj1, obj2) {
	const obj1Keys = Object.keys(obj1);
	const obj2Keys = Object.keys(obj2);
	if (obj1Keys.length !== obj2Keys.length) {
		return false;
	}
	for (let objKey of obj1Keys) {
		if (obj1[objKey] !== obj2[objKey]) {
			if (typeof obj1[objKey] == "object" && typeof obj2[objKey] == "object") {
				if (!isEqual(obj1[objKey], obj2[objKey])) {
					return false;
				}
			}
			else {
				return false;
			}
		}
	}
	return true;
}
function doit(secs, f, interval) {
	if (get_now() - DA.start < secs * 1000) setTimeout(() => { f(); doit(secs, f, interval); }, interval);
	else console.log('DONE!!!');
}
function exchange_by_index(arr1, i1, arr2, i2) {
	let temp = arr1[i1];
	arr1[i1] = arr2[i2];
	arr2[i2] = temp;
}
function formatDate(d) {
	const date = isdef(d) ? d : new Date();
	const month = ('0' + date.getMonth()).slice(0, 2);
	const day = date.getDate();
	const year = date.getFullYear();
	const dateString = `${month}/${day}/${year}`;
	return dateString;
}
function get_now() { return Date.now(); }
function get_timestamp() { return Date.now(); }
function getCaretCoordinates(element, position, options) {
	var properties = [
		'direction',
		'boxSizing',
		'width',
		'height',
		'overflowX',
		'overflowY',
		'borderTopWidth',
		'borderRightWidth',
		'borderBottomWidth',
		'borderLeftWidth',
		'borderStyle',
		'paddingTop',
		'paddingRight',
		'paddingBottom',
		'paddingLeft',
		'fontStyle',
		'fontVariant',
		'fontWeight',
		'fontStretch',
		'fontSize',
		'fontSizeAdjust',
		'lineHeight',
		'fontFamily',
		'textAlign',
		'textTransform',
		'textIndent',
		'textDecoration',
		'letterSpacing',
		'wordSpacing',
		'tabSize',
		'MozTabSize'
	];
	var isBrowser = (typeof window !== 'undefined');
	var isFirefox = (isBrowser && window.mozInnerScreenX != null);
	if (!isBrowser) {
		throw new Error('textarea-caret-position#getCaretCoordinates should only be called in a browser');
	}
	var debug = options && options.debug || false;
	if (debug) {
		var el = document.querySelector('#input-textarea-caret-position-mirror-div');
		if (el) el.parentNode.removeChild(el);
	}
	var div = document.createElement('div');
	div.id = 'input-textarea-caret-position-mirror-div';
	document.body.appendChild(div);
	var style = div.style;
	var computed = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
	var isInput = element.nodeName === 'INPUT';
	style.whiteSpace = 'pre-wrap';
	if (!isInput) style.wordWrap = 'break-word';
	style.position = 'absolute';
	if (!debug) style.visibility = 'hidden';
	properties.forEach(prop => {
		if (isInput && prop === 'lineHeight') {
			if (computed.boxSizing === "border-box") {
				var height = parseInt(computed.height);
				var outerHeight =
					parseInt(computed.paddingTop) +
					parseInt(computed.paddingBottom) +
					parseInt(computed.borderTopWidth) +
					parseInt(computed.borderBottomWidth);
				var targetHeight = outerHeight + parseInt(computed.lineHeight);
				if (height > targetHeight) {
					style.lineHeight = height - outerHeight + "px";
				} else if (height === targetHeight) {
					style.lineHeight = computed.lineHeight;
				} else {
					style.lineHeight = 0;
				}
			} else {
				style.lineHeight = computed.height;
			}
		} else {
			style[prop] = computed[prop];
		}
	});
	if (isFirefox) {
		if (element.scrollHeight > parseInt(computed.height))
			style.overflowY = 'scroll';
	} else {
		style.overflow = 'hidden';
	}
	div.textContent = element.value.substring(0, position);
	if (isInput)
		div.textContent = div.textContent.replace(/\s/g, '\u00a0');
	var span = document.createElement('span');
	span.textContent = element.value.substring(position) || '.';
	div.appendChild(span);
	var coordinates = {
		top: span.offsetTop + parseInt(computed['borderTopWidth']),
		left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
		height: parseInt(computed['lineHeight'])
	};
	if (debug) {
		span.style.backgroundColor = '#aaa';
	} else {
		document.body.removeChild(div);
	}
	return coordinates;
}
function getGlobals() {
	let di = {};
	let keys = get_keys(window); keys.sort();
	for (const k of keys) {
		let o = window[k];
		let type = typeof o;
		lookupAddToList(di, [type], { key: k, o: o, value: k, type: type });
	}
	Globals = di;
	return di;
}
function getTextAreaCurrentLine(el) {
	let line = '';
	if (el instanceof HTMLTextAreaElement) {
		line = el.value.slice(el.value.lastIndexOf('\n', el.selectionStart - 1) + 1,
			((end = el.value.indexOf('\n', el.selectionStart)) => end > -1 ? end : undefined)());
	}
	return line;
}
function getTextAreaCurrentWord(el) {
	let line = '', w = '', prefix = '';
	if (el instanceof HTMLTextAreaElement) {
		let s = el.value;
		let i_caret = el.selectionEnd;
		let i_last_break_before_caret = s.lastIndexOf('\n', i_caret - 1); if (i_last_break_before_caret < 0) i_last_break_before_caret = 0;
		let i_next_break = s.indexOf('\n', i_caret); if (i_next_break < 0) i_next_break = s.length - 1;
		let i_caret_within_line = i_caret - i_last_break_before_caret;
		line = s.slice(i_last_break_before_caret + 1, i_next_break);
		let pos = i_caret_within_line - 2;
		console.log('_________\nline:', line, '\ni_caret=' + i_caret, 'i_in_line=' + pos);
		for (let i = pos; i >= 0; i--) {
			let ch = line[i];
			if (isAlphaNum(ch)) w = ch + w; else break;
		}
		prefix = w;
		for (let i = pos + 1; i < line.length; i++) {
			let ch = line[i];
			if (isAlphaNum(ch)) w = w + ch; else break;
		}
	}
	return [w, prefix];
}
function if_plural(n) { return n == 1 ? '' : 's'; }
function if_stringified(obj) { return is_stringified(obj) ? JSON.parse(obj) : obj; }
function if_stringified_or_dict(obj) { return nundef(obj) ? {} : is_stringified(obj) ? JSON.parse(obj) : obj; }
function if_stringified_or_list(obj) { return nundef(obj) ? [] : is_stringified(obj) ? JSON.parse(obj) : obj; }
function if_stringified_or_string(obj) { return nundef(obj) ? '' : is_stringified(obj) ? JSON.parse(obj) : obj; }
function intersection(arr1, arr2) {
	let res = [];
	for (const a of arr1) {
		if (arr2.includes(a)) {
			addIf(res, a);
		}
	}
	return res;
}
function is_stringified(obj) {
	if (isString(obj)) {
		return '"\'{[('.includes(obj[0]);
	}
	return false;
}
function mFlip(card, ms, callback) {
	let a = mAnimate(iDiv(card), 'transform', [`scale(1,1)`, `scale(0,1)`],
		() => {
			if (card.faceUp) face_down(card); else face_up(card);
			mAnimate(iDiv(card), 'transform', [`scale(0,1)`, `scale(1,1)`], callback, ms / 2, 'ease-in', 0, 'both');
		},
		ms / 2, 'ease-out', 0, 'both');
}
function object2string(o, props = [], except_props = []) {
	let s = '';
	if (nundef(o)) return s;
	if (isString(o)) return o;
	let keys = Object.keys(o).sort();
	for (const k of keys) {
		if (!isEmpty(props) && props.includes(k) || !except_props.includes(k)) {
			let val = isList(o[k]) ? o[k].join(',') : isDict(o[k]) ? object2string(o[k].props, except_props) : o[k];
			let key_part = isEmpty(s) ? '' : `, ${k}:`;
			s += val;
		}
	}
	return s;
}
function rName(n = 1) { let arr = MyNames; return rChoose(arr, n); }
function run_for_seconds(secs, f, interval = 50) {
	DA.start = get_now(); doit(secs, f, interval);
}
function say(text, lang, callback, volume, rate, pitch) {
	function sayit(text, lang, callback, volume, rate, pitch) {
		var text = valf(text, 'Hello, world!');
		var msg = new SpeechSynthesisUtterance();
		var voices = DA.voicelist;
		let voice = voices.filter(x => x.lang.includes(lang));
		if (isEmpty(voice)) voice = voices.filter(x => x.name.toLowerCase().includes(lang));
		msg.voice = valf(rChoose(voice), rChoose(voices));
		if (isdef(volume)) msg.volume = volume;
		if (isdef(rate)) msg.rate = rate;
		if (isdef(pitch)) msg.pitch = pitch;
		msg.text = text;
		msg.onend = e => {
			if (callback) callback(); else console.log('ENDE', e.utterance, 'Finished in ' + e.elapsedTime + ' seconds.');
		};
		speechSynthesis.speak(msg);
	}
	if (!('speechSynthesis' in window)) { alert('speech not supported!!! connect to internet?'); return; }
	if (nundef(DA.voicelist)) {
		speechSynthesis.onvoiceschanged = function () {
			DA.voicelist = speechSynthesis.getVoices();
			sayit(text, lang, callback, volume, rate, pitch);
		}
	} else sayit(text, lang, callback, volume, rate, pitch);
}
function simpleCompare(o1, o2) {
	let s1 = object2string(o1);
	let s2 = object2string(o2);
	return s1 == s2;
}
function stringLast(s, n) { return s.substring(s.length - n, s.length); }
//#endregion new (basemin)

//#region db (basemin)
function db_create(table, rec, db) {
	if (!db) { db = DB; }
	lookupAddToList(db, ['appdata', table], rec);
	return db;
}
function db_delete(table, i, db) {
	if (!db) { db = DB; }
	if (nundef(i)) delete db.appdata[table]; else arrRemovip(lookup(db, ['appdata', table])[i]);
	return db;
}
function db_init(db) { DB = db; return db; }
function db_readall(db) {
	if (!db) { db = DB; }
	return db;
}
function db_update(table, i, rec, save = false) {
	if (isdef(DB)) { let list = lookup(DB, ['appdata', table]); list[i] = rec; }
	if (NODEJS) post_json(SERVERURL + `/update`, { table: table, i: i, rec: rec, save: save }, () => console.log('updated db'));
}
function dbSave() {
	if (NODEJS) {
		let route = `/post/json`;
		let o = { filename: 'db', data: DB }
		let callback = () => console.log('saved db');
		post_json(route, o, callback);
		console.log('full route', route);
	} else console.log('not saved - no app running!')
}
//#endregion db (basemin)


//#region sudoku (board)
function arrToMatrix(arr, rows, cols) {
	let i = 0, res = [];
	for (let r = 0; r < rows; r++) {
		let rarr = [];
		for (let c = 0; c < cols; c++) {
			let a = arr[i]; i++;
			rarr.push(a);
		}
		res.push(rarr);
	}
	return res;
}
function checkSudokuRule(matrix) {
	let i = 0;
	for (const arr of matrix) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let err = { type: 'row', row: i, col: dd.i, val: dd.val, info: dd, i: i };
			return err;
		}
		i += 1;
	}
	i = 0;
	for (const arr of bGetCols(matrix)) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let err = { type: 'column', col: i, row: dd.i, val: dd.val, i: i, info: dd };
			return err;
		}
		i += 1;
	}
	let [rows, cols] = [matrix.length, matrix[0].length];
	let rowsEach = rows == 9 ? 3 : 2;
	let colsEach = cols == 4 ? 2 : 3;
	let chunks = bGetChunksWithIndices(matrix, rowsEach, colsEach);
	i = 0;
	for (const arr of chunks) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let val = dd.val;
			let err = { type: 'quadrant', row: val.row, col: val.col, val: val.val, i: i, info: dd };
		}
		i += 1;
	}
	return null;
}
function checkSudokuRule_trial1(matrix) {
	for (const arr of matrix) { let dd = hasDuplicate(arr); if (dd) return { type: 'row', info: dd }; }
	for (const arr of bGetCols(matrix)) { let dd = hasDuplicate(arr); if (dd) return { type: 'column', info: dd }; }
	let chunks = bGetChunks(matrix, 2, 2);
	for (const arr of chunks) { let dd = hasDuplicate(arr); if (dd) return { type: 'quadrant', info: dd }; }
	return null;
}
function destroySudokuRule(pattern, rows, cols) {
	let sz = Math.min(rows, cols);
	let [r1, r2] = choose(range(0, sz - 1), 2);
	let c = chooseRandom(range(0, sz - 1));
	if (coin(50)) { arrSwap2d(pattern, r1, c, r2, c); }
	else if (coin(50)) { arrSwap2d(pattern, c, r1, c, r2); }
}
function getSudokuPattern(r, c) {
	let patterns = {
		44: [
			[[0, 1, 2, 3], [2, 3, 0, 1], [3, 0, 1, 2], [1, 2, 3, 0]],
			[[0, 1, 2, 3], [3, 2, 0, 1], [2, 3, 1, 0], [1, 0, 3, 2]],
			[[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]],
		],
	};
	return chooseRandom(patterns['' + r + c]);
}
function getSudokuPatternFromDB(r, c, index) {
	let key = '' + r + 'x' + c;
	let numSamples = Object.keys(DB.games.gColoku.samples[key]).length;
	if (nundef(index)) index = randomNumber(0, numSamples - 1); else if (index >= numSamples) index = 1;
	let sample = DB.games.gColoku.samples[key][index];
	let pattern = sudokuSampleToIndexMatrix(sample.sol, r, c);
	let puzzle = sudokuSampleToIndexMatrix(sample.min, r, c);
	return { pattern: pattern, puzzle: puzzle };
}
function hasDuplicate(arr, efunc) {
	let di = {};
	if (nundef(efunc)) efunc = x => { return x === ' ' };
	let i = -1;
	for (const a of arr) {
		i += 1;
		if (efunc(a)) continue;
		if (a in di) return { i: i, val: a };
		di[a] = true;
	}
	return false;
}
function stringToMatrix(s, rows, cols) {
	if (isNumber(s)) s = String(s);
	let letters = toLetterArray(s);
	let nums = letters.map(x => Number(x));
	let matrix = arrToMatrix(nums, rows, cols);
}
function sudokuSampleToIndexMatrix(s, rows, cols) {
	if (isNumber(s)) s = String(s);
	let letters = toLetterArray(s);
	let nums = letters.map(x => Number(x));
	let res = [];
	for (const n of nums) {
		if (n === 0) res.push(' ');
		else res.push(n - 1);
	}
	let matrix = arrToMatrix(res, rows, cols);
	return matrix;
}
//#endregion sudoku (board)

//#region board (board)
function bCapturedPieces(plSym, arr, idx, rows, cols, includeDiagonals = true) {
	let res = [];
	let nei = bNei(arr, idx, rows, cols, includeDiagonals);
	for (let dir = 0; dir < 8; dir++) {
		let i = nei[dir];
		if (nundef(i)) continue;
		let el = arr[i];
		if (empty_func(el) || el == plSym) continue;
		let inew = [];
		let MAX = 100, cmax = 0;
		while (isOppPiece(el, plSym)) {
			if (cmax > MAX) break; cmax += 1;
			inew.push(i);
			i = bNeiDir(arr, i, dir, rows, cols);
			if (nundef(i)) break;
			el = arr[i];
		}
		if (el == plSym) {
			res = res.concat(inew);
		}
	}
	return res;
}
function bCheck(r, c, rows, cols) { return r >= 0 && r < rows && c >= 0 && c < cols ? r * cols + c : null; }
function bCreateEmpty(rows, cols) { return new Array(rows * cols).fill(null); }
function bFreeRayDir(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		i = bNeiDir(arr, i, dir, rows, cols);
		if (!i || !empty_func(arr[i])) break; else indices.push(i);
	}
	return indices;
}
function bFreeRayDir1(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		i = bNeiDir(arr, i, dir, rows, cols);
		if (!i) break;
		else indices.push(i);
		if (!empty_func(arr[i])) break;
	}
	return indices;
}
function bFullCol(arr, icol, rows, cols) {
	let iStart = icol;
	let x = arr[iStart]; if (empty_func(x)) return null;
	for (let i = iStart + cols; i < iStart + (cols * rows); i += cols) if (arr[i] != x) return null;
	return x;
}
function bFullDiag(arr, rows, cols) {
	let iStart = 0;
	let x = arr[iStart]; if (empty_func(x)) return null;
	for (let i = iStart + cols + 1; i < arr.length; i += cols + 1) { if (arr[i] != x) return null; }
	return x;
}
function bFullDiag2(arr, rows, cols) {
	let iStart = cols - 1;
	let x = arr[iStart]; if (empty_func(x)) return null;
	for (let i = iStart + cols - 1; i < arr.length - 1; i += cols - 1) { if (arr[i] != x) return null; }
	return x;
}
function bFullRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let x = arr[iStart]; if (empty_func(x)) return null;
	for (let i = iStart + 1; i < iStart + cols; i++) if (arr[i] != x) return null;
	return x;
}
function bGetChunks(arr2d, rowsEach, colsEach) {
	let res = [];
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	for (let r = 0; r < rTotal; r += rowsEach) {
		let m1 = [];
		for (let c = 0; c < cTotal; c += colsEach) {
			m1 = bGetSubMatrix(arr2d, r, rowsEach, c, colsEach);
			res.push(arrFlatten(m1));
		}
	}
	return res;
}
function bGetChunksWithIndices(arr2d, rowsEach, colsEach) {
	let res = [];
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	for (let r = 0; r < rTotal; r += rowsEach) {
		let m1 = [];
		for (let c = 0; c < cTotal; c += colsEach) {
			m1 = bGetSubMatrixWithIndices(arr2d, r, rowsEach, c, colsEach);
			res.push(arrFlatten(m1));
		}
	}
	return res;
}
function bGetCol(arr, icol, rows, cols) {
	let iStart = icol;
	let res = [];
	for (let i = iStart; i < iStart + (cols * rows); i += cols) res.push(arr[i]);
	return res;
}
function bGetCols(arr2d) {
	let rows = arr2d.length;
	let cols = arr2d[0].length;
	let res = [];
	for (let c = 0; c < cols; c++) { res.push([]); }
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			res[c].push(arr2d[r][c]);
		}
	}
	return res;
}
function bGetRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let arrNew = arr.slice(iStart, iStart + cols);
	let res = [];
	for (let i = iStart; i < iStart + cols; i++) res.push(arr[i]);
	console.assert(sameList(arrNew, res), 'NOOOOOO');
	return res;
}
function bGetRows(arr2d) {
	return arr2d;
}
function bGetSubMatrix(arr2d, rFrom, rows, cFrom, cols) {
	let res = []; for (let i = 0; i < rows; i++) res.push([]);
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	let rIndex = 0;
	for (let r = rFrom; r < rFrom + rows; r++) {
		for (let c = cFrom; c < cFrom + cols; c++) {
			res[rIndex].push(arr2d[r][c]);
		}
		rIndex += 1;
	}
	return res;
}
function bGetSubMatrixWithIndices(arr2d, rFrom, rows, cFrom, cols) {
	let res = []; for (let i = 0; i < rows; i++) res.push([]);
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	let rIndex = 0;
	for (let r = rFrom; r < rFrom + rows; r++) {
		for (let c = cFrom; c < cFrom + cols; c++) {
			res[rIndex].push({ row: r, col: c, val: arr2d[r][c] });
		}
		rIndex += 1;
	}
	return res;
}
function bNei(arr, idx, rows, cols, includeDiagonals = true) {
	let nei = [];
	let [r, c] = iToRowCol(idx, rows, cols);
	if (r > 0) nei.push(idx - cols); else nei.push(null);
	if (r > 0 && c < cols - 1 && includeDiagonals) nei.push(idx - cols + 1); else nei.push(null);
	if (c < cols - 1) nei.push(idx + 1); else nei.push(null);
	if (r < rows - 1 && c < cols - 1 && includeDiagonals) nei.push(idx + cols + 1); else nei.push(null);
	if (r < rows - 1) nei.push(idx + cols); else nei.push(null);
	if (r < rows - 1 && c > 0 && includeDiagonals) nei.push(idx + cols - 1); else nei.push(null);
	if (c > 0) nei.push(idx - 1); else nei.push(null);
	if (r > 0 && c > 0 && includeDiagonals) nei.push(idx - cols - 1); else nei.push(null);
	return nei;
}
function bNeiDir(arr, idx, dir, rows, cols, includeDiagonals = true) {
	let [r, c] = iToRowCol(idx, rows, cols);
	switch (dir) {
		case 0: if (r > 0) return (idx - cols); else return (null);
		case 1: if (r > 0 && c < cols - 1 && includeDiagonals) return (idx - cols + 1); else return (null);
		case 2: if (c < cols - 1) return (idx + 1); else return (null);
		case 3: if (r < rows - 1 && c < cols - 1 && includeDiagonals) return (idx + cols + 1); else return (null);
		case 4: if (r < rows - 1) return (idx + cols); else return (null);
		case 5: if (r < rows - 1 && c > 0 && includeDiagonals) return (idx + cols - 1); else return (null);
		case 6: if (c > 0) return (idx - 1); else return (null);
		case 7: if (r > 0 && c > 0 && includeDiagonals) return (idx - cols - 1); else return (null);
	}
	return null;
}
function boardArrOmitFirstRowCol(boardArr, rows, cols) {
	let res = [];
	for (let r = 1; r < rows; r++) {
		for (let c = 1; c < cols; c++) {
			let i = iFromRowCol(r, c, rows, cols);
			res.push(boardArr[i]);
		}
	}
	return res;
}
function boardToNode(state) {
	let res = new Array();
	for (let i = 0; i < state.length; i++) {
		if (state[i] == null) res[i] = ' ';
		else res[i] = state[i];
	}
	return res;
}
function bPartialCol(arr, icol, rows, cols) {
	let iStart = icol;
	let x = null;
	for (let i = iStart; i < iStart + (cols * rows); i += cols) { if (empty_func(arr[i])) continue; else if (empty_func(x)) x = arr[i]; else if (arr[i] != x) return null; }
	return x;
}
function bPartialDiag(arr, rows, cols) {
	let iStart = 0;
	let x = null;
	for (let i = iStart; i < arr.length; i += cols + 1) { if (empty_func(arr[i])) continue; else if (empty_func(x)) x = arr[i]; else if (arr[i] != x) return null; }
	return x;
}
function bPartialDiag2(arr, rows, cols) {
	let iStart = cols - 1;
	let x = null;
	for (let i = iStart; i < arr.length - 1; i += cols - 1) {
		if (empty_func(arr[i])) continue; else if (empty_func(x)) x = arr[i]; else if (arr[i] != x) return null;
	}
	return x;
}
function bPartialRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let x = null;
	for (let i = iStart; i < iStart + cols; i++) {
		if (empty_func(arr[i])) continue;
		else if (empty_func(x)) x = arr[i];
		else if (arr[i] != x) return null;
	}
	return x;
}
function bRayDir(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		let i = bNeiDir(arr, i, dir, rows, cols);
		if (!i) break; else indices.push(i);
	}
	return indices;
}
function bStrideCol(arr, icol, rows, cols, stride) {
	for (let i = 0; i <= rows - stride; i++) {
		let ch = bStrideColFrom(arr, i, icol, rows, cols, stride);
		if (ch) return ch;
	}
	return null;
}
function bStrideColFrom(arr, irow, icol, rows, cols, stride) {
	if (rows - irow < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	if (empty_func(x)) return null;
	for (let i = iStart + cols; i < iStart + cols * stride; i += cols) if (arr[i] != x) return null;
	return x;
}
function bStrideDiag2From(arr, irow, icol, rows, cols, stride) {
	if (rows - irow < stride || icol - stride + 1 < 0) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	if (empty_func(x)) return null;
	for (let i = iStart + cols - 1; i < iStart + (cols - 1) * stride; i += cols - 1) if (arr[i] != x) return null;
	return x;
}
function bStrideDiagFrom(arr, irow, icol, rows, cols, stride) {
	if (rows - irow < stride || cols - icol < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	if (empty_func(x)) return null;
	for (let i = iStart + cols + 1; i < iStart + (cols + 1) * stride; i += cols + 1) if (arr[i] != x) return null;
	return x;
}
function bStrideRow(arr, irow, rows, cols, stride) {
	for (let i = 0; i <= cols - stride; i++) {
		let ch = bStrideRowFrom(arr, irow, i, rows, cols, stride);
		if (ch) return ch;
	}
	return null;
}
function bStrideRowFrom(arr, irow, icol, rows, cols, stride) {
	if (cols - icol < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	if (empty_func(x)) return null;
	for (let i = iStart + 1; i < iStart + stride; i++) if (arr[i] != x) return null;
	return x;
}
function checkBoardEmpty(arr) { for (const x of arr) { if (!empty_func(x)) return false; } return true; }
function checkBoardFull(arr) { for (const x of arr) if (empty_func(x)) return false; return true; }
function checkPotentialTTT(arr, rows, cols) { return checkWinnerPossible(arr, rows, cols); }
function checkWinner(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bFullRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bFullCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bFullDiag(arr, rows, cols); if (ch) return ch;
	ch = bFullDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkWinnerC4(arr, rows = 6, cols = 7, stride = 4) {
	for (i = 0; i < rows; i++) { let ch = bStrideRow(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bStrideCol(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < rows; i++) {
		for (j = 0; j < cols; j++) {
			let ch = bStrideDiagFrom(arr, i, j, rows, cols, stride); if (ch) return ch;
			ch = bStrideDiag2From(arr, i, j, rows, cols, stride); if (ch) return ch;
		}
	}
	return null;
}
function checkWinnerPossible(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bPartialRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bPartialCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bPartialDiag(arr, rows, cols); if (ch) return ch;
	ch = bPartialDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkWinnerTTT(arr, rows, cols) { return checkWinner(arr, rows, cols); }
function empty_func(x) { nundef(x) || x == ' '; }
function iFromRowCol(row, col, rows, cols) { return row * cols + col; }
function isOppPiece(sym, plSym) { return sym && sym != plSym; }
function iToRowCol(idx, rows, cols) { let c = idx % cols; let r = (idx - c) / rows; return [r, c]; }
function printBoard(arr, rows, cols, reduced = true) {
	let arrR = boardArrOmitFirstRowCol(arr, rows, cols);
	let s = toBoardString(arrR, rows, cols);
	console.log('board', s);
}
function printMatrix(arr2d, title = 'result') {
	let rows = arr2d.length;
	let cols = arr2d[0].length;
	let arr = arrFlatten(arr2d);
	let s = toBoardString(arr, rows, cols);
	console.log(title, s)
}
function printState(state, cols, rows) {
	let formattedString = '';
	state.forEach((cell, index) => {
		formattedString += isdef(cell) ? ` ${cell == '0' ? ' ' : cell} |` : '   |';
		if ((index + 1) % cols == 0) {
			formattedString = formattedString.slice(0, -1);
			if (index < rows * cols - 1) {
				let s = '\u2015\u2015\u2015 '.repeat(cols);
				formattedString += '\n' + s + '\n';
			}
		}
	});
	console.log('%c' + formattedString, 'color: #6d4e42;font-size:10px');
	console.log();
}
function toBoardString(arr, rows, cols) {
	let s = '\n';
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let item = arr[r * cols + c];
			s += '' + (nundef(item) ? '_' : item) + ' ';
		}
		s += '\n';
	}
	return s;
}
//#endregion board (board)

//#region expand (board)
function cCircle(c, sz, n, disp = -90) {
	let rad = sz / 2;
	centers = getEllipsePoints(rad, rad, n, disp)
	centers = centers.map(pt => ({ x: pt.X + c.x, y: pt.Y + c.y }));
	return centers;
}
function circleCenters(rows, cols, wCell, hCell) {
	let [w, h] = [cols * wCell, rows * hCell];
	let cx = w / 2;
	let cy = h / 2;
	let centers = [{ x: cx, y: cy }];
	let rx = cx + wCell / 2; let dradx = rx / wCell;
	let ry = cy + hCell / 2; let drady = ry / hCell;
	let nSchichten = Math.floor(Math.min(dradx, drady));
	for (let i = 1; i < nSchichten; i++) {
		let [newCenters, wsch, hsch] = oneCircleCenters(i * 2 + 1, i * 2 + 1, wCell, hCell);
		for (const nc of newCenters) {
			centers.push({ x: nc.x + cx - wsch / 2, y: nc.y + cy - hsch / 2 });
		}
	}
	return [centers, wCell * cols, hCell * rows];
}
function expandBoard(board, rNew, cNew, iInsert) {
	let [boardArrOld, rOld, cOld] = [board.fields.map(x => isdef(x.item) ? x.item.index : null), board.rows, board.cols];
	let boardArrNew = new Array(rNew * cNew);
	for (let r = 0; r < rNew; r++) {
		for (let c = 0; c < cNew; c++) {
			let i = iFromRowCol(r, c, rNew, cNew);
			let x = (rOld != rNew) ? r : c;
			if (x < iInsert) {
				let iOld = iFromRowCol(r, c, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
			else if (x == iInsert) boardArrNew[i] = null;
			else {
				let [ir, ic] = (rOld != rNew) ? [r - 1, c] : [r, c - 1];
				let iOld = iFromRowCol(ir, ic, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
		}
	}
	return { rows: rNew, cols: cNew, boardArr: boardArrNew, extras: [] };
}
function getCenters(layout, rows, cols, wCell, hCell,) {
	if (layout == 'quad') { return quadCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex') { return hexCenters(rows, cols, wCell, hCell); }
	else if (layout == 'circle') { return circleCenters(rows, cols, wCell, hCell); }
}
function getCentersFromAreaSize(layout, wBoard, hBoard, wCell, hCell) {
	let info;
	if (layout == 'quad') { info = quadCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex') { info = hexCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex1') { info = hex1Centers(rows, cols, wCell, hCell); }
	else if (layout == 'circle') { info = circleCenters(rows, cols, wCell, hCell); }
	return info;
}
function getCentersFromRowsCols(layout, rows, cols, wCell, hCell) {
	let info;
	if (layout == 'quad') { info = quadCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex') { info = hexCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex1') { info = hex1Centers(rows, cols, wCell, hCell); }
	else if (layout == 'circle') { info = circleCenters(rows, cols, wCell, hCell); }
	return info;
}
function insertColNew(board, cClick) { return expandBoard(board, board.rows, board.cols + 1, cClick + 1); }
function insertRowNew(board, cClick) { return expandBoard(board, board.rows + 1, board.cols, cClick + 1); }
function oneCircleCenters(rows, cols, wCell, hCell) {
	let [w, h] = [cols * wCell, rows * hCell];
	let cx = w / 2;
	let cy = h / 2;
	let centers = [{ x: cx, y: cy }];
	let n = 8;
	let radx = cx - wCell / 2;
	let rady = cy - hCell / 2;
	let peri = Math.min(radx, rady) * 2 * Math.PI;
	n = Math.floor(peri / Math.min(wCell, hCell));
	while (n > 4 && n % 4 != 0 && n % 6 != 0) n -= 1;
	centers = getEllipsePoints(radx, rady, n)
	centers = centers.map(pt => ({ x: pt.X + cx, y: pt.Y + cy }));
	return [centers, wCell * cols, hCell * rows];
}
function quadCenters(rows, cols, wCell, hCell) {
	let offX = wCell / 2, offY = hCell / 2;
	let centers = [];
	let x = 0; y = 0;
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			let center = { x: x + offX, y: y + offY };
			centers.push(center);
			x += wCell;
		}
		y += hCell; x = 0;
	}
	return [centers, wCell * cols, hCell * rows];
}
function reduceBoard(board, rNew, cNew, iModify) {
	let [boardArrOld, rOld, cOld] = [board.fields.map(x => isdef(x.item) ? x.item.index : null), board.rows, board.cols];
	let rest = [];
	if (rOld > rNew) { rest = bGetRow(boardArrOld, iModify, rOld, cOld).filter(x => x != null); }
	else if (cOld > cNew) { rest = bGetCol(boardArrOld, iModify, rOld, cOld).filter(x => x != null); }
	let boardArrNew = new Array(rNew * cNew);
	for (let r = 0; r < rNew; r++) {
		for (let c = 0; c < cNew; c++) {
			let i = iFromRowCol(r, c, rNew, cNew);
			let x = (rOld != rNew) ? r : c;
			if (x < iModify) {
				let iOld = iFromRowCol(r, c, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
			else {
				let [ir, ic] = (rOld != rNew) ? [r + 1, c] : [r, c + 1];
				let iOld = iFromRowCol(ir, ic, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
		}
	}
	return { rows: rNew, cols: cNew, boardArr: boardArrNew, extras: rest };
}
function removeColNew(board, cClick) { return reduceBoard(board, board.rows, board.cols - 1, cClick); }
function removeRowNew(board, cClick) { return reduceBoard(board, board.rows - 1, board.cols, cClick); }
//#endregion expand (board)

//#region hex (board)
function _calc_hex_col_array(rows, cols) {
	let colarr = [];
	let even = rows % 2 == 0;
	for (let i = 0; i < rows; i++) {
		colarr[i] = cols;
		if (even && i < (rows / 2) - 1) cols += 1;
		else if (even && i > rows / 2) cols -= 1;
		else if (!even && i < (rows - 1) / 2) cols += 1;
		else if (!even || i >= (rows - 1) / 2) cols -= 1;
	}
	return colarr;
}
function _calc_hex_col_array_old(rows, cols) {
	let colarr = [];
	for (let i = 0; i < rows; i++) {
		colarr[i] = cols;
		if (i < (rows - 1) / 2) cols += 1;
		else cols -= 1;
	}
	return colarr;
}
function addRowsCols(items) {
	let byrc = {};
	let byx = sortBy(items, 'x');
	let c = 0, x = byx[0].x;
	for (let i = 0; i < byx.length; i++) {
		let item = byx[i];
		if (!isCloseTo(item.x, x, 2)) { c += 1; x = item.x; }
		item.col = c;
	}
	let byy = sortBy(items, 'y');
	let r = 0, y = byy[0].y;
	for (let i = 0; i < byy.length; i++) {
		let item = byy[i];
		if (!isCloseTo(item.y, y, 2)) { r += 1; y = item.y; }
		item.row = r;
		lookupSet(byrc, [item.row, item.col], item);
	}
	return byrc;
}
function catanBoard(dParent, rows, topcols, styles = {}) {
	let g = hex1Board(dParent, rows, topcols, styles);
	hexCornerNodes(g);
}
function correctPolys(polys, approx = 10) {
	let clusters = [];
	for (const p of polys) {
		for (const pt of p) {
			let found = false;
			for (const cl of clusters) {
				for (const v of cl) {
					let dx = Math.abs(v.x - pt.x);
					let dy = Math.abs(v.y - pt.y);
					if (dx < approx && dy < approx) {
						cl.push(pt);
						found = true;
						break;
					}
				}
				if (found) break;
			}
			if (!found) {
				clusters.push([pt]);
			}
		}
	}
	let vertices = [];
	for (const cl of clusters) {
		let sumx = 0;
		let sumy = 0;
		let len = cl.length;
		for (const pt of cl) {
			sumx += pt.x;
			sumy += pt.y;
		}
		vertices.push({ x: Math.round(sumx / len), y: Math.round(sumy / len) });
	}
	for (const p of polys) {
		for (const pt of p) {
			let found = false;
			for (const v of vertices) {
				let dx = Math.abs(v.x - pt.x);
				let dy = Math.abs(v.y - pt.y);
				if (dx < approx && dy < approx) {
					if (dx != 0 || dy != 0) {
						pt.x = v.x;
						pt.y = v.y;
					}
					found = true;
				}
				if (found) break;
			}
			if (!found) {
				error('point not found in vertices!!! ' + pt.x + ' ' + pt.y);
			}
		}
	}
	return vertices;
}
function fillColarr(colarr, items) {
	let i = 0;
	let result = [];
	for (const r of colarr) {
		let arr = [];
		for (let c = 0; c < r; c++) {
			arr.push(items[i]); i++;
		}
		result.push(arr);
	}
	return result;
}
function getCornerVertices(centers, w = 100, h = 100) {
	let polys = [];
	for (const pt of centers) {
		let poly = getHexPoly(pt.x, pt.y, w, h);
		polys.push(poly);
	}
	let vertices = correctPolys(polys, 1);
	return vertices;
}
function hex1Board(dParent, rows, topcols, styles = {}) {
	let g = new UIGraph(dParent, styles);
	let [w, h] = [valf(lookup(styles, ['node', 'w']), 50), valf(lookup(styles, ['node', 'h']), 50)];
	let total = hex1Count(rows, topcols);
	let nids = g.addNodes(total);
	g.hex1(rows, topcols, w + 4, h + 4);
	let indices = hex1Indices(rows, topcols);
	let ids = g.getNodeIds();
	let di = {};
	for (let i = 0; i < ids.length; i++) {
		let [row, col] = [indices[i].row, indices[i].col];
		let id = ids[i];
		lookupSet(di, [row, col], id);
		g.setProp(id, 'row', row);
		g.setProp(id, 'col', col);
		g.setProp(id, 'label', `${row},${col}`);
	}
	for (let i = 0; i < ids.length; i++) {
		let [row, col] = [indices[i].row, indices[i].col];
		let id = ids[i];
		let nid2 = lookup(di, [row, col + 2]); if (nid2) g.addEdge(id, nid2);
		nid2 = lookup(di, [row + 1, col - 1]); if (nid2) g.addEdge(id, nid2);
		nid2 = lookup(di, [row + 1, col + 1]); if (nid2) g.addEdge(id, nid2);
	}
	let byrc = {};
	for (const r in di) {
		byrc[r] = {};
		for (const c in di[r]) {
			byrc[r][c] = g.getNode(di[r][c]).data();
		}
	}
	g.di = di;
	g.byrc = byrc;
	g.rc = (i, j, f) => (isdef(f)) ? f(g.getNode(di[i][j])) : g.getNode(di[i][j]);
	return g;
}
function hex1Centers(rows, cols, wCell = 100, hCell = null) {
	let colarr = _calc_hex_col_array(rows, cols);
	let maxcols = arrMax(colarr);
	if (nundef(hCell)) hCell = (hCell / .866);
	let hline = hCell * .75;
	let offX = wCell / 2, offY = hCell / 2;
	let centers = [];
	let x = 0; y = 0;
	for (let r = 0; r < colarr.length; r++) {
		let n = colarr[r];
		for (let c = 0; c < n; c++) {
			let dx = (maxcols - n) * wCell / 2;
			let dy = r * hline;
			let center = { x: dx + c * wCell + offX, y: dy + offY };
			centers.push(center);
		}
	}
	return [centers, wCell * maxcols, hCell / 4 + rows * hline];
}
function hex1Count(rows, topcols) {
	let colarr = _calc_hex_col_array(rows, topcols);
	let total = 0;
	for (let r = 0; r < colarr.length; r++) { total += colarr[r]; }
	return total;
}
function hex1Indices(rows, topcols) {
	let colarr = _calc_hex_col_array(rows, topcols);
	let iStart = Math.floor(rows / 2);
	let inc = -1;
	let res = [];
	for (let r = 0; r < colarr.length; r++) {
		let n = colarr[r];
		for (let c = 0; c < n; c++) {
			let icol = iStart + 2 * c;
			let irow = r;
			res.push({ row: irow, col: icol });
		}
		if (iStart == 0) inc = 1;
		iStart += inc;
	}
	return res;
}
function hexCenters(rows, cols, wCell = 100, hCell) {
	if (nundef(hCell)) hCell = (hCell / .866);
	let hline = hCell * .75;
	let offX = wCell / 2, offY = hCell / 2;
	let centers = [];
	let startSmaller = Math.floor(rows / 2) % 2 == 1;
	let x = 0; y = 0;
	for (let r = 0; r < rows; r++) {
		let isSmaller = startSmaller && r % 2 == 0 || !startSmaller && r % 2 == 1;
		let curCols = isSmaller ? cols - 1 : cols;
		let dx = isSmaller ? wCell / 2 : 0;
		dx += offX;
		for (let c = 0; c < curCols; c++) {
			let center = { x: dx + c * wCell, y: offY + r * hline };
			centers.push(center);
		}
	}
	return [centers, wCell * cols, hCell / 4 + rows * hline];
}
function hexCornerNodes(g) {
	let nodes = g.getNodes();
	let centers = nodes.map(x => x.data('center'));
	let vertices = getCornerVertices(centers);
	for (const f of nodes) {
		let center = f.data('center');
		console.log('center', center)
	}
}
function makeEdge(dParent, v1, v2, dFromEdge, ew = 20) {
	let switched = false;
	if (v1.x == v2.x) {
		if (v1.y > v2.y) { let h = v2; v2 = v1; v1 = h; switched = true; }
		let w = ew / 2;
		let sp = `polygon(${v1.x - w + ew}px ${v1.y + dFromEdge + ew}px, ${v1.x + w + ew}px ${v1.y + dFromEdge + ew}px, ${v2.x + w + ew}px ${v2.y - dFromEdge + ew}px, ${v2.x - w + ew}px ${v2.y - dFromEdge + ew}px)`;
		let de = mDiv(dParent, { position: 'absolute', left: -ew, top: -ew, w: '120%', h: '120%' });
		mClass(de, 'edge');
		mStyle(de, { 'clip-path': sp });
		return mItem(null, { div: de }, { type: 'edge' }, true);
	}
	if (v1.x > v2.x) { let h = v2; v2 = v1; v1 = h; switched = true; }
	let dx = v2.x - v1.x;
	let dy = v2.y - v1.y;
	let m = dy / dx;
	let [x1, y1, x2, y2] = [v1.x, v1.y, v2.x, v2.y];
	let alpha = Math.atan(m);
	let xa = x1 + dFromEdge * Math.cos(alpha);
	let ya = y1 + dFromEdge * Math.sin(alpha);
	let xe = x2 - dFromEdge * Math.cos(alpha);
	let ye = y2 - dFromEdge * Math.sin(alpha);
	let m2 = -1 / m;
	let beta = Math.atan(m2);
	let w = ew / 2;
	let x1t = xa + w * Math.cos(beta);
	let y1t = ya + w * Math.sin(beta);
	let x1b = xa - w * Math.cos(beta);
	let y1b = ya - w * Math.sin(beta);
	let x2t = xe + w * Math.cos(beta);
	let y2t = ye + w * Math.sin(beta);
	let x2b = xe - w * Math.cos(beta);
	let y2b = ye - w * Math.sin(beta);
	let de = mDiv(dParent, { position: 'absolute', left: 0, top: 0, w: '120%', h: '120%' });
	mStyle(de, { 'clip-path': `polygon(${x1t}px ${y1t}px, ${x2t}px ${y2t}px, ${x2b}px ${y2b}px, ${x1b}px ${y1b}px)` });
	mClass(de, 'edge');
	return mItem(null, { div: de }, { type: 'edge' }, true);
}
function neighborhood(items, byrc) {
	let adjList = [];
	let di = {};
	for (const info of items) {
		if (info.type != 'field') continue;
		let [r, c] = [info.row, info.col];
		info.nodeItems = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r - 1, c - 1]),
		];
		info.nodes = info.nodeItems.map(x => isdef(x) ? x.id : null);
		delete info.nodeItems;
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		info.neiItems = [
			lookup(byrc, [r - 3, c + 1]),
			lookup(byrc, [r, c + 2]),
			lookup(byrc, [r + 3, c + 1]),
			lookup(byrc, [r + 3, c - 1]),
			lookup(byrc, [r, c - 2]),
			lookup(byrc, [r - 3, c - 1]),
		];
		info.nei = info.neiItems.map(x => isdef(x) ? x.id : null);
		delete info.neiItems;
	}
}
//#endregion hex (board)

//#region mGraph (board)
function mStyleTranslate(prop, val, convertNumbers = true) {
	const paramDict = {
		align: 'text-align',
		bg: 'background-color',
		fg: 'color',
		hgap: 'column-gap',
		vgap: 'row-gap',
		matop: 'margin-top',
		maleft: 'margin-left',
		mabottom: 'margin-bottom',
		maright: 'margin-right',
		patop: 'padding-top',
		paleft: 'padding-left',
		pabottom: 'padding-bottom',
		paright: 'padding-right',
		rounding: 'border-radius',
		w: 'width',
		h: 'height',
		wmin: 'min-width',
		hmin: 'min-height',
		wmax: 'max-width',
		hmax: 'max-height',
		fontSize: 'font-size',
		fz: 'font-size',
		family: 'font-family',
		weight: 'font-weight',
		z: 'z-index'
	};
	let valDict = {
		random: randomColor(),
	};
	let propName = isdef(paramDict[prop]) ? paramDict[prop] : prop;
	let newVal = isdef(valDict[val]) ? valdict[val] : val;
	if (convertNumbers && isNumber(newVal)) newVal = '' + newVal + 'px';
	return [propName, newVal];
}
function translateStylesToCy(styles, group) {
	let di = {};
	for (const k in styles) {
		let v = styles[k];
		let [prop, val] = translateToCssStyle(k, v, true);
		if (group == 'edge' && k == 'bg') di['line-color'] = val;
		else if (prop == 'shape' && val == 'hex') {
			di.shape = 'polygon';
			di['shape-polygon-points'] = [0, -1, 1, -0.5, 1, 0.5, 0, 1, -1, 0.5, -1, -0.5];
		}
		else di[prop] = val;
	}
	return di;
}
function translateToCssStyle(prop, val) { return mStyleTranslate(prop, val); }
//#endregion mGraph (board)


//#region undefined (cards)
function correct_handsorting(hand, plname) {
	let pl = Z.fen.players[plname];
	let [cs, pls, locs] = [Clientdata.handsorting, pl.handsorting, localStorage.getItem('handsorting')];
	let s = cs ?? pls ?? locs ?? Config.games[Z.game].defaulthandsorting;
	hand = sort_cards(hand, s == 'suit', 'CDSH', true, Z.func.rankstr);
	return hand;
}
function mContainerSplay(d, splay, w, h, num, ov) {
	if (nundef(splay)) splay = 2;
	if (!isNumber(splay)) splay = get_splay_number(splay);
	if (isString(ov) && ov[ov.length - 1] == '%') ov = splay == 0 ? 1 : splay == 3 ? Number(ov) * h / 100 : Number(ov) * w / 100;
	if (splay == 3) {
		d.style.display = 'grid';
		d.style.gridTemplateRows = `repeat(${num},${ov}px)`;
		console.log('HAAAAAAAAAAAALLLLLLLLLLLLLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOOOOOOOO')
		d.style.minHeight = `${h + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 2 || splay == 1) {
		d.style.display = 'grid';
		d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
		let wnew = w + (num - 1) * (ov * 1.1);
		d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 0) {
		d.style.display = 'grid'; ov = .5
		d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
		d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 5) {
		d.style.display = 'grid';
		d.style.gridTemplateColumns = `${ov}px repeat(${num - 1},${ov / 2}px)`;
		d.style.minWidth = `${w + (num) * (ov / 2 * 1.1)}px`;
	} else if (splay == 4) {
		d.style.position = 'relative';
		if (nundef(ov)) ov = .5;
		d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
		d.style.minHeight = `${h + (num - 1) * (ov * 1.1)}px`;
	}
}
function mItemSplay(item, list, splay, ov = .5) {
	if (!isNumber(splay)) splay = get_splay_number(splay);
	let d = iDiv(item);
	let idx = list.indexOf(item.key);
	if (splay == 4) {
		let offset = (list.length - idx) * ov;
		mStyle(d, { position: 'absolute', left: offset, top: offset });
		d.style.zIndex = list.length - idx;
	} else {
		d.style.zIndex = splay != 2 ? list.length - idx : 0;
	}
}
//#endregion undefined (cards)

//#region get (cards)
function ari_get_card(ckey, h, w, ov = .3) {
	let type = ckey[2];
	let sz = { largecard: 100, smallcard: 50 };
	let info = type == 'n' ? to_aristocard(ckey, sz.largecard) : type == 'l' ? to_luxurycard(ckey, sz.largecard) : type == 'r' ? to_rumorcard(ckey, sz.smallcard) : to_commissioncard(ckey, sz.smallcard);
	let card = cardFromInfo(info, h, w, ov);
	if (type == 'l') luxury_card_deco(card);
	return card;
}
function ari_get_card_large(ckey, h, w, ov = .2) {
	let type = ckey[2];
	let sz = { largecard: 120, smallcard: 80 };
	let info = type == 'n' ? to_aristocard(ckey, sz.largecard) : type == 'l' ? to_luxurycard(ckey, sz.largecard) : type == 'r' ? to_rumorcard(ckey, sz.smallcard) : to_commissioncard(ckey, sz.smallcard);
	let card = cardFromInfo(info, h, w, ov);
	if (type == 'l') luxury_card_deco(card);
	return card;
}
function cardFromInfo(info, h, w, ov) {
	let svgCode = C52[info.c52key];
	svgCode = '<div>' + svgCode + '</div>';
	let el = mCreateFrom(svgCode);
	h = valf(h, valf(info.h, 100));
	w = valf(w, h * .7);
	mSize(el, w, h);
	let res = {};
	copyKeys(info, res);
	copyKeys({ w: w, h: h, faceUp: true, div: el }, res);
	if (isdef(ov)) res.ov = ov;
	return res;
}
function create_card_assets_c52() {
	let ranknames = { A: 'Ace', K: 'King', T: '10', J: 'Jack', Q: 'Queen' };
	let suitnames = { S: 'Spades', H: 'Hearts', C: 'Clubs', D: 'Diamonds' };
	let rankstr = '23456789TJQKA';
	let suitstr = 'SHDC';
	sz = 100;
	let di = {};
	for (const r of toLetters(rankstr)) {
		for (const s of toLetters(suitstr)) {
			let k = r + s;
			let info = di[k] = { key: k, val: 1, irank: rankstr.indexOf(r), isuit: suitstr.indexOf(s), rank: r, suit: s, color: RED, c52key: 'card_' + r + s, w: sz * .7, h: sz, sz: sz, ov: .25, friendly: `${isNumber(r) ? r : ranknames[r]} of ${suitnames[s]}`, short: `${r}${s}` };
			info.isort = info.isuit * 13 + info.irank;
		}
	}
	C52Cards = di;
	return di;
}
function ferro_get_card(ckey, h, w, ov = .25) {
	let type = ckey[2];
	let info = ckey[0] == '*' ? get_joker_info() : jsCopy(C52Cards[ckey.substring(0, 2)]);
	info.key = ckey;
	info.cardtype = ckey[2];
	let [r, s] = [info.rank, info.suit];
	info.val = r == '*' ? 50 : r == 'A' ? 20 : 'TJQK'.includes(r) ? 10 : Number(r);
	info.color = RED;
	info.sz = info.h = valf(h, Config.ui.card.h);
	info.w = valf(w, info.sz * .7);
	info.irank = '23456789TJQKA*'.indexOf(r);
	info.isuit = 'SHCDJ'.indexOf(s);
	info.isort = info.isuit * 14 + info.irank;
	let card = cardFromInfo(info, h, w, ov);
	return card;
}
function luxury_card_deco(card) {
	let d = iDiv(card); mStyle(d, { position: 'relative' });
	let d1 = mDiv(d, { fg: 'dimgray', fz: 11, family: 'tangerine', position: 'absolute', left: 0, top: 0, 'writing-mode': 'vertical-rl', transform: 'scale(-1)', top: '35%' }, null, 'Luxury');
	let html = `<img height=${18} src="../base/assets/icons/deco0.svg" style="transform:scaleX(-1);">`;
	d1 = mDiv(d, { position: 'absolute', bottom: -2, left: 3, opacity: .25 }, null, html);
}
function sheriff_card(name, color) {
	let di = SHERIFF.cards;
	let info = valf(di[name], { ksym: 'crossbow', kcenter: 'green apple', label: 'crossbow', type: 'contraband', value: 9, penalty: 4 });
	let bcolor = SHERIFF.color[info.type];
	let c = cPortrait(null, { margin: 12, border: `solid 4px ${bcolor}`, bg: valf(color, colorLight('gold', 60)) });
	let d = iDiv(c);
	let ds = mSym(info.ksym, d, { sz: 30 }, 'tl');
	ds = mSymText(info.value, d, { sz: 25, rounding: '50%', bg: 'gold', margin: 3 }, 'tr');
	ds = mText(info.label.toUpperCase(), d, { family: 'Algerian', w: '100%', fz: 12, align: 'center', position: 'absolute', bottom: 0 });
	ds = mText(info.label.toUpperCase(), d, { family: 'Algerian', w: '100%', fz: 12, align: 'center', position: 'absolute', top: 0 });
	ds = mSymText(info.penalty, d, { sz: 25, rounding: '50%', bg: 'crimson', margin: 3 }, 'br');
	ds = mSym(info.kcenter, d, { sz: 70 }, 'cc'); mPos(ds, 'calc( 50% - 35px )', 'calc( 50% - 35px )');
	return c;
}
function to_aristocard(ckey, sz = 100, color = RED, w) {
	let info = jsCopy(C52Cards[ckey.substring(0, 2)]);
	info.key = ckey;
	info.cardtype = ckey[2];
	let [r, s] = [info.rank, info.suit];
	info.val = r == 'A' ? 1 : 'TJQK'.includes(r) ? 10 : Number(r);
	info.color = color;
	info.sz = info.h = sz;
	info.w = valf(w, sz * .7);
	info.irank = 'A23456789TJQK'.indexOf(r);
	info.isuit = 'SHCD'.indexOf(s);
	info.isort = info.isuit * 13 + info.irank;
	return info;
}
function to_commissioncard(ckey, sz = 40, color = GREEN, w) { return to_aristocard(ckey, sz, color); }
function to_luxurycard(ckey, sz = 100, color = 'gold', w) { return to_aristocard(ckey, sz, color); }
function to_rumorcard(ckey, sz = 40, color = GREEN, w) { return to_aristocard(ckey, sz, color); }
//#endregion get (cards)

//#region card (cards)
function anim_face_down(item, ms = 300, callback = null) { face_up(item); anim_toggle_face(item, callback); }
function anim_face_up(item, ms = 300, callback = null) { face_down(item); anim_toggle_face(item, callback); }
function anim_toggle_face(item, ms = 300, callback = null) {
	let d = iDiv(item);
	mClass(d, 'aniflip');
	TO.anim = setTimeout(() => {
		if (item.faceUp) face_down(item); else face_up(item); mClassRemove(d, 'aniflip');
		if (isdef(callback)) callback();
	}, ms);
}
function face_down(item, color, texture) {
	if (!item.faceUp) return;
	if (isdef(texture) || lookup(item, ['live', 'dCover'])) {
		face_down_alt(item, color, texture);
	} else {
		let svgCode = C52.card_2B;
		item.div.innerHTML = svgCode;
		if (nundef(color)) color = item.color;
		if (isdef(item.color)) item.div.children[0].children[1].setAttribute('fill', item.color);
	}
	item.faceUp = false;
}
function face_down_alt(item, bg, texture_name) {
	let dCover = item.live.dCover;
	if (nundef(dCover)) {
		let d = iDiv(item);
		dCover = item.live.dCover = mDiv(d, { background: bg, rounding: mGetStyle(d, 'rounding'), position: 'absolute', width: '100%', height: '100%', left: 0, top: 0 });
		let t = get_texture(texture_name);
		dCover.style.backgroundImage = t;
		dCover.style.backgroundRepeat = 'repeat';
	} else mStyle(dCover, { display: 'block' });
}
function face_up(item) {
	if (item.faceUp) return;
	if (lookup(item, ['live', 'dCover'])) mStyle(item.live.dCover, { display: 'none' });
	else item.div.innerHTML = isdef(item.c52key) ? C52[item.c52key] : item.html;
	item.faceUp = true;
}
function toggle_face(item) { if (item.faceUp) face_down(item); else face_up(item); }
//#endregion card (cards)

//#region ui (cards)
function ui_type_building(b, dParent, styles = {}, path = 'farm', title = '', get_card_func = ari_get_card, separate_lead = false, ishidden = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);
	let list = b.list;
	let d = mDiv(dParent);
	let items = list.map(x => get_card_func(x));
	reindex_items(items);
	let d_harvest = null;
	if (isdef(b.h)) {
		let keycard = items[0];
		let d = iDiv(keycard);
		mStyle(d, { position: 'relative' });
		d_harvest = mDiv(d, { position: 'absolute', w: 20, h: 20, bg: 'orange', opacity: .5, fg: 'black', top: '45%', left: -10, rounding: '50%', align: 'center' }, null, 'H');
	}
	let d_rumors = null, rumorItems = [];
	if (!isEmpty(b.rumors)) {
		let d = cont;
		mStyle(d, { position: 'relative' });
		d_rumors = mDiv(d, { display: 'flex', gap: 2, position: 'absolute', h: 30, bottom: 0, right: 0 });
		for (const rumor of b.rumors) {
			let dr = mDiv(d_rumors, { h: 24, w: 16, vmargin: 3, align: 'center', bg: 'dimgray', rounding: 2 }, null, 'R');
			rumorItems.push({ div: dr, key: rumor });
		}
	}
	let card = isEmpty(items) ? { w: 1, h: 100, ov: 0 } : items[0];
	let [ov, splay] = separate_lead ? [card.ov * 1.5, 5] : [card.ov, 2];
	mContainerSplay(cardcont, 5, card.w, card.h, items.length, card.ov * 1.5 * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items);
	let uischweine = [];
	for (let i = 1; i < items.length; i++) {
		let item = items[i];
		if (!b.schweine.includes(i)) face_down(item); else add_ui_schwein(item, uischweine);
	}
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
		schweine: uischweine,
		harvest: d_harvest,
		rumors: rumorItems,
		keycard: items[0],
	};
}
function ui_type_church(list, dParent, styles = {}, path = 'trick', title = '', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex' });
	let items = [];
	let n = Z.plorder.length;
	let inc = 90;
	let rotation = n % 2 ? 0 : 90;
	for (const ckey of list) {
		let d = mDiv(cardcont, { origin: 'center', transform: `rotate( ${rotation}deg )`, position: 'absolute', left: 8 });
		let c = get_card_func(ckey);
		if (ckey != arrLast(list)) face_down(c);
		mAppend(d, iDiv(c));
		remove_card_shadow(c);
		let item = { card: c, div: d };
		items.push(item);
		rotation += inc;
	}
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	}
}
function ui_type_deck(list, dParent, styles = {}, path = 'deck', title = 'deck', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);
	let items = [];
	ensure_ui(list, cardcont, items, get_card_func);
	ui_add_container_title(title, cont, items, show_if_empty);
	function get_topcard() { return isEmpty(list) ? null : items[0]; }
	function get_bottomcard() { return isEmpty(list) ? null : arrLast(items); }
	function ensure_ui(list, cardcont, items, get_card_func) {
		clearElement(cardcont); arrClear(items); if (isEmpty(list)) return;
		let n = Math.min(2, list.length); let ct = get_card_func(list[0]); items.push(ct); if (n > 1) { let cb = get_card_func(arrLast(list)); items.push(cb); }
		mStyle(cardcont, { position: 'relative', wmin: ct.w + 8, hmin: ct.h });
		for (let i = items.length - 1; i >= 0; i--) { let x = items[i]; face_down(x); mAppend(cardcont, iDiv(x)); mStyle(iDiv(x), { position: 'absolute', top: 0, left: 0 }) }
		mText(list.length, iDiv(ct), { position: 'absolute', left: list.length >= 100 ? '10%' : '25%', top: 10, fz: ct.h / 3 });
	}
	return {
		ctype: 'deck',
		container: cont,
		cardcontainer: cardcont,
		items: items,
		list: list,
		title: title,
		path: path,
		func: get_card_func,
		get_topcard: get_topcard,
		get_bottomcard: get_bottomcard,
		get_card_func: get_card_func,
		renew: ensure_ui,
	};
}
function ui_type_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let items = list.map(x => get_card_func(x));
	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: Config.ui.card.h, ov: 0 } : items[0];
	let splay = 2;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
	};
}
function ui_type_lead_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {
	let hcard = isdef(styles.h) ? styles.h - 30 : Config.ui.card.h;
	addKeys(get_container_styles(styles), styles);
	let cont = ui_make_container(dParent, styles);
	let items = list.map(x => get_card_func(x, hcard));
	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: hcard, ov: 0 } : items[0];
	let splay = 5;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
	};
}
function ui_type_market(list, dParent, styles = {}, path = 'market', title = 'market', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex', gap: 2 });
	let items = list.map(x => get_card_func(x));
	items.map(x => mAppend(cardcont, iDiv(x)));
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		ctype: 'market',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	};
}
function ui_type_rank_count(list, dParent, styles, path, title, get_card_func, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex' });
	let items = [];
	for (const o of list) {
		let d = mDiv(cardcont, { display: 'flex', dir: 'c', padding: 1, fz: 12, align: 'center', position: 'relative' });
		let c = get_card_func(o.key);
		mAppend(d, iDiv(c));
		remove_card_shadow(c);
		d.innerHTML += `<span style="font-weight:bold">${o.count}</span>`;
		let item = { card: c, count: o.count, div: d };
		items.push(item);
	}
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	}
}
//#endregion ui (cards)

//#region helpers (cards)
function aggregate_player_hands_by_rank(fen) {
	let di_ranks = {};
	let akku = [];
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		let hand = pl.hand;
		for (const c of hand) {
			akku.push(c);
			let r = c[0];
			if (isdef(di_ranks[r])) di_ranks[r] += 1; else di_ranks[r] = 1;
		}
	}
	fen.akku = akku;
	return di_ranks;
}
function calc_hand_value(hand, card_func = ferro_get_card) {
	let vals = hand.map(x => card_func(x).val);
	let sum = vals.reduce((a, b) => a + b, 0);
	return sum;
}
function create_fen_deck(cardtype, num_decks = 1, num_jokers = 0) {
	let arr = get_keys(C52Cards).map(x => x + cardtype);
	let newarr = [];
	while (num_decks > 0) { newarr = newarr.concat(arr); num_decks--; }
	while (num_jokers > 0) { newarr.push('*H' + cardtype); num_jokers--; }
	return newarr;
}
function find_index_of_jolly(j) { return j.findIndex(x => is_jolly(x)); }
function find_jolly_rank(j, rankstr = 'A23456789TJQKA') {
	let jolly_idx = find_index_of_jolly(j);
	if (jolly_idx == -1) return false;
	if (jolly_idx > 0) {
		let rank_before_index = j[jolly_idx - 1][0];
		let rank_needed = rankstr[rankstr.indexOf(rank_before_index) + 1];
		return rank_needed;
	} else {
		let rank_after_index = j[jolly_idx + 1][0];
		let rank_needed = rank_after_index == 'A' ? 'K' : rankstr[rankstr.indexOf(rank_after_index) - 1];
		return rank_needed;
	}
}
function get_container_styles(styles = {}) { let defaults = valf(Config.ui.container, {}); defaults.position = 'relative'; addKeys(defaults, styles); return styles; }
function get_containertitle_styles(styles = {}) { let defaults = valf(Config.ui.containertitle, {}); defaults.position = 'absolute'; addKeys(defaults, styles); return styles; }
function get_group_rank(j) { let non_jolly_key = firstCond(j, x => !is_jolly(x)); return non_jolly_key[0]; }
function get_joker_info() {
	return {
		c52key: `card_0J`, //'card_1J', //`card_${1+n%2}`,
		color: "#e6194B",
		friendly: "Joker",
		key: '*Hn',
		h: 100,
		irank: 14,
		isort: 100,
		isuit: 3,
		ov: 0.25,
		rank: "*",
		short: "J",
		suit: "H",
		sz: 100,
		val: 1,
		w: 70,
	};
}
function get_sequence_suit(j) { let non_jolly_key = firstCond(j, x => !is_jolly(x)); return non_jolly_key[1]; }
function has_at_most_n_jolly(j, n = 1) { return j.filter(x => is_jolly(x)).length <= n; }
function has_jolly(j) { return firstCond(j, x => is_jolly(x)); }
function is_card_key(ckey, rankstr = '*A23456789TJQK', suitstr = 'SHCD') { return rankstr.includes(ckey[0]) && suitstr.includes(ckey[1]); }
function is_joker(card) { return is_jolly(card.key); }
function is_jolly(ckey) { return ckey[0] == '*'; }
function is_overlapping_set(cards, max_jollies_allowed = 1, seqlen = 7, group_same_suit_allowed = true) {
	let istart = 0;
	let inextstart = 0;
	let lmin = 3;
	let legal = true;
	if (cards.length < lmin) return false;
	while (legal && istart <= cards.length - lmin) {
		let cl = cards.slice(istart, istart + lmin);
		let set = ferro_is_set(cl, max_jollies_allowed, seqlen, group_same_suit_allowed);
		if (set) { istart++; inextstart = Math.min(istart + lmin, cards.length - 3); }
		else if (!set && inextstart == istart) return false;
		else istart++;
	}
	return cards.map(x => x.key);
}
function jolly_matches(key, j, rankstr = 'A23456789TJQKA') {
	let jolly_idx = find_index_of_jolly(j);
	if (jolly_idx == -1) return false;
	if (is_group(j)) {
		let r = get_group_rank(j);
		if (key[0] == r) return true;
	} else if (jolly_idx > 0) {
		let rank_before_index = j[jolly_idx - 1][0];
		let suit_needed = j[jolly_idx - 1][1];
		let rank_needed = rankstr[rankstr.indexOf(rank_before_index) + 1];
		if (key[0] == rank_needed && key[1] == suit_needed) return true;
	} else {
		let rank_after_index = j[jolly_idx + 1][0];
		let suit_needed = j[jolly_idx + 1][1];
		let rank_needed = rank_after_index == 'A' ? 'K' : rankstr[rankstr.indexOf(rank_after_index) - 1];
		if (key[0] == rank_needed && key[1] == suit_needed) return true;
	}
	return false;
}
function pop_top(o) {
	if (isEmpty(o.list)) return null;
	let t = o.get_topcard();
	o.list.shift();
	o.renew(o.list, o.cardcontainer, o.items, o.get_card_func);
	return t;
}
function remove_card_shadow(c) { iDiv(c).firstChild.setAttribute('class', null); }
function replace_jolly(key, j) {
	let jolly_idx = find_index_of_jolly(j);
	j[jolly_idx] = key;
}
function set_card_border(item, thickness = 1, color = 'black', dasharray) {
	let d = iDiv(item);
	let rect = lastDescendantOfType('rect', d);
	assertion(rect, 'NO RECT FOUND IN ELEM', d);
	if (rect) {
		rect.setAttribute('stroke-width', thickness);
		rect.setAttribute('stroke', color);
		if (isdef(dasharray)) rect.setAttribute('stroke-dasharray', dasharray);
	}
}
function set_card_style(item, styles = {}, className) {
	console.log('set_card_style', item, styles);
	let d = iDiv(item);
	let svg = findDescendantOfType('svg', d);
	let rect = findDescendantOfType('rect', svg);
	if (isdef(styles.shadow)) {
		let shadow = styles.shadow;
		delete styles.shadow;
		let hexcolor = colorFrom(styles.shadow);
		svg.style.filter = `drop-shadow(4px 5px 2px ${hexcolor})`;
	}
	if (isdef(styles.bg)) {
		let hexcolor = colorFrom(styles.bg);
		rect.setAttribute('stroke-width', 14); rect.setAttribute('stroke', hexcolor);
	}
	assertion(rect, 'NO RECT FOUND IN ELEM', d);
	mStyle(d, styles);
	if (isdef(className)) mClass(svg, className);
}
function set_card_style_works(c, styles, className) {
	let d = iDiv(c);
	mStyle(d, styles);
	d.firstChild.setAttribute('class', className);
}
function sort_cards(hand, bySuit = true, suits = 'CDHS', byRank = true, rankstr = '23456789TJQKA') {
	if (bySuit && byRank) {
		let buckets = arrBuckets(hand, x => x[1], suits);
		for (const b of buckets) { sort_cards(b.list, false, null, true, rankstr); }
		hand.length = 0; buckets.map(x => x.list.map(y => hand.push(y)));
	} else if (bySuit) hand.sort((a, b) => suits.indexOf(a[1]) - suits.indexOf(b[1]));
	else if (byRank) hand.sort((a, b) => rankstr.indexOf(a[0]) - rankstr.indexOf(b[0]));
	return hand;
}
function sortByRank(ckeys, rankstr = '23456789TJQKA') {
	let ranks = toLetters(rankstr);
	ckeys.sort((a, b) => ranks.indexOf(a[0]) - ranks.indexOf(b[0]));
	return ckeys;
}
function sortCardItemsByRank(items, rankstr = '23456789TJQKA') {
	let ranks = toLetters(rankstr);
	items.sort((a, b) => ranks.indexOf(a.key[0]) - ranks.indexOf(b.key[0]));
	return items;
}
function sortCardItemsBySuit(items, suitstr = 'CDSH') {
	let ranks = toLetters(suitstr);
	items.sort((a, b) => ranks.indexOf(a.key[1]) - ranks.indexOf(b.key[1]));
	return items;
}
function sortCardItemsToSequence(items, rankstr = '23456789TJQKA', jolly_allowed = 1) {
	let ranks = toLetters(rankstr);
	let n = items.length;
	let jollies = items.filter(x => is_joker(x));
	if (jollies.length > jolly_allowed) { return null; }
	let no_jolly = items.filter(x => !is_joker(x));
	let sorted = sortCardItemsByRank(no_jolly, rankstr);
	let partial_sequences = [], seq = [sorted[0]], first, second;
	for (let i = 0; i < sorted.length - 1; i++) {
		first = sorted[i];
		second = sorted[i + 1];
		diff = second.irank - first.irank;
		if (diff == 1) { seq.push(second); }
		else {
			partial_sequences.push({ seq: seq, len: seq.length, diff_to_next: diff });
			seq = [second];
		}
	}
	diff = sorted[0].irank - (sorted[sorted.length - 1].irank - rankstr.length)
	if (!isEmpty(seq)) {
		partial_sequences.push({ seq: seq, len: seq.length, diff_to_next: diff });
	} else {
		arrLast(partial_sequences).diff_to_next = diff;
	}
	let i_max_diff = partial_sequences.findIndex(x => x.diff_to_next == Math.max(...partial_sequences.map(x => x.diff_to_next)));
	let max_diff = partial_sequences[i_max_diff].diff_to_next;
	let istart = (i_max_diff + 1) % partial_sequences.length;
	let final_sequence = [];
	let jollies_needed = 0;
	let len = partial_sequences.length;
	let ij = 0;
	for (let i = 0; i < len; i++) {
		let index = (i + istart) % len;
		let list = partial_sequences[index].seq;
		final_sequence = final_sequence.concat(list);
		let nj = partial_sequences[index].diff_to_next - 1;
		if (i < len - 1) {
			for (let j = 0; j < nj; j++) { final_sequence.push(jollies[ij++]); }
			jollies_needed += nj;
		}
	}
	for (let i = 0; i < final_sequence.length; i++) { items[i] = final_sequence[i]; }
	return jollies_needed;
}
function spread_hand(path, ov) {
	let hand = lookup(UI, path.split('.'));
	assertion(hand, 'hand does NOT exist', path);
	if (hand.ctype != 'hand') return;
	if (isEmpty(hand.items)) return;
	let card = hand.items[0];
	if (nundef(ov)) ov = card.ov;
	if (hand.ov == ov) return;
	hand.ov = ov;
	let cont = hand.cardcontainer;
	let items = hand.items;
	mContainerSplay(cont, hand.splay, card.w, card.h, items.length, ov * card.w);
}
function symbolcolor(card, color) {
	let d = iDiv(card);
	let els = d.getElementsByTagName('symbol');
	console.log('list', els)
	for (const el of els) {
		let html = el.innerHTML;
		let html1 = replaceAll(html, 'red', color);
		let html2 = replaceAll(html1, 'black', color);
		el.innerHTML = html2;
	}
}
function ui_add_cards_to_deck_container(cont, items, list) {
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 4, Card.ovdeck);
		face_down(item);
	}
	return items[0];
}
function ui_add_cards_to_hand_container(cont, items, list) {
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 2, Card.ovw);
	}
}
function ui_add_container_title(title, cont, items, show_if_empty) {
	if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
		let st = get_containertitle_styles();
		let stmeasure = jsCopy(st); delete stmeasure.position;
		let elem = mText(title, cont, stmeasure);
		let sz = getSizeNeeded(elem);
		let offsetx = valf(st.left, 0);
		let cont_wmin = mGetStyle(cont, 'wmin');
		let my_min = sz.w + offsetx * 1.5;
		let wmin = !isNumber(cont_wmin) ? my_min : Math.max(valf(cont_wmin, 0), my_min);
		mStyle(cont, { wmin: wmin });
		mStyle(elem, st);
	}
}
function ui_make_container(dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	return d;
}
function ui_make_deck_container(list, dParent, styles = { bg: 'random', padding: 10 }, get_card_func) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	if (isEmpty(list)) return d;
	let c = get_card_func(list[0]);
	mContainerSplay(d, 4, c.w, c.h, n, 0);
	return d;
}
function ui_make_hand_container(items, dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	if (!isEmpty(items)) {
		let card = items[0];
		mContainerSplay(d, 2, card.w, card.h, items.length, card.ov * card.w);
	}
	return d;
}
//#endregion helpers (cards)


//#region history (gamehelpers)
function HPLayout() {
	if (isdef(UI.DRR)) UI.DRR.remove();
	mInsert(UI.dRechts, UI.dHistory);
	Clientdata.historyLayout = 'hp';
}
function HRPLayout() {
	let dr = UI.dRechts;
	dr.remove();
	let drr = UI.DRR = mDiv(dTable);
	mAppend(drr, UI.dHistory);
	mAppend(dTable, dr);
	Clientdata.historyLayout = 'hrp';
}
function PHLayout() {
	if (isdef(UI.DRR)) UI.DRR.remove();
	mAppend(UI.dRechts, UI.dHistory);
	Clientdata.historyLayout = 'ph';
}
function PRHLayout() {
	let drr = UI.DRR = mDiv(dTable);
	mAppend(drr, UI.dHistory);
	Clientdata.historyLayout = 'prh';
}
//#endregion history (gamehelpers)

//#region misc (gamehelpers)
function show_playerdatastate() {
	for (const pldata of Z.playerdata) {
		console.log('player', pldata.name, `status=${isEmpty(pldata.player_status) ? 'none' : pldata.player_status}`, pldata.state);
	}
}
function shuffletest(list) {
	for (let i = 0; i < 100; i++) {
		shuffle(list);
		console.log('shuffle: ' + jsCopy(list));
	}
}
function sss() { show_playerdatastate(); }
function sss1() {
	let [fen, A, uplayer, plorder, data] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.uplayer_data];
	let s = 'no data.state for player ' + uplayer;
	if (isDict(data.state)) {
		s = `${uplayer} passes `;
		for (const k in data.state.di) {
			s += `${k} ${data.state.di[k]}, `;
		}
	}
	console.log(s);
}
//#endregion misc (gamehelpers)

//#region title (gamehelpers)
function animatedTitle(msg = 'DU BIST DRAN!!!!!') {
	TO.titleInterval = setInterval(() => {
		let corner = CORNERS[WhichCorner++ % CORNERS.length];
		document.title = `${corner} ${msg}`; //'⌞&amp;21543;    U+231E \0xE2Fo\u0027o Bar';
	}, 1000);
}
function staticTitle() {
	clearInterval(TO.titleInterval);
	let url = window.location.href;
	let loc = url.includes('telecave') ? 'telecave' : 'local';
	let game = isdef(Z) ? stringAfter(Z.friendly, 'of ') : '♠ GAMES ♠';
	document.title = `(${loc}) ${game}`;
}
//#endregion title (gamehelpers)

//#region uname (gamehelpers)
function activate_playerstats(items) {
	let fen = Z.fen;
	for (const plname in fen.players) {
		let ui = items[plname];
		let d = iDiv(ui);
		d.onclick = () => { switch_uname(plname); onclick_reload(); }
	}
}
function activate_ui() {
	if (uiActivated) { DA.ai_is_moving = false; return; }
	uiActivated = true; DA.ai_is_moving = false;
}
function animate_card_approx(card, goal, ms, callback) {
	let d = iDiv(card);
	let dgoal = iDiv(goal);
	let r = getRect(d);
	let rgoal = getRect(dgoal);
	let c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
	let cgoal = { x: rgoal.x + rgoal.w / 2, y: rgoal.y + rgoal.h / 2 };
	let v = { x: cgoal.x - c.x, y: cgoal.y - c.y };
	mAnimateList(d, { transform: `translateX(${v.x}px) translateY(${v.y}px)`, opacity: 0 }, callback, ms, 'linear');
}
function animate_card_exchange(i0, i1, callback) {
	ari_make_unselectable(i0);
	ari_make_unselectable(i1);
	let d0 = iDiv(i0.o);
	let d1 = iDiv(i1.o);
	let r0 = getRect(d0);
	let r1 = getRect(d1);
	let c0 = { x: r0.x + r0.w / 2, y: r0.y + r0.h / 2 };
	let c1 = { x: r1.x + r1.w / 2, y: r1.y + r1.h / 2 };
	let v = { x: c1.x - c0.x, y: c1.y - c0.y };
	mTranslateBy(d0, v.x, v.y);
	mTranslateBy(d1, -v.x, -v.y, 700, callback);
}
function animate_card_transfer(card, goal, callback) {
	let d = iDiv(card);
	let dgoal = iDiv(goal);
	let r = getRect(d);
	let rgoal = getRect(dgoal);
	let c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
	let cgoal = { x: rgoal.x + rgoal.w / 2, y: rgoal.y + rgoal.h / 2 };
	let v = { x: cgoal.x - c.x, y: cgoal.y - c.y };
	mTranslateBy(d, v.x, v.y, 700, callback);
}
function animate_title() {
	var rev = "fwd";
	function titlebar(val) {
		var msg = "Hallodi!";
		var res = " ";
		var speed = 100;
		var pos = val;
		msg = "   |-" + msg + "-|";
		var le = msg.length;
		if (rev == "fwd") {
			if (pos < le) {
				pos = pos + 1;
				scroll = msg.substr(0, pos);
				document.title = scroll;
				timer = window.setTimeout("titlebar(" + pos + ")", speed);
			}
			else {
				rev = "bwd";
				timer = window.setTimeout("titlebar(" + pos + ")", speed);
			}
		}
		else {
			if (pos > 0) {
				pos = pos - 1;
				var ale = le - pos;
				scrol = msg.substr(ale, le);
				document.title = scrol;
				timer = window.setTimeout("titlebar(" + pos + ")", speed);
			}
			else {
				rev = "fwd";
				timer = window.setTimeout("titlebar(" + pos + ")", speed);
			}
		}
	}
	titlebar(0);
}
function ari_show_handsorting_buttons_for(plname) {
	if (Z.role == 'spectator' || isdef(mBy('dHandButtons'))) return;
	let fen = Z.fen;
	let pl = fen.players[plname];
	if (pl.hand.length <= 1) return;
	let d = UI.players[plname].hand.container; mStyle(d, { position: 'relative' });
	let dHandButtons = mDiv(d, { position: 'absolute', bottom: -2, left: 52, height: 25 }, 'dHandButtons');
	show_player_button('sort', dHandButtons, onclick_by_rank);
}
function arrNext(list, el) {
	let iturn = list.indexOf(el);
	let nextplayer = list[(iturn + 1) % list.length];
	return nextplayer;
}
function arrPrev(list, el) {
	let iturn = list.indexOf(el);
	if (iturn == 0) iturn = list.length;
	let nextplayer = list[(iturn - 1) % list.length];
	return nextplayer;
}
function beautify_history(lines, title, fen, uplayer) {
	let html = `<div class="history"><span style="color:red;font-weight:bold;">${title}: </span>`;
	for (const l of lines) {
		let words = toWords(l);
		for (const w1 of words) {
			if (is_card_key(w1)) {
				html += mCardText(w1);
				continue;
			}
			w = w1.toLowerCase();
			if (isdef(fen.players[w])) {
				html += `<span style="color:${get_user_color(w)};font-weight:bold"> ${w} </span>`;
			} else html += ` ${w} `;
		}
	}
	html += "</div>";
	return html;
}
function clear_status() { if (nundef(mBy('dStatus'))) return; clearTimeout(TO.fleeting); mRemove("dStatus"); }
function clear_title() { mClear('dTitleMiddle'); mClear('dTitleLeft'); mClear('dTitleRight'); }
function collect_game_specific_options(game) {
	let poss = Config.games[game].options;
	if (nundef(poss)) return;
	let di = {};
	for (const p in poss) {
		let fs = mBy(`d_${p}`);
		let val = get_checked_radios(fs)[0];
		di[p] = isNumber(val) ? Number(val) : val;
	}
	return di;
}
function compute_hidden(plname) {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[plname];
	let hidden;
	if (isdef(fen.winners)) hidden = false;
	else if (Z.role == 'spectator') hidden = plname != uplayer;
	else if (Z.mode == 'hotseat') hidden = (pl.playmode == 'bot' || plname != uplayer);
	else hidden = plname != Z.uname;
	return hidden;
}
function deactivate_ui() { uiActivated = false; DA.ai_is_moving = true; }
function delete_table(friendly) { stop_game(); phpPost({ friendly: friendly }, 'delete_table'); }
function ev_to_gname(ev) { evNoBubble(ev); return evToTargetAttribute(ev, 'gamename'); }
function find_card(index, ui_item) { return ui_item.items[index]; }
function generate_table_name(n) {
	let existing = Serverdata.tables.map(x => x.friendly);
	while (true) {
		let cap = rChoose(Info.capital);
		let parts = cap.split(' ');
		if (parts.length == 2) cap = stringBefore(cap, ' '); else cap = stringBefore(cap, '-');
		cap = cap.trim();
		let s = (n == 2 ? 'duel of ' : rChoose(['battle of ', 'war of '])) + cap;
		if (!existing.includes(s)) return s;
	}
}
function get_admin_player(list) {
	let res = valf(firstCond(list, x => x == 'mimi'), firstCond(list, x => ['felix', 'amanda', 'lauren'].includes(x)));
	return res ?? list[0];
}
function get_checked_radios(rg) {
	let inputs = rg.getElementsByTagName('INPUT');
	let list = [];
	for (const ch of inputs) {
		let checked = ch.getAttribute('checked');
		if (ch.checked) list.push(ch.value);
	}
	return list;
}
function get_default_options(gamename) {
	let options = {};
	for (const k in Config.games[gamename].options) options[k] = arrLast(Config.games[gamename].options[k]);
	return options;
}
function get_game_color(game) { return colorFrom(Config.games[game].color); }
function get_img_html(path, styles, classes) {
	let img = mImage(path, null, styles, classes);
	let x = img.outerHTML;
	return img.outerHTML;
}
function get_logout_button() {
	let html = `<a id="aLogout" href="javascript:onclick_logout()">logout</a>`;
	return mCreateFrom(html);
}
function get_multi_trigger() { return lookup(Z, ['fen', 'trigger']); }
function get_next_human_player(plname) {
	if (nundef(plname)) return null;
	let [prevturn, mode, turn, uname, plorder, fen, host] = [Z.prev.turn, Z.mode, Z.turn, Z.uname, Z.plorder, Z.fen, Z.host];
	let same = isString(plname) && isList(prevturn) && sameList(prevturn, turn);
	if (!same) return null;
	let plnew = get_next_player(Z, plname);
	while (fen.players[plnew].playmode == 'bot') {
		plnew = get_next_player(Z, plnew);
		if (plnew == plname) break;
	}
	return plnew;
}
function get_next_player(g, uname) {
	let plorder = g.fen.plorder;
	let iturn = plorder.indexOf(uname);
	let nextplayer = plorder[(iturn + 1) % plorder.length];
	return nextplayer;
}
function get_playmode(uname) { return Z.fen.players[uname].playmode; }
function get_present_order() {
	let [fen, uplayer, uname] = [Z.fen, Z.uplayer, Z.uname];
	let uname_plays = fen.plorder.includes(Z.uname);
	let show_first = uname_plays && Z.mode == 'multi' ? Z.uname : uplayer;
	return arrCycle(Z.fen.plorder, Z.fen.plorder.indexOf(show_first));
}
function get_screen_distance(child, newParent) {
	child = toElem(child);
	newParent = toElem(newParent);
	const parentOriginal = child.parentNode;
	let children = arrChildren(parentOriginal);
	let iChild = children.indexOf(child);
	let sibling = iChild == children.length - 1 ? null : children[iChild + 1];
	const x0 = child.getBoundingClientRect().left;
	const y0 = child.getBoundingClientRect().top;
	newParent.appendChild(child);
	const x1 = child.getBoundingClientRect().left;
	const y1 = child.getBoundingClientRect().top;
	if (sibling) parentOriginal.insertBefore(child, sibling); else parentOriginal.appendChild(child);
	return [x1 - x0, y1 - y0];
}
function get_texture(name) { return `url(../base/assets/textures/${name}.png)`; }
function get_user_color(uname) { let u = firstCond(Serverdata.users, x => x.name == uname); return colorFrom(u.color); }
function get_user_pic(uname, sz = 50, border = 'solid medium white') {
	let html = get_user_pic_html(uname, sz, border);
	return mCreateFrom(html);
}
function get_user_pic_and_name(uname, dParent, sz = 50, border = 'solid medium white') {
	let html = `
      <div username='${uname}' style='text-align:center;font-size:${sz / 2.8}px'>
        <img src='../base/assets/users/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='margin:0;border:${border}'>
        <div style='margin-top:${-sz / 6}px'>${uname}</div>
      </div>`;
	let elem = mCreateFrom(html);
	mAppend(dParent, elem);
	return elem;
}
function get_user_pic_html(uname, sz = 50, border = 'solid medium white') {
	return `<img src='../base/assets/users/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='margin:0px 4px;border:${border}'>`
}
function get_waiting_html(sz = 30) { return `<img src="../base/assets/icons/active_player.gif" height="${sz}" style="margin:0px ${sz / 3}px" />`; }
function hFunc(content, funcname, arg1, arg2, arg3) {
	let html = `<a style='color:blue' href="javascript:${funcname}('${arg1}','${arg2}','${arg3}');">${content}</a>`;
	return html;
}
function hide_buildings() {
	let uplayer = Z.uplayer;
	let buildings = UI.players[uplayer].buildinglist;
	for (const b of buildings) {
		for (let i = 1; i < b.items.length; i++) {
			let card = b.items[i];
			if (b.schweine.includes(card)) continue;
			face_down(b.items[i]);
		}
	}
}
function i_am_acting_host() { return U.name == Z.fen.acting_host; }
function i_am_host() { return U.name == Z.host; }
function i_am_trigger() { return is_multi_trigger(U.name); }
function if_hotseat_autoswitch(result) {
	if (isdef(result.table) && isdef(Z) && Z.mode == 'hotseat') {
		let turn = lookup(result, ['table', 'fen', 'turn']);
		assertion(isdef(turn), 'turn is NOT defined (_sendSIMSIM) !!!!');
		let uname = turn.length == 1 ? turn[0] : arrNext(turn, U.name);
		if (uname != U.name) switch_uname(uname);
	}
}
function is_advanced_user() {
	let advancedUsers = ['mimi', 'bob', 'buddy', 'minnow', 'nimble', 'leo'];
	return isdef(U) && ((advancedUsers.includes(DA.secretuser) || advancedUsers.includes(U.name)));
}
function is_collect_mode() { return Z.turn.length > 1; }
function is_just_my_turn() {
	return isEmpty(Z.turn.filter(x => x != Z.uplayer));
}
function is_multi_stage() { return isdef(Z.fen.trigger); }
function is_multi_trigger(plname) { return lookup(Z, ['fen', 'trigger']) == plname; }
function is_playerdata_set(plname) {
	return isdef(Z.playerdata) && !isEmpty(Z.playerdata) && !isEmpty(Z.playerdata.find(x => x.name == plname).state);
}
function is_playing(pl, fen) {
	return isList(fen.plorder) && fen.plorder.includes(pl) || isList(fen.roundorder) && fen.roundorder.includes(pl) || Z.game == 'feedback' && isdef(Z.fen.players[pl]);
}
function is_shield_mode() {
	return Z.role == 'spectator'
		|| Z.mode == 'multi' && Z.role == 'inactive' && Z.host != Z.uname
		|| Z.mode == 'multi' && Z.role == 'inactive' && Z.pl.playmode != 'bot'
}
function new_cards_animation(n = 2) {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];
	if (stage == 'card_selection' && !isEmpty(pl.newcards)) {
		let anim_elems = [];
		for (const key of pl.newcards) {
			let ui = lastCond(UI.players[uplayer].hand.items, x => x.key == key);
			if (nundef(ui)) { pl.newcards = []; return; }
			ui = iDiv(ui);
			anim_elems.push(ui);
		}
		delete pl.newcards;
		anim_elems.map(x => mPulse(x, n * 1000));
	}
}
function path2fen(fen, path) { let o = lookup(fen, path.split('.')); return o; }
function path2UI(path) {
	let res = lookup(UI, path.split('.'));
	return res;
}
function player_stat_count(key, n, dParent, styles = {}) {
	let sz = valf(styles.sz, 16);
	addKeys({ display: 'flex', margin: 4, dir: 'column', hmax: 2 * sz, 'align-content': 'start', fz: sz, align: 'center' }, styles);
	let d = mDiv(dParent, styles);
	if (isdef(Syms[key])) mSym(key, d, { h: sz, 'line-height': sz, w: '100%' });
	else mText(key, d, { h: sz, fz: sz, w: '100%' });
	d.innerHTML += `<span style="font-weight:bold">${n}</span>`;
	return d;
}
function remove_hourglass(uname) { let d = mBy(`dh_${uname}`); if (isdef(d)) mRemove(d); }
function remove_player(fen, uname) {
	if (nundef(fen.original_players)) fen.original_players = jsCopy(fen.players);
	removeInPlace(fen.plorder, uname);
	delete fen.players[uname];
	return fen.plorder;
}
function round_change_animation(n = 2) {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];
	if (pl.roundchange) {
		let d = mBy('dTitleLeft');
		mStyle(d, { 'transform-origin': '0% 0%' });
		mPulse(d, n * 1000);
		show_special_message(`${fen.round_winner} won round ${Z.round - 1}!!!`)
		delete pl.roundchange;
	}
}
function set_player(name, fen) {
	if (isdef(PL) && PL.name != name) { Z.prev.pl = PL; Z.prev.uplayer = PL.name; }
	PL = Z.pl = firstCond(Serverdata.users, x => x.name == name);
	copyKeys(fen.players[name], PL);
	Z.uplayer = name;
}
function set_player_strategy(val) {
	Z.strategy = Clientdata.strategy = Z.pl.strategy = val;
	mRemove('dOptions')
}
function set_user(name) {
	if (isdef(Z) && isdef(U) && U.name != name) {
		Z.prev.u = U;
		Z.prev.uname = U.name;
	}
	U = firstCond(Serverdata.users, x => x.name == name);
	if (isdef(Z)) {
		Z.u = U;
		Z.uname = Z.uplayer = name;
	}
}
function shield_off() {
	mStyle('dAdmin', { bg: 'white' });
}
function shield_on() {
	mShield(dTable.firstChild.childNodes[1]);
	mStyle('dAdmin', { bg: 'silver' });
}
function show_admin_ui() {
	for (const id of ['bSpotitStart', 'bClearAck', 'bRandomMove', 'bSkipPlayer', 'bRestartMove']) hide(id);
	if (Z.game == 'spotit' && Z.uname == Z.host && Z.stage == 'init') show('bSpotitStart');
	else if (Z.game == 'bluff' && Z.uname == Z.host && Z.stage == 1) show('bClearAck');
	else if (Z.uname == Z.host && Z.stage == 'round_end') show('bClearAck');
	else if (Z.game == 'ferro' && Z.uname == 'mimi' && Z.stage != 'card_selection') show('bClearAck');
	if (['ferro', 'bluff', 'aristo', 'a_game'].includes(Z.game) && (Z.role == 'active' || Z.mode == 'hotseat')) {
		show('bRandomMove');
	}
	if (Z.uname == Z.host || Z.uname == 'mimi') show('dHostButtons'); else hide('dHostButtons');
	if (DA.TEST0 == true) show('dTestButtons'); else hide('dTestButtons');
}
function show_fleeting_message(s, dParent, styles, id, ms = 2000) {
	let d = mDiv(dParent, styles, id, s);
	mFadeRemove(d, ms);
}
function show_game_options(dParent, game) {
	mRemoveChildrenFromIndex(dParent, 2);
	let poss = Config.games[game].options;
	if (nundef(poss)) return;
	for (const p in poss) {
		let key = p;
		let val = poss[p];
		if (isString(val)) {
			let list = val.split(',');
			let fs = mRadioGroup(dParent, {}, `d_${key}`, key);
			for (const v of list) { mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, null, key, true); }
			measure_fieldset(fs);
		}
	}
}
function show_games(ms = 500) {
	let dParent = mBy('dGames');
	mClear(dParent);
	mText(`<h2>start new game</h2>`, dParent, { maleft: 12 });
	let d = mDiv(dParent, { fg: 'white', animation: 'appear 1s ease both' }, 'game_menu');
	mCenterFlex(d);
	let gamelist = 'aristo bluff spotit ferro fritz'; if (DA.TEST0) gamelist += ' a_game';
	for (const g of dict2list(Config.games)) {
		if (gamelist.includes(g.id)) {
			let [sym, bg, color, id] = [Syms[g.logo], g.color, null, getUID()];
			let d1 = mDiv(d, { cursor: 'pointer', rounding: 10, margin: 10, vpadding: 15, wmin: 140, bg: bg, position: 'relative' }, g.id);
			d1.setAttribute('gamename', g.id);
			d1.onclick = onclick_game_menu_item;
			mCenterFlex(d1);
			mDiv(d1, { fz: 50, family: sym.family, 'line-height': 55 }, null, sym.text);
			mLinebreak(d1);
			mDiv(d1, { fz: 18, align: 'center' }, null, g.friendly);
		}
	}
}
function show_handsorting_buttons_for(plname, styles = {}) {
	if (Z.role == 'spectator' || isdef(mBy('dHandButtons'))) return;
	let fen = Z.fen;
	let pl = fen.players[plname];
	if (pl.hand.length <= 1) return;
	let d = UI.players[plname].hand.container; mStyle(d, { position: 'relative', wmin: 155 });
	addKeys({ position: 'absolute', left: 58, bottom: -8, height: 25 }, styles);
	let dHandButtons = mDiv(d, styles, 'dHandButtons');
	show_player_button('rank', dHandButtons, onclick_by_rank);
	show_player_button('suit', dHandButtons, onclick_by_suit);
}
function show_history(fen, dParent) {
	if (!isEmpty(fen.history)) {
		let html = '';
		for (const o of jsCopy(fen.history).reverse()) {
			html += beautify_history(o.lines, o.title, fen);
		}
		let dHistory = mDiv(dParent, { paleft: 12, bg: colorLight('#EDC690', .5), box: true, matop: 4, rounding: 10, patop: 10, pabottom: 10, w: '100%', hmax: `calc( 100vh - 250px )`, 'overflow-y': 'auto', w: 260 }, null, html);
		UI.dHistoryParent = dParent;
		UI.dHistory = dHistory;
		if (isdef(Clientdata.historyLayout)) {
			show_history_layout(Clientdata.historyLayout);
		}
	}
}
function show_history_layout(layout) {
	assertion(isdef(UI.dHistoryParent) && isdef(UI.dHistory), 'UI.dHistoryParent && UI.dHistory do NOT exist!!!');
	if (layout == 'ph') PHLayout();
	else if (layout == 'hp') HPLayout();
	else if (layout == 'prh') PRHLayout();
	else if (layout == 'hrp') HRPLayout();
	else PHLayout();
}
function show_history_popup() {
	if (isEmpty(Z.fen.history)) return;
	assertion(isdef(UI.dHistoryParent) && isdef(UI.dHistory), 'UI.dHistoryParent && UI.dHistory do NOT exist!!!');
	let l = valf(Clientdata.historyLayout, 'ph');
	let cycle = ['ph', 'hp', 'prh', 'hrp'];
	let i = (cycle.indexOf(l) + 1) % cycle.length;
	show_history_layout(cycle[i]);
}
function show_home_logo() {
	let bg = colorLight();
	let dParent = mBy('dAdminLeft');
	clearElement(dParent);
	let d = miPic('castle', dParent, { cursor: 'pointer', fz: 24, padding: 6, h: 36, box: true, margin: 2 });
	d.onclick = db_load;
	let version = 'v0.0.1';
	let html = `version ${version}`
	mText(html, dParent, { fz: 12 });
}
function show_hourglass(uname, d, sz, stylesPos = {}) {
	let html = get_waiting_html(sz);
	mStyle(d, { position: 'relative' });
	addKeys({ position: 'absolute' }, stylesPos);
	let dw = mDiv(d, stylesPos, `dh_${uname}`, html);
}
function show_instruction(msg) { mBy('dSelections0').innerHTML = msg; }
function show_message(msg = '', stay = false) {
	mStyle(dTable, { transition: 'all 1s ease' });
	let d = mBy('dMessage'); d.innerHTML = msg;
	if (stay) return;
	let ms = 1000, delay = 3000;
	let anim = d.animate([{ transform: `scale(1,1)`, opacity: 1 }, { transform: `scale(1,0)`, opacity: 0 },], { duration: 1000, easing: 'ease', delay: delay });
	dTable.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-56px)' },], { fill: 'none', duration: ms, easing: 'ease', delay: delay });
	anim.onfinish = () => {
		mClear(d);
	}
}
function show_MMM(msg) { show_fleeting_message(msg, mBy('dMMM')); }
function show_options_popup(options) {
	let opresent = {};
	let di = { mode: 'gamemode', yes: true, no: false };
	let keys = get_keys(options);
	keys.sort();
	for (const k of get_keys(options).sort()) {
		let key = valf(di[k], k);
		let val = valf(di[options[k]], options[k]);
		opresent[key] = val;
	}
	let x = mYaml(mCreate('div'), opresent);
	let dpop = mPopup(x.innerHTML, dTable, { fz: 16, fg: 'white', top: 0, right: 0, border: 'white', padding: 10, bg: 'dimgray' }, 'dOptions');
	mInsert(dpop, mCreateFrom(`<div style="text-align:center;width:100%;font-family:Algerian;font-size:22px;">${Z.game}</div>`));
}
function show_player_button(caption, ui_item, handler) {
	let d = ui_item.container ?? iDiv(ui_item);
	let styles = { rounding: 6, bg: 'silver', fg: 'black', border: 0, maleft: 10 };
	let b = mButton(caption, handler, d, styles, 'enabled');
	return b;
}
function show_polling_signal() {
	if (DA.TEST0 != true) return;
	let d1 = mDiv(mBy('dAdmin'), { position: 'fixed', top: 10, left: 73 });
	let bg = Z.skip_presentation == true ? 'grey' : 'green';
	let d2 = mDiv(d1, { width: 20, height: 20, bg: bg, rounding: 10, display: 'inline-block' });
	mFadeRemove(d1, 1000);
}
function show_role() {
	let d = mBy('dAdminMiddle');
	clearElement(d);
	let hotseatplayer = Z.uname != Z.uplayer && Z.mode == 'hotseat' && Z.host == Z.uname;
	let styles, text;
	let boldstyle = { fg: 'red', weight: 'bold', fz: 20 };
	let normalstyle = { fg: 'black', weight: null, fz: null };
	let location = '';
	if (hotseatplayer) {
		styles = boldstyle;
		text = `your turn for ${Z.uplayer}`;
	} else if (Z.role == 'spectator') {
		styles = normalstyle;
		text = `(spectating)`;
	} else if (Z.role == 'active') {
		styles = boldstyle;
		text = `It's your turn!!!`;
	} else if (Z.role == 'waiting') {
		text = `waiting for players to complete their moves...`;
	} else {
		assertion(Z.role == 'inactive', 'role is not active or inactive or spectating ' + Z.role);
		styles = normalstyle;
		text = `(${Z.turn[0]}'s turn)`;
	}
	d.innerHTML = location + text;
	mStyle(d, styles);
}
function show_settings(dParent) {
	let [options, fen, uplayer] = [Z.options, Z.fen, Z.uplayer];
	clearElement(dParent);
	mFlex(dParent);
	mStyle(dParent, { 'justify-content': 'end', gap: 12, paright: 10 })
	let playmode = get_playmode(uplayer);
	let game_mode = Z.mode;
	let st = { fz: 20, padding: 0, h: 40, box: true, matop: 2, rounding: '50%', cursor: 'pointer' };
	let dHistoryButton = miPic('scroll', dParent, st);
	dHistoryButton.onclick = show_history_popup;
	if (isdef(Config.games[Z.game].options.strategy)) {
		let dStrategy = miPic('chess pawn', dParent, st);
		dStrategy.onclick = show_strategy_popup;
	}
	let d = miPic('gear', dParent, st);
	options.playmode = playmode;
	d.onmouseenter = () => show_options_popup(options);
	d.onmouseleave = hide_options_popup;
}
function show_stage() {
	if (isdef(Z.fen.progress)) {
		let d = mBy('dTitleLeft');
		let former = mBy('dProgress');
		if (isdef(former)) former.remove();
		let dprogress = mDiv(d, {}, 'dProgress', `<div>${Z.fen.progress}</div>`);
	}
}
function show_status(s) {
	if (is_advanced_user()) {
		clear_status();
		if (!TESTING && !s.includes('reload')) show_fleeting_message(s, 'dTest', { fz: 14, position: 'absolute', top: 5, right: 10 }, 'dStatus');
	}
}
function show_strategy_popup() {
	let dpop = mPopup('', dTable, { fz: 16, fg: 'white', top: 0, right: 0, border: 'white', padding: 10, bg: 'dimgray' }, 'dOptions');
	mAppend(dpop, mCreateFrom(`<div style="text-align:center;width:100%;font-family:Algerian;font-size:22px;">${Z.game}</div>`));
	mDiv(dpop, { matop: 5, maleft: 10 }, null, `choose strategy:`);
	let vals = Config.games[Z.game].options.strategy.split(',');
	let key = 'strategy';
	let fs = mRadioGroup(dpop, { fg: 'white' }, `d_${key}`);
	for (const v of vals) { mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, set_player_strategy, key, v == Z.strategy); }
	measure_fieldset(fs);
}
function show_tables(ms = 500) {
	clear_screen();
	let dParent = mBy('dTables');
	mClear(dParent);
	show_games();
	let tables = Serverdata.tables;
	if (isEmpty(tables)) { mText('no active game tables', dParent); return []; }
	tables.map(x => x.game_friendly = Config.games[x.game].friendly);
	mText(`<h2>game tables</h2>`, dParent, { maleft: 12 })
	let t = mDataTable(tables, dParent, null, ['friendly', 'game_friendly', 'players'], 'tables', false);
	mTableCommandify(t.rowitems, {
		0: (item, val) => hFunc(val, 'onclick_table', val, item.id),
	});
	let d = iDiv(t);
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		let h = hFunc('delete', 'delete_table', ri.o.friendly);
		c = mAppend(r, mCreate('td'));
		c.innerHTML = h;
	}
}
function show_title() {
	Z.func.state_info(mBy('dTitleLeft'));
	show_settings(mBy('dTitleRight'));
	mBy('dTablename').innerHTML = Z.friendly;
}
function show_username() {
	let uname = U.name;
	let dpic = get_user_pic(uname, 30);
	let d = mBy('dAdminRight');
	mClear(d);
	mAppend(d, get_logout_button());
	mAppend(d, dpic);
	if (is_advanced_user()) { show('dAdvanced1'); } else { hide('dAdvanced'); hide('dAdvanced1'); }
	//console.log('DA.running',DA.running); //'Z',Z,'dTable',dTable,mBy('dTable'),isVisible('dTable'));
	if (!TESTING && !DA.running) phpPost({ app: 'easy' }, 'tables');
}
function show_users(ms = 300) {
	let dParent = mBy('dUsers');
	mClear(dParent);
	for (const u of Serverdata.users) {
		if (['ally', 'bob', 'leo'].includes(u.name)) continue;
		let d = get_user_pic_and_name(u.name, dParent);
		d.onclick = () => onclick_user(u.name);
		mStyle(d, { cursor: 'pointer' });
	}
	mFall(dParent, ms);
}
function show_view_buildings_button(plname) {
	if (Z.role == 'spectator' || isdef(mBy('dPlayerButtons'))) return;
	if (isEmpty(UI.players[plname].buildinglist)) return;
	let d1 = iDiv(UI.players[plname]); mStyle(d1, { position: 'relative' });
	let d2 = mDiv(d1, { position: 'absolute', top: 8, left: 50, height: 25 }, 'dPlayerButtons');
	show_player_button('view buildings', d2, onclick_view_buildings);
}
function show_waiting_for_ack_message() {
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	mBy('dSelections0').innerHTML = 'waiting for next round to start...';
}
function show_waiting_message(msg) {
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	mBy('dSelections0').innerHTML = msg;
}
function show_winners() {
	let winners = Z.fen.winners;
	let multiple_winners = winners.length > 1;
	let winners_html = winners.map(x => get_user_pic_html(x, 35)).join(' ');
	let msg = `
    <div style="display:flex;gap:10px;align-items:center">
      <div style="color:red;font-size:22px;font-weight:bold;">GAME OVER! the winner${multiple_winners ? 's are: ' : ' is '}</div>
      <div style="padding-top:5px;">${winners_html}</div>
    </div>
  `;
	show_message(msg, true);
	mShield(dTable);
	hide('bRestartMove');
	return Z.fen.winners;
}
function status_message_new(msg, dParent, styles = {}) {
}
function switch_uname(plname) {
	set_user(plname);
	show_username();
}
function tableLayoutMR(dParent, m = 7, r = 1) {
	let ui = UI; ui.players = {};
	clearElement(dParent);
	let bg = 'transparent';
	let [dMiddle, dRechts] = [ui.dMiddle, ui.dRechts] = mColFlex(dParent, [m, r], [bg, bg]);
	mCenterFlex(dMiddle, false);
	let dOben = ui.dOben = mDiv(dMiddle, { w: '100%', display: 'block' }, 'dOben');
	let dSelections = ui.dSelections = mDiv(dOben, {}, 'dSelections');
	for (let i = 0; i <= 5; i++) { ui[`dSelections${i}`] = mDiv(dSelections, {}, `dSelections${i}`); }
	let dActions = ui.dActions = mDiv(dOben, { w: '100%' });
	for (let i = 0; i <= 5; i++) { ui[`dActions${i}`] = mDiv(dActions, { w: '100%' }, `dActions${i}`); }
	ui.dError = mDiv(dOben, { w: '100%', bg: 'red', fg: 'yellow', hpadding: 12, box: true }, 'dError');
	let dSubmitOrRestart = ui.dSubmitOrRestart = mDiv(dOben, { w: '100%' });
	let dOpenTable = ui.dOpenTable = mDiv(dMiddle, { w: '100%', padding: 10 }); mFlexWrap(dOpenTable);
	return [dOben, dOpenTable, dMiddle, dRechts];
}
function ui_player_info(dParent, outerStyles = { dir: 'column' }, innerStyles = {}) {
	let fen = Z.fen;
	if (nundef(outerStyles.display)) outerStyles.display = 'flex';
	mStyle(dParent, outerStyles);
	let items = {};
	let styles = jsCopy(innerStyles); addKeys({ rounding: 10, bg: '#00000050', margin: 4, padding: 4, patop: 12, box: true, 'border-style': 'solid', 'border-width': 6 }, styles);
	let order = get_present_order();
	for (const plname of order) {
		let pl = fen.players[plname];
		let uname = pl.name;
		let imgPath = `../base/assets/users/${uname}.jpg`;
		styles['border-color'] = get_user_color(uname);
		let item = mDivItem(dParent, styles, name2id(uname));
		let d = iDiv(item);
		let picstyle = { w: 50, h: 50, box: true };
		let ucolor = get_user_color(uname);
		if (pl.playmode == 'bot') {
			copyKeys({ rounding: 0, border: `double 6px ${ucolor}` }, picstyle);
		} else {
			copyKeys({ rounding: '50%', border: `solid 2px white` }, picstyle);
		}
		let img = mImage(imgPath, d, picstyle, 'img_person');
		items[uname] = item;
	}
	if (DA.SIMSIM || is_advanced_user()) activate_playerstats(items)
	return items;
}
//#endregion uname (gamehelpers)


//#region transaction (select)
function add_transaction(cmd) {
	if (!DA.simulate) start_transaction();
	DA.transactionlist.push(cmd);
}
function clear_transaction() { DA.simulate = false; DA.transactionlist = []; }
function pack_table(o) {
	for (const k of ['players', 'fen', 'state', 'player_status', 'options', 'scoring', 'notes', 'turn']) {
		let val = o[k];
		if (isdef(val)) o[k] = JSON.stringify(val);
	}
	return JSON.stringify({ table: o, playerdata: JSON.stringify(o.playerdata) });
}
function start_transaction() {
	if (DA.simulate) return;
	DA.simulate = true;
	DA.snapshot = { fen: jsCopy(Z.fen), stage: Z.stage, round: Z.round, phase: Z.phase, turn: Z.turn };
	DA.transactionlist = [];
}
//#endregion transaction (select)

//#region select (select)
function clear_selection() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (nundef(Z.A) || isEmpty(A.selected)) return;
	let selitems = A.selected.map(x => A.items[x]);
	for (const item of selitems) { ari_make_unselected(item); }
	A.selected = [];
}
function continue_after_error() {
	dError.innerHTML = ''; if (isdef(DA.callback)) { DA.callback(); delete (DA.callback); }
}
function remove_from_selection(card) {
	if (nundef(Z.A)) return;
	let A = Z.A;
	let item = firstCond(A.items, x => x.id == card.id);
	if (isdef(item)) {
		let idx = item.index;
		A.items.splice(item.index, 1);
		removeInPlace(A.selected, item.index);
		make_card_unselectable(item);
		make_card_unselected(item);
		reindex_items(A.items);
	}
}
function restart_selection_process() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (Z.game != 'ferro') {
		console.log('attempt to restart selection process in non-ferro game!!!');
		return;
	}
	A.selectedCards.map(x => ari_make_unselected(x));
	mClear('dSelections0');
	Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null };
	Z.stage = 'card_selection';
	ferro_pre_action();
}
function select_add_items(items, callback = null, instruction = null, min = 0, max = 100, prevent_autoselect = false) {
	let A = Z.A;
	select_clear_previous_level();
	A.level++; A.items = items; A.callback = callback; A.selected = []; A.minselected = min; A.maxselected = max;
	console.log('A.level', A.level)
	show_stage();
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	dInstruction.innerHTML = (Z.role == 'active' ? `${get_waiting_html()}<span style="color:red;font-weight:bold;max-height:25px">You</span>` : `${Z.uplayer}`) + "&nbsp;" + instruction;
	if (too_many_string_items(A)) { mLinebreak(dInstruction, 4); }
	let has_submit_items = false;
	let buttonstyle = { maleft: 10, vmargin: 2, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }
	for (const item of A.items) {
		let type = item.itemtype = is_card(item) ? 'card' : isdef(item.o) ? 'container' : 'string';
		if (isdef(item.submit_on_click)) { has_submit_items = true; }
		let id = item.id = lookup(item, ['o', 'id']) ? item.o.id : getUID(); A.di[id] = item;
		if (type == 'string') {
			let handler = ev => select_last(item, isdef(item.submit_on_click) ? callback : select_toggle, ev);
			item.div = mButton(item.a, handler, dInstruction, buttonstyle, null, id);
		} else {
			let ui = item.div = iDiv(item.o);
			ui.onclick = ev => select_last(item, select_toggle, ev);
			ui.id = id;
		}
	}
	let show_submit_button = !has_submit_items && (A.minselected != A.maxselected || !A.autosubmit);
	if (show_submit_button) { mButton('submit', callback, dInstruction, buttonstyle, 'selectable_button', 'bSubmit'); }
	let show_restart_button = A.level > 1;
	if (show_restart_button) { mButton('restart', onclick_reload, dInstruction, buttonstyle, 'selectable_button', 'bReload'); }
	let dParent = window[`dActions${A.level}`];
	for (const item of A.items) { ari_make_selectable(item, dParent, dInstruction); }
	assertion(A.items.length >= min, 'less options than min selection!!!!', A.items.length, 'min is', min);
	if (A.items.length == min && !is_ai_player() && !prevent_autoselect) {
		for (const item of A.items) { A.selected.push(item.index); ari_make_selected(item); }
		if (A.autosubmit) {
			loader_on();
			setTimeout(() => { if (callback) callback(); loader_off(); }, 800);
		}
	} else if (is_ai_player()) {
		ai_move();
	} else if (TESTING && isdef(DA.test)) {
		if (DA.test.iter >= DA.auto_moves.length) {
			if (isdef(DA.test.end)) DA.test.end();
			activate_ui();
			return;
		}
		let selection = DA.auto_moves[DA.test.iter++];
		if (selection) {
			deactivate_ui();
			let numbers = [];
			for (const el of selection) {
				if (el == 'last') {
					numbers.push(A.items.length - 1);
				} else if (el == 'random') {
					numbers.push(rNumber(0, A.items.length - 1));
				} else if (isString(el)) {
					let commands = A.items.map(x => x.key);
					let idx = commands.indexOf(el);
					numbers.push(idx);
				} else numbers.push(el);
			}
			selection = numbers;
			A.selected = selection;
			if (selection.length == 1) A.command = A.items[A.selected[0]].key;
			A.last_selected = A.items[A.selected[0]];
			select_highlight();
			setTimeout(() => {
				if (A.callback) A.callback();
			}, 1000);
		} else { activate_ui(); }
	} else { activate_ui(); }
}
function select_clear_previous_level() {
	let A = Z.A;
	if (!isEmpty(A.items)) {
		console.assert(A.level >= 1, 'have items but level is ' + A.level);
		A.ll.push({ items: A.items, selected: A.selected });
		let dsel = mBy(`dSelections1`);
		mStyle(dsel, { display: 'flex', 'align-items': 'center', padding: 10, box: true, gap: 10 });
		for (const item of A.items) {
			ari_make_unselectable(item);
			if (A.keep_selection) continue;
			ari_make_unselected(item);
			if (!A.selected.includes(item.index)) continue;
			if (item.itemtype == 'card') {
				let d = iDiv(item);
				let card = item.o;
				let mini = mDiv(dsel, { bg: 'yellow', fg: 'black', hpadding: 2, border: '1px solid black' }, null, card.friendly);
			} else if (item.itemtype == 'container') {
				let list = item.o.list;
				let cards = list.map(x => ari_get_card(x, 30, 30 * .7));
				let cont2 = ui_make_hand_container(cards, dsel, { bg: 'transparent' });
				ui_add_cards_to_hand_container(cont2, cards, list);
			} else if (item.itemtype == 'string') {
				let db = mDiv(dsel, { bg: 'yellow', fg: 'black', border: 'black', hpadding: 4 }, item.id, item.a);
			}
		}
	}
}
function select_confirm_weiter(callback) {
	select_add_items(ui_get_string_items(['weiter']), callback, 'may click to continue', 1, 1, Z.mode == 'multi');
}
function select_error(msg, callback = null, stay = false) {
	let [A] = [Z.A];
	DA.callback = callback;
	if (A.maxselected == 1 && A.selected.length > 0) {
		let item = A.items[A.selected[0]];
		ari_make_unselected(item);
		A.selected = [];
	} else if (A.selected.length == 2) {
		let item = A.items[A.selected[1]];
		ari_make_unselected(item);
		A.selected = [A.selected[0]];
	}
	dError.innerHTML = msg;
	if (stay) {
		dError.innerHTML += '<br><button onclick="continue_after_error()">CLICK TO CONTINUE</button>';
	} else {
		TO.error = setTimeout(continue_after_error, 3000);
	}
}
function select_highlight() { let A = Z.A; for (const i of A.selected) { let a = A.items[i]; ari_make_selected(a, true); } }
function select_last(item, callback, ev) {
	if (isdef(ev)) evNoBubble(ev);
	Z.A.last_selected = item; callback(item, ev);
}
function select_timer(ms, callback) {
	let d = mBy('dSelections0');
	let dtimer = mDiv(d, { w: 80, maleft: 10, fg: 'red', weight: 'bold' }, 'dTimer');
	if (isdef(DA.timer)) { DA.timer.clear(); DA.timer = null; }
	let timer = DA.timer = new SimpleTimer(dtimer, 1000, null, ms, callback);
	timer.start();
	return dtimer;
}
function select_toggle() {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	let A = Z.A;
	let item = A.last_selected;
	if (A.selected.includes(item.index)) {
		removeInPlace(A.selected, item.index);
		ari_make_unselected(item);
	} else {
		if (A.maxselected == 1 && !isEmpty(A.selected)) { ari_make_unselected(A.items[A.selected[0]]); A.selected = []; }
		A.selected.push(item.index);
		ari_make_selected(item);
		if (!DA.ai_is_moving && A.selected.length >= A.maxselected && A.autosubmit) {
			setTimeout(() => A.callback(), 100);
		}
	}
}
function stop_timer() {
	if (isdef(DA.timer)) {
		let res = DA.timer.clear();
		DA.timer = null;
		return isNumber(res) ? res : 0;
	}
	return 0;
}
//#endregion select (select)

//#region making (select)
function ari_make_selectable(item, dParent, dInstruction) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_selectable(item); break;
		case 'container': make_container_selectable(item); break;
		case 'string': make_string_selectable(item); break;
	}
}
function ari_make_selected(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_selected(item); break;
		case 'container': make_container_selected(item); break;
		case 'string': make_string_selected(item); break;
	}
}
function ari_make_unselectable(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_unselectable(item); break;
		case 'container': make_container_unselectable(item); break;
		case 'string': make_string_unselectable(item); break;
	}
}
function ari_make_unselected(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_unselected(item); break;
		case 'container': make_container_unselected(item); break;
		case 'string': make_string_unselected(item); break;
	}
}
function make_card_selectable(item) { let d = iDiv(item.o); mClass(d, 'selectable'); if (Z.game != 'aristo') { spread_hand(item.path, .3); } mClass(d.parentNode, 'selectable_parent'); }
function make_card_selected(item) {
	let color = isdef(Z.func.get_selection_color) ? Z.func.get_selection_color(item) : 'red';
	set_card_border(item, 13, color);
	if (DA.magnify_on_select) mClass(iDiv(item.o), 'mag');
}
function make_card_unselectable(item) { let d = iDiv(item.o); d.onclick = null; mClassRemove(d, 'selectable'); mClassRemove(d.parentNode, 'selectable_parent'); spread_hand(item.path); }
function make_card_unselected(item) { set_card_border(item); if (DA.magnify_on_select) mClassRemove(iDiv(item.o), 'mag'); }
function make_container_selectable(item) { let d = iDiv(item); mClass(d, 'selectable'); mClass(d, 'selectable_parent'); }
function make_container_selected(item) { let d = iDiv(item); mClass(d, 'selected_parent'); }
function make_container_unselectable(item) { let d = iDiv(item); d.onclick = null; mClassRemove(d, 'selectable'); mClassRemove(d, 'selectable_parent'); }
function make_container_unselected(item) { let d = iDiv(item); mClassRemove(d, 'selected_parent'); }
function make_deck_selectable(item) { }
function make_deck_selected(item) { }
function make_deck_unselectable(item) { }
function make_deck_unselected(item) { }
function make_hand_selectable(item) { }
function make_hand_selected(item) { }
function make_hand_unselectable(item) { }
function make_hand_unselected(item) { }
function make_market_selectable(item) { }
function make_market_selected(item) { }
function make_market_unselectable(item) { }
function make_market_unselected(item) { }
function make_string_selectable(item) { let d = mBy(item.id); mClass(d, 'selectable_button'); }
function make_string_selected(item) { let d = mBy(item.id); item.bg = mGetStyle(d, 'bg'); item.fg = mGetStyle(d, 'fg'); mStyle(d, { bg: 'yellow', fg: 'black' }); }
function make_string_unselectable(item) { let d = mBy(item.id); d.onclick = null; mClassRemove(d, 'selectable_button'); }
function make_string_unselected(item) { let d = mBy(item.id); mStyle(d, { bg: item.bg, fg: item.fg }); }
//#endregion making (select)
function parseCodefile(content, fname, preserveRegionNames = true, info = {}, superdi = {}) {
	let defaultRegions = { cla: 'classes', func: 'funcs' };
	let lines = content.split('\r\n');
	let parsing = false, code, type, key, regionName, regionOrig;
	let firstletters = [], firstWords = [], iline = 0;
	for (const line of lines) {
		let l = line; iline += 1;
		if (!l.includes("'//") && !l.includes("//'") && !l.includes("http")) {
			l = replaceAllFast(line, '://', '://');
			l = replaceAllFast(l, '//#', '@@#');
			l = stringBefore(l, '//');
			l = replaceAllFast(l, '@@#', '//#');
			l = replaceAllFast(l, '://', '://');
		}
		if (isEmptyOrWhiteSpace(l.trim())) continue;

		if (parsing) {

			let l1 = replaceAllSpecialChars(l, '\t', '  ');
			let ch = l1[0];

			if (' }]'.includes(ch)) code += l1 + '\r\n';

			if (ch != ' ') { //end of parsing!
				parsing = false;

				//duplicate funcs anzeigen!!!!!!!!!!!!!!!!!!!
				//if (lookup(superdi,[type,key])) { console.log('==>DUPLICATE FUNC:', fname, regionName, key); }

				if (nundef(regionName)) { regionName = regionOrig = valf(defaultRegions[type], type); }
				let regKey = preserveRegionNames ? regionOrig : `${regionName} (${fname})`;

				let sig;
				if (type == 'cla') {
					sig = `class ${key}{}`;
				} else if (type == 'func') {
					let firstline = stringBefore(code, '\r\n');
					if (firstline.includes(') {')) sig = stringBefore(firstline, ') {') + ')';
					else if (firstline.includes('){')) sig = stringBefore(firstline, '){') + ')';
					else sig = `function ${key}()`;
					sig += '{}';
				} else { sig = `${type} ${key}`; }

				let o = { name: key, code: code, sig: sig, region: regKey, filename: fname, type: type };
				addKeys(info, o);
				type = checkKey(superdi, key, type);
				if (type) lookupSetOverride(superdi, [type, key], o);

				addOnelineVars(superdi, o); //code, type, key, info, iline - 1);

				addIf(firstletters, l[0]);
			}
		} else {
			//if (nundef(regionOrig)) { regionOrig = regionName = 'funcs'; }
			let w = l[0] != '/' ? firstWord(l) : l.substring(0, 3);
			addIf(firstWords, w);
			//if (!['onload', 'async', 'function', 'class', 'var', 'const', '//#'].includes(w)) { console.log('line', iline, w, l[0]); }

		}
		if (parsing) continue;

		if (startsWith(l, '//#region')) {
			regionOrig = stringAfter(l, 'region').trim();
			regionName = firstWordAfter(l, 'region', true);
		} else if (startsWith(l, 'var')) {
			key = firstWordAfter(l, 'var', true);
			// //var wird nur genommen wenn es keine const,function, oder class mit dem namen gibt
			// for (const t of ['const', 'func', 'cla']) if (lookup(superdi, [t, key])) continue;
			parsing = true;
			code = l + '\r\n';
			type = 'var';
		} else if (startsWith(l, 'const')) {
			key = firstWordAfter(l, 'const', true);
			//const wird nur genommen wenn es keine function, oder class mit dem namen gibt
			//for (const t of ['func', 'cla']) if (lookup(superdi, [t, key])) continue;
			//wenn es var gibt, hau sie aus superrdi raus!!!
			//if (lookup(superdi,.var[key])) delete superdi.var[key];
			parsing = true;
			code = l + '\r\n';
			type = 'const';
		} else if (startsWith(l, 'class')) {
			key = firstWordAfter(l, 'class', true);
			// //class wird nur genommen wenn es keine function, oder class mit dem namen gibt
			// for (const t of ['func']) if (lookup(superdi, [t, key])) continue;
			// //wenn es var oder const gibt, hau sie aus superrdi raus!!!
			// for (const t of ['var', 'const']) if (lookup(superdi, [t, key])) delete superdi[t][key];
			parsing = true;
			code = l + '\r\n';
			type = 'cla';
			// key = firstWordAfter(l, 'class');
		} else if (startsWith(l, 'async') || startsWith(l, 'function')) {
			key = stringBefore(stringAfter(l, 'function').trim(), '(');
			//wenn es var oder const oder class gibt, hau sie aus superrdi raus!!!
			// for (const t of ['var', 'const', 'cla']) if (lookup(superdi, [t, key])) delete superdi[t][key];
			parsing = true;
			code = l + '\r\n';
			type = 'func';
		}
	}
	return superdi;
}
function checkKey(superdi, key, type) {
	let types = ['const', 'var', 'cla', 'func'];
	let itype = types.indexOf(type);
	for (const t in superdi) {
		if (lookup(superdi, [t, key])) {
			let it = types.indexOf(t);
			if (itype > it) { delete superdi[t][key]; return type; }
			else if (it > itype) { return type == 'const' ? t : false; }
			else return type;
		}
	}
	return type;
}
function _addOnelineVars(superdi, o) {
	//multiple declarations in 1 line!
	let [code, type] = [o.code, o.type];
	let crn = (code.match(/\r\n/g) || []).length;
	let oneliner = crn == 1;

	//let specialword = 'Counter'; //'PORT';
	//if (oneliner && key == specialword) console.log('oneliner', info.path, iline, type);

	//var declaration in a line that contains '[' or '{ ' will NOT be taken into consideration!!!
	if (oneliner && type == 'var' && code.includes(',') && !code.includes('[') && !code.includes('{ ')) {
		let othervars = stringAfter(code, 'var').trim().split(',');
		othervars = othervars.map(x => firstWord(x, true));
		othervars.shift();
		//console.log('othervars',othervars,o.path)
		for (const v of othervars) {
			let o1 = jsCopy(o);
			o1.lead = o.key;
			o1.key = v;
			o1.code = '';
			o1.sig = `var ${v};`;
			if (isNumber(v)) { continue; } //console.log('var:',v,o.path); 
			lookupSetOverride(superdi, [type, v], o1);
		}
	}
}
function addOnelineVars(superdi, o) {
	//multiple declarations in 1 line!
	let [code, type] = [o.code, o.type];
	//if (code.includes(' A')) console.log('addOnelinerVars A',code)
	let crn = (code.match(/\r\n/g) || []).length;
	let oneliner = crn == 1;

	//let specialword = 'Counter'; //'PORT';
	//if (oneliner && key == specialword) console.log('oneliner', info.path, iline, type);

	//var declaration in a line that contains '[' or '{ ' will NOT be taken into consideration!!!
	let signal=false;
	if (oneliner && type == 'var' && code.includes(',') && !code.includes('[') && !code.includes('{ ')) {
		let othervars = stringAfter(code, 'var').trim().split(',');
		let varkeys = othervars.map(x => firstWord(x, true));

		//if (varkeys.some(x=>x=='A')) {signal=true;console.log('found var A:',code);}

		//the first one is o
		assertion(varkeys[0] == o.name, `WTF?!?! ${varkeys[0]} ### ${o.name}?!?!?!?!????????????? addOnelinerVars`);
		o.code = stringBefore(code, ',')+';' //code.endsWith(';')?'\r\n':';\r\n';

		othervars.shift();
		if (signal) console.log('othervars',othervars,varkeys)
		//console.log('othervars',othervars,o.path)
		for (const vcode of othervars) {

			let o1 = jsCopy(o);

			let code1 = vcode.trim();
			if (!code1.endsWith(';')) code1+=';';
			if (signal) console.log('code1',code1);

			//o1.lead = o.key;
			let k1 = o1.name = firstWord(code1, true);
			if (signal) console.log('k1',k1);

			o1.code = 'var ' + code1; // + code1.endsWith(';')?'':';'; //'\r\n':';\r\n';
			//if (k1 == 'A') console.log('A',o1.code)
			
			o1.sig = `var ${k1};`;
			if (isNumber(k1)) { continue; } //console.log('var:',v,o.path); 

			if (signal) console.log('trage ein',k1,o1)
			lookupSetOverride(superdi, [type, k1], o1);
		}
	}
}
function addModuleExports(list) {
	let txt =
		`if (this && typeof module == "object" && module.exports && this === module.exports) {\r\n`
		+ `  module.exports = {\r\n`;
	for (const s of list) {
		txt += `    ${s},\r\n`
	};
	txt += '  }\r\n}';
	return txt;
}
function removeCommentsFromLine(line) {
	let l = line;
	if (!l.includes("`//") && !l.includes("'//") && !l.includes("//'") && !l.includes("http")) {
		l = replaceAllFast(line, '://', ':@@');
		l = replaceAllFast(l, '//#', '@@#');
		l = stringBefore(l, '//');
		l = replaceAllFast(l, '@@#', '//#');
		l = replaceAllFast(l, ':@@', '://');
	}
	return l;
}
function getFunctionSignature(firstline, key) {
	let sig;
	if (firstline.includes(') {')) sig = stringBefore(firstline, ') {') + ')';
	else if (firstline.includes('){')) sig = stringBefore(firstline, '){') + ')';
	else sig = `function ${key}()`;
	sig += '{}';
	return sig;
}
function parseCodefile1(content, fname, preserveRegionNames = true, info = {}, superdi = {}) {
	let lines = content.split('\r\n');
	let parsing = false;
	let code, type, key, star, sig;
	let multicomment = false;
	let iline = 0;
	for (const line of lines) {
		iline++;
		let l = removeCommentsFromLine(line); if (isEmptyOrWhiteSpace(l.trim())) continue;

		if (l.trim().startsWith('/*')) multicomment = true;
		if (multicomment) {
			if (l.trim().endsWith('*/')) multicomment = false;
			continue;
		}

		if (parsing) {

			let l1 = replaceAllSpecialChars(l, '\t', '  ');
			let ch = l1[0];

			if (' }]'.includes(ch)) code += l1 + '\r\n';

			if (ch != ' ') { //end of parsing!
				parsing = false;

				let o = { name: key, code: code, sig: sig, region: type, filename: fname, type: type };
				addKeys(info, o);

				// if (o.type == 'var' && o.fname == 'chess.js') { o.index = iline; lookupAddIfToList(superdi, ['chessvar'], o.name); }
				if (o.type == 'var' && o.fname == 'chess.js' && o.name.startsWith('brd_')) { lookupSet(superdi, ['chessvar', o.name], true); }

				if (type == 'var') addOnelineVars(superdi, o); //onelinerVars may modify o.code!

				lookupSetOverride(superdi, [type, key], o);
			}
		}
		if (startsWith(l, 'async') || startsWith(l, 'function')) {
			key = stringBefore(stringAfter(l, 'function').trim(), '(');
			if (key.startsWith('*')) { star = true; key = stringAfter(key, '*').trim(); } else star = false;
			parsing = true;
			code = l + '\r\n';
			type = 'func';
			sig = getFunctionSignature(l, key);
		} else if (startsWith(l, 'class')) {
			key = firstWordAfter(l, 'class', true);
			parsing = true;
			code = l + '\r\n';
			type = 'cla';
			sig = `class ${key}{}`;
		} else if (startsWith(l, 'const')) {
			//console.log('const',l)
			key = firstWordAfter(l, 'const', true);
			parsing = true;
			code = l + '\r\n';
			type = 'const';
			sig = `const ${key};`;
		} else if (startsWith(l, 'var')) {
			key = firstWordAfter(l, 'var', true);
			parsing = true;
			code = l + '\r\n';
			type = 'var';
			sig = `var ${key};`;
		}
	}
	return superdi;
}


if (this && typeof module == "object" && module.exports && this === module.exports) {
	module.exports = {
		parseCodefile,
		parseCodefile1,
		HPLayout,
		HRPLayout,
		HSLAToRGBA,
		HSLToRGB,
		PHLayout,
		PRHLayout,
		RGBAToHSLA,
		RGBAToHex9,
		RGBToHSL,
		RGBToHex7,
		_calc_hex_col_array,
		_calc_hex_col_array_old,
		_deqSound,
		_enqSound,
		_evToClass,
		_gCreate,
		_gSizeToContent,
		_mStamp,
		_rChoose,
		_selectText,
		_unfocusOnEnter,
		_valf,
		_whenSoundPaused,
		aFlip,
		aJumpby,
		aMove,
		aRestore,
		aRollby,
		aRotate,
		aRotateAccel,
		aSvg,
		aSvgg,
		aTranslateBy,
		aTranslateByEase,
		aTranslateFadeBy,
		activate_playerstats,
		activate_ui,
		addIf,
		addKeys,
		addMonthToDate,
		addRowsCols,
		addWeekToDate,
		add_transaction,
		agCircle,
		agColoredShape,
		agEllipse,
		agG,
		agHex,
		agLine,
		agPoly,
		agRect,
		agShape,
		aggregate_elements,
		aggregate_player_hands_by_rank,
		allNumbers,
		alphaToHex,
		anim_face_down,
		anim_face_up,
		anim_toggle_face,
		animateProperty,
		animatePropertyX,
		animate_card_approx,
		animate_card_exchange,
		animate_card_transfer,
		animate_title,
		animatedTitle,
		ari_get_card,
		ari_get_card_large,
		ari_make_selectable,
		ari_make_selected,
		ari_make_unselectable,
		ari_make_unselected,
		ari_show_handsorting_buttons_for,
		arrAdd,
		arrAverage,
		arrBuckets,
		arrChildren,
		arrClear,
		arrCount,
		arrCycle,
		arrExtend,
		arrFirst,
		arrFlatten,
		arrFromIndex,
		arrFromTo,
		arrFunc,
		arrIndices,
		arrLast,
		arrLastOfLast,
		arrMax,
		arrMin,
		arrMinMax,
		arrMinus,
		arrNext,
		arrNoDuplicates,
		arrPlus,
		arrPrev,
		arrRange,
		arrRemove,
		arrRemoveDuplicates,
		arrRemoveLast,
		arrRemovip,
		arrRepeat,
		arrReplace,
		arrReplace1,
		arrReverse,
		arrRotate,
		arrShufflip,
		arrSplitAtIndex,
		arrSplitByIndices,
		arrSum,
		arrSwap,
		arrTake,
		arrTakeLast,
		arrTakeWhile,
		arrToMatrix,
		arrWithout,
		arrZip,
		arr_get_max,
		arr_get_min,
		assertion,
		audio_beep,
		audio_onclick_pp,
		audio_pause,
		audio_play,
		audio_playing,
		audio_toggle,
		autocomplete,
		autocomplete_addActive,
		autocomplete_closeAllLists,
		autocomplete_removeActive,
		bCapturedPieces,
		bCheck,
		bCreateEmpty,
		bFreeRayDir,
		bFreeRayDir1,
		bFullCol,
		bFullDiag,
		bFullDiag2,
		bFullRow,
		bGetChunks,
		bGetChunksWithIndices,
		bGetCol,
		bGetCols,
		bGetRow,
		bGetRows,
		bGetSubMatrix,
		bGetSubMatrixWithIndices,
		bNei,
		bNeiDir,
		bPartialCol,
		bPartialDiag,
		bPartialDiag2,
		bPartialRow,
		bRayDir,
		bStrideCol,
		bStrideColFrom,
		bStrideDiag2From,
		bStrideDiagFrom,
		bStrideRow,
		bStrideRowFrom,
		beautify_history,
		boardArrOmitFirstRowCol,
		boardToNode,
		bottom_elem_from_to,
		bottom_elem_from_to_top,
		cCenterOrigin,
		cCircle,
		cClear,
		cColor,
		cEllipse,
		cLine,
		cRect,
		cSetOrigin,
		cShadow,
		cStyle,
		cStyle_dep,
		calc_hand_value,
		calculateDaysBetweenDates,
		cap_each_word,
		capitalize,
		cardFromInfo,
		catanBoard,
		checkBoardEmpty,
		checkBoardFull,
		checkPotentialTTT,
		checkSudokuRule,
		checkSudokuRule_trial1,
		checkWinner,
		checkWinnerC4,
		checkWinnerPossible,
		checkWinnerTTT,
		choose,
		chooseRandom,
		circleCenters,
		clamp,
		clearElement,
		clearFleetingMessage,
		clear_select,
		clear_selection,
		clear_status,
		clear_timeouts,
		clear_title,
		clear_transaction,
		coin,
		collect_game_specific_options,
		colorChannelMixer,
		colorDark,
		colorFrom,
		colorFromHSL,
		colorHSL,
		colorHSLBuild,
		colorHex,
		colorHue,
		colorHueWheel,
		colorIdealText,
		colorLight,
		colorMap,
		colorMix,
		colorMixer,
		colorPalette,
		colorPaletteFromImage,
		colorPaletteFromUrl,
		colorRGB,
		colorShades,
		colorTrans,
		colorTransPalette,
		colorWheel,
		colorsFromBFA,
		complexCompare,
		compute_hidden,
		contains,
		continue_after_error,
		convert_to_range,
		copyKeys,
		correctPolys,
		correct_handsorting,
		countAll,
		create_card_assets_c52,
		create_fen_deck,
		csv2list,
		cycle,
		dSquare,
		date2locale,
		dbSave,
		db_create,
		db_delete,
		db_init,
		db_readall,
		db_update,
		deactivate_ui,
		default_allowDrop,
		delete_table,
		destroySudokuRule,
		dict2list,
		distance,
		divInt,
		doit,
		downloadAsText,
		downloadAsYaml,
		downloadJson,
		download_all_functions,
		drawFlatHex,
		drawHex,
		drawPlainCircle,
		drawShape,
		drawSym,
		drawText,
		drawTriangle,
		draw_from_deck_to,
		draw_from_deck_to_board,
		elem_from_to,
		elem_from_to_top,
		empty_func,
		endsWith,
		ensureColorDict,
		errlog,
		evNoBubble,
		evStop,
		evToClass,
		evToClosestId,
		evToId,
		evToItem,
		evToProp,
		evToTargetAttribute,
		ev_to_gname,
		exchange_by_index,
		expandBoard,
		face_down,
		face_down_alt,
		face_up,
		ferro_get_card,
		fillColarr,
		findAncestorElemOfType,
		findAncestorElemWithParentOfType,
		findAttributeInAncestors,
		findChildOfType,
		findChildWithClass,
		findChildWithId,
		findChildrenOfType,
		findDescendantOfType,
		findDescendantWithId,
		findKeys,
		findParentWithClass,
		findParentWithId,
		find_card,
		find_index_of_jolly,
		find_jolly_rank,
		find_minimum,
		find_minimum_by_function,
		fireClick,
		fireKey,
		fireWheel,
		firstCond,
		firstCondDict,
		firstCondDictKey,
		firstCondDictKeys,
		firstNCond,
		firstNumber,
		firstWord,
		firstWordAfter,
		fisherYates,
		fleetingMessage,
		forAll,
		formatDate,
		format_currency,
		format_date,
		fromLocalStorage,
		fromUmlaut,
		fromYaml,
		gBg,
		gCanvas,
		gCreate,
		gEllipse,
		gFg,
		gG,
		gHex,
		gLine,
		gPoly,
		gPos,
		gRect,
		gRounding,
		gShape,
		gSize,
		gSizeToContent,
		gStroke,
		gSvg,
		genCats,
		generate_table_name,
		germanize,
		getAnimals,
		getCaretCoordinates,
		getCenters,
		getCentersFromAreaSize,
		getCentersFromRowsCols,
		getCirclePoints,
		getColorHexes,
		getColorNames,
		getConsonants,
		getCornerVertices,
		getEllipsePoints,
		getFruid,
		getFunctionCallerName,
		getFunctionsNameThatCalledThisFunction,
		getGSGElements,
		getGlobals,
		getHexPoly,
		getKeySets,
		getLettersExcept,
		getNature,
		getPoly,
		getQuadPoly,
		getRandomLetter,
		getRect,
		getSizeNeeded,
		getStyleProp,
		getSudokuPattern,
		getSudokuPatternFromDB,
		getTextAreaCurrentLine,
		getTextAreaCurrentWord,
		getTextWidth,
		getTriangleDownPoly,
		getTriangleUpPoly,
		getTypeOf,
		getUID,
		getVowels,
		get_admin_player,
		get_checked_radios,
		get_container_styles,
		get_containertitle_styles,
		get_default_options,
		get_game_color,
		get_group_rank,
		get_img_html,
		get_joker_info,
		get_keys,
		get_logout_button,
		get_mouse_pos,
		get_multi_trigger,
		get_next_human_player,
		get_next_player,
		get_now,
		get_playmode,
		get_present_order,
		get_screen_distance,
		get_sequence_suit,
		get_texture,
		get_timestamp,
		get_user_color,
		get_user_pic,
		get_user_pic_and_name,
		get_user_pic_html,
		get_values,
		get_waiting_html,
		get_weekday,
		hFunc,
		hasDuplicate,
		hasWhiteSpace,
		has_at_most_n_jolly,
		has_jolly,
		hex1Board,
		hex1Centers,
		hex1Count,
		hex1Indices,
		hexAToHSLA,
		hexCenters,
		hexCornerNodes,
		hexToHSL,
		hide,
		hide0,
		hide_buildings,
		hslToHex,
		iAdd,
		iClear,
		iDelete,
		iDiv,
		iFromRowCol,
		iG,
		iMeasure,
		iReg,
		iRegister,
		iRepair,
		iSvg,
		iToRowCol,
		iTrim,
		i_am_acting_host,
		i_am_host,
		i_am_trigger,
		if_hotseat_autoswitch,
		if_plural,
		if_stringified,
		if_stringified_or_dict,
		if_stringified_or_list,
		if_stringified_or_string,
		incInput,
		indexOfAny,
		insertColNew,
		insertRowNew,
		intersection,
		isAlphaNum,
		isCloseTo,
		isDOM,
		isDict,
		isDictOrList,
		isDigit,
		isEmpty,
		isEmptyOrWhiteSpace,
		isLetter,
		isList,
		isListOf,
		isLiteral,
		isNumber,
		isOppPiece,
		isOverflown,
		isString,
		isSvg,
		isVisible,
		isWhiteSpace,
		isWhiteSpace2,
		isWhiteSpaceString,
		is_advanced_user,
		is_card_key,
		is_collect_mode,
		is_joker,
		is_jolly,
		is_just_my_turn,
		is_key_down,
		is_multi_stage,
		is_multi_trigger,
		is_overlapping_set,
		is_playerdata_set,
		is_playing,
		is_shield_mode,
		is_stringified,
		isdef,
		jolly_matches,
		jsClean,
		jsCopy,
		jsCopySafe,
		jsonToYaml,
		lastCond,
		lastDescendantOfType,
		lastIndexOfAny,
		last_elem_from_to,
		lerp,
		list2dict,
		load_assets_direct,
		load_assets_fetch,
		load_config,
		load_config_fast,
		load_config_new,
		load_db,
		load_syms,
		loader_off,
		loader_on,
		log_array,
		log_object,
		lookup,
		lookupAddIfToList,
		lookupAddToList,
		lookupSet,
		lookupSetOverride,
		luxury_card_deco,
		mAnimate,
		mAnimateList,
		mAnimateTo,
		mAppear,
		mAppend,
		mAttrs,
		mAutocomplete,
		mBackground,
		mBoxFromMargins,
		mButton,
		mButtonX,
		mBy,
		mCanvas,
		mCard,
		mCardButton,
		mCardText,
		mCenter,
		mCenterCenter,
		mCenterCenterFlex,
		mCenterFlex,
		mClass,
		mClass0,
		mClassRemove,
		mClassReplace,
		mClassToggle,
		mClear,
		mColFlex,
		mColorLetters,
		mColorPickerBehavior,
		mColorPickerControl,
		mConfine,
		mContainerSplay,
		mCreate,
		mCreateFrom,
		mDataTable,
		mDiv,
		mDiv100,
		mDivItem,
		mDivLR,
		mDivLine,
		mDover,
		mDraggable,
		mDroppable,
		mEdit,
		mEditNumber,
		mEditRange,
		mEditX,
		mEditableInput,
		mEditableOnEdited,
		mFade,
		mFadeClear,
		mFadeClearShow,
		mFadeRemove,
		mFall,
		mFleeting,
		mFlex,
		mFlexColumn,
		mFlexEvenly,
		mFlexLR,
		mFlexSpacebetween,
		mFlexWrap,
		mFlip,
		mForm,
		mFromPoint,
		mGetStyle,
		mGrid,
		mHide,
		mIfNotRelative,
		mImage,
		mImg,
		mInput,
		mInsert,
		mInsertAfter,
		mInsertAt,
		mInsertFirst,
		mItem,
		mItemSplay,
		mLine,
		mLinebreak,
		mLinebreakFlex,
		mLink,
		mMagnifyOnHoverControl,
		mMagnifyOnHoverControlPopup,
		mMagnifyOnHoverControlRemove,
		mMeasure,
		mNode,
		mPlace,
		mPlayPause,
		mPopup,
		mPos,
		mPulse,
		mPulse1,
		mPulse2,
		mPulse3,
		mPuppet,
		mRadio,
		mRadio1,
		mRadioGroup,
		mRadioToggle,
		mRemove,
		mRemoveChildrenFromIndex,
		mRise,
		mScale,
		mSearch,
		mSection,
		mSelectTableRow,
		mShield,
		mShieldsOff,
		mShow,
		mShrink,
		mShrinkTranslate,
		mShrinkUp,
		mSize,
		mSpan,
		mStamp,
		mStyle,
		mStyleGet,
		mStyleOrClass,
		mStyleRemove,
		mStyleTranslate,
		mStyleUndo,
		mSuit,
		mSym,
		mSymSizeToBox,
		mSymSizeToFz,
		mSymSizeToH,
		mSymSizeToW,
		mSymText,
		mTable,
		mTableCol,
		mTableCommandify,
		mTableCommandifyList,
		mTableHeader,
		mTableRow,
		mTableTransition,
		mTag,
		mText,
		mTextWidth,
		mTextarea,
		mToggle,
		mTogglebar,
		mToolbar,
		mTranslate,
		mTranslateBy,
		mTranslateByFade,
		mYaml,
		maButton,
		makeCategories,
		makeEdge,
		makeUnitString,
		make_card_selectable,
		make_card_selected,
		make_card_unselectable,
		make_card_unselected,
		make_container_selectable,
		make_container_selected,
		make_container_unselectable,
		make_container_unselected,
		make_deck_selectable,
		make_deck_selected,
		make_deck_unselectable,
		make_deck_unselected,
		make_hand_selectable,
		make_hand_selected,
		make_hand_unselectable,
		make_hand_unselected,
		make_market_selectable,
		make_market_selected,
		make_market_unselectable,
		make_market_unselected,
		make_string_selectable,
		make_string_selected,
		make_string_unselectable,
		make_string_unselected,
		map_range,
		measureText,
		measure_fieldset,
		mgSvg,
		mgTag,
		mgText,
		miPic,
		neighborhood,
		new_cards_animation,
		normalize_string,
		nundef,
		object2string,
		old_mButtonX,
		oneCircleCenters,
		oneWordKeys,
		onpagedeactivated,
		oscillate_between,
		pSBC,
		pack_table,
		parseCodefile,
		path2UI,
		path2fen,
		player_stat_count,
		plural,
		polyPointsFrom,
		pop_top,
		posToPoint,
		post_json,
		printBoard,
		printMatrix,
		printState,
		quadCenters,
		rAdd,
		rAddSub,
		rAddSubRange,
		rAlphanums,
		rCard,
		rChoose,
		rCoin,
		rColor,
		rConsonant,
		rDate,
		rDigits,
		rFloat,
		rGaussian,
		rHue,
		rLetter,
		rLetters,
		rName,
		rNumber,
		rPassword,
		rPerlin,
		rPrimaryColor,
		rRank,
		rSuit,
		rVowel,
		rWheel,
		randomColor,
		range,
		recConvertLists,
		reduceBoard,
		removeColNew,
		removeDuplicates,
		removeInPlace,
		removeRowNew,
		remove_card_shadow,
		remove_from_selection,
		remove_hourglass,
		remove_player,
		replaceAll,
		replaceAllFast,
		replaceAllSafe,
		replaceAllSpecialChars,
		replaceAllX,
		replaceAtString,
		replaceEvery,
		replaceWhite,
		replace_jolly,
		resetUIDs,
		restart_selection_process,
		return_elem_to_deck_from,
		reverse,
		rgb2float,
		rgb2hex,
		rgbToHex,
		rgbaStr,
		round_change_animation,
		route_path_json,
		route_path_text,
		route_path_yaml_dict,
		route_post_json,
		run_for_seconds,
		sameList,
		saveFileAtClient,
		say,
		selectText,
		select_add_items,
		select_clear_previous_level,
		select_confirm_weiter,
		select_error,
		select_highlight,
		select_last,
		select_timer,
		select_toggle,
		setKeys,
		setRect,
		set_card_border,
		set_card_style,
		set_card_style_works,
		set_player,
		set_player_strategy,
		set_run_state,
		set_run_state_local,
		set_run_state_no_server,
		set_run_state_vps,
		set_user,
		sheriff_card,
		shield_off,
		shield_on,
		show,
		show0,
		showFleetingMessage,
		show_MMM,
		show_admin_ui,
		show_fleeting_message,
		show_game_options,
		show_games,
		show_handsorting_buttons_for,
		show_history,
		show_history_layout,
		show_history_popup,
		show_home_logo,
		show_hourglass,
		show_instruction,
		show_message,
		show_options_popup,
		show_player_button,
		show_playerdatastate,
		show_polling_signal,
		show_role,
		show_settings,
		show_special_message,
		show_stage,
		show_status,
		show_strategy_popup,
		show_tables,
		show_title,
		show_username,
		show_users,
		show_view_buildings_button,
		show_waiting_for_ack_message,
		show_waiting_message,
		show_winners,
		shuffle,
		shuffleChildren,
		shuffle_children,
		shuffletest,
		simpleCompare,
		simulateClick,
		size2hex,
		size2tridown,
		size2triup,
		sortCaseInsensitive,
		sortBy,
		sortByDescending,
		sortByFunc,
		sortByFuncDescending,
		sortByRank,
		sortCardItemsByRank,
		sortCardItemsBySuit,
		sortCardItemsToSequence,
		sortNumbers,
		sort_cards,
		splitAtAnyOf,
		splitIntoNumbersAndWords,
		spread_hand,
		sss,
		sss1,
		start_simple_timer,
		start_transaction,
		startsWith,
		staticTitle,
		status_message_new,
		stop_simple_timer,
		stop_timer,
		stringAfter,
		stringAfterLast,
		stringBefore,
		stringBeforeLast,
		stringBetween,
		stringBetweenLast,
		stringLast,
		stringToMatrix,
		stripToKeys,
		sudokuSampleToIndexMatrix,
		switch_uname,
		symbolcolor,
		tableLayoutMR,
		timeConversion,
		toBoardString,
		toDegree,
		toElem,
		toLetters,
		toLocalStorage,
		toModulo,
		toRadian,
		toUmlaut,
		toWords,
		toYaml,
		to_aristocard,
		to_commissioncard,
		to_luxurycard,
		to_rumorcard,
		toggleSelection,
		toggleSelectionOfPicture,
		toggle_face,
		toggle_select,
		top_elem_from_to,
		top_elem_from_to_top,
		translateStylesToCy,
		translateToCssStyle,
		ui_add_cards_to_deck_container,
		ui_add_cards_to_hand_container,
		ui_add_container_title,
		ui_make_container,
		ui_make_deck_container,
		ui_make_hand_container,
		ui_player_info,
		ui_type_building,
		ui_type_church,
		ui_type_deck,
		ui_type_hand,
		ui_type_lead_hand,
		ui_type_market,
		ui_type_rank_count,
		unfocusOnEnter,
		valf,
		valfi,
		valnwhite,
	};
}





