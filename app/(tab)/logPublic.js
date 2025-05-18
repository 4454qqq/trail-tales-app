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
  const maxTitleLength = 10;
  const formaImgDate = new FormData();
  const formaVideoDate = new FormData();

  const [openDestination, setOpenDestination] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);

  // 计算输入的字符长度
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

  // 输入框实时更新内容
  const handleChangeTitle = (title) => {
    const length = calculateLength(title);
    if (length <= maxTitleLength) {
      setTitle(title);
    } else {
      ToastAndroid.show(`标题长度不能超过${maxTitleLength}个字符`, ToastAndroid.SHORT);
    }
  };

  // 处理图片添加
  const handlePickImage = async () => {
    if (imageUrl.length >= 6) {
      ToastAndroid.show("最多上传6张图片", ToastAndroid.SHORT);
      return;
    }
    const image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (image.canceled) return;
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

  // 处理视频添加
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
        setVideoData([...videoData, [base64, suffix]]);
        setVideoUrl([...videoUrl, uri]);
      } else {
        setImageData([...imageData, [base64, suffix]]);
        setImageUrl([...imageUrl, uri]);
      }
    } catch (error) {
      console.log("读取文件失败:", error);
    }
  };

  // 删除已选视频或图片
  const handleRemoveMedia = (type, index) => {
    if (type === 'image') {
      setImageUrl(imageUrl.filter((_, i) => i !== index));
    } else if (type === 'video') {
      setVideoUrl(videoUrl.filter((_, i) => i !== index));
    }
  };

  // 提交游记内容
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

  const fetchLogDetail = async () => {
    try {
      const response = await api.get(`/logDetail/findLog/${logId}`);
      const data = await response.data;
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="chevron-left" size={30} color="#989797" />
        </TouchableOpacity>

        <Text style={styles.label}>标题</Text>
        <TextInput
          value={title}
          onChangeText={handleChangeTitle}
          placeholder="请输入标题"
          style={styles.input}
        />

        <Text style={styles.label}>正文</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="请输入内容"
          multiline
          numberOfLines={6}
          style={styles.textArea}
        />

        <Text style={styles.label}>上传图片</Text>
        <Button title="选择图片" onPress={handlePickImage} />
        <ScrollView horizontal nestedScrollEnabled style={styles.mediaScroll}>
          {imageUrl.map((uri, idx) => (
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

        <Text style={styles.label}>上传视频</Text>
        <Button title="选择视频" onPress={handlePickVideo} />
        <ScrollView horizontal nestedScrollEnabled style={styles.mediaScroll}>
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

        <Text style={styles.label}>出行地点</Text>
        <DropDownPicker
          items={destinations.map(d => ({ label: d, value: d }))}
          open={openDestination}
          setOpen={setOpenDestination}
          value={destination}
          setValue={setDestination}
          placeholder="选择出行地"
          listMode="SCROLLVIEW"
          scrollViewProps={{ nestedScrollEnabled: true }}
          style={styles.dropdown}
          zIndex={3000}
        />

        <Text style={styles.label}>出行月份</Text>
        <DropDownPicker
          items={months.map(m => ({ label: m, value: m }))}
          open={openMonth}
          setOpen={setOpenMonth}
          value={selectedMonth}
          setValue={setSelectedMonth}
          placeholder="选择月份"
          listMode="SCROLLVIEW"
          scrollViewProps={{ nestedScrollEnabled: true }}
          style={styles.dropdown}
          zIndex={2000}
        />

        <Text style={styles.label}>主题</Text>
        <View style={styles.checkboxGroup}>
          {labels.map((label) => (
            <CheckBox
              key={label}
              title={label}
              checked={labelText.includes(label)}
              onPress={() => setLabelText(label)}
              containerStyle={styles.checkboxContainer}
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
  container: {
    padding: 15,
    backgroundColor: '#fff'
  },
  backButton: {
    marginBottom: 10,
    marginLeft: -10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 4,
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  mediaScroll: {
    marginVertical: 10,
  },
  mediaContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: 10,
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    marginBottom: 10,
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 5,
    margin: 5,
  }
});
