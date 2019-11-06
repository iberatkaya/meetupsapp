import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet, Image, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer'
import HomeScreen from './screens/Home';
import CreateRoomScreen from './screens/CreateRoom';
import JoinRoomScreen from './screens/JoinRoom';
import HistoryScreen from './screens/History';

const { width, height } = Dimensions.get('window');

const Stack = createStackNavigator({
    Home: HomeScreen,
    CreateRoom: CreateRoomScreen,
    JoinRoom: JoinRoomScreen,
    History: HistoryScreen
}, {
    defaultNavigationOptions: {
        headerTintColor: 'white',
        headerStyle: {
            backgroundColor: 'rgb(157,201,255)',
            elevation: 2
        }
    }
});


const Draw = createDrawerNavigator({
    Home: {
        screen: Stack
    },
    History: {
        screen: HistoryScreen
    }
}, {
    drawerWidth: width * 0.8,
    contentComponent:
        (props) => (
            <ScrollView>
                <View style={{ marginBottom: 4, height: height * 0.25, alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                        source={require('./assets/header.png')}
                        style={{ width: width * 0.8, height: height * 0.25 }}
                    />
                </View>
                <TouchableOpacity
                    style={styles.items}
                    onPress={() => { props.navigation.navigate('History') }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="history" size={24} color="#aaa" />
                        <Text style={{ fontSize: 14, fontWeight: 'bold', paddingLeft: 32, color: 'black' }}>History</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.items}
                    onPress={() => { Linking.openURL("mailto:ibraberatkaya@gmail.com?subject=Feedback"); }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="email" size={24} color="#aaa" />
                        <Text style={{ fontSize: 14, fontWeight: 'bold', paddingLeft: 32, color: 'black' }}>Feedback</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        )
});


Stack.navigationOptions = ({ navigation }: any) => {
    let name = (navigation.state.index !== undefined ? navigation.state.routes[navigation.state.index] : navigation.state.routeName)
    let drawerLockMode = 'locked-closed'
    if (name.routeName == 'Home') {
        drawerLockMode = 'unlocked'
    }
    return {
        drawerLockMode,
    };
}

const styles = StyleSheet.create({
    items: {
        paddingLeft: 17,
        paddingVertical: 12
    }
});

export default createAppContainer(Draw);