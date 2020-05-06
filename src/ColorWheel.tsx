import React, {Component} from 'react'
import {
  Animated,
  Image,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
  ViewStyle,
  GestureResponderEvent,
  NativeTouchEvent,
  PanResponderGestureState
} from 'react-native'
// @ts-ignore
import colorsys from 'colorsys'

interface HSV {
  h: number, s: number, v: number
}
interface State {
  offset: { x: number, y: number },
  currentColor: string,
  pan: Animated.ValueXY,
  radius: number,

  height?: number,
  width?: number,
  top?: number,
  left?: number,
  hsv?: HSV,
  panHandlerReady?: boolean
}

interface Props {
  initialColor: string
  thumbSize: number
  style: ViewStyle
  thumbStyle: ViewStyle
  onColorChange: (hsv: HSV) => {},
  onColorChangeComplete: (hsv: HSV) => {},
}

export default class ColorWheel extends Component<Props, State> {
  static defaultProps = {
    thumbSize: 50,
    initialColor: '#ffffff',
    onColorChange: () => {},
  }

  constructor (props: Props) {
    super(props)
    this.state = {
      offset: {x: 0, y: 0},
      currentColor: props.initialColor,
      pan: new Animated.ValueXY(),
      radius: 0,
    }
  }

  _panResponder: any
  componentDidMount = () => {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponderCapture: ({nativeEvent}: GestureResponderEvent) => {
        if (this.calcPolarPage(nativeEvent).radius > 1) return false
        this.updateColor(nativeEvent)
        this.setState({panHandlerReady: true})

        this.state.pan.setValue({
          x: -this.state.left! + nativeEvent.pageX - this.props.thumbSize / 2,
          y: -this.state.top! + nativeEvent.pageY - this.props.thumbSize / 2,
        })
        return true
      },
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => true,
      onPanResponderMove: (event, gestureState) => {
        if (this.calcPolarMove(gestureState).radius > 1) return

        this.resetPanHandler()
        return Animated.event(
          [
            null,
            {
              dx: this.state.pan.x,
              dy: this.state.pan.y,
            },
          ],
          {listener: ({ nativeEvent}) => this.updateColor(nativeEvent as any), useNativeDriver: false}
        )(event, gestureState)
      },
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: ({nativeEvent}) => {
        this.setState({panHandlerReady: true})
        this.state.pan.flattenOffset()
        const {radius} = this.calcPolarPage(nativeEvent)
        if (radius < 0.1) {
          this.forceUpdateColor('#ffffff')
        }

        if (this.props.onColorChangeComplete) {
          this.props.onColorChangeComplete(this.state.hsv!);
        }
      },
    })
  }

  onLayout () {
    this.measureOffset()
  }

  measureOffset () {
    /*
    * const {x, y, width, height} = nativeEvent.layout
    * onlayout values are different than measureInWindow
    * x and y are the distances to its previous element
    * but in measureInWindow they are relative to the window
    */
    this.self.measureInWindow((x: number, y: number, width: number, height: number) => {
      const window = Dimensions.get('window')
      const absX = x % width
      const radius = Math.min(width, height) / 2
      const offset = {
        x: absX + width / 2,
        y: y % window.height + height / 2,
      }

      this.setState({
        offset,
        radius,
        height,
        width,
        top: y % window.height,
        left: absX,
      })
      this.forceUpdateColor(this.state.currentColor)
    })
  }

  calcPolarPage (gestureState: NativeTouchEvent) {
    const {
      pageX, pageY,
    } = gestureState
    const [x, y] = [pageX , pageY]
    const [dx, dy] = [x - this.state.offset.x, y - this.state.offset.y]
    return {
      deg: Math.atan2(dy, dx) * (-180 / Math.PI),
      // pitagoras r^2 = x^2 + y^2 normalized
      radius: Math.sqrt(dy * dy + dx * dx) / this.state.radius,
    }
  }
  calcPolarMove (gestureState: PanResponderGestureState) {
    const {
      moveX, moveY,
    } = gestureState
    const [x, y] = [moveX, moveY]
    const [dx, dy] = [x - this.state.offset.x, y - this.state.offset.y]
    return {
      deg: Math.atan2(dy, dx) * (-180 / Math.PI),
      // pitagoras r^2 = x^2 + y^2 normalized
      radius: Math.sqrt(dy * dy + dx * dx) / this.state.radius,
    }
  }


  resetPanHandler () {
    if (!this.state.panHandlerReady) {
      return
    }

    this.setState({panHandlerReady: false})
    this.state.pan.setOffset({
      x: (this.state.pan.x as any)._value,
      y: (this.state.pan.y as any)._value,
    })
    this.state.pan.setValue({x: 0, y: 0})
  }

  calcCartesian (deg: number, radius: number) {
    const r = radius * this.state.radius // was normalized
    const rad = Math.PI * deg / 180
    const x = r * Math.cos(rad)
    const y = r * Math.sin(rad)
    return {
      left: this.state.width! / 2 + x,
      top: this.state.height! / 2 - y,
    }
  }

  updateColor = (nativeEvent: NativeTouchEvent) => {
    const {deg, radius} = this.calcPolarPage(nativeEvent)
    const hsv = {h: deg, s: 100 * radius, v: 100};
    const currentColor = colorsys.hsv2Hex(hsv)
    this.setState({hsv, currentColor})
    this.props.onColorChange(hsv);
  }

  forceUpdateColor = (color: string) => {
    const {h, s, v} = colorsys.hex2Hsv(color)
    const {left, top} = this.calcCartesian(h, s / 100)
    this.setState({currentColor: color})
    this.props.onColorChange({h, s, v})
    this.state.pan.setValue({
      x: left - this.props.thumbSize / 2,
      y: top - this.props.thumbSize / 2,
    })
  }

  animatedUpdate = (color: string) => {
    const {h, s, v} = colorsys.hex2Hsv(color)
    const {left, top} = this.calcCartesian(h, s / 100)
    this.setState({currentColor: color})
    this.props.onColorChange({h, s, v})
    Animated.spring(this.state.pan, {
      toValue: {
        x: left - this.props.thumbSize / 2,
        y: top - this.props.thumbSize / 2,
      },
      useNativeDriver: false
    }).start()
  }

  self: any
  render () {
    const {radius} = this.state
    const thumbStyle = [
      styles.circle,
      this.props.thumbStyle,
      {
        width: this.props.thumbSize,
        height: this.props.thumbSize,
        borderRadius: this.props.thumbSize / 2,
        backgroundColor: this.state.currentColor,
        opacity: this.state.offset.x === 0 ? 0 : 1,
      },
    ]

    const panHandlers = this._panResponder && this._panResponder.panHandlers || {}

    return (
      <View
        ref={node => {
          this.self = node
        }}
        {...panHandlers}
        onLayout={this.onLayout}
        style={[styles.coverResponder, this.props.style]}>
        <Image
          style={[styles.img, 
                  {
                    height: radius * 2 - this.props.thumbSize,
                    width: radius * 2 - this.props.thumbSize
                  }]}
          source={require('./color-wheel.png')}
        />
        <Animated.View style={[this.state.pan.getLayout(), thumbStyle]} />
      </View>
    )
  }
}

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
})
