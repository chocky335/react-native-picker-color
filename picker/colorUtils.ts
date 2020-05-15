const RGB_MAX = 255;
const HUE_MAX = 360;
const SV_MAX = 1;

interface HSV {
  // range [0, 360]
  hue: number;
  // range [0,1]
  saturation: number;
  // range [0,1]
  value: number;
}
interface RGB {
  // range [0,255]
  red: number;
  // range [0,255]
  green: number;
  // range [0,255]
  blue: number;
}

export function hsv2rgb({hue, saturation, value}: HSV): RGB {
  let chroma = value * saturation;
  let hue1 = hue / 60;
  let x = chroma * (1 - Math.abs((hue1 % 2) - 1));
  let r1, g1, b1;
  if (hue1 >= 0 && hue1 <= 1) {
    [r1, g1, b1] = [chroma, x, 0];
  } else if (hue1 >= 1 && hue1 <= 2) {
    [r1, g1, b1] = [x, chroma, 0];
  } else if (hue1 >= 2 && hue1 <= 3) {
    [r1, g1, b1] = [0, chroma, x];
  } else if (hue1 >= 3 && hue1 <= 4) {
    [r1, g1, b1] = [0, x, chroma];
  } else if (hue1 >= 4 && hue1 <= 5) {
    [r1, g1, b1] = [x, 0, chroma];
  } else if (hue1 >= 5 && hue1 <= 6) {
    [r1, g1, b1] = [chroma, 0, x];
  } else {
    throw new Error(`Invalid hue value = ${hue}. Valid range is [0, 360]`);
  }

  let m = value - chroma;
  let [r, g, b] = [r1 + m, g1 + m, b1 + m];

  return {
    red: Math.round(r * 255),
    green: Math.round(g * 255),
    blue: Math.round(b * 255),
  };
}

// color is HEX/RGB/RGBA string
export const str2rgb = (hexORrgb: string): RGB => {
  let rgbSubset = hexORrgb
    .split('(')
    .pop()
    ?.split(')')
    .shift()
    ?.split(',')
    .slice(0, 3)
    .map(Number)
    .filter((n) => !isNaN(n));

  if (rgbSubset && rgbSubset.length === 3) {
    const [red, green, blue] = rgbSubset;
    return {red, green, blue};
  }

  return hex2Rgb(hexORrgb);
};

const hex2Rgb = function (hex: string): RGB {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);

  if (!result) {
    throw new Error('Invalid HEX color = ${hex}');
  }

  return {
    red: parseInt(result[1], 16),
    green: parseInt(result[2], 16),
    blue: parseInt(result[3], 16),
  };
};

export const rgb2Hsv = function ({red, green, blue}: RGB): HSV {
  // It converts [0,255] format, to [0,1]
  const r = red === RGB_MAX ? 1 : (red % RGB_MAX) / RGB_MAX;
  const g = green === RGB_MAX ? 1 : (green % RGB_MAX) / RGB_MAX;
  const b = blue === RGB_MAX ? 1 : (blue % RGB_MAX) / RGB_MAX;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  var d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    hue: +(h * HUE_MAX).toFixed(2),
    saturation: +(s * SV_MAX).toFixed(2),
    value: +(v * SV_MAX).toFixed(2),
  };
};
