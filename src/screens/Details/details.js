import React, { Component } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Dimensions, Image, TouchableOpacity, ActivityIndicator, ScrollView, FlatList } from 'react-native';

import Ionicons from "react-native-vector-icons/Ionicons";
import AS from "@react-native-async-storage/async-storage"

const w = Platform.OS == "ios" ? Dimensions.get("window").width : Dimensions.get("window").width * 1.1;
const h = Platform.OS == "ios" ? Dimensions.get("window").height : Dimensions.get("window").height * 1.1;
import { observer, inject } from 'mobx-react';
import axios from "axios"
import { toJS } from 'mobx';
import { Avatar } from 'react-native-paper';

@inject('MainStore')
@observer
export default class details extends Component {
    constructor(props) {
        super(props);
        this.state = {
            movie: this.props.route.params.movie,
            favMovie: [],
            genres: this.props.route.params.genre,
            detail: [],
            language: "",
            loadingDetail: false,
            isCollaps: false,
            cast: [],
            crew: []
        };

    }
    componentDidMount() {
        this.getDetail()

    }
    getDetail() {
        const { movie } = this.state;
        this.setState({
            loadingDetail: true
        })
        axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=579c7fc7840ab037036071939351dc60&language=en-US`).then((res) => {
            var languageArr = []
            var waiting = res.data.spoken_languages.length
            res.data.spoken_languages.forEach(element => {
                languageArr.push(element.english_name + "\n")
                waiting--;
            })
            if (waiting == 0) {
                this.setState({
                    detail: res.data,
                    language: languageArr,

                })
                this.getDeepDetail()
            }
        }).catch((err) => {
            this.setState({
                loadingDetail: false
            })
            alert(err)
        })
    }
    getDeepDetail() {
        const { movie } = this.state;
        axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=579c7fc7840ab037036071939351dc60&language=en-US`).then((res) => {

            this.setState({
                cast: res.data.cast,
                crew: res.data.crew,
                loadingDetail: false
            })


        }).catch((err) => {
            this.setState({
                loadingDetail: false
            })
            alert(err)
        })
    }
    setGenres(item) {
        const { genres } = this.state;
        var allGenres = []
        for (let index = 0; index < item.genre_ids.length; index++) {
            genres.forEach((element) => {
                if (index == item.genre_ids.length - 1) {
                    if (item.genre_ids[index] == element.id) {
                        allGenres.push(element.name)
                    }
                } else {
                    if (item.genre_ids[index] == element.id) {
                        allGenres.push(element.name + " / ")
                    }
                }
            })
        }
        return (<View style={{ marginTop: w * 0.03 }}><Text style={{ color: "#57606f", fontSize: w * 0.04, fontWeight: "400" }}>{allGenres}</Text></View>)
    }
    like(item) {
        AS.getItem("likeMovie").then((res) => {
            res + `${item.id}` + "+"
            AS.setItem("likeMovie", res + `${item.id}` + "+")
            this.props.MainStore.favMovie = this.props.MainStore.favMovie + `${item.id}` + "+"
        })
    }
    dislike(item) {
        AS.getItem("likeMovie").then((res) => {
            res = res.replaceAll(`${item.id}` + "+", "")
            AS.setItem("likeMovie", res)
            this.props.MainStore.favMovie = this.props.MainStore.favMovie.replaceAll(`${item.id}` + "+", "")
        })
    }
    renderHeader() {
        return (
            <View style={style.headerContainer} >
                <Ionicons onPress={() => {
                    this.props.navigation.goBack()
                }} color="#485460" size={w * 0.08} name="chevron-back-outline"></Ionicons>
                <Text style={style.moviesText}>{this.state.movie.original_title}</Text>
                <Ionicons size={w * 0.08} color="white" name="chevron-back-outline"></Ionicons>
            </View>);
    }
    renderMoviePoster() {
        const { movie } = this.state;
        return (
            <View style={stylePoster.posterView}>
                <Image style={stylePoster.posterimage} source={{ uri: `https://image.tmdb.org/t/p/w500/${movie.backdrop_path}` }}></Image>
                <View
                    style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                    <TouchableOpacity onPress={() => {
                        if (this.props.MainStore.favMovie.includes(`${movie.id}`)) {
                            this.dislike(movie)
                        } else {
                            this.like(movie)
                        }
                    }}>
                        {
                            this.props.MainStore.favMovie.includes(`${movie.id}`) ? <Image source={require("../../../assets1/icons1/like.png")} style={stylePoster.likeimage}></Image> : <Image source={require("../../../assets1/icons1/unlike.png")} style={stylePoster.likeimage}></Image>

                        }
                    </TouchableOpacity>

                </View>

            </View>
        )


    }
    calculateDuration(duration) {
        var hours = parseInt((duration / 60));
        var minute = duration % 60

        return `${hours}` + "h" + "  " + `${minute}` + "m"
    }
    renderMovieinfo() {
        const { detail, language } = this.state;


        return (
            <View style={styleMovieinfo.upView}>

                <View style={styleMovieinfo.duration}>
                    <View>
                        <Text style={{ color: "#2f3542", fontSize: w * 0.05, fontWeight: "600" }}>Duration</Text>
                        <Text style={{ marginTop: w * 0.03, color: "#57606f", fontSize: w * 0.06, fontWeight: "400" }}>
                            {this.calculateDuration(detail.runtime)}</Text>

                    </View>

                </View>
                <View style={styleMovieinfo.Genre}>
                    <View>
                        <Text style={{ color: "#2f3542", fontSize: w * 0.05, fontWeight: "600" }}>Genre</Text>
                        {this.setGenres(this.state.movie)}

                    </View>

                </View>
                <View style={styleMovieinfo.Language}>
                    <View>
                        <Text style={{ color: "#2f3542", fontSize: w * 0.05, fontWeight: "600" }}>Language</Text>
                        <ScrollView >
                            <Text style={{ marginTop: w * 0.03, color: "#57606f", fontSize: `${language}`.length < 20 ? w * 0.05 : w * 0.04, fontWeight: "400", textAlign: "" }}>{language}</Text>

                        </ScrollView>



                    </View>

                </View>

            </View>

        )


    }
    renderSynopsis() {
        const { detail, isCollaps } = this.state;
        return (
            <View style={{ height: isCollaps ? w * .30 : w * .26, }, synopsisStyle.container}>
                <View>
                    <Text style={synopsisStyle.title}>Synopsis</Text>
                    <View>
                        {
                            isCollaps ?
                                <Text style={synopsisStyle.content}>{detail.overview}</Text>
                                : <Text style={synopsisStyle.content}>{`${detail.overview}`.length > 130 ? `${detail.overview}`.substring(0, 127) + "..." : detail.overview}</Text>
                        }
                        <View style={synopsisStyle.readMoreView}>
                            <TouchableOpacity onPress={() => {
                                this.setState({
                                    isCollaps: !isCollaps
                                })
                            }}>
                                <Text style={synopsisStyle.readMoreText}>{isCollaps ? "Close" : "Read more"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    renderMainCast() {

        const { cast } = this.state;

        console.disableYellowBox = true;
        return (

            <View style={maincastStyle.container}>
                <View style={{ flexDirection: "row", justifyContent: "flex-start", width: w * .9, marginBottom: w * 0.04 }}>
                    <Text style={maincastStyle.title}>Main cast</Text>
                </View>


                <FlatList

                    data={cast}
                    renderItem={this.renderMainCastItem}
                    numColumns={3}
                    keyExtractor={(item, index) => index.toString()}


                ></FlatList>
            </View>
        )

    }

    renderMainCastItem(item) {

        return (
            <View style={maincastStyle.imageView}  >
                <Image borderRadius={100} style={{ width: w * 0.23, height: w * 0.23, }} source={{ uri: `https://image.tmdb.org/t/p/w500/${item.item.profile_path}` }}>
                </Image>
                <Text style={maincastStyle.castName}>{`${item.item.name}`.length>15?`${item.item.name}`.substring(0,12)+"...":item.item.name}</Text>
            </View>)
    }
    renderMainCrew() {

        const { crew } = this.state;

        console.disableYellowBox = true;
        return (

            <View style={maincastStyle.container}>
                <View style={{ flexDirection: "row", justifyContent: "flex-start", width: w * .9, marginBottom: w * 0.04 }}>
                    <Text style={maincastStyle.title}>Main Technical Team</Text>
                </View>


                <FlatList

                    data={crew}
                    renderItem={this.renderMainCrewItem}
                    numColumns={3}
                    keyExtractor={(item, index) => index.toString()}


                ></FlatList>
            </View>
        )

    }
    renderMainCrewItem(item) {
        console.log(item);

        return (
            <View style={maincastStyle.imageView}  >
                <Image borderRadius={100} style={{ width: w * 0.23, height: w * 0.23, }} source={{ uri: `https://image.tmdb.org/t/p/w500/${item.item.profile_path}` }}>
                </Image>
                <Text style={maincastStyle.castName}>{`${item.item.name}`.length>15?`${item.item.name}`.substring(0,12)+"...":item.item.name}</Text>
            </View>)
    }
    render() {
        const { loadingDetail } = this.state
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "white", }}>
                {this.renderHeader()}
                <ScrollView>
                    {this.renderMoviePoster()}
                    {
                        !loadingDetail ?
                            <View>
                                {this.renderMovieinfo()
                                }
                                {
                                    this.renderSynopsis()
                                }
                                {
                                    this.renderMainCast()
                                }
                                {

                                    this.renderMainCrew()
                                }

                            </View>
                            : <View style={{ justifyContent: "center", alignItems: "center", height: w, }}>
                                <ActivityIndicator color="#ff4757" size="large"></ActivityIndicator>
                            </View>
                    }

                    <View style={{ height: 50 }}></View>
                </ScrollView>

            </SafeAreaView>
        );
    }
}
const maincastStyle = StyleSheet.create({
    container: {
        height: w * 0.4,
        marginTop: w * 0.02,
        marginHorizontal: w * 0.05,
        alignItems: "center"

    },
    title: {
        fontSize: w * 0.05,
        justifyContent: "center",
        color: "#2f3542",
        fontWeight: "600",
    },
    imageView: {
        height: w * 0.3,
        width: w * 0.23,
        marginHorizontal: w * 0.023,
        marginBottom: w * 0.02,
        alignItems: "center"
    },
    castName: {
        color:"#747d8c",
        marginTop:3

    }


})

