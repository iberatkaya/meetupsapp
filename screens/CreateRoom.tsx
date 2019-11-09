import React, { createRef } from 'react';
import { View, Text, ScrollView, Clipboard, TouchableOpacity, StatusBar, Dimensions, ToastAndroid, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationStackProp } from 'react-navigation-stack';
import moment from 'moment';
import { Header } from 'react-navigation-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SQLite from 'react-native-sqlite-2';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addKey } from './Actions';
const db = SQLite.openDatabase("history.db", '1.0', '', 1);
import _ from 'lodash';
const t = require('tcomb-form-native');
const stylesheet = _.cloneDeep(t.form.Form.stylesheet);

const Form = t.form.Form;

let { height } = Dimensions.get('window');
StatusBar.currentHeight ? height = height - Header.HEIGHT - StatusBar.currentHeight : height = height - Header.HEIGHT;

const FromStruct = t.struct({
    name: t.String
});

const RoomStruct = t.struct({
    room: t.String
});

const options = {
    auto: 'none',
    fields: {
        name: {
            error: 'Please enter a name.',
            placeholder: 'Name',
            autoComplete: 'off'
        }
    },
};

const optionsRoom = {
    auto: 'none',
    fields: {
        room: {
            error: 'Please enter a room title.',
            placeholder: 'Room Title',
            autoComplete: 'off'
        }
    }
}

type Props = {
    navigation: NavigationStackProp<{}>,
    addKey: Function
};

type State = {
    formvalue: object,
    formvalueroom: object,
    dates: Array<Dates>,
    index: number,
    showDateStart: boolean,
    showDateEnd: boolean,
    showTimeEnd: boolean,
    showTimeStart: boolean,
    key: string,
    clickable: boolean
};

interface Dates {
    startDate: Date,
    endDate: Date
};



class CreateRoom extends React.Component<Props, State>{

