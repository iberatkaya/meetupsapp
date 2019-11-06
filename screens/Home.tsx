import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Clipboard, ScrollView, ToastAndroid } from 'react-native';
import { Table, Row, TableWrapper, Cell } from 'react-native-table-component';
import { NavigationStackProp } from 'react-navigation-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SplashScreen from 'react-native-splash-screen';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
        this.loadFromDB();
    }


    static navigationOptions = ({navigation} : Navopt) => ({
        headerTitle: 'MeetUp',
        headerLeft: (
            <TouchableOpacity
                onPress={() => {navigation.openDrawer();}}
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
            style={{marginLeft: 4}}
            onLongPress={() => {
                Clipboard.setString('http://ibkmeetup.herokuapp.com/' + data);
                ToastAndroid.show('Copied to clipboard', ToastAndroid.LONG);
            }}
            onPress={() => {
                this.props.navigation.navigate('JoinRoom', { key: data });
            }}>
            <View>
                <Text style={{ fontSize: 13, color: 'rgb(0, 120, 255)', textDecorationLine: 'underline' }}>{data.substring(0, 14) + '...'}</Text>
            </View>
        </TouchableOpacity>
    );

    reverseOfArray = (array: Array<History>) => {
        let array2: Array<History> = [];
        for(let i=array.length-1; i>=0; i--)
            array2.push(array[i]);
        return array2;
    } 

    table = () => {
        return (
            <View style={{marginHorizontal: 6, marginTop: 4}}>
                <Text style={{ color: '#444', marginLeft: 4, fontSize: 16, marginBottom: 4 }}>Recent History</Text>
                <Table borderStyle={{ borderWidth: 1, borderColor: "#ccc" }}  >
                    <Row data={['Key', 'Date']} style={{ height: 26 }} textStyle={{ fontSize: 15, paddingLeft: 4, color: 'black' }} />
                    {
                        this.reverseOfArray(this.props.keys).slice(0, 5).map((item) => { return [item.key, moment(new Date(item.date)).format('DD.MM.YYYY, HH:mm')]; }).map((rowData, index) => (
                            <TableWrapper style={{ height: 26, flexDirection: 'row' }} key={index}>
                                {
                                    rowData.map((cellData, cellIndex) => (
                                        <Cell key={cellIndex} data={cellIndex == 0 ? this.keyCell(cellData) : <Text style={{ fontSize: 13, marginLeft: 4 }}>{cellData}</Text>} />
                                    ))
                                }
                            </TableWrapper>
                        ))
                    }
                </Table>
            </View>
        );
    }

    render() {
        return (
            <View style={styles.mainView}>
                <StatusBar backgroundColor="rgb(150, 150, 255)" />
                <ScrollView>
                    <TouchableOpacity
                        style={styles.createFormButton}
                        onPress={() => {
                            this.props.navigation.navigate('CreateRoom');
                        }}
                    >
                        <Text style={styles.formButtonText}>Create Room</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.joinFormButton}
                        onPress={() => {
                            this.props.navigation.navigate('JoinRoom', {key: 'NOAPIKEY'});
                        }}
                    >
                        <Text style={styles.formButtonText}>Join Room</Text>
                    </TouchableOpacity>
                    {this.props.keys.length > 0 ?
                        this.table()
                        :
                        <View />
                    }
                </ScrollView>
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
    createFormButton: {
        alignSelf: 'center',
        paddingVertical: '8%',
        paddingHorizontal: '10%',
        marginVertical: '6%',
        borderRadius: 40,
        backgroundColor: 'rgb(165, 165, 255)'
    },
    joinFormButton: {
        alignSelf: 'center',
        paddingVertical: '8%',
        paddingHorizontal: '12%',
        marginBottom: '6%',
        borderRadius: 40,
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