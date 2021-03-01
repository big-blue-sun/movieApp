import React, { Component } from 'react';
import { View, Text } from 'react-native';

export default class profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <View style={{alignItems:"center",justifyContent:"center"}}>
        <Text> User Profile </Text>
      </View>
    );
  }
}
