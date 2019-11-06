import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, ScrollView, ToastAndroid } from 'react-native';
import { Table, Row, Rows, TableWrapper, Cell } from 'react-native-table-component';
import { NavigationStackProp } from 'react-navigation-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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

class Home extends React.Component<Props, State>{

    constructor(props: any) {
        super(props);
        this.loadFromDB();
    }


    static navigationOptions = ({ navigation }) => ({
        headerTitle: 'MeetUp',
        headerLeft: (
            <TouchableOpacity
            >
                <View style={{ marginLeft: 12, padding: 4 }}>
                    <Icon name="menu" size={28} color='black' />
                </View>
            </TouchableOpacity>
        )
    })

    loadFromDB = () => {
        db.transaction((tx: any) => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS HISTORY (id INTEGER PRIMARY KEY AUTOINCREMENT, apikey TEXT, date INTEGER);', [],
                (tx: any) => {
                    tx.executeSql('SELECT * FROM HISTORY', [], async (tx, res: any) => {
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
                        //                        SplashScreen.hide();
                    }, (err: any) => { console.log(err); });
                }, (err: any) => { console.log(err); }
            );
        })
    }

    keyCell = (data: string, index: number) => (
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

    table = () => {
        return (
            <View>
                <Text style={{ color: '#444', marginLeft: 4, fontSize: 16, marginBottom: 4 }}>History</Text>
                <Table borderStyle={{ borderWidth: 1, borderColor: "#ccc" }}  >
                    <Row data={['Key', 'Date']} style={{ height: 26 }} textStyle={{ fontSize: 15, paddingLeft: 4, color: 'black' }} />
                    {
                        this.props.keys.map((item) => { return [item.key, moment(new Date(item.date)).format('DD.MM.YYYY')]; }).map((rowData, index) => (
                            <TableWrapper style={{ height: 26, flexDirection: 'row' }} key={index}>
                                {
                                    rowData.map((cellData, cellIndex) => (
                                        <Cell key={cellIndex} data={cellIndex == 0 ? this.keyCell(cellData, cellIndex) : <Text style={{ fontSize: 13, marginLeft: 4 }}>{cellData}</Text>} />
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
        marginHorizontal: 4,
        flex: 1
    },
    createFormButton: {
        marginVertical: '6%',
        paddingHorizontal: 24,
        alignSelf: 'center',
        paddingVertical: 16,
        borderRadius: 28,
        backgroundColor: 'rgb(215, 215, 255)'
    },
    joinFormButton: {
        marginVertical: '6%',
        paddingHorizontal: 24,
        alignSelf: 'center',
        paddingVertical: 16,
        borderRadius: 28,
        backgroundColor: 'rgb(255, 200, 210)'
    },
    formButtonText: {
        fontSize: 18,
        color: '#333'
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