import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import HomeScreen from './screens/Home';
import CreateRoomScreen from './screens/CreateRoom';
import JoinRoomScreen from './screens/JoinRoom';

const Stack = createStackNavigator({
    Home: HomeScreen,
    CreateRoom: CreateRoomScreen,
    JoinRoom: JoinRoomScreen
}, {
    defaultNavigationOptions: {
        headerTintColor: 'black',
        headerStyle: {
            backgroundColor: '#eeeeee',
            elevation: 2
        }
    }
});

export default createAppContainer(Stack)