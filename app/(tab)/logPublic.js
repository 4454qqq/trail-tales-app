import { MaterialIcons } from "@expo/vector-icons";
import { Video } from 'expo-av';
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { CheckBox } from "react-native-elements";
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
  const [videoUrl, setVideoUrl] = useState([]);
  const [videoData, setVideoData] = useState([]);

  const [destination, setDestination] = useState(null);
  const destinations = config.destination;
  const [selectedMonth, setSelectedMonth] = useState(null);
  const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const [labelText, setLabelText] = useState([]);
  const labels = config.topic;
  const maxTitleLength = 20;
  const formaImgDate = new FormData();
  const formaVideoDate = new FormData();

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
      ToastAndroid.show(`标题长度不能超过${maxTitleLength}个字符`, ToastAndroid.SHORT);
    }
  };

  const handlePickImage = async () => {
    if (imageUrl.length >= 6) {
      ToastAndroid.show("最多上传6张图片", ToastAndroid.SHORT);
      return;
    }
    const image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,  //压缩处理
    });
    const url = image.assets[0].uri;
    const suffix = url.substring(url.lastIndexOf(".") + 1);
    try {
      const data = await FileSystem.readAsStringAsync(url, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setImageData([...imageData, [data, suffix]]);
    } catch (error) {
      console.log("Error reading image file:", error);
    }
    setImageUrl([...imageUrl, url]);
  };

  const handlePickVideo = async () => {
    if (videoUrl.length > 0) {
      ToastAndroid.show("最多上传1个视频", ToastAndroid.SHORT);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 0.5,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const suffix = uri.substring(uri.lastIndexOf(".") + 1).toLowerCase();

    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (suffix === "mp4" || suffix === "mov") {
        // 视频处理
        setVideoData([...videoData, [base64, suffix]]);
        setVideoUrl([...videoUrl, uri]);
      } else {
        // 图片处理
        setImageData([...imageData, [base64, suffix]]);
        setImageUrl([...imageUrl, uri]);
      }
    } catch (error) {
      console.log("读取文件失败:", error);
    }
  };

  const handleRemoveMedia = (type, index) => {
    if (type === 'image') {
      setImageUrl(imageUrl.filter((_, i) => i !== index));
    } else if (type === 'video') {
      setVideoUrl(videoUrl.filter((_, i) => i !== index));
    }
  };

  const handleSubmitData = async () => {
    if (imageUrl.length === 0 || !title || !content) {
      ToastAndroid.show("请至少上传一张图片，填写标题和内容~", ToastAndroid.SHORT);
      return;
    }
    
    formaImgDate.append("images", imageData);
    formaVideoDate.append("videos", videoData);
    const httpImgUrls = imageUrl
      .filter((url) => url.startsWith("http"))
      .map((url) => url.match(/\/([^/]+\.[a-zA-Z0-9]+)$/)[1]);

    const httpVideoUrls = videoUrl
      .filter((url) => url.startsWith("http"))
      .map((url) => url.match(/\/([^/]+\.[a-zA-Z0-9]+)$/)[1]);

    await api
      .post("/logPublic/upload", {
        travelId: logId,
        images: formaImgDate,
        videos: formaVideoDate,
        httpImgUrls,
        httpVideoUrls,
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
        clearData();
        ToastAndroid.show("提交成功", ToastAndroid.SHORT);
        router.push("myLog");
      })
      .catch((err) => {
        console.log("提交失败:", err);
      });
  };

  const clearData = () => {
    setTitle("");
    setContent("");
    setImageUrl([]);
    setImageData([]);
    setVideoUrl([]);
    setVideoData([]);
    setDestination(null);
    setSelectedMonth(null);
    setLabelText([]);
  };

  //编译已提交的游记时调用
  const fetchLogDetail = async () => {
    try {
      const response = await api.get(`/logDetail/findLog/${logId}`);
      const data = await response.data;
      console.log(data);
      setImageUrl(data.imagesUrl);
      setVideoUrl(data.videosUrl)
      setContent(data.content);
      setTitle(data.title);
      setSelectedMonth(data.travelMonth);
      setLabelText(data.topic);
      setDestination(data.destination);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (logId) {
      fetchLogDetail();
    } else {
      clearData();
    }
  }, [logId]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: 15 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginVertical: 10, marginLeft: -10 }}
        >
          <MaterialIcons name="chevron-left" size={30} color="#989797" />
        </TouchableOpacity>

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
        <ScrollView horizontal nestedScrollEnabled>
          {imageUrl.map((uri, idx) => (

            // <Image key={idx} source={{ uri }} style={{ width: 100, height: 100, margin: 5 }} />
            <View key={idx} style={styles.mediaContainer}>
              <Image source={{ uri }} style={styles.media} />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemoveMedia('image', idx)}
              >
                <MaterialIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <Text>上传视频</Text>
        <Button title="选择视频" onPress={handlePickVideo} />

        <ScrollView horizontal nestedScrollEnabled>
          {videoUrl.map((uri, idx) => (
            <View key={idx} style={styles.mediaContainer}>
              <Video
                source={{ uri }}
                style={styles.media}
                useNativeControls
                resizeMode="contain"
                isLooping
              />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemoveMedia('video', idx)}
              >
                <MaterialIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>




        <Text>出行地点</Text>
        <DropDownPicker
          items={destinations.map(d => ({ label: d, value: d }))}
          open={openDestination}
          setOpen={setOpenDestination}
          value={destination}
          setValue={setDestination}
          placeholder="选择出行地"
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
          style={{ marginBottom: openDestination ? 100 : 10, zIndex: 3000 }}
          zIndex={3000}
        />

        <Text>出行月份</Text>
        <DropDownPicker
          items={months.map(m => ({ label: m, value: m }))}
          open={openMonth}
          setOpen={setOpenMonth}
          value={selectedMonth}
          setValue={setSelectedMonth}
          placeholder="选择月份"
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
          style={{ marginBottom: openMonth ? 100 : 10, zIndex: 2000 }}
          zIndex={2000}
        />

        <Text>主题</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {labels.map((label) => (
            <CheckBox
              key={label}
              title={label}
              checked={labelText.includes(label)}
              onPress={() => setLabelText(label)}
              containerStyle={{
                backgroundColor: 'transparent',
                borderWidth: 0,
                padding: 5,
                margin: 5,
              }}
              textStyle={{ fontSize: 14 }}
              checkedColor="#2196F3"
            />
          ))}
        </View>

        <Button title="发布" onPress={handleSubmitData} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mediaContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    margin: 5
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 5
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

