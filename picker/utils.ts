import {hsv2rgb, str2rgb, rgb2Hsv} from './colorUtils';

export interface XY {
  x: number;
  y: number;
}

export const isXyInCircle = ({x, y}: XY, r: number): boolean => {
  const dx2 = Math.pow(x - r, 2);
  const dy2 = Math.pow(y - r, 2);
  const r2 = Math.pow(r, 2);

  return dx2 + dy2 < r2;
};

export const xyOnCircle = (xy: XY, r: number): XY => {
  if (isXyInCircle(xy, r)) {
    return xy;
  }

  const {x, y} = xy;
  const xv = x - r;
  const yv = y - r;
  const len = Math.sqrt(xv * xv + yv * yv);
  const multiplier = r / len;

  return {x: r + multiplier * xv, y: r + multiplier * yv};
};

const extendedWhiteKoef = 0.33;
// returns RGB string
export const xy2color = ({x: x1, y: y1}: XY, radius: number): string => {
  const x0 = radius;
  const y0 = radius;

  const dx = Math.round(x1 - x0);
  const dy = Math.round(y1 - y0);
  const distanceToCenter = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

  let deg = Math.abs((Math.atan2(dx, dy) * 180) / Math.PI - 180);

  const hue = deg;
  const extendedWhiteCircleRadius = radius * extendedWhiteKoef;
  let saturation = (distanceToCenter - extendedWhiteCircleRadius) / radius;
  if (distanceToCenter <= extendedWhiteCircleRadius) {
    saturation = 0;
  } else {
    saturation = Math.round(1.5 * saturation * 100) / 100;
  }
  const value = 1.0;

  const {red, green, blue} = hsv2rgb({hue, saturation, value});

  return `rgb(${red},${green},${blue})`;
};

// color is HEX/RGB/RGBA string
export const color2xy = (color: string, radius: number): XY => {
  const rgb = str2rgb(color);

  const {hue: angle, saturation} = rgb2Hsv(rgb);

  if (saturation === 0) {
    return {x: radius, y: radius};
  }
  const Cx = radius;
  const Cy = radius;
  const extendedWhiteCircleRadius = radius * extendedWhiteKoef;
  const distanceFromCenter =
    extendedWhiteCircleRadius +
    saturation * (radius - extendedWhiteCircleRadius);

  const angleRadians = (angle + -90) * (Math.PI / 180);
  const x = Cx + radius * Math.cos(angleRadians);
  const y = Cy + radius * Math.sin(angleRadians);

  var xDist = x - Cx;
  var yDist = y - Cy;

  const fractionOfTotal = distanceFromCenter / radius;

  return xyOnCircle(
    {
      x: Cx + xDist * fractionOfTotal,
      y: Cy + yDist * fractionOfTotal,
    },
    radius,
  );
};
