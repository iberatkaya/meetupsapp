import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Clipboard, ScrollView, ToastAndroid, Image } from 'react-native';
import { NavigationStackProp } from 'react-navigation-stack';
import AppIntroSlider from 'react-native-app-intro-slider';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-community/async-storage';

const slides = [
    {
        key: '1',
        title: 'Welcome to MeetUps!',
        text: 'Arrange group meetups\nwith your friends',
        image: require('../assets/1.png'),
        backgroundColor: '#83B4FF',
        style: {
            width: 200,
            height: 200,
            resizeMode: 'stretch'
        }
    },
    {
        key: '2',
        title: 'Create Rooms',
        text: 'Create a room and send\nthe link to your friend!',
        image: require('../assets/2.png'),
        backgroundColor: '#6CDF60',
        style: {
            width: 280,
            height: 80,
            resizeMode: 'stretch'
        }
    },
    {
        key: '3',
        title: 'Join Rooms',
        text: 'Join a room and check available\ntime slots for your next group meetup!',
        image: require('../assets/3.png'),
        backgroundColor: '#f7a700',
        style: {
            width: 280,
            height: 80,
            resizeMode: 'stretch'
        }
    }
];

type State = {

};

type Props = {
    navigation: NavigationStackProp<{}>,
};

class Intro extends React.Component<Props, State>{

    
    async componentDidMount() {
        let firstenter = await this.getData('firstenter');
        console.log(firstenter);
        if (firstenter === "true" || firstenter === undefined || firstenter === null) {
            SplashScreen.hide();
            await this.storeData("firstenter", "false");
        }
        else {
            this.props.navigation.navigate("Home");
        }
    }


    getData = async (key: string) => {
        try {
            const value = await AsyncStorage.getItem(key);
            if (value !== null) {
                console.log(value);
                return value;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    storeData = async (key: string, val: string) => {
        try {
            await AsyncStorage.setItem(key, val);
        } catch (e) {
        }
    }

    _renderItem = ({ item }: any) => {
        return (
            <View style={{ ...styles.mainContent, backgroundColor: item.backgroundColor }}>
                <Text style={styles.title}>{item.title}</Text>
                <Image style={item.style} source={item.image} />
                <Text style={styles.text}>{item.text}</Text>
            </View>
        );
    }

    _onDone = async () => {
        this.props.navigation.navigate("Home");
    }


    static navigationOptions = () => ({
        header: null
    })



    render() {
        return (
            <View style={{width: '100%', height: '100%'}}>
                <StatusBar backgroundColor="rgb(127,181,255)" />
                <AppIntroSlider renderItem={this._renderItem} slides={slides} onDone={this._onDone} />
            </View>
        );

    }
}

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 16
    },
    title: {
        fontSize: 26,
        color: 'white',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 4,
    },
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
    }
});



export default Intro;