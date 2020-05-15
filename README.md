# :art: react-native-picker-color
![npm version](https://badge.fury.io/js/react-native-picker-color.svg)

A react native reusable and color picker wheel

## Usage

```javascript
import React, { Component } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { ColorWheel } from 'react-native-picker-color';

const Example = ({onChange}) => (
  <View style={{flex: 1}}>
    <ColorPickerHSV
      initialColor="#ee0000"
      onColorChange={color => console.log(color)}
      onColorChangeComplete={color => console.log(color)}
      radius={200}
      pickerSize={25}
    />
  </View>
);
```

## Props

| Name                    | Description                                    |          Type           | Optional |
|-------------------------|------------------------------------------------|-------------------------|----------|
| `initialColor`          | Initial value in hex/rgb format                |         String          |    Yes   |
| `onColorChange`         | Callback when the value is changed or moved    |  (rgb: string) => void  |    Yes   |
| `onColorChangeComplete` | Callback on mouseup or drag event has finished |  (rgb: string) => void  |    No    |
| `radius`                | Width of circle palette                        |         Number          |    Yes   |
| `pickerRadius`          | Width of draggable picker                      |         Number          |    Yes   |

PRs and issues are more than welcome.
