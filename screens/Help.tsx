import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


class Help extends React.Component<{}, {}>{


    static navigationOptions = () => ({
        headerTitle: 'Help',
    })


    render() {
        return (
            <View style={styles.mainView}>
                <Text style = {styles.helpText}>{'\t\t'}Welcome to MeetUps. MeetUps is a group meetup organizer. Select your available dates and times, and create or join a room. Once you create a room, you can send the link to your friends to let them join your room. MeetUps will then show you the available time slots for your next meetup!</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainView: {
        backgroundColor: '#f6f6ff',
        height: '100%',
        flex: 1
    },
    helpText: {
        fontSize: 20,
        marginTop: 8,
        marginLeft: 12,
        marginRight: 4
    }
});


export default Help;