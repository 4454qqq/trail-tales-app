import { router } from "expo-router";
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
  View
} from "react-native";
import { api, getItemFromAS, removeValueFromAS, setAuthHeader } from "../../utiles/utile";

export default function MyLog() {
  const [userInfo, setUserInfo] = useState({})
  const [myLogInfo, setMyLogInfo] = useState({})
  const [isLogin, setIsLogin] = useState(false)
  const [refreshing, setRefreshing] = useState(false);


  const handleRefresh = async () => {
  setRefreshing(true);
  try {
    // 重新获取游记数据，假设你已有 fetchMyLogs 函数
    await fetchUserLogData(); 
  } catch (error) {
    console.error('刷新失败', error);
  } finally {
    setRefreshing(false);
  }
};

  const fetchUserLogData = async () => {
    try {
      await setAuthHeader();
      // 获取用户信息
      const userResponse = await api.get("/userInfo/info");
      setUserInfo(userResponse.data.data);

      // 获取用户当前已有游记信息
      const logResponse = await api.get("/myLog/getMyLogs");
      console.log(logResponse);
      setMyLogInfo(logResponse.data.data)
    } catch (e) {
      console.log(e.response.data.message);
    }
  };

  //获取当前用户信息
  const getUserDataFromAS = async () => {
    try {
      let user = await getItemFromAS("userInfo");
      user = JSON.parse(user);
      if (user) {
        setIsLogin(true)
      } else {
        setIsLogin(false)
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
            await removeValueFromAS("userInfo");
            await removeValueFromAS("token");
            api.interceptors.request.eject(
              "AddAuthorizationToken"
            );
            router.push({ pathname: "login" });
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

  useEffect(() => {
    getUserDataFromAS()
    fetchUserLogData()
  }, [])


  {/* <Text>我的游记</Text>
      <Link href={'login'}>Login</Link>
      <Link href={'register'}>register</Link> */}
  return (
    <View style={styles.container}>
      {!isLogin ? (
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Please login to view your profile.</Text>
          <Button title="LogIn" onPress={() => router.push('login')} />
        </View>
      ) : (
        <>
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
                  marginBottom: 20,
                  marginLeft: 10
                }}>
                  <Image style={{ height: 80, width: 80, borderRadius: 40, }} source={{ uri: userInfo.userAvatar }} />
                </View>

                <View
                  style={{
                    flex: 3,
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  {userInfo ? (
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
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        router.push({ pathname: 'login' })
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: "#000",
                          fontSize: 15,
                          fontFamily: "serif",
                        }}
                      >
                        游客请登录
                      </Text>
                    </TouchableOpacity>
                  )}
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
                  <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
                    <Text style={styles.buttonText}>退出登录</Text>
                  </TouchableOpacity>
                </View>

              </View>


            </ImageBackground>
          </View>

          <View style={styles.logsContainer}>
            <Text style={styles.sectionTitle}>我的游记</Text>
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
                    <Text style={[styles.logStatus, { color: getStatusColor(item.state) }]}>{item.state}</Text>
                  </View>
                  <View style={{ justifyContent: 'center', }}>
                    <View style={{ marginVertical: 5, marginRight: 10 }}>
                      {(!(item.state === "已通过") && <Button title="编辑"  />)}
                    </View>
                    <View style={{ marginVertical: 5, marginRight: 10 }}>
                      <Button title="删除" onPress={() => handleDelete(item)} />
                    </View>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item._id}
            />
          </View>
        </>
      )}
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
});