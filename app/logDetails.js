import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ToastAndroid
} from "react-native";
import { MaterialIcons} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { api, getItemFromAS } from "../utiles/utile";
import ImageSlider from "../components/imageSlider";
export default function Details() {
  // 获取路由参数
  const params = useLocalSearchParams();
  const log = JSON.parse(params.log || "{}");
  const logId = log._id;
  const userId = log.userId;
  const userAvatar = log.userAvatar;
  const userName = log.username;

  const [travelLog, setTravelLog] = useState(null);

  // 获取游记完整信息
  const fetchLogDetail = async () => {
    try {
      const response = await api.get(`/logDetail/findLog/${logId}`);
      const data = await response.data;
      console.log(data);
      setTravelLog({
        ...data,
        editTime: formatDate(data.editTime),
      });
    } catch (error) {
      console.error(error);
    }
  };
  // 时间格式化显示
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

    // 分享功能
  const handleSharePress = async () => {
    let user = await getItemFromAS("userInfo");
    user = JSON.parse(user);
    if (user) {
      ToastAndroid.show("该功能暂未开放", ToastAndroid.SHORT);
    } else {
      ToastAndroid.show("请先登录~", ToastAndroid.SHORT);
    }
  };

  useEffect(() => { fetchLogDetail(); }, [])


  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* 顶部导航栏 */}
      <View style={styles.topScreen}>
        <View style={styles.leftTopScreen}>
          <TouchableOpacity onPress={() => { router.back(); }} >
            <MaterialIcons
              name="arrow-back-ios"
              size={30}
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.userInfo} >
            {/* 根据传过来的用户Id进行查找，跳到对应的id用户界面 */}
            <View style={styles.avatarContainer}>
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            </View>
            <View style={styles.nickName}>
              <Text style={styles.nameText}>
                {userName ? userName : "空的昵称"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.leftTopScreen}>
          <TouchableOpacity  onPress={handleSharePress}>
            <MaterialIcons
              name="ios-share"
              size={30}
              style={{ marginRight: 10, color: "#566573" }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 中间的滚动视图 */}
      <ScrollView style={{ flex: 1 }}>
        {travelLog && <ImageSlider imageUrls={travelLog.imagesUrl} />}
        {travelLog && <Text style={styles.titleText}>{travelLog.title}</Text>}
        {/* 地点、出行时间 */}
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <View style={styles.labelBox}>
            <View style={styles.label}>
              <Text style={styles.labelText}>地点</Text>
              <TouchableOpacity
                onPress={() => {
                  handleLinkPress("https://www.ctrip.com/");
                }}
              >
                {travelLog && (
                  <Text
                    style={[
                      styles.labelData,
                      {
                        color: "#5499C7",
                        textDecorationLine: "underline",
                        paddingBottom: 0,
                      },
                    ]}
                  >
                    {travelLog.destination
                      ? matchText(travelLog.destination)
                      : "XX"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.label}>
              <Text style={styles.labelText}>出行月份</Text>
              {travelLog && (
                <Text style={[styles.labelData, {}]}>
                  {travelLog.travelMonth}
                </Text>
              )}
            </View>
          </View>
        </View>
        {/* 游记内容 */}
        <View style={{ marginTop: 10 }}>
          {travelLog && (
            <Text style={styles.contentText}>{travelLog.content}</Text>
          )}
        </View>
      </ScrollView>
      {/* 编辑时间 */}
      <View style={styles.editTimeContainer}>
        {travelLog && (
          <Text style={styles.editTime}>
            编辑于 {travelLog.editTime}
          </Text>
        )}
      </View>

    </View>
  );
}


const styles = StyleSheet.create({
  topScreen: {
    height: 60,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  leftTopScreen: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  nickName: {
    marginLeft: 10,
  },
  nameText: {
    fontSize: 16,
  },
  imageContainer: {
    flex: 1,
    height: 800,
  },
  titleText: {
    fontSize: 22,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  labelBox: {
    width: "98%",
    height: 80,
    borderRadius: 20,
    backgroundColor: "#EBF5FB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  labelText: {
    fontSize: 16,
    color: "#808B96",
  },
  labelData: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  contentText: {
    fontSize: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
    textAlign: "left",
    marginTop: 10,
  },
  editTimeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    height: 40, // 设置固定高度
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0, // 使其占满底部
  },
  editTime: {
    fontSize: 14,
    color: "#808B96",
  },
});