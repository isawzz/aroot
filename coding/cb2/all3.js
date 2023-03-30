
const RCREATE = {
	card52: mCard52,
	card: mCard,
	hand: mHand,
	grid: mGrid,
	info: mInfo,
	invisible: mInvisible,
	panel: mPanel,
	picto: mPicto,
	manual00: mManual00,
}
const GFUNC = {
	gTouchPic: {
		startGame: startGameTP, startLevel: startLevelTP, startRound: startRoundTP, trialPrompt: trialPromptTP, prompt: promptTP, activate: activateTP, eval: evalTP
	},
	gTouchColors: {
		startGame: startGameTC, startLevel: startLevelTC, startRound: startRoundTC, trialPrompt: trialPromptTC, prompt: promptTC, activate: activateTC, eval: evalTC
	},
	gWritePic: {
		startGame: startGameWP, startLevel: startLevelWP, startRound: startRoundWP, trialPrompt: trialPromptWP, prompt: promptWP, activate: activateWP, eval: evalWP
	},
	gMissingLetter: {
		startGame: startGameML, startLevel: startLevelML, startRound: startRoundML, trialPrompt: trialPromptML, prompt: promptML, activate: activateML, eval: evalML
	},
	gSayPic: {
		startGame: startGameSP, startLevel: startLevelSP, startRound: startRoundSP, trialPrompt: trialPromptSP, prompt: promptSP, activate: activateSP, eval: evalSP
	},
	gSayPicAuto: {
		startGame: startGameSPA, startLevel: startLevelSPA, startRound: startRoundSPA, trialPrompt: trialPromptSPA, prompt: promptSPA, activate: activateSPA, eval: evalSPA
	},
}
const ALLTESTS = {
	0: {
		0: {
			fStruct: makeRoot, options: {
				presentationStrategy: 'rec', autoType: 'cssEmpty',
				params: { _1: { width: 40, height: 40, color: 'red', 'background-color': 'blue' } }
			}
		},
	},
	1: {
		0: { fStruct: makeSimplestTree, options: { params: { '_1': { height: 120 } } } },
		1: { fStruct: makeSimplestTree, options: { params: { '_1': { width: 100, height: 120 } } } },
		2: { fStruct: makeSimpleTree, options: { params: { '_1': { width: 100, height: 120 } } } },
		3: { fStruct: makeSimpleTree, options: { params: { '_1': { orientation: 'v', width: 100, height: 120 } } } },
		4: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' }, '_4': { orientation: 'v' } } } },
		5: { fStruct: makeTree332x2, options: { params: { '_1': { orientation: 'v' } } } },
		6: { fStruct: makeTree332x2, options: { params: { '_4': { orientation: 'v' } } } },
	},
	2: {
		0: { fStruct: makeTree33, options: { params: { '_4': { fg: 'red', orientation: 'v' } } } },
		1: { fStruct: makeTree33, options: { params: { '_4': { orientation: 'v' } } } },
		2: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' } } } },
		3: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' } } } },
		4: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' }, '_4': { orientation: 'v' } } } },
		5: { fStruct: makeTree332x2, options: { params: { '_1': { orientation: 'v' } } } },
		6: { fStruct: makeTree332x2, options: { params: { '_4': { orientation: 'v' } } } },
		7: { fStruct: makeTree332x2, options: { params: { '_7': { orientation: 'v' } } } },
	},
	3: {
		0: { fStruct: makeTree33, options: { params: { '_4': { fg: 'red', orientation: 'v' } } } },
		1: { fStruct: makeTree33, options: { params: { '_4': { orientation: 'v' } } } },
		2: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' } } } },
		3: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' } } } },
		4: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' }, '_4': { orientation: 'v' } } } },
		5: { fStruct: makeTree332x2, options: { params: { '_1': { orientation: 'v' } } } },
		6: { fStruct: makeTree332x2, options: { params: { '_4': { orientation: 'v' } } } },
		7: { fStruct: makeTree332x2, options: { params: { '_7': { orientation: 'v' } } } },
		8: { fStruct: makeTree332x2, options: { params: { '_4': { orientation: 'v' }, '_7': { orientation: 'v' } } } },
		9: { fStruct: makeSimplestTree, options: undefined },
		10: { fStruct: makeSimplestTree, options: { fContent: contentNoRootContent } },
		11: { fStruct: makeSimpleTree, options: undefined },
		12: { fStruct: makeSimpleTree, options: { params: { '_1': { orientation: 'v' } } } },
		13: { fStruct: makeSimpleTree, options: { fContent: contentNoRootContent } },
		14: { fStruct: makeTree33, options: { fContent: contentNoRootContent } },
		15: { fStruct: makeTree332x2, options: undefined },
		16: { fStruct: makeTree332x2, options: { fContent: contentNoRootContent } },
		17: { fStruct: () => makeSimpleTree(20), options: { fContent: contentNoRootContent } },
		18: { fStruct: makeSimplestTree, options: { fContent: contentRootExtralong } },
		19: { fStruct: makeTree33, options: { fContent: contentRootExtralong } },
		20: { fStruct: () => makeSimpleTree(3), options: { fContent: contentRootExtralong } },
		21: {
			fStruct: makeTree33, options: {
				params: {
					'_1': { bg: 'black', orientation: 'v' },
					'_4': { bg: 'inherit', orientation: 'v' }
				}
			}
		},
		22: { fStruct: makeTree33, options: { fContent: contentRootExtralong, params: { '_1': { orientation: 'v' } } } },
		23: { fStruct: makeTree33, options: { fContent: contentRootExtralong, params: { '_4': { orientation: 'v' } } } },
	},
	4: {
		0: { fStruct: makeSimplestTree, options: { fContent: n => n.uid == '_1' ? 'random' : n.uid, positioning: 'random' } },
		1: { fStruct: makeSimpleTree, options: { fContent: n => n.uid == '_1' ? 'random' : n.uid, positioning: 'random' } },
		2: { fStruct: () => makeSimpleTree(10), options: { fContent: n => n.uid == '_1' ? 'random' : n.uid, positioning: 'random' } },
		3: { fStruct: makeTree33, options: { fContent: n => n.uid == '_1' ? 'random' : n.uid, positioning: 'random' } },
	},
	5: {
		0: { fStruct: makeSimplestTree, options: { fContent: n => n.uid == '_1' ? 'hallo' : n.uid, params: { '_1': { height: 120 } } } },
		1: {
			fStruct: makeSimplestTree, options: {
				fContent: n => n.uid == '_1' ? { first: '1', uid: n.uid } : n.uid,
				params: { '_1': { bg: 'blue', 'text-align': 'center', width: 100, height: 120 } }
			}
		},
	},
	6: {
		41: {
			fStruct: () => makeTreeNNEach(2, 4), options: {
				params: {
					'_1': { orientation: 'h' },
					'_2': { orientation: 'w', rows: 2, cols: 2 },
					'_7': { orientation: 'w', rows: 2, cols: 2 }
				}
			}
		},
		40: {
			fStruct: () => makeTreeNNEach(1, 4),
			options: {
				params:
				{
					'_2': { orientation: 'w', rows: 2, cols: 2 }
				}
			}
		},
		39: {
			fStruct: () => makeTreeNNEach(2, 2), options: {
				params: {
					'_2': { orientation: 'w', rows: 1, cols: 2 },
					'_5': { orientation: 'w', rows: 1, cols: 2 }
				}
			}
		},
		38: {
			fStruct: () => makeTreeNNEach(2, 4), options: {
				params: {
					'_2': { orientation: 'w', rows: 2, cols: 2 },
					'_7': { orientation: 'w', rows: 2, cols: 2 }
				}
			}
		},
		37: { fStruct: makeSimpleTree, options: { fType: typePanelInfo, fContent: contentHallo } },
		36: { fStruct: makeSimpleTree, options: { fType: typePanelInfo, fContent: contentHallo, presentationStrategy: 'new' } },
		35: { fStruct: () => makeTreeNN(2, 2), options: { fType: typeEmpty, presentationStrategy: 'new' } },
		34: { fStruct: makeTree33, options: { fType: typeEmpty, presentationStrategy: 'new' } },
		33: { fStruct: makeTree33, options: { fType: typeEmpty, presentationStrategy: 'new', params: { '_1': { orientation: 'v' } } } },
		32: { fStruct: makeTree33, options: { presentationStrategy: 'orig', params: { '_1': { orientation: 'v' } } } },
		31: {
			fStruct: makeTree33, options: {
				fType: typePanelInfo,
				presentationStrategy: 'new',
				params: { '_1': { orientation: 'v' } }
			}
		},
		30: {
			fStruct: makeTree33, options: {
				fType: typeEmpty,
				presentationStrategy: 'rec',
				params: { '_1': { orientation: 'h' } }
			}
		},
		29: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' } } } },
		28: { fStruct: () => makeSimpleTree(8), options: { presentationStrategy: 'new', fType: type00flex } },
		27: { fStruct: makeSimplestTree, options: { presentationStrategy: 'new', fType: type00flex } },
		26: { fStruct: makeSimplestTree, options: { presentationStrategy: 'new', fType: typeEmpty } },
		25: { fStruct: makeSimplestTree, options: { presentationStrategy: 'new' } },
		24: { fStruct: makeSimplestTree, options: undefined },
		23: { fStruct: makeSimplestTree, options: { presentationStrategy: 'orig' } },
		22: { fStruct: makeSimplestTree, options: { fType: typeEmpty } },
		21: { fStruct: () => makeHugeBoardInBoardOld(25, 5), options: { fContent: contentNoParentContent } },
		20: { fStruct: () => makeHugeBoardInBoard(25, 5), options: { fContent: contentNoParentContent } },
		19: { fStruct: () => makeHugeBoardInBoard(40, 5), options: { fContent: contentNoParentContent } },
		18: { fStruct: () => makeHugeBoardInBoard(4, 2), options: { fContent: contentNoParentContent } },
		17: { fStruct: () => makeTreeNNEach(2, 4), options: { fContent: contentNoParentContent, params: { '_1': { orientation: 'w', rows: 1, cols: 2 }, '_2': { contentwalign: 'center', contenthalign: 'center' }, '_7': { contentwalign: 'center', orientation: 'w', rows: 2, cols: 2 } } } },
		16: {
			fStruct: () => makeTreeNNEach(2, 4), options: {
				fContent: contentRootExtralong,
				params: {
					'_1': { orientation: 'w', rows: 1, cols: 2 },
					'_2': { contenthalign: 'center' },
					'_7': { contentwalign: 'center', orientation: 'w', rows: 2, cols: 2 }
				}
			}
		},
		15: {
			fStruct: () => makeTreeNNEach(2, 4), options: {
				params: {
					'_1': { orientation: 'w', rows: 1, cols: 2 },
					'_7': { orientation: 'w', rows: 2, cols: 2 }
				}
			}
		},
		14: { fStruct: () => makeTreeNN(2, 4), options: { fContent: contentNoParentContentRootExtralong, params: { '_1': { orientation: 'w', rows: 1, cols: 2 }, '_2': { orientation: 'w', rows: 2, cols: 2 } } } },
		13: { fStruct: () => makeTreeNN(2, 4), options: { params: { '_1': { orientation: 'w', rows: 1, cols: 2 }, '_2': { orientation: 'w', rows: 2, cols: 2 } } } },
		12: { fStruct: () => makeTreeNN(2, 4), options: { fContent: contentNoParentContent, params: { '_1': { orientation: 'w', rows: 1, cols: 2 }, '_2': { orientation: 'w', rows: 2, cols: 2 } } } },
		11: { fStruct: () => makeSimpleTree(3), options: { fContent: contentRootExtralong, params: { '_1': { orientation: 'w', rows: 3, cols: 1 } } } },
		10: { fStruct: () => makeSimpleTree(3), options: { params: { '_1': { orientation: 'w', rows: 3, cols: 1 } } } },
		9: { fStruct: () => makeSimpleTree(3), options: { fContent: contentNoParentContent, params: { '_1': { orientation: 'w', rows: 3, cols: 1 } } } },
		8: { fStruct: () => makeSimpleTree(2), options: { fContent: contentRootExtralong, params: { '_1': { orientation: 'w', rows: 2, cols: 1 } } } },
		7: { fStruct: () => makeSimpleTree(2), options: { params: { '_1': { orientation: 'w', rows: 2, cols: 1 } } } },
		6: { fStruct: () => makeSimpleTree(2), options: { fContent: contentNoParentContent, params: { '_1': { orientation: 'w', rows: 2, cols: 1 } } } },
		5: { fStruct: () => makeSimpleTree(4), options: { fContent: contentRootExtralong, params: { '_1': { orientation: 'w', rows: 2, cols: 2 } } } },
		4: { fStruct: () => makeSimpleTree(4), options: { params: { '_1': { orientation: 'w', rows: 2, cols: 2 } } } },
		3: { fStruct: () => makeSimpleTree(2), options: { fContent: contentRootExtralong } },
		2: { fStruct: () => makeSimpleTree(2), options: { positioning: 'regular', fContent: contentRootExtralong } },
		1: { fStruct: () => makeSimpleTree(20), options: { positioning: 'regular' } },
		0: { fStruct: () => makeSimpleTree(4), options: { fContent: n => n.uid == '_1' ? 'board' : n.uid, positioning: 'regular' } },
	},
	7: {
		0: { fStruct: makeSimpleTree, options: { autoType: 'cssEmpty', fContent: contentNoParentContent } },
	},
};
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
var BG_CARD_BACK = randomColor();
var dSettings = mBy('dSettings');
const SHAPEFUNCS = { 'circle': agCircle, 'hex': agHex, 'rect': agRect, };






















