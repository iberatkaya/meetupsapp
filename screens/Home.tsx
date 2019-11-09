import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Clipboard, ScrollView, ToastAndroid } from 'react-native';
import { Table, Row, TableWrapper, Cell } from 'react-native-table-component';
import { NavigationStackProp } from 'react-navigation-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SplashScreen from 'react-native-splash-screen';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AdMobBanner } from 'react-native-androide';
import {bannerid} from './appid';
import moment from 'moment';
import { setKeys } from './Actions';
import SQLite from 'react-native-sqlite-2';
const db = SQLite.openDatabase("history.db", '1.0', '', 1);

type Props = {
    navigation: NavigationStackProp<{}>,
    setKeys: Function,
    keys: Array<History>
};

type State = {
    loadedAd: boolean
};

interface History {
    date: Date,
    key: string
};

interface Navopt {
    navigation: Nav
}

interface Nav {
    openDrawer: Function
}

class Home extends React.Component<Props, State>{

    constructor(props: any) {
        super(props);
        this.state = {
            loadedAd: false
        };
        this.loadFromDB();
    }


    static navigationOptions = ({ navigation }: Navopt) => ({
        headerTitle: 'MeetUps',
        headerLeft: (
            <TouchableOpacity
                onPress={() => { navigation.openDrawer(); }}
            >
                <View style={{ marginLeft: 12, padding: 4 }}>
                    <Icon name="menu" size={28} color='white' />
                </View>
            </TouchableOpacity>
        )
    })

    loadFromDB = () => {
        db.transaction((tx: any) => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS HISTORY (id INTEGER PRIMARY KEY AUTOINCREMENT, apikey TEXT, date INTEGER);', [],
                (tx: any) => {
                    tx.executeSql('SELECT * FROM HISTORY', [], async (tx: any, res: any) => {
                        if (res.rows === undefined)
                            return;
                        let len = res.rows.length;
                        let arr = [];
                        for (let i = 0; i < len; i++) {
                            let tempobj = {
                                date: new Date(res.rows.item(i).date),
                                key: res.rows.item(i).apikey
                            };
                            arr.push(tempobj);
                        }
                        this.props.setKeys(arr);
                        SplashScreen.hide();
                    }, (err: any) => { console.log(err); });
                }, (err: any) => { console.log(err); }
            );
        })
    }

    keyCell = (data: string) => (
        <TouchableOpacity
            style={{ marginLeft: 4 }}
            onLongPress={() => {
                Clipboard.setString('https://www.meetupswithfriends.com/' + data);
                ToastAndroid.show('Copied to clipboard', ToastAndroid.LONG);
            }}
            onPress={() => {
                this.props.navigation.navigate('JoinRoom', { key: data });
            }}>
            <View>
                <Text style={{ fontSize: 14, color: 'rgb(0, 120, 255)', textDecorationLine: 'underline', marginLeft: 4 }}>{data.substring(0, 12) + '...'}</Text>
            </View>
        </TouchableOpacity>
    );

    reverseOfArray = (array: Array<History>) => {
        let array2: Array<History> = [];
        for (let i = array.length - 1; i >= 0; i--)
            array2.push(array[i]);
        return array2;
    }

    table = () => {
        return (
            <View style={{ marginHorizontal: 6, marginTop: 4 }}>
                <Text style={{ color: '#444', marginLeft: 4, fontSize: 16, marginBottom: 4 }}>Recent History</Text>
                <Table borderStyle={{ borderWidth: 1, borderColor: "#ccc" }}  >
                    <Row data={['Key', 'Date']} style={{ height: 30 }} textStyle={{ fontSize: 16, paddingLeft: 4, color: 'black' }} />
                    {
                        this.reverseOfArray(this.props.keys).slice(0, 5).map((item) => { return [item.key, moment(new Date(item.date)).format('DD.MM.YYYY, HH:mm')]; }).map((rowData, index) => (
                            <TableWrapper style={{ height: 28, flexDirection: 'row' }} key={index}>
                                {
                                    rowData.map((cellData, cellIndex) => (
                                        <Cell key={cellIndex} data={cellIndex == 0 ? this.keyCell(cellData) : <Text style={{ fontSize: 14, marginLeft: 4 }}>{cellData}</Text>} />
                                    ))
                                }
                            </TableWrapper>
                        ))
                    }
                </Table>
            </View>
        );
    }

    ad = () => {
        return (
            <View style={styles.ad}>
                <AdMobBanner
                    adSize="fullBanner"
                    adUnitID={bannerid}
                    onFailedToLoad={(m: string) => console.log(m)}
                    onLoad={() => { this.setState({ loadedAd: true }); }}
                />
            </View>
        );
    }

    mainViewBottomPadding = () => {
        if(this.state.loadedAd)
            return 62;
        else
            return 0;
    }

    render() {
        return (
            <View style={{...styles.mainView, paddingBottom: this.mainViewBottomPadding()}}>
                <StatusBar backgroundColor="rgb(127,181,255)" />
                <ScrollView>
                    <View style={{ alignSelf: 'center' }}>
                        <TouchableOpacity
                            style={styles.createFormButton}
                            onPress={() => {
                                this.props.navigation.navigate('CreateRoom');
                            }}
                        >
                            <Icon name="plus-circle" size={32} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.formButtonText}>Create a room</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ alignSelf: 'center' }}>
                        <TouchableOpacity
                            style={styles.joinFormButton}
                            onPress={() => {
                                this.props.navigation.navigate('JoinRoom', { key: 'NOAPIKEY' });
                            }}
                        >
                            <Icon name="send-circle" size={32} color="white" style={{ marginRight: 12 }} />
                            <Text style={styles.formButtonText}>Join a room</Text>
                        </TouchableOpacity>
                    </View>
                    {this.table()}
                </ScrollView>
                {this.ad()}
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
    ad: {
        position: 'absolute', 
        bottom: 0,  
        width: '100%', 
        backgroundColor: '#f6f6ff'
    },
    createFormButton: {
        flexDirection: 'row',
        paddingVertical: '5%',
        paddingHorizontal: '8%',
        marginVertical: '8%',
        borderRadius: 12,
        backgroundColor: 'rgb(165, 200, 255)'
    },
    joinFormButton: {
        flexDirection: 'row',
        paddingVertical: '5%',
        paddingHorizontal: '10%',
        marginBottom: '8%',
        borderRadius: 12,
        backgroundColor: 'rgb(255, 160, 170)'
    },
    formButtonText: {
        textAlign: 'center',
        fontSize: 24,
        color: '#fff'
    }
});


interface StateRedux {
    keys: Array<object>
}

const mapStateToProps = (state: StateRedux) => {
    const { keys } = state;
    return { keys };
};

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        setKeys
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Home);