const synopsisStyle = StyleSheet.create({

    container: {


        marginHorizontal: w * 0.05

    },
    title: {
        fontSize: w * 0.05,
        justifyContent: "center",
        color: "#2f3542",
        fontWeight: "600",

    },
    content: {
        fontSize: w * 0.043,
        textAlign: "justify",
        color: "#57606f",
        marginTop: w * 0.03


    },
    readMoreView: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginRight: w * 0.04


    },
    readMoreText: {
        color: "#ff4757",
        fontSize: w * 0.04,
        fontWeight: "700"



    }




})

const styleMovieinfo = StyleSheet.create({

    upView: {
        height: w * .27,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: w * 0.02
    },

    upViewAC: {
        height: w * .3,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: w * 0.02
    },
    duration: {
        flex: 1,
        backgroundColor: "white",
        marginHorizontal: 5,
        alignItems: "center",
        height: w * .3,

    },
    Genre: {
        flex: 1,
        backgroundColor: "white",
        marginHorizontal: 5,
        height: w * .3,
        alignItems: "center"
    },
    Language: {
        flex: 1,
        backgroundColor: "white",
        marginHorizontal: 5,
        height: w * .3,
        alignItems: "center"
    }


})

const stylePoster = StyleSheet.create({

    posterView: {
        height: w * .65,

    },
    posterimage: {
        flex: 1
    },
    likeimage: {
        width: w * 0.13,
        height: w * 0.13,
        marginTop: -w * 0.07,
        marginRight: w * 0.05
    }

})

const style = StyleSheet.create({
    headerContainer: {

        height: w * 0.13,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        paddingHorizontal: w * 0.02
    },
    moviesText: {
        fontWeight: "600",
        fontSize: w * 0.05,
        color: "#485460"
    },

    serachinput: {
        backgroundColor: "#ecf0f1",
        height: w * 0.08,
        borderRadius: 30,
        borderWidth: 0.4,
        borderColor: "black",

        color: "black",
        paddingLeft: w * 0.03,
        flex: 1,
        marginHorizontal: w * 0.02,
        padding: -3,
        shadowColor: "#57606f",
        shadowOpacity: 0.4,
        shadowRadius: 7,
        shadowOffset: { height: 4, width: 4, },


    },
    infoBar: {

        height: w * 0.1,
        marginHorizontal: w * 0.02,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    mostpopularText: {
        fontWeight: "500",
        fontSize: w * 0.06,
        color: "#485460"
    },



})