import React, {useState, useMemo} from 'react';
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  View,
  PanResponderGestureState,
} from 'react-native';
import {xyOnCircle, isXyInCircle, xy2color, color2xy} from './utils';

const circleImage = require('./hsv-circle.png');

const PICKER_SIZE = 20;
const RADIUS = 150;
const DEFAULT_COLOR = '#fff';

interface Props {
  radius?: number;
  pickerRadius?: number;
  initialColor?: string;
  onColorChange?: (rgb: string) => void;
  onColorChangeComplete: (rgb: string) => void;
}

export default function ColorPickerHSV({
  radius = RADIUS,
  pickerRadius = PICKER_SIZE,
  initialColor = DEFAULT_COLOR,
  onColorChange,
  onColorChangeComplete,
}: Props) {
  const offsetXY = useMemo(() => ({x: -pickerRadius, y: -pickerRadius}), [
    pickerRadius,
  ]);
  const initialXY = useMemo(() => color2xy(initialColor, radius), [
    initialColor,
    radius,
  ]);

  const [currentXY, setCurrentXY] = useState({
    x: initialXY.x,
    y: initialXY.y,
  });

  const handleXYchange = (
    {dx, dy}: PanResponderGestureState,
    isReleased?: boolean,
  ) => {
    const xy = xyOnCircle({x: currentXY.x + dx, y: currentXY.y + dy}, radius);
    const color = xy2color(xy, radius);

    setCurrentXY(xy);

    onColorChange && onColorChange(color);
    isReleased && onColorChangeComplete(color);
  };

  const color = xy2color(currentXY, radius);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponderCapture: ({
      nativeEvent: {locationX: x, locationY: y},
    }) => {
      const xy = {x, y};
      const isDragguble = isXyInCircle(xy, radius);

      if (isDragguble) {
        setCurrentXY(xy);
      }

      return isDragguble;
    },
    onPanResponderMove: (_, event) => handleXYchange(event),
    onPanResponderRelease: (_, event) => handleXYchange(event, true),
  });

  const pickerSizeStyle = circleStyle(pickerRadius);
  const hsvPaletteSizeStyle = circleStyle(radius);

  const circlePalletteStyle = [styles.img, hsvPaletteSizeStyle];
  const pickerStyle = [
    styles.circle,
    pickerSizeStyle,
    {
      backgroundColor: color,
      left: currentXY.x + offsetXY.x,
      top: currentXY.y + offsetXY.x,
    },
  ];

  return (
    <View style={styles.coverResponder}>
      <View style={circleStyle(radius)} {...panResponder.panHandlers}>
        <Image style={circlePalletteStyle} source={circleImage} />
        <Animated.View style={pickerStyle} pointerEvents="none" />
      </View>
    </View>
  );
}

const circleStyle = (r: number) => ({
  height: r * 2,
  width: r * 2,
  borderRadius: r,
});

const styles = StyleSheet.create({
  coverResponder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    alignSelf: 'center',
  },
  circle: {
    position: 'absolute',
    backgroundColor: '#EEEEEE',
    borderWidth: 3,
    borderColor: '#EEEEEE',
    elevation: 3,
    shadowColor: 'rgb(46, 48, 58)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
});
