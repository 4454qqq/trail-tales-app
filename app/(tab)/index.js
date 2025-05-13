import { Link } from "expo-router";
import { useState, useEffect } from "react";
import WaterfallFlow from 'react-native-waterfall-flow';
import TravelLogCard from "../../components/TravelLogCard";
import { router } from "expo-router";
// import { Dialog } from "@rneui/themed";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ToastAndroid,
} from "react-native";
import { api } from "../../utiles/utile";
import { Feather, MaterialIcons } from "@expo/vector-icons";
const config = require("../../config.json")
// 屏幕宽度高度
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const RequestStatus = {
  IDLE: "IDLE",
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
};

export default function Index() {

  // 瀑布流列数
  const numColumns = screenHeight / screenWidth > 1.2 ? 2 : 3;
  const topics = ["", ...config.topic];

  // 每次瀑布流加载countEachLoad个游记卡片
  const countEachLoad = config.countEachLoad;

  // 存放游记列表
  const [travelLogs, setTravelLogs] = useState([]);

  // 存放要搜索的内容
  const [searchContent, setSearchContent] = useState("");
  // 存放搜索框输入的内容，用于判断搜索是否合法
  const [searchInput, setSearchInput] = useState("");
  // 存放当前选择的主题
  const [selectedTopic, setSelectedTopic] = useState("");

  const [requestStatus, setRequestStatus] = useState(RequestStatus.IDLE);

  // 点击游记卡片执行跳转至详情页
  // const navigation = useNavigation();
  const handlePress = (item) => {
    router.push({pathname:'logDetails',params: { log: JSON.stringify(item) }});
  };

  // 分中英文计算字符长度，用于判断搜索框内容长度是否合法
  const maxInputLength = 20;
  const calculateLength = (str) => {
    let length = 0;
    for (let i = 0; i < str.length; i++) {
      // 检查是否是中文字符，如果是，则计数+2，否则+1
      const charCode = str.charCodeAt(i);
      if (charCode >= 0x4e00 && charCode <= 0x9fff) {
        length += 1; // 中文字符
      } else {
        length += 0.5; // 英文字符
      }
    }
    return length;
  };
  // 搜索框内容改变时判断长度是否合法,安卓系统会弹出过长提示框
  const handleInputChange = (input) => {
    input = input.nativeEvent.text;
    const length = calculateLength(input);
    if (length <= maxInputLength) {
      setSearchInput(input);
    } else {
      ToastAndroid.show(`搜索长度不能超过${maxInputLength}个字符`, ToastAndroid.SHORT);
    }
  };
  // 清空搜索框内容
  const handleInputDelete = () => {
    setSearchInput("");
    setSearchContent("");
  };
  // 点击搜索按钮更新游记列表
  const handleSearchPress = () => {
    setSearchContent(searchInput);
  }

  // 点击对应主题执行更新搜索的主题
  const handleTopicPress = (index) => {
    setSelectedTopic(topics[index]);
  };

  // 当滚动到顶部时刷新游记列表
  const handleFresh = async () => {
    setRequestStatus(RequestStatus.PENDING);
    await fetchTravelLog("fresh");
  };


  // 获取游记列表
  const fetchTravelLog = async (type) => {
    try {
      const params = {
        selectedTopic: selectedTopic,
        searchContent: searchContent,
        count: countEachLoad,
      };
      const response = await api.get("/home/travelLogs", { params });
      console.log(response)
      // 使用 Promise.all() 来等待所有的 Image.getSize() 异步操作完成，然后返回一个新的数组 newTravelLogs。在 map() 函数中，使用 async/await 来等待每个 Image.getSize() 异步操作的完成，然后将结果存入新数组中
      const newTravelLogs = await Promise.all(
        response.data.map(async (item) => {
          return new Promise((resolve, reject) => {
            Image.getSize(
              item.imageUrl,
              (width, height) => {
                // 计算图片在瀑布流中的高度;
                const newHeight = Math.floor(
                  (screenWidth / numColumns / width) * height
                );
                resolve({ ...item, height: newHeight });
              },
              reject
            );
          });
        })
      );

      // console.log(newTravelLogs);
      type === "fresh"
        ? setTravelLogs(newTravelLogs) // 刷新游记
        : setTravelLogs([...travelLogs, ...newTravelLogs]); // 增量获取
      // 数据加载成功
      setRequestStatus(RequestStatus.SUCCESS);
    } catch (error) {
      // 数据加载失败
      setRequestStatus(RequestStatus.ERROR);
    }
  };

  useEffect(() => {
    // 等待容器加载数据
    setRequestStatus(RequestStatus.PENDING);
    fetchTravelLog("fresh");
  }, [searchContent, selectedTopic]);


  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 搜索框 */}
        <View style={styles.searchBoxContainer}>
          <View style={styles.searchBox}>
            <Feather name="search" color="gray" size={20} style={styles.icon} />
            <TextInput
              style={styles.searchInput}
              placeholder="输入游记标题或作者昵称搜索"
              onChange={handleInputChange}
              value={searchInput}
            />
            {/* 输入搜索内容显示清空按键 */}
            {searchInput.length > 0 && (
              <TouchableOpacity onPress={handleInputDelete}>
                <MaterialIcons
                  name="cancel"
                  size={24}
                  color="#989797"
                  style={styles.icon}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={handleSearchPress}>
            <Text style={styles.searchButton}>搜索</Text>
          </TouchableOpacity>
        </View>
        {/* 主题滚动条 */}
        <View style={styles.topicScrollContainer}>
          {/* 将主题横向放置，设置为水平方向的滚动条 */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            {topics.map((topic, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleTopicPress(index)}
              >
                <Text
                  style={[
                    styles.topic,
                    topic === selectedTopic && styles.selectedTopic,
                  ]}
                >
                  {topic ? topic : "全部"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* 渲染数据 */}
        {(requestStatus === RequestStatus.PENDING ||
          requestStatus === RequestStatus.SUCCESS) && (
            <WaterfallFlow
              style={styles.waterfallFlow}
              data={travelLogs}
              numColumns={numColumns}
              onRefresh={handleFresh}
              refreshing={requestStatus === RequestStatus.PENDING}
              onEndReached={() => {
                fetchTravelLog("append");
              }}
              onEndReachedThreshold={0.1}
              renderItem={({ item, index, columnIndex }) => (
                <TravelLogCard
                  item={item}
                  key={index}
                  columnIndex={columnIndex}
                  onPress={handlePress} />
              )}
            />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  searchBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginTop: 40,
  },
  searchBox: {
    flex: 4,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    backgroundColor: "#eeeeee",
    borderRadius: 20,
  },
  icon: {
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    borderRadius: 5,
    marginRight: 10,
  },
  searchButton: {
    fontSize: 16,
    marginLeft: 10,
    color: "gray",
  },

  topicScrollContainer: {
    marginVertical: 5,
  },
  topic: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    fontSize: 16,
    color: "gray",
  },
  selectedTopic: {
    fontWeight: "bold",
    color: "#3498DB",
    borderBottomWidth: 2,
    borderBottomColor: "#3498DB",
  },

  waterfallFlow: {
    backgroundColor: "#f0f0f0",
  },
  loading: {
    flex: 1,
  },
});