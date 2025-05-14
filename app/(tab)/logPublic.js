import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  View,
  TouchableOpacity
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import { CheckBox } from 'react-native-elements';
import Toast from "react-native-root-toast";
import config from "../../config.json";
import { api } from "../../utiles/utile";

export default function PublishLog() {
  const params = useLocalSearchParams();
  const log = JSON.parse(params.log || "{}");
  let logId = log ? log._id : null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState([]);
  const [imageData, setImageData] = useState([]);
  const [destination, setDestination] = useState(null);
  const destinations = config.destination;
  const [selectedMonth, setSelectedMonth] = useState(null);
  const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const [labelText, setLabelText] = useState();
  const labels = config.topic;
  const maxTitleLength = 20;
  const formaDate = new FormData();

  const [openDestination, setOpenDestination] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);

  const calculateLength = (str) => {
    let length = 0;
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      if (charCode >= 0x4e00 && charCode <= 0x9fff) {
        length += 1;
      } else {
        length += 0.5;
      }
    }
    return length;
  };

  const handleChangeTitle = (title) => {
    const length = calculateLength(title);
    if (length <= maxTitleLength) {
      setTitle(title);
    } else {
      Toast.show(`标题长度不能超过${maxTitleLength}个字符`);
    }
  };

  const handlePickImage = async () => {
    // 返回一个promise对象
    const image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // 允许选择所有类型的媒体
      allowsEditing: true,
      quality: 0.5,
    });
    const url = image.assets[0].uri;
    const suffix = url.substring(url.lastIndexOf(".") + 1);
    try {
      // 读取图片的内容
      const data = await FileSystem.readAsStringAsync(url, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // 传给后端图片数据和后缀名
      // console.log(data.length);
      setImageData([...imageData, [data, suffix]]);
    } catch (error) {
      console.log("Error reading image file:", error);
    }

    setImageUrl([...imageUrl, url]);
  };

  const handleLabelToggle = (label) => {
    if (labelText.includes(label)) {
      setLabelText(labelText.filter((l) => l !== label));
    } else {
      setLabelText([...labelText, label]);
    }
  };

  const handleSubmitData = async () => {
    if (imageUrl.length === 0 || !title || !content) {
      ToastAndroid.show("请至少上传一张图片，填写标题和内容~", ToastAndroid.SHORT);
      return;
    }

    formaDate.append("images", imageData);

    const httpUrls = imageUrl
      .filter((url) => url.startsWith("http"))
      .map((url) => url.match(/\/([^/]+\.[a-zA-Z0-9]+)$/)[1]);

    await api
      .post("/logPublic/upload", {
        travelId: logId,
        images: formaDate,
        httpUrls,
        title,
        content,
        topic: labelText,
        travelMonth: selectedMonth,
        percost: '',
        rate: 1,
        destination,
        state: "待审核",
      })
      .then((res) => {
        ToastAndroid.show("提交成功", ToastAndroid.SHORT);
        router.push("myLog");
      })
      .catch((err) => {
        console.log("提交失败:", err);
      });
  };
  const clearData = () => {
    // 页面初始化时清空所有字段
    setTitle("");
    setContent("");
    setImageUrl([]);
    setImageData([]);
    setDestination(null);
    setSelectedMonth(null);
    setLabelText(null);
  }
  useEffect(() => {
    clearData()
  }, []);
  useFocusEffect(
    useCallback(() => {
      clearData()
    }, [logId]));

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
      >
        <MaterialIcons name="chevron-left" size={36} color="#989797" />
      </TouchableOpacity>

      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={[1]} // 使用一个空数据，避免报错
        keyExtractor={() => "1"}
        renderItem={() => (
          <>
            <Text>标题</Text>
            <TextInput
              value={title}
              onChangeText={handleChangeTitle}
              placeholder="请输入标题"
              style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />

            <Text>正文</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="请输入内容"
              multiline
              numberOfLines={6}
              style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />

            <Text>上传图片</Text>
            <Button title="选择图片" onPress={handlePickImage} />
            <ScrollView horizontal>
              {imageUrl.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={{ width: 100, height: 100, margin: 5 }} />
              ))}
            </ScrollView>

            <Text>出行地点</Text>
            <View style={{ marginBottom: 10, zIndex: 9999 }}>
              <DropDownPicker
                items={destinations.map(d => ({ label: d, value: d }))}
                open={openDestination}
                setOpen={() => setOpenDestination(!openDestination)}
                value={destination}
                setValue={setDestination}
                placeholder="选择出行地"
              />
            </View>

            <Text>出行月份</Text>
            <View style={{ marginBottom: 10 }}>
              <DropDownPicker
                items={months.map(m => ({ label: m, value: m }))}
                open={openMonth}
                setOpen={() => setOpenMonth(!openMonth)}
                value={selectedMonth}
                setValue={setSelectedMonth}
                placeholder="选择月份"
              />
            </View>

            <Text>主题</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
              {labels.map((label) => (
                <CheckBox
                  key={label}
                  title={label}
                  checked={labelText === label}
                  onPress={() => setLabelText(label)}
                  containerStyle={{
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    padding: 5,
                    margin: 5,
                    width: 'auto',
                  }}
                  textStyle={{ fontSize: 14 }}
                  checkedColor="#2196F3" // 可选：设置勾选颜色
                />
              ))}
            </View>

            <Button title="发布" onPress={handleSubmitData} />
          </>
        )}
      />
    </View>
  );
}
