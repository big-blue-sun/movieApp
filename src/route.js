import React, { Component } from 'react';
import { SafeAreaView ,Dimensions} from 'react-native';
import { NavigationContainer,  } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Ionicons from "react-native-vector-icons/Ionicons"
import HomeScreen from "./screens/Home/home";
import DetailScreen from "./screens/Details/details"
import Profile from "./screens/Profile/profile"

const w=Dimensions.get("window").width
const HomeStack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();
const Tabs = ({ navigation }) => (
    <Tab.Navigator
        initialRouteName="Home"
        activeColor="#ff4757"
        inactiveColor="#a4b0be"
        shifting={true}
        barStyle={{ backgroundColor: 'white',height:w*0.12}}
        
    >
        <Tab.Screen name="Home" component={HomeScreen}
            options={({ route }) => ({
                tabBarLabel: 'Home',
                tabBarIcon: ({ color }) => (
                    <Ionicons name="home" color={color} size={26} />
                ),
            })}
        />
        <Tab.Screen name="Profile" component={Profile}
            options={{
                tabBarLabel: 'Profile',
                tabBarIcon: ({ color }) => (
                    <Ionicons name="person-circle-outline" color={color} size={26} />
                ),
            }} />
    </Tab.Navigator>
);


export default class route extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
        return (
            <SafeAreaView style={{ flex: 1, }}>
                <NavigationContainer>
                    <HomeStack.Navigator
                        screenOptions={{
                            headerShown: false
                        }}>
                        <HomeStack.Screen name="Home" component={Tabs} />
                        <HomeStack.Screen name="Details" component={DetailScreen} />

                    </HomeStack.Navigator>
                </NavigationContainer>
            </SafeAreaView>

        );
    }
}
