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
const buildRgb = (imageData) => {
  const rgbValues = [];
  for (let i = 0; i < imageData.length; i += 4) {
    const rgb = {
      r: imageData[i],
      g: imageData[i + 1],
      b: imageData[i + 2],
    };
    rgbValues.push(rgb);
  }
  return rgbValues;
};
const calculateColorDifference = (color1, color2) => {
  const rDifference = Math.pow(color2.r - color1.r, 2);
  const gDifference = Math.pow(color2.g - color1.g, 2);
  const bDifference = Math.pow(color2.b - color1.b, 2);
  return rDifference + gDifference + bDifference;
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
const complementaryColor = color => {
  const hexColor = color.replace('#', '0x');
  return `#${('000000' + ('0xffffff' ^ hexColor).toString(16)).slice(-6)}`;
};
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
const fieldSorter = fields => (a, b) =>
  fields
    .map(o => {
      let dir = 1;
      if (o[0] === '-') {
        dir = -1;
        o = o.substring(1);
      }
      return a[o] > b[o] ? dir : a[o] < b[o] ? -dir : 0;
    })
    .reduce((p, n) => (p ? p : n), 0);
const findBiggestColorRange = (rgbValues) => {
  let rMin = Number.MAX_VALUE;
  let gMin = Number.MAX_VALUE;
  let bMin = Number.MAX_VALUE;
  let rMax = Number.MIN_VALUE;
  let gMax = Number.MIN_VALUE;
  let bMax = Number.MIN_VALUE;
  rgbValues.forEach((pixel) => {
    rMin = Math.min(rMin, pixel.r);
    gMin = Math.min(gMin, pixel.g);
    bMin = Math.min(bMin, pixel.b);
    rMax = Math.max(rMax, pixel.r);
    gMax = Math.max(gMax, pixel.g);
    bMax = Math.max(bMax, pixel.b);
  });
  const rRange = rMax - rMin;
  const gRange = gMax - gMin;
  const bRange = bMax - bMin;
  const biggestRange = Math.max(rRange, gRange, bRange);
  if (biggestRange === rRange) {
    return "r";
  } else if (biggestRange === gRange) {
    return "g";
  } else {
    return "b";
  }
};
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
const hslToHexCOOL = (hslColor) => {
  const hslColorCopy = { ...hslColor };
  hslColorCopy.l /= 100;
  const a =
    (hslColorCopy.s * Math.min(hslColorCopy.l, 1 - hslColorCopy.l)) / 100;
  const f = (n) => {
    const k = (n + hslColorCopy.h / 30) % 12;
    const color = hslColorCopy.l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};
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
const displayMessages = () => {
  const messagesHTML = messages
    .map(message => createMessageHTML(message))
    .join('');
  messagesList.innerHTML = messagesHTML;
};
const OPS = {
  'first': { cmd: 'add', link: 'to', wr: '+', sp: 'plus', f: (a, b) => (a + b), min: 20, max: 100 },
  'plus': { cmd: 'add', link: 'to', wr: '+', sp: 'plus', f: (a, b) => (a + b), min: 3, max: 30 },
  'minus': { cmd: 'subtract', link: 'from', wr: '-', sp: 'minus', f: (a, b) => (a - b), min: 1, max: 10 },
  'div': { cmd: 'divide', link: 'by', wr: ':', sp: 'divided by', f: (a, b) => (a / b), min: 2, max: 10 },
  'intdiv': { cmd: 'divide', link: 'by', wr: 'div', sp: 'divided by', f: (a, b) => (Math.floor(a / b)), min: 1, max: 10 },
  'mult': { cmd: 'multiply', link: 'by', wr: 'x', sp: 'times', f: (a, b) => (a * b), min: 2, max: 10 },
  'pow': { cmd: 'build', link: 'to the power of', wr: '^', sp: 'to the power of', f: (a, b) => (Math.pow(a, b)), min: 0, max: 20 },
  'mod': { cmd: 'build', link: 'modulo', wr: '%', sp: 'modulo', f: (a, b) => (a % b), min: 0, max: 20 },
  'l': { cmd: 'true or false?', link: 'less than', wr: '<', sp: 'less than', f: (a, b) => (a < b) },
  'g': { cmd: 'true or false?', link: 'greater than', wr: '>', sp: 'greater than', f: (a, b) => (a > b) },
  'leq': { cmd: 'true or false?', link: 'less or equal', wr: '<=', sp: 'less or equal', f: (a, b) => (a <= b) },
  'geq': { cmd: 'true or false?', link: 'greater or equal', wr: '>=', sp: 'greater or equal', f: (a, b) => (a >= b) },
  'eq': { cmd: 'true or false?', link: 'equal', wr: '=', sp: 'equal', f: (a, b) => (a == b) },
  'neq': { cmd: 'true or false?', link: 'unequal', wr: '#', sp: 'unequal', f: (a, b) => (a != b) },
  'and': { cmd: 'true or false?', link: 'and', wr: '&&', sp: 'and', f: (a, b) => (a && b) },
  'or': { cmd: 'true or false?', link: 'or', wr: '||', sp: 'or', f: (a, b) => (a || b) },
  'nand': { cmd: 'true or false?', link: 'nand', wr: 'nand', sp: 'nand', f: (a, b) => (!(a && b)) },
  'nor': { cmd: 'true or false?', link: 'nor', wr: 'nor', sp: 'nor', f: (a, b) => (!(a || b)) },
  'xor': { cmd: 'true or false?', link: 'xor', wr: 'xor', sp: 'xor', f: (a, b) => (a && !b || !a && b) },
}
const orderByLuminance = (rgbValues) => {
  const calculateLuminance = (p) => {
    return 0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b;
  };
  return rgbValues.sort((p1, p2) => {
    return calculateLuminance(p2) - calculateLuminance(p1);
  });
};
const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray
const _overwriteMerge = (destinationArray, sourceArray, options) => sourceArray
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
const quantization = (rgbValues, depth) => {
  const MAX_DEPTH = 4;
  if (depth === MAX_DEPTH || rgbValues.length === 0) {
    const color = rgbValues.reduce(
      (prev, curr) => {
        prev.r += curr.r;
        prev.g += curr.g;
        prev.b += curr.b;
        return prev;
      },
      {
        r: 0,
        g: 0,
        b: 0,
      }
    );
    color.r = Math.round(color.r / rgbValues.length);
    color.g = Math.round(color.g / rgbValues.length);
    color.b = Math.round(color.b / rgbValues.length);
    return [color];
  }
  const componentToSortBy = findBiggestColorRange(rgbValues);
  rgbValues.sort((p1, p2) => {
    return p1[componentToSortBy] - p2[componentToSortBy];
  });
  const mid = rgbValues.length / 2;
  return [
    ...quantization(rgbValues.slice(0, mid), depth + 1),
    ...quantization(rgbValues.slice(mid + 1), depth + 1),
  ];
};
const randomRange = (min, max) => min + Math.random() * (max - min)
const normalWalk = ({ peep, props }) => {
  const {
    startX,
    startY,
    endX
  } = props
  const xDuration = 10
  const yDuration = 0.25
  const tl = gsap.timeline()
  tl.timeScale(randomRange(0.5, 1.5))
  tl.to(peep, {
    duration: xDuration,
    x: endX,
    ease: 'none'
  }, 0)
  tl.to(peep, {
    duration: yDuration,
    repeat: xDuration / yDuration,
    yoyo: true,
    y: startY - 10
  }, 0)
  return tl
}
const randomIndex = (array) => randomRange(0, array.length) | 0
const getRandomFromArray = (array) => (array[randomIndex(array) | 0])
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
const removeFromArray = (array, i) => array.splice(i, 1)[0]
const removeItemFromArray = (array, item) => removeFromArray(array, array.indexOf(item))
const removeRandomFromArray = (array) => removeFromArray(array, randomIndex(array))
const rgbToHexCOOL = (pixel) => {
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };
  return (
    "#" +
    componentToHex(pixel.r) +
    componentToHex(pixel.g) +
    componentToHex(pixel.b)
  ).toUpperCase();
};
const buildPalette = (colorsList) => {
  const paletteContainer = document.getElementById("palette");
  const complementaryContainer = document.getElementById("complementary");
  paletteContainer.innerHTML = "";
  complementaryContainer.innerHTML = "";
  const orderedByColor = orderByLuminance(colorsList);
  const hslColors = convertRGBtoHSL(orderedByColor);
  for (let i = 0; i < orderedByColor.length; i++) {
    const hexColor = rgbToHexCOOL(orderedByColor[i]);
    const hexColorComplementary = hslToHexCOOL(hslColors[i]);
    if (i > 0) {
      const difference = calculateColorDifference(
        orderedByColor[i],
        orderedByColor[i - 1]
      );
      if (difference < 120) {
        continue;
      }
    }
    const colorElement = document.createElement("div");
    colorElement.style.backgroundColor = hexColor;
    colorElement.appendChild(document.createTextNode(hexColor));
    paletteContainer.appendChild(colorElement);
    if (hslColors[i].h) {
      const complementaryElement = document.createElement("div");
      complementaryElement.style.backgroundColor = `hsl(${hslColors[i].h},${hslColors[i].s}%,${hslColors[i].l}%)`;
      complementaryElement.appendChild(
        document.createTextNode(hexColorComplementary)
      );
      complementaryContainer.appendChild(complementaryElement);
    }
  }
};
const mainCOOL = () => {
  const imgFile = document.getElementById("imgfile");
  const image = new Image();
  const file = imgFile.files[0];
  const fileReader = new FileReader();
  fileReader.onload = () => {
    image.onload = () => {
      const canvas = document.getElementById("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const rgbArray = buildRgb(imageData.data);
      const quantColors = quantization(rgbArray, 0);
      buildPalette(quantColors);
    };
    image.src = fileReader.result;
  };
  fileReader.readAsDataURL(file);
};
const RUPDATE = {
  info: mNodeChangeContent,
};
const sleep = m => new Promise(r => setTimeout(r, m))
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
const walks = [
  normalWalk,
]
//#endregion

