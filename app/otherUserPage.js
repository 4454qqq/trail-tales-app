import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    FlatList,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from "react-native";
import { api, getItemFromAS, removeValueFromAS } from "../utiles/utile";

export default function MyLog() {
    // 获取路由参数
    const params = useLocalSearchParams();
    const userId = JSON.parse(params.userId || "{}");

    const [userInfo, setUserInfo] = useState({})
    const [myLogInfo, setMyLogInfo] = useState({})
    const [isLogin, setIsLogin] = useState(false) //用于判断用户是否登录
    const [refreshing, setRefreshing] = useState(false);
    const [isVisible, setIsVisible] = useState(false)


    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            // 重新获取游记数据
            await fetchUserLogData();
        } catch (error) {
            console.error('刷新失败', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleEditAvatar = async () => {
        try {
            // 首先弹出确认对话框
            Alert.alert(
                "修改头像",
                "确定要修改头像吗？",
                [
                    {
                        text: "取消",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel",
                    },
                    { text: "确定", onPress: handleAvatarUpdate },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error("头像上传出错:", error);
            Alert.alert("上传失败", "头像上传过程中出错，请稍后再试");
        }
    };
    const handleAvatarUpdate = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled) {
                const image = result.assets[0];
                const base64Data = image.base64;
                const ext = image.uri.split('.').pop();

                const formData = new FormData();
                formData.append('images', [base64Data, ext]);

                const response = await api.post('/userInfo/updateUserAvatar', { images: formData });

                if (response.data.status === 'success') {
                    const newAvatarUrl = response.data.data.url;
                    Alert.alert("头像更新成功");
                    // 刷新头像
                    setUserInfo(prev => ({ ...prev, userAvatar: newAvatarUrl }));
                } else {
                    Alert.alert("头像更新失败", response.data.message);
                }
            }
        } catch (error) {
            console.error("头像上传出错:", error);
            Alert.alert("上传失败", "头像上传过程中出错，请稍后再试");
        }
    };


    const fetchUserLogData = async () => {
        try {
            // 获取用户信息
            const userResponse = await api.get(`/userInfo//getUserById/${userId}`);
            setUserInfo(userResponse.data.data);
            // 获取用户当前已通过游记信息
            const logResponse = await api.get(`/myLog/getLogsByUserId/${userId}`);
            setMyLogInfo(logResponse.data.data)
        } catch (e) {
            console.log(e.response.data.message);
        }
    };

    //获取当前用户状态,判断是查看其他用户主页还是查看我的主页
    const getUserDataFromAS = async () => {
        try {
            let user = await getItemFromAS("userInfo");
            user = JSON.parse(user);
            if (user) {
                setIsLogin(true)
                if ((user?.userId === userId))
                    setIsVisible(true)
            }
        } catch (e) {
            // error reading value
            console.log(e);
        }
    };

    const handleExit = () => {
        Alert.alert(
            "退出",
            "确定退出登录？",
            [
                {
                    text: "取消",
                    style: "cancel",
                },
                {
                    text: "确定",
                    onPress: async () => {
                        router.replace("login");
                        await removeValueFromAS("userInfo");
                        await removeValueFromAS("token");
                        api.interceptors.request.eject(
                            "AddAuthorizationToken"
                        );
                        setIsLogin(false)
                    },
                },
            ],
            { cancelable: false }
        );
    }

    const getStatusColor = (state) => {
        switch (state) {
            case '已通过':
                return 'green';
            case '待审核':
                return 'blue';
            case '未通过':
                return 'red';
            default:
                return 'black';
        }
    };

    const handleDelete = (item) => {
        Alert.alert(
            "删除游记",
            "确定要删除这条游记吗？",
            [
                {
                    text: "取消",
                    style: "cancel",
                },
                {
                    text: "删除",
                    onPress: async () => {
                        try {
                            await api.delete(`/myLog/deleteLogs/${item._id}`).then((res) => {
                                console.log(res.data);
                                ToastAndroid.show("删除成功", ToastAndroid.SHORT);
                            });
                            fetchUserLogData();
                        } catch (error) {
                            console.error("Error deleting data:", error);
                            ToastAndroid.show("删除失败", ToastAndroid.SHORT);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    }

    const handelBack = () => {
        router.back();
    }

    useEffect(() => {
        getUserDataFromAS();
        fetchUserLogData()
    }, [])

    return (
        <View style={styles.container}>
            <View style={{marginBottom: -10, backgroundColor: '#fff',}}>
                <TouchableOpacity
                    onPress={handelBack}
                >
                    <MaterialIcons name="chevron-left" style={{ width: 25 }} size={32} color="#989797" />
                </TouchableOpacity>
            </View>
            <View style={styles.userInfoContainer}>
                <ImageBackground
                    source={{ uri: userInfo.backgroundImage }}
                    resizeMode="recover"
                    style={styles.background_image}
                >
                    <View style={{
                        flex: 3,
                        flexDirection: "row",
                        marginBottom: 30
                    }}>
                        <View style={{
                            flex: 2,
                            alignItems: "left",
                            justifyContent: "center",
                            marginVertical: 20,
                            marginLeft: 10
                        }}>
                            <Image style={{ height: 80, width: 80, borderRadius: 40, }} source={{ uri: userInfo.userAvatar }} />
                            {(isVisible && <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    bottom: 3,
                                    right: 0,
                                    backgroundColor: '#ffffff',
                                    borderRadius: 12,
                                    padding: 4,
                                }}
                                onPress={handleEditAvatar}
                            >
                                <MaterialIcons name="edit" size={18} color="#3498DB" />
                            </TouchableOpacity>)}
                        </View>

                        <View
                            style={{
                                flex: 3,
                                alignItems: "flex-start",
                                justifyContent: "center",
                                marginLeft: 15
                            }}
                        >
                            <Text
                                style={{
                                    fontWeight: "bold",
                                    color: "#000",
                                    fontSize: 25,
                                    fontFamily: "serif",
                                }}
                            >
                                {userInfo && userInfo.username}
                            </Text>
                            <Text
                                style={{
                                    color: "green",
                                    fontSize: 15,
                                    fontFamily: "serif",
                                    marginTop: 5,
                                    fontWeight: "bold",
                                }}
                            >
                                ID:{userInfo ? userInfo.customId : ""}
                            </Text>

                        </View>
                        <View
                            style={{
                                flex: 3,
                                alignItems: "flex-end",
                                justifyContent: "center",
                                marginTop: 100,
                                marginRight: 10
                            }}
                        >
                            {(isVisible && <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
                                <Text style={styles.buttonText}>退出登录</Text>
                            </TouchableOpacity>)}
                        </View>

                    </View>
                </ImageBackground>
            </View>

            <View style={styles.logsContainer}>
                <Text style={styles.sectionTitle}>{isVisible ? "我的游记" : "已发布的游记"}</Text>
                <FlatList
                    data={myLogInfo}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    renderItem={({ item }) => (
                        <View style={styles.logItem}>
                            <TouchableOpacity disabled={!(item.state === "已通过")} onPress={() => router.push({ pathname: 'logDetails', params: { log: JSON.stringify(item) } })}>
                                <Image style={styles.logImage} source={{ uri: item.imageUrl }} />
                            </TouchableOpacity>
                            <View style={styles.logDetails}>
                                <Text style={styles.logTitle}>{item.title}</Text>
                                {(isVisible && <Text style={[styles.logStatus, { color: getStatusColor(item.state) }]}>{item.state}</Text>)}
                                {(item.state === "未通过" && <Text style={[styles.logInstruction, { color: getStatusColor(item.state) }]}>{item.instruction}</Text>)}
                            </View>
                            {(isVisible && <View style={{ justifyContent: 'center', }}>
                                <View style={{ marginVertical: 5, marginRight: 10 }}>
                                    {(!(item.state === "已通过") && <Button title="编辑" onPress={() => { router.push({ pathname: 'logPublic', params: { log: JSON.stringify(item) } }) }} />)}
                                </View>
                                <View style={{ marginVertical: 5, marginRight: 10 }}>
                                    <Button title="删除" onPress={() => handleDelete(item)} />
                                </View>
                            </View>)}
                        </View>
                    )}
                    keyExtractor={(item) => item._id}
                />
            </View>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5f5',
    },
    loginContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 18,
        marginBottom: 10,
    },
    userInfoContainer: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
        flexDirection: "row",
        flex: 2
    },
    background_image: {
        width: "100%",
        height: "100%",
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userNumber: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    editButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: '#007bff',
        borderRadius: 50,
        padding: 10,
    },
    exitButton: {
        width: '70%',
        height: 35,
        backgroundColor: 'blue',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    logsContainer: {
        padding: 20,
        flex: 7
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    logItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    logImage: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
    logDetails: {
        flex: 1,
        justifyContent: 'center'
    },
    logTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    logStatus: {
        fontSize: 14,
        color: '#888',
    },
    logInstruction: {
        fontSize: 12,
        color: '#888',
    },
});