import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, ScrollView, ToastAndroid } from 'react-native';
import { Table, Row, TableWrapper, Cell } from 'react-native-table-component';
import { NavigationStackProp } from 'react-navigation-stack';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { setKeys } from './Actions';

type Props = {
    navigation: NavigationStackProp<{}>,
    keys: Array<IHistory>
};

type State = {
};

interface IHistory {
    date: Date,
    key: string
};

class History extends React.Component<Props, State>{

    constructor(props: any) {
        super(props);
    }


    static navigationOptions = () => ({
        headerTitle: 'History'
    });

    keyCell = (data: string) => (
        <TouchableOpacity
            style={{marginLeft: 4}}
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

    reverseOfArray = (array: Array<IHistory>) => {
        let array2: Array<IHistory> = [];
        for(let i=array.length-1; i>=0; i--)
            array2.push(array[i]);
        return array2;
    } 

    table = () => {
        return (
            <View>
                <Table borderStyle={{ borderWidth: 1, borderColor: "#ccc" }}  >
                    <Row data={['Key', 'Date']} style={{ height: 36 }} textStyle={{ fontSize: 18, paddingLeft: 6, color: 'black' }} />
                    {
                        this.reverseOfArray(this.props.keys).map((item) => { return [item.key, moment(new Date(item.date)).format('DD.MM.YYYY, HH:mm')]; }).map((rowData, index) => (
                            <TableWrapper style={{ height: 30, flexDirection: 'row' }} key={index}>
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

    render() {
        return (
            <View style={styles.mainView}>
                <ScrollView>
                    {this.props.keys.length > 0 ?
                        this.table()
                        :
                        <View style={{ marginTop: 6, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 24, textAlign: 'center' }}>Your history is empty.</Text>
                        </View>
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
        paddingHorizontal: 4,
        flex: 1,
        paddingTop: 4
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

export default connect(mapStateToProps, mapDispatchToProps)(History);