    constructor(props: Props) {
        super(props);
        this.state = {
            formvalue: {
                name: ''
            },
            formvalueroom: {
                room: ''
            },
            dates: [
                {
                    startDate: this.roundDate(new Date()),
                    endDate: this.roundDate(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes() + 60))
                }
            ],
            index: 0,
            showDateStart: false,
            showDateEnd: false,
            showTimeStart: false,
            showTimeEnd: false,
            key: '',
            clickable: true
        };
    }

    static navigationOptions = () => ({
        headerTitle: 'Create Room'
    });


    roundDate = (date: Date) => {
        let coeff: number = 1000 * 60 * 15;     //15 is the round time parameter
        let rounded: Date = new Date(Math.round(date.getTime() / coeff) * coeff)
        return rounded;
    }

    datePicker = (index: number, mode: string, type: string) => {
        if (mode === 'date' && type == 'start') {
            return (
                <DateTimePicker
                    onChange={(dateevent: any) => {
                        if (dateevent.type === "dismissed") {
                            this.setState({ showDateStart: false });
                            return;
                        }
                        let olddate = this.state.dates[index].startDate;
                        let date = new Date(new Date(dateevent.nativeEvent.timestamp).getFullYear(), new Date(dateevent.nativeEvent.timestamp).getMonth(), new Date(dateevent.nativeEvent.timestamp).getDate(), olddate.getHours(),  olddate.getMinutes());
                        this.dateChanger(date, index, mode, type);
                    }}
                    minimumDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 0, 0)}
                    mode="date"
                    value={this.state.dates[index].startDate}
                />
            );
        }
        else if (mode === 'date' && type == 'end') {
            return (
                <DateTimePicker
                    onChange={(dateevent: any) => {
                        if (dateevent.type === "dismissed") {
                            this.setState({ showDateEnd: false });
                            return;
                        }
                        let olddate = this.state.dates[index].endDate;
                        let date = new Date(new Date(dateevent.nativeEvent.timestamp).getFullYear(), new Date(dateevent.nativeEvent.timestamp).getMonth(), new Date(dateevent.nativeEvent.timestamp).getDate(), olddate.getHours(),  olddate.getMinutes());
                        this.dateChanger(date, index, mode, type);
                    }}
                    minimumDate={this.state.dates[index].startDate}
                    mode="date"
                    value={this.state.dates[index].endDate}
                />
            );
        }
        else if (mode === 'time' && type == 'start') {
            return (
                <DateTimePicker
                    onChange={(dateevent: any) => {
                        if (dateevent.type === "dismissed") {
                            this.setState({ showTimeStart: false });
                            return;
                        }
                        let olddate = this.state.dates[index].startDate;
                        let date = new Date(olddate.getFullYear(), olddate.getMonth(), olddate.getDate(), new Date(dateevent.nativeEvent.timestamp).getHours(),  new Date(dateevent.nativeEvent.timestamp).getMinutes());
                        this.dateChanger(date, index, mode, type);
                    }}
                    is24Hour={true}
                    mode="time"
                    value={this.state.dates[index].startDate}
                />
            );
        }
        else {
            return (
                <DateTimePicker
                    onChange={(dateevent: any) => {
                        if (dateevent.type === "dismissed") {
                            this.setState({ showTimeEnd: false });
                            return;
                        }                        
                        let olddate = this.state.dates[index].endDate;
                        let date = new Date(olddate.getFullYear(), olddate.getMonth(), olddate.getDate(), new Date(dateevent.nativeEvent.timestamp).getHours(),  new Date(dateevent.nativeEvent.timestamp).getMinutes());
                        this.dateChanger(date, index, mode, type);
                    }}
                    is24Hour={true}
                    mode="time"
                    value={this.state.dates[index].endDate}
                />
            );
        }
    }

    dateChanger = (date: Date, index: number, mode: string, type: string) => {
        let dates = [...this.state.dates];
        if (type === "end") {
            if (dates[index].startDate.getTime() >= date.getTime()) {
                ToastAndroid.show('End Date cannot be\nsmaller than Start Date', ToastAndroid.LONG);
                if (mode === 'time')
                    this.setState({ showTimeEnd: false });
                else if (mode === 'date')
                    this.setState({ showDateEnd: false });
                return;
            }
        }
        if (type === "start")
            dates[index].startDate = this.roundDate(date);
        else
            dates[index].endDate = this.roundDate(date);
        if (mode === 'date' && type === 'start') {
            dates[index].endDate = this.roundDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1, date.getMinutes()));
            this.setState({ dates: dates, showDateStart: false });
        }
        else if (mode === 'date' && type === 'end') {
            this.setState({ dates: dates, showDateEnd: false });
        }
        else if (mode === 'time' && type === 'start') {
            dates[index].endDate = this.roundDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1, date.getMinutes()));
            this.setState({ dates: dates, showTimeStart: false });
        }
        else {
            this.setState({ dates: dates, showTimeEnd: false });
        }
    }

    datesComp = () => {
        return (
            <View style={styles.dateCard}>
                {this.state.dates.map((item: Dates, index: number) => {
                    return (
                        <View>
                            <Text style={styles.dateTimeHeader}>Start Date</Text>
                            <View>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ showDateStart: true, index: index });
                                    }}
                                >
                                    <Text style={styles.dateTimeText}>Date: {moment(item.startDate).format("MMM DD, YYYY")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ showTimeStart: true, index: index });
                                    }}
                                >
                                    <Text style={styles.dateTimeText}>Time: {moment(item.startDate).format("HH:mm")}</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.dateTimeHeader}>End Date</Text>
                            <View>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ showDateEnd: true, index: index });
                                    }}
                                >
                                    <Text style={styles.dateTimeText}>Date: {moment(item.endDate).format("MMM DD, YYYY")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ showTimeEnd: true, index: index });
                                    }}
                                >
                                    <Text style={styles.dateTimeText}>Time: {moment(item.endDate).format("HH:mm")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
                {this.icons()}
                {this.formComp()}
            </View>
        );
    }


    form = createRef<typeof Form>();
    formComp = () => {
        return (
            <View style={{ marginHorizontal: 8, paddingHorizontal: 20, borderRadius: 24, paddingTop: 8, backgroundColor: '#eee', marginVertical: 6 }}>
                <Form
                    value={this.state.formvalue}
                    onChange={(val: object) => { this.setState({ formvalue: val }); }}
                    ref={(ref: typeof Form) => { this.form = ref; }}
                    options={options}
                    stylesheet={stylesheet}
                    type={FromStruct} />
            </View>
        );
    }

    icons = () => {
        return (
            <View style={styles.iconsCard}>
                {this.state.dates.length > 1 ?
                    <Icon
                        onPress={() => {
                            let dates = [...this.state.dates];
                            dates.pop();
                            this.setState({ dates: dates });
                        }}
                        name="minus"
                        size={32}
                        style={{ alignSelf: 'center' }}
                        color="black"
                    />
                    :
                    <View />
                }
                <Icon
                    onPress={() => {
                        let dates = [...this.state.dates];
                        let max = 0;
                        let datelen = dates.length;
                        for (let j = 0; j < datelen; j++) {
                            if (j === 0) {
                                max = dates[j].endDate.getTime();
                                continue;
                            }
                            if (max < dates[j].endDate.getTime())
                                max = dates[j].endDate.getTime();
                        }
                        let date = max;
                        dates.push({
                            startDate: new Date(date + 900000),
                            endDate: new Date(date + 4500000)
                        });
                        this.setState({ dates: dates });
                    }}
                    size={32}
                    color="red"
                    style={{ alignSelf: 'center' }}
                    name="plus"
                />
            </View>
        )
    }

    floatingButton = () => {
        return (
            <TouchableOpacity
                style={{
                    elevation: 1,
                    position: 'absolute',
                    bottom: 22,
                    right: 18,
                    borderWidth: 1,
                    borderColor: 'rgba(10, 10, 255,0.3)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
                    backgroundColor: '#fff',
                    borderRadius: 100,
                }}
                disabled={!this.state.clickable}
                onPress={async () => {
                    const value = (this.form as any).getValue();
                    const valueroom = (this.formroom as any).getValue();
                    if (value === null || valueroom === null) {
                        return;
                    }
                    this.setState({ clickable: false });
                    let res = await fetch('https://meetupswithfriends.com/api', {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: 'POST',
                        body: JSON.stringify({ name: value.name, dates: this.state.dates, roomtitle: valueroom.room })
                    });
                    let resjson = await res.json();
                    if (resjson !== null) {
                        let date = new Date().getTime();
                        db.transaction((tx: any) => {
                            tx.executeSql('INSERT INTO HISTORY (apikey, date) VALUES(?, ?)', [resjson.key, date], () => {
                                Clipboard.setString('https://meetupswithfriends.com/api/' + resjson.key);
                                this.props.addKey({ key: resjson.key, date: date });
                                this.props.navigation.pop();
                                ToastAndroid.show('Copied key to clipboard', ToastAndroid.LONG);
                            }, (err: any) => { console.log(err); });
                        });
                    }

                }}
            >
                <Icon name="check" size={30} color="rgb(10, 10, 255)" />
            </TouchableOpacity>
        );
    }

    formroom = createRef<typeof Form>();
    formRoomComp = () => {
        return (
            <View style={{ marginHorizontal: 16, paddingHorizontal: 20, borderRadius: 24, paddingTop: 8, backgroundColor: '#eee', marginVertical: 6 }}>
                <Form
                    value={this.state.formvalueroom}
                    onChange={(valroom: object) => { this.setState({ formvalueroom: valroom }); }}
                    ref={(ref: typeof Form) => { this.formroom = ref; }}
                    options={optionsRoom}
                    stylesheet={stylesheet}
                    type={RoomStruct} />
            </View>
        );
    }

    loadingComp = () => {
        return (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ padding: 24, borderRadius: 24, backgroundColor: 'rgba(165,189,239, 0.65)' }}>
                    <ActivityIndicator size={55} color='red' />
                </View>
            </View>
        );
    }


    render() {
        return (
            <View style={styles.mainView}>
                {this.formRoomComp()}
                <ScrollView>
                    {this.datesComp()}
                </ScrollView>
                {
                    this.state.clickable ?
                        <View />
                        :
                        this.loadingComp()
                }
                {this.floatingButton()}
                {this.state.showDateStart && this.datePicker(this.state.index, 'date', 'start')}
                {this.state.showDateEnd && this.datePicker(this.state.index, 'date', 'end')}
                {this.state.showTimeStart && this.datePicker(this.state.index, 'time', 'start')}
                {this.state.showTimeEnd && this.datePicker(this.state.index, 'time', 'end')}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainView: {
        paddingTop: 4,
        paddingHorizontal: 4,
        height: height,
        backgroundColor: '#f6f6ff',
        flex: 1
    },
    dateCard: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 6,
        backgroundColor: 'rgb(225, 240, 255)',
        borderRadius: 28,
        paddingBottom: 12,
        marginBottom: 6
    },
    dateTimeHeader: {
        textAlign: 'center',
        color: '#222',
        fontSize: 23,
        borderBottomWidth: 1,
        borderBottomColor: '#bbb',
        marginBottom: 4
    },
    dateTimeText: {
        textDecorationLine: 'underline',
        fontSize: 19,
        marginBottom: 2
    },
    iconsCard: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 12
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
        addKey
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(CreateRoom);


stylesheet.textbox.normal.color = '#000000';
stylesheet.textbox.normal.borderColor = "#000000";
stylesheet.textbox.normal.backgroundColor = '#eee';
stylesheet.textbox.normal.borderWidth = 0;
stylesheet.textbox.normal.borderRadius = 0;
stylesheet.textbox.normal.borderBottomWidth = 1;
stylesheet.textbox.normal.fontSize = 18;
stylesheet.textbox.normal.paddingHorizontal = 4;
stylesheet.textbox.error.color = '#000000';
stylesheet.textbox.error.borderColor = "#D00000";
stylesheet.textbox.error.backgroundColor = '#eee';
stylesheet.textbox.error.borderWidth = 0;
stylesheet.textbox.error.borderRadius = 0;
stylesheet.textbox.error.borderBottomWidth = 1;
stylesheet.textbox.error.fontSize = 18;
stylesheet.textbox.error.paddingHorizontal = 4;
stylesheet.controlLabel.normal.color = "#000000";
stylesheet.controlLabel.normal.fontWeight = "300";
stylesheet.controlLabel.error.color = "#D00000";
stylesheet.controlLabel.error.fontWeight = "300";
stylesheet.errorBlock.color = "#D00000";