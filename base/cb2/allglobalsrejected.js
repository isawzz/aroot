//#region consts
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
const colorShadeX = (c, amt) => {
  let col = colorHex(c);
  col = col.replace(/^#/, '')
  if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2]
  let [r, g, b] = col.match(/.{2}/g);
  ([r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt])
  r = Math.max(Math.min(255, r), 0).toString(16)
  g = Math.max(Math.min(255, g), 0).toString(16)
  b = Math.max(Math.min(255, b), 0).toString(16)
  const rr = (r.length < 2 ? '0' : '') + r
  const gg = (g.length < 2 ? '0' : '') + g
  const bb = (b.length < 2 ? '0' : '') + b
  return `#${rr}${gg}${bb}`
}
const convertRGBtoHSL = (rgbValues) => {
  return rgbValues.map((pixel) => {
    let hue,
      saturation,
      luminance = 0;
    let redOpposite = pixel.r / 255;
    let greenOpposite = pixel.g / 255;
    let blueOpposite = pixel.b / 255;
    const Cmax = Math.max(redOpposite, greenOpposite, blueOpposite);
    const Cmin = Math.min(redOpposite, greenOpposite, blueOpposite);
    const difference = Cmax - Cmin;
    luminance = (Cmax + Cmin) / 2.0;
    if (luminance <= 0.5) {
      saturation = difference / (Cmax + Cmin);
    } else if (luminance >= 0.5) {
      saturation = difference / (2.0 - Cmax - Cmin);
    }
    const maxColorValue = Math.max(pixel.r, pixel.g, pixel.b);
    if (maxColorValue === pixel.r) {
      hue = (greenOpposite - blueOpposite) / difference;
    } else if (maxColorValue === pixel.g) {
      hue = 2.0 + (blueOpposite - redOpposite) / difference;
    } else {
      hue = 4.0 + (greenOpposite - blueOpposite) / difference;
    }
    hue = hue * 60;
    if (hue < 0) {
      hue = hue + 360;
    }
    if (difference === 0) {
      return false;
    }
    return {
      h: Math.round(hue) + 180,
      s: parseFloat(saturation * 100).toFixed(2),
      l: parseFloat(luminance * 100).toFixed(2),
    };
  });
};
const CRIMSON = colorDarker('crimson', .25);
const getText = function (feature, resolution, dom) {
  const type = dom.text.value;
  const maxResolution = dom.maxreso.value;
  let text = feature.get('name');
  if (resolution > maxResolution) {
    text = '';
  } else if (type == 'hide') {
    text = '';
  } else if (type == 'shorten') {
    text = text.trunc(12);
  } else if (
    type == 'wrap' &&
    (!dom.placement || dom.placement.value != 'line')
  ) {
    text = stringDivider(text, 16, '\n');
  }
  return text;
};
const createTextStyle = function (feature, resolution, dom) {
  const align = dom.align.value;
  const baseline = dom.baseline.value;
  const size = dom.size.value;
  const height = dom.height.value;
  const offsetX = parseInt(dom.offsetX.value, 10);
  const offsetY = parseInt(dom.offsetY.value, 10);
  const weight = dom.weight.value;
  const placement = dom.placement ? dom.placement.value : undefined;
  const maxAngle = dom.maxangle ? parseFloat(dom.maxangle.value) : undefined;
  const overflow = dom.overflow ? dom.overflow.value == 'true' : undefined;
  const rotation = parseFloat(dom.rotation.value);
  if (dom.font.value == "'Open Sans'" && !openSansAdded) {
    const openSans = document.createElement('link');
    openSans.href = 'https://fonts.googleapis.com/css?family=Open+Sans';
    openSans.rel = 'stylesheet';
    document.head.appendChild(openSans);
    openSansAdded = true;
  }
  const font = weight + ' ' + size + '/' + height + ' ' + dom.font.value;
  const fillColor = dom.color.value;
  const outlineColor = dom.outline.value;
  const outlineWidth = parseInt(dom.outlineWidth.value, 10);
  return new Text({
    textAlign: align == '' ? undefined : align,
    textBaseline: baseline,
    font: font,
    text: getText(feature, resolution, dom),
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({ color: outlineColor, width: outlineWidth }),
    offsetX: offsetX,
    offsetY: offsetY,
    placement: placement,
    maxAngle: maxAngle,
    overflow: overflow,
    rotation: rotation,
  });
};
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
const createMessageHTML = message => {
  if (isString(message)) {
    return `
      <p class="secondary-text text-center mb-2">${message}</p>
    `;
  } else if (isString(message)) {
    return `
    <div>
      <p style="color:red" class="message-content">${message}</p>
    </div>
    `;
  }
  return `
  <div class="message ${message.type === messageTypes.LEFT ? 'message-left' : 'message-right'
    }">
    <div class="message-details flex">
      <p class="flex-grow-1 message-author">${message.author}</p>
      <p class="message-date">${message.date}</p>
    </div>
    <p class="message-content">${message.content}</p>
  </div>
  `;
};
const randomRange = (min, max) => min + Math.random() * (max - min)
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
const RUPDATE = {
  info: mNodeChangeContent,
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
const resetPeep = ({ stage, peep }) => {
  const direction = Math.random() > 0.5 ? 1 : -1
  const offsetY = 100 - 250 * gsap.parseEase('power2.in')(Math.random())
  const startY = stage.height - peep.height + offsetY
  let startX
  let endX
  if (direction === 1) {
    startX = -peep.width
    endX = stage.width
    peep.scaleX = 1
  } else {
    startX = stage.width + peep.width
    endX = 0
    peep.scaleX = -1
  }
  peep.x = startX
  peep.y = startY
  peep.anchorY = startY
  return {
    startX,
    startY,
    endX
  }
}
//#endregion

