import React, { Component } from 'react';
import {
	View, Text, SafeAreaView,
	Dimensions, Platform,
	StyleSheet, TextInput,
	FlatList, Image,
	ImageBackground, TouchableOpacity,
	ActivityIndicator, Animated,
	Easing,
} from 'react-native';

import Ionicons from "react-native-vector-icons/Ionicons";
import AS from "@react-native-async-storage/async-storage"
import axios from "axios"
import { observer, inject } from 'mobx-react';

const w = Platform.OS == "ios" ? Dimensions.get("window").width : Dimensions.get("window").width * 1.1;
const h = Platform.OS == "ios" ? Dimensions.get("window").height : Dimensions.get("window").height * 1.1;
@inject('MainStore')
@observer
export default class home extends Component {

	constructor(props) {
		super(props);
		this.state = {
			moviesData: [],
			moviesFilterData: [],
			genres: [],
			selectedMovieGenres: [],
			text: "",
			isGrid: false,
			favMovies: "",
			loading: false,
			loadingGrid: false
		};
		this.opacity = new Animated.Value(1)
	}
	componentDidMount() {
		this.setConfig()
		this.getData()
	}



	
	fadeAnim() {
		this.opacity.setValue(1)
		Animated.timing(
			this.opacity,
			{
				useNativeDriver: true,
				toValue: 0,

				duration: 75,
				easing: Easing.easing,
			}
		).start(() => this.reFadeAnim())
	}
	reFadeAnim() {
		this.opacity.setValue(0)
		Animated.timing(
			this.opacity,
			{
				useNativeDriver: true,
				toValue: 1,

				duration: 75,
				easing: Easing.easing,
			}
		).start()
		this.setState({
			loadingGrid: false
		})
	}
	async getData() {
		this.setState({
			loading: true
		})
		axios.get("http://api.themoviedb.org/3/trending/movie/week?api_key=579c7fc7840ab037036071939351dc60").then((res) => {

			this.setState({
				moviesData: res.data.results,
				moviesFilterData: res.data.results,

			})
			this.getGenres()
		}).catch((err) => {
			this.setState({
				loading: false
			})
			alert(err)
		})


	}
	async getGenres() {
		axios.get("https://api.themoviedb.org/3/genre/movie/list?api_key=579c7fc7840ab037036071939351dc60&language=en-US").then((res) => {
			this.setState({
				genres: res.data.genres,
				loading: false
			})
		}).catch((err) => {
			this.setState({
				loading: false
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
		return (<View><Text style={renderGridItemStyle.subtitle2}>{allGenres}</Text></View>)
	}
	like(id) {
		AS.getItem("likeMovie").then((res) => {
			res + `${id}` + "+"
			AS.setItem("likeMovie", res + `${id}` + "+")
			this.props.MainStore.favMovie = this.props.MainStore.favMovie + `${id}` + "+"
		})
	}
	dislike(id) {
		AS.getItem("likeMovie").then((res) => {
			res = res.replaceAll(`${id}` + "+", "")
			AS.setItem("likeMovie", res)
			this.props.MainStore.favMovie = this.props.MainStore.favMovie.replaceAll(`${id}` + "+", "")
		})
	}
	async setConfig() {
		AS.getItem("isGrid").then((res) => {
			if (res == "true") {
				this.setState({
					isGrid: true,
				})
			} else {
				this.setState({
					isGrid: false,
				})
			}
		})
	}
	renderItem = ({ item, index }) => {
		const { isGrid } = this.state;
		if (item.name == "0") {
			return (<View style={renderNotFoundItemStyle.notFoundContainer}>
				<Image style={renderNotFoundItemStyle.sadCatNotFound} source={require("../../../assets1/icons1/sad-cat-not-found.png")}></Image>
				<Text style={renderNotFoundItemStyle.notFoundText}>Oops! I am sorry, i couldn't find it...</Text>
			</View>);
		} else {
			if (isGrid) {
				return (
					this.renderGridItems(item))
			} else {
				return (
					this.renderNonGridItems(item)
				)
			}
		}
	};
	searchFilter = text => {
		const newData = this.state.moviesData.filter(item => {
			const listItem = `${item.original_title.toLowerCase()}`
			return listItem.indexOf(text.toLowerCase()) > -1;
		})
		if (newData.length == 0) {
			this.setState({
				moviesFilterData: [{
					"name": "0",
				}]
			});
		} else {
			this.setState({
				moviesFilterData: newData
			});
		}

	}


////////////////////////////  UI  ///////////////////////////////////////

	renderSearchBar = () => {
		const { text } = this.state;
		return (
			<View style={{ flexDirection: "row", alignItems: "center" }}>
				<TextInput
					onChangeText={
						text => {
							this.setState({
								text,
							});
							this.searchFilter(text);
						}
					}
					placeholderTextColor={"#57606f"}
					textAlignVertical={"auto"}
					value={text}
					style={style.serachinput}
					placeholder=" Search...">
				</TextInput>
			</View>
		)
	}

	renderHeader() {
		return (
			<View style={style.headerContainer} >
				<Text style={style.moviesText}>MOVIES</Text>
				<Text style={{ height: 0, }}>{this.props.MainStore.favMovie.substring(0, 0)}</Text>
			</View>);
	}

	renderInfoBar() {
		const { isGrid, loadingGrid } = this.state;
		return (
			<View style={style.infoBar}>
				<Text style={style.mostpopularText}>Most Popular</Text>
				<View style={{ flexDirection: "row" }}>
					{
						loadingGrid ? <ActivityIndicator color="black" style={{ marginRight: 5 }}></ActivityIndicator> : null
					}

					<View onTouchStart={() => {
						this.setState({
							loadingGrid: true
						})
						this.fadeAnim()
						setTimeout(() => {
							this.setState({
								isGrid: !isGrid
							})
							AS.setItem("isGrid", `${!isGrid}`)
						}, 50)
					}}>
						{isGrid ? <Ionicons size={w * 0.06} name="grid-outline"></Ionicons> : <Ionicons size={w * 0.06} name="layers-outline"></Ionicons>}

					</View>
				</View>


			</View>
		)

	}
	renderGridItems(item) {

		return (
			<TouchableOpacity onPress={() => {
				this.props.navigation.navigate("Details", {
					"movie": item,
					"genre": this.state.genres
				})
			}} >
				<View
					style={renderGridNonItemStyle.wrapperContainer}>
					<ImageBackground style={renderGridNonItemStyle.imageView} borderRadius={10} source={{ uri: `https://image.tmdb.org/t/p/w500/${item.backdrop_path}` }}>
						<View style={renderGridItemStyle.inImage}>
							<View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
								<TouchableOpacity
									onPress={() => {
										if (this.props.MainStore.favMovie.includes(`${item.id}`)) {
											this.dislike(item.id)
										} else {
											this.like(item.id)
										}
									}}>
									{
										this.props.MainStore.favMovie.includes(`${item.id}`) ? <Image source={require("../../../assets1/icons1/like.png")} style={renderGridItemStyle.likeimage}></Image> : <Image source={require("../../../assets1/icons1/unlike.png")} style={renderGridItemStyle.likeimage}></Image>
									}
								</TouchableOpacity>
							</View>
						</View>
					</ImageBackground>
					<View style={renderGridNonItemStyle.infoView}>
						<View>
							<Text style={renderGridNonItemStyle.title}>{item.original_title}</Text>
							<Text style={renderGridNonItemStyle.subtitle}>{`${item.release_date}`.substring(0, 4)} | {`${item.original_language}`.charAt(0).toUpperCase()}{`${item.original_language}`.substring(1,)}</Text>
							{this.setGenres(item)}
						</View>
						<View>
							<Text style={renderGridNonItemStyle.average}>{item.vote_average}</Text>
							<Text style={renderGridNonItemStyle.average}>{item.adult ? "" : "Public"}</Text>
						</View>

					</View>

				</View>
			</TouchableOpacity>
		)
	}
	renderNonGridItems(item) {
		return (
			<TouchableOpacity onPress={() => {
				this.props.navigation.navigate("Details", {
					"movie": item,
					"genre": this.state.genres
				})
			}} style={renderGridItemStyle.wrapperContainer}>
				<View style={renderGridItemStyle.wrapperContainer}>
					<ImageBackground style={renderGridItemStyle.imageView} borderRadius={10} source={{ uri: `https://image.tmdb.org/t/p/w500/${item.backdrop_path}` }}>
						<View style={renderGridItemStyle.inImage}>
							<View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
								<TouchableOpacity
									onPress={() => {

										if (this.props.MainStore.favMovie.includes(`${item.id}`)) {
											this.dislike(item.id)
										} else {
											this.like(item.id)
										}

									}}>
									{

										this.props.MainStore.favMovie.includes(`${item.id}`) ? <Image source={require("../../../assets1/icons1/like.png")} style={renderGridItemStyle.likeimage}></Image> : <Image source={require("../../../assets1/icons1/unlike.png")} style={renderGridItemStyle.likeimage}></Image>
									}
								</TouchableOpacity>
							</View>
							<View style={renderGridItemStyle.titleView}><Text style={renderGridItemStyle.title}>{item.original_title}</Text></View>
						</View>
					</ImageBackground>
					<View style={renderGridItemStyle.subtitleView}>
						<Text style={renderGridItemStyle.subtitle}>{`${item.release_date}`.substring(0, 4)} | {`${item.original_language}`.charAt(0).toUpperCase()}{`${item.original_language}`.substring(1,)}</Text>
						{this.setGenres(item)}
					</View>
				</View>
			</TouchableOpacity>
		)
	}
	render() {
		const { isGrid, loading,moviesFilterData } = this.state;
		const opacityValue = this.opacity.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1]
		});
		if (!loading) {
			return (
				<SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
					{this.renderHeader()}
					{this.renderSearchBar()}
					{this.renderInfoBar()}
					<Animated.View style={{ flex: 1, opacity: opacityValue }}>
						{
							<FlatList
								data={moviesFilterData}
								keyExtractor={(item, index) => index.toString()}
								renderItem={this.renderItem}
								numColumns={!isGrid ? 2 : 1}
								key={!isGrid ? 2 : 1}
								ListFooterComponent={<View style={{ height: w * 0.1 }}>

								</View>
								}
							></FlatList>
						}
					</Animated.View>
				</SafeAreaView>
			);
		} else {
			return (<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator color="#ff4757" size="large"></ActivityIndicator></View>)

		}

	}
}
const renderNotFoundItemStyle = StyleSheet.create({
	notFoundContainer: {
		justifyContent: "center",
		alignItems: "center",
		height: h * .5,
		width: w

	},
	sadCatNotFound: {
		height: w * 0.2,
		width: w * 0.2
	},
	notFoundText: {
		color: "red",
		fontWeight: "300",
		fontSize: w * 0.05,
		marginTop: w * 0.1
	},

})
const renderGridNonItemStyle = StyleSheet.create({
	wrapperContainer: {

		flex: 1,
		height: w * 0.57,
		margin: 5,
		flexDirection: "row",
		marginTop: w * .05,


	},
	imageView: {
		flex: 2,
		padding: 5,

		shadowColor: "#57606f",
		shadowOpacity: 0.6,
		shadowRadius: 4,
		shadowOffset: { height: 4, width: 1, },
	},
	infoView: {
		flex: 3,
		marginLeft: w * 0.04,
		justifyContent: "space-between",


	},
	title: {
		fontSize: w * 0.06,
		color: "#636e72",
		fontWeight: "500"
	},
	subtitle: {
		fontSize: w * 0.04,
		color: "#95a5a6",
		fontWeight: "500"

	},
	average: {
		fontSize: w * 0.05,
		color: "#95a5a6",
		fontWeight: "500"

	}
})
const renderGridItemStyle = StyleSheet.create({
	wrapperContainer: {
		flex: 1,
		height: w * 0.8,
		margin: 5,
		borderRadius: 10,
		marginTop: 10
	},

	imageView: {
		flex: 1,
		padding: 5,
		height: w * 0.63,
		shadowColor: "#57606f",
		shadowOpacity: 0.6,
		shadowRadius: 4,
		shadowOffset: { height: 4, width: 1, },
	},
	inImage: {
		height: w * 0.7,
		justifyContent: "space-between",
	},
	titleView: {
		marginBottom: w * 0.11,

	},
	title: {
		fontSize: w * 0.06,
		color: "white",
		fontWeight: "500"
	},
	subtitleView: {
		height: w * .1,
		marginBottom: w * 0.03,

	},
	subtitle: {
		fontSize: w * 0.06,
		color: "#95a5a6",
		fontWeight: "500"

	},
	subtitle2: {
		fontSize: w * 0.04,
		color: "#95a5a6",
		fontWeight: "500"

	},
	likeimage: {
		width: w * 0.08,
		height: w * 0.08,

	}

})
const style = StyleSheet.create({
	headerContainer: {

		height: w * 0.1,
		backgroundColor: "#ffffff",
		alignItems: "center",
		justifyContent: "center",
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