import React, { createRef } from 'react';
import { View, Text, ScrollView, Clipboard, TouchableOpacity, StatusBar, ActivityIndicator, Dimensions, ToastAndroid, StyleSheet } from 'react-native';
import { NavigationStackProp } from 'react-navigation-stack';
import moment from 'moment';
import { Header } from 'react-navigation-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from "react-native-root-toast";
// @ts-ignore
import SQLite from 'react-native-sqlite-2';
import { connect } from 'react-redux';
// @ts-ignore
import { AdMobBanner } from 'react-native-admob';
import { bannerid, demobannerid } from './appid';
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

const EnterStruct = t.struct({
    key: t.String
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

const optionskey = {
    auto: 'none',
    fields: {
        key: {
            error: 'Please enter a key.',
            placeholder: 'Enter a url or a key',
            autoComplete: 'off'
        }
    },
};

type Props = {
    navigation: NavigationStackProp<{}>,
    addKey: Function
};

type State = {
    formvalue: object,
    dates: Array<Dates>,
    index: number,
    showDateStart: boolean,
    showDateEnd: boolean,
    showTimeEnd: boolean,
    showTimeStart: boolean,
    key: string,
    clickable: boolean,
    error: boolean,
    roomTitle: string,
    persons: Array<Persons>,
    intersections: Array<Intersections>,
    loading: boolean,
    formenter: object,
    loadedAd: boolean,
    joined: boolean
};

interface Intersections {
    end: number,
    start: number,
    personid: Array<number>,
    occurance: number
}

interface Dates {
    startDate: Date,
    endDate: Date
};

interface Persons {
    dates: Array<Dates>,
    id: number,
    name: string
}

class JoinRoom extends React.Component<Props, State>{

    constructor(props: Props) {
        super(props);
        this.state = {
            formvalue: {
                name: ''
            },
            formenter: {
                key: ''
            },
            dates: [
                {
                    startDate: this.roundDate(new Date()),
                    endDate: this.roundDate(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes() + 60))
                }
            ],
            persons: [

            ],
            index: 0,
            showDateStart: false,
            showDateEnd: false,
            showTimeStart: false,
            showTimeEnd: false,
            key: this.props.navigation.getParam('key'),
            clickable: true,
            error: false,
            roomTitle: '',
            intersections: [],
            loading: true,
            loadedAd: false,
            joined: false
        };
    }

    static navigationOptions = () => ({
        headerTitle: 'Join Room'
    });

    fetchPeople = async () => {
        try {
            let res = await fetch('https://meetupswithfriends.com/api/' + this.state.key, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'GET',
            });
            let resjson = await res.json();
            if (resjson.length === 0) {
                this.setState({ error: true });
                return;
            }
            let persons = [];
            for (let i = 0; i < resjson.length; i++) {
                let dates = JSON.parse(resjson[i].dates);
                let newdates = []
                for (let j = 0; j < dates.length; j++) {
                    newdates.push({ startDate: new Date(dates[j].startDate), endDate: new Date(dates[j].endDate) });
                }
                persons.push({ dates: newdates, id: i, name: resjson[i].name });
            }
            let roomTitle = resjson[0].roomtitle;
            this.setState({ persons: persons, roomTitle: roomTitle, loading: false, clickable: true }, () => {
                this.calculateAvailableTime();
            });
        } catch (e) {
            Toast.show("An error occurred");
            this.props.navigation.pop();
        }
    }

    async componentDidMount() {
        if (this.state.key !== 'NOAPIKEY')
            await this.fetchPeople();
    }


    calculateAvailableTime = () => {
        let persons = [...this.state.persons];
        let ranges: any = [];
        let min = 0;
        let max = 0;
        let perlen = persons.length;
        for (let i = 0; i < perlen; i++) {
            let date = persons[i].dates;
            let datelen = persons[i].dates.length;
            for (let j = 0; j < datelen; j++) {
                if (i === 0 && j === 0) {
                    min = date[j].startDate.getTime();
                    max = date[j].endDate.getTime();
                    continue;
                }
                if (min > date[j].startDate.getTime())
                    min = date[j].startDate.getTime();
                if (max < date[j].endDate.getTime())
                    max = date[j].endDate.getTime();
            }
        }
        let range = { start: min, end: max };
        let stepdiv = persons.length * 10000;
        let step = (max - min) / stepdiv;
        for (let a = range.start; a < range.end; a += step) {
            ranges.push({ start: a, end: a + step, occurance: 0, personid: [] });
        }
        for (let a = 0; a < ranges.length; a++) {
            let perlen = persons.length;
            for (let b = 0; b < perlen; b++) {
                let dates = persons[b].dates;
                let datelen = persons[b].dates.length;
                for (let c = 0; c < datelen; c++) {
                    if (ranges[a].start >= dates[c].startDate.getTime() && ranges[a].end <= dates[c].endDate.getTime()) {
                        ranges[a].occurance++;
                        ranges[a].personid.push(persons[b].id);
                    }
                }
            }
        }
        /*
        console.log(ranges.map((a) => {
          return ({start: moment(new Date(a.start)).format('HH:mm'), end: moment(new Date(a.end)).format('HH:mm')})
        }));
        console.log(this.normalize(ranges).map((a) => {
          return ({start: moment(new Date(a.start)).format('HH:mm'), end: moment(new Date(a.end)).format('HH:mm'), occurance: a.occurance})
        }));*/
        let normalizedranges = this.normalize(ranges, min, max);
        /*console.log([normalizedranges[normalizedranges.length-1]].map((a) => {
            return ({start: moment(new Date(a.start)).format('HH:mm'), end: moment(new Date(a.end)).format('HH:mm'), occurance: a.occurance})
          }));*/
        this.setState({ intersections: normalizedranges });
    }


    normalize = (array: Array<any>, min: number, max: number) => {
        let len = array.length;
        let newarr = [];
        for (let a = 0; a < len - 1; a++) {
            let firstel = array[a];
            let b = a + 1;
            let newel = { ...firstel };
            while (b < len && firstel.occurance === array[b].occurance) {    //If different persons are wanted, check the personid's
                newel.end = array[b].end;
                b++;
                a++;
                if (a > len) {
                    console.log('error');
                    return [];
                }
            }
            if (newel.occurance > 1) {
                newarr.push(newel);
            }
        }
        for (let i = 0; i < newarr.length; i++) {
            for (let j = 0; j < newarr[i].personid.length - 1; j++) {
                let person1 = newarr[i].personid[j];
                for (let k = j + 1; k < newarr[i].personid.length; k++) {
                    let person2 = newarr[i].personid[k];
                    if (person1 === person2)
                        newarr[i].occurance--;
                }
            }
        }
        let finalarray = [];
        for (let i = 0; i < newarr.length; i++) {
            if (newarr[i].occurance > 1)
                finalarray.push(newarr[i]);
        }
        return finalarray;
    }

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
                        let date = new Date(new Date(dateevent.nativeEvent.timestamp).getFullYear(), new Date(dateevent.nativeEvent.timestamp).getMonth(), new Date(dateevent.nativeEvent.timestamp).getDate(), olddate.getHours(), olddate.getMinutes());
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
                        let date = new Date(new Date(dateevent.nativeEvent.timestamp).getFullYear(), new Date(dateevent.nativeEvent.timestamp).getMonth(), new Date(dateevent.nativeEvent.timestamp).getDate(), olddate.getHours(), olddate.getMinutes());
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
                        let date = new Date(olddate.getFullYear(), olddate.getMonth(), olddate.getDate(), new Date(dateevent.nativeEvent.timestamp).getHours(), new Date(dateevent.nativeEvent.timestamp).getMinutes());
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
                        let date = new Date(olddate.getFullYear(), olddate.getMonth(), olddate.getDate(), new Date(dateevent.nativeEvent.timestamp).getHours(), new Date(dateevent.nativeEvent.timestamp).getMinutes());
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
                Toast.show('End Date cannot be\nsmaller than Start Date');
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

    peopleComp = () => {
        return (
            <View>
                {this.state.persons.map((item: Persons, index: number) => {
                    return (
                        <View style={styles.dateCard}>
                            <Text style={styles.personName}>{item.name}</Text>
                            {item.dates.map((dateitem) => {
                                return (
                                    <View>
                                        <Text style={styles.dateTimeHeader}>Start Date</Text>
                                        <View>
                                            <Text style={styles.dateTimeText}>Date: {moment(dateitem.startDate).format("MMM DD, YYYY")}</Text>
                                            <Text style={styles.dateTimeText}>Time: {moment(dateitem.startDate).format("HH:mm")}</Text>
                                        </View>
                                        <Text style={styles.dateTimeHeader}>End Date</Text>
                                        <View>
                                            <Text style={styles.dateTimeText}>Date: {moment(dateitem.endDate).format("MMM DD, YYYY")}</Text>
                                            <Text style={styles.dateTimeText}>Time: {moment(dateitem.endDate).format("HH:mm")}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    );
                })}
            </View>
        );
    }
    userDateComp = () => {
        return (
            <ScrollView contentContainerStyle={styles.userCard}>
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
                                    <Text style={styles.userDateTimeText}>Date: {moment(item.startDate).format("MMM DD, YYYY")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ showTimeStart: true, index: index });
                                    }}
                                >
                                    <Text style={styles.userDateTimeText}>Time: {moment(item.startDate).format("HH:mm")}</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.dateTimeHeader}>End Date</Text>
                            <View>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ showDateEnd: true, index: index });
                                    }}
                                >
                                    <Text style={styles.userDateTimeText}>Date: {moment(item.endDate).format("MMM DD, YYYY")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ showTimeEnd: true, index: index });
                                    }}
                                >
                                    <Text style={styles.userDateTimeText}>Time: {moment(item.endDate).format("HH:mm")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
                {this.icons()}
                {this.formComp()}
            </ScrollView>
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
                        size={28}
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
                    size={28}
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
                style={{ ...styles.floatingButton, bottom: this.floatingButtonBottom() }}
                disabled={!this.state.clickable}
                onPress={async () => {
                    const value = (this.form as any).getValue();
                    if (value === null) {
                        return;
                    }
                    this.setState({ clickable: false });
                    let res = await fetch('https://meetupswithfriends.com/api/' + this.state.key, {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: 'POST',
                        body: JSON.stringify({ name: value.name, dates: this.state.dates, roomtitle: this.state.roomTitle })
                    });
                    let resjson = await res.json();
                    if (resjson !== null) {
                        let date = new Date().getTime();
                        db.transaction((tx: any) => {
                            tx.executeSql('INSERT INTO HISTORY (apikey, date) VALUES(?, ?)', [this.state.key, date], () => {
                                Clipboard.setString('https://meetupswithfriends.com/' + this.state.key);
                                this.props.addKey({ key: this.state.key, date: date });
                                Toast.show('Copied key to clipboard');
                                this.setState({joined: true}, async () => {
                                    this.fetchPeople()
                                })
                                //this.props.navigation.pop();
                            }, (err: any) => { console.log(err); });
                        });
                    }

                }}
            >
                <Icon name="check" size={30} color="rgb(10, 10, 255)" />
            </TouchableOpacity>
        );
    }

    form = createRef<typeof Form>();
    formComp = () => {
        return (
            <View style={{ marginHorizontal: 2, paddingHorizontal: 12, borderRadius: 24, paddingTop: 4, backgroundColor: '#eee', marginVertical: 6 }}>
                <Form
                    value={this.state.formvalue}
                    onChange={(valroom: object) => { this.setState({ formvalue: valroom }); }}
                    ref={(ref: typeof Form) => { this.form = ref; }}
                    options={options}
                    stylesheet={stylesheet}
                    type={FromStruct} />
            </View>
        );
    }

    roomTitleComp = () => {
        return (
            <View style={styles.roomTitleCont}>
                <Text style={styles.roomTitle}>{this.state.roomTitle}</Text>
                <Text style={styles.peopeInRoom}>People in the room: {this.state.persons.length}</Text>
            </View>
        );
    }

    loadingScreen = () => {
        return (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: height }}>
                <ActivityIndicator size={64} color="#999" />
            </View>
        );
    }

    errorScreen = () => {
        return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24, textAlign: 'center' }}>Room doesn't exist :(</Text>
            </View>
        );
    }

    stringAfterSlash = (str: string) => {
        if (!str.includes("/"))
            return str;
        let i = str.lastIndexOf('/');
        return str.slice(i + 1, str.length);
    }

    enterform = createRef<typeof Form>();
    enterkey = () => {
        return (
            <>
                <View style={{ marginHorizontal: 2, paddingHorizontal: 12, borderRadius: 24, paddingTop: 4, backgroundColor: '#eee', marginVertical: 6 }}>
                    <Text style={{ paddingLeft: 8, fontSize: 18, marginTop: 4, marginBottom: 2 }}>Key</Text>
                    <Form
                        options={optionskey}
                        type={EnterStruct}
                        value={this.state.formenter}
                        onChange={(valroom: object) => { this.setState({ formenter: valroom }); }}
                        ref={(ref: typeof Form) => { this.enterform = ref; }}
                        stylesheet={stylesheet}
                    />
                </View>
                <TouchableOpacity style={styles.floatingButton}
                    onPress={() => {
                        const val = (this.enterform as any).getValue();
                        if (val != null) {
                            let key: string = this.stringAfterSlash(val.key);
                            this.setState({ key: key }, async () => {
                                await this.fetchPeople();
                            })
                        }
                    }}
                >
                    <Icon name="check" size={30} color="rgb(10, 10, 255)" />
                </TouchableOpacity>
            </>
        );
    }


    intersectionsList = () => {
        let intersections = this.state.intersections.sort((a, b) => (b.occurance-a.occurance));
        if (intersections.length === 0)
            return (
                <View style={styles.intersectionList}>
                    <Text style={styles.intersectionTitle}>There are no intersections.</Text>
                </View>
            );
        return (
            <View style={styles.intersectionList}>
                <Text style={styles.intersectionTitle}>Intersections</Text>
                {intersections.map((item) => {
                    let people = "";
                    for (let a = 0; a < item.personid.length; a++) {
                        let b = item.personid[a];
                        people += this.state.persons[b].name;
                        people += a != item.personid.length - 1 ? ", " : "";
                    }
                    return (
                        <View>
                            <Text style={styles.intersectionText}>{item.occurance} people ({people}) are available at {moment(this.roundDate(new Date(item.start))).format('MMM DD, YYYY HH:mm')} - {moment(this.roundDate(new Date(item.end))).format('MMM DD, YYYY HH:mm')}</Text>
                        </View>
                    )
                })}
            </View>
        )
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

    mainViewBottomPadding = () => {
        if (this.state.loadedAd)
            return 62;
        else
            return 0;
    }

    floatingButtonBottom = () => {
        if (this.state.loadedAd)
            return 66;
        else
            return 22;
    }

    ad = () => {
        return (
            <View style={styles.ad}>
                <AdMobBanner
                    adSize="fullBanner"
                    adUnitID={bannerid}
                    onAdFailedToLoad={(m: string) => console.log(m)}
                    onAdLoaded={() => {
                        this.setState({ loadedAd: true });
                    }}
                />
            </View>
        );
    }

    render() {
        if (this.state.key === 'NOAPIKEY')
            return (
                <ScrollView contentContainerStyle={styles.mainView}>
                    {this.enterkey()}
                </ScrollView>
            );
        if (this.state.error)
            return (
                <View style={styles.mainView}>
                    {this.errorScreen()}
                </View>
            );
        if (this.state.loading)
            return (
                <View style={styles.mainView}>
                    {this.loadingScreen()}
                </View>
            );
        return (
            <View style={{ ...styles.mainView, paddingBottom: this.mainViewBottomPadding() }}>
                {this.roomTitleComp()}
                <ScrollView>
                    {!this.state.joined ?
                        this.userDateComp()
                        :
                        <View/>
                    }
                    {this.state.persons.length > 1
                        ?
                        this.intersectionsList()
                        :
                        <View />
                    }
                    {this.peopleComp()}
                </ScrollView>
                {
                    this.state.clickable ?
                        <View />
                        :
                        this.loadingComp()
                }
                {!this.state.joined ?
                    this.floatingButton()
                    :
                    <View/>
                }
                {this.state.showDateStart && this.datePicker(this.state.index, 'date', 'start')}
                {this.state.showDateEnd && this.datePicker(this.state.index, 'date', 'end')}
                {this.state.showTimeStart && this.datePicker(this.state.index, 'time', 'start')}
                {this.state.showTimeEnd && this.datePicker(this.state.index, 'time', 'end')}
                {this.ad()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainView: {
        backgroundColor: '#f6f6ff',
        paddingTop: 2,
        paddingHorizontal: 4,
        height: height,
        flex: 1
    },
    ad: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#f6f6ff'
    },
    roomTitleCont: {
        backgroundColor: '#eeeeee',
        borderRadius: 24,
        paddingHorizontal: 40,
        marginVertical: 4,
        paddingBottom: 6,
        paddingTop: 2,
        alignSelf: 'center'
    },
    intersectionList: {
        backgroundColor: 'rgb(220, 245, 220)',
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginVertical: 4,
    },
    intersectionTitle: {
        fontSize: 21,
        borderBottomWidth: 1,
        borderBottomColor: '#bbb',
        marginBottom: 4,
        textAlign: 'center'
    },
    intersectionText: {
        fontSize: 17
    },
    peopeInRoom: {
        textAlign: 'center',
        fontSize: 16,
        color: '#444'
    },
    roomTitle: {
        textAlign: 'center',
        fontSize: 26
    },
    floatingButton: {
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
    },
    userCard: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 6,
        backgroundColor: 'rgb(225, 240, 255)',
        borderRadius: 28,
        paddingBottom: 12,
        marginBottom: 6
    },
    dateCard: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 6,
        backgroundColor: 'rgb(255, 220, 220)',
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
    userDateTimeText: {
        fontSize: 19,
        textDecorationLine: 'underline',
        marginBottom: 2
    },
    dateTimeText: {
        fontSize: 19,
        marginBottom: 2
    },
    personName: {
        fontSize: 24,
        marginBottom: 6,
        textAlign: 'center'
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

export default connect(mapStateToProps, mapDispatchToProps)(JoinRoom);


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