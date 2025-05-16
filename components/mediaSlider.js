import { Video } from "expo-av";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

const MediaSlider = ({ imageUrls, videosUrl }) => {
  const [maxRatio, setMaxRatio] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const videoRef = useRef(null); // 视频引用
  const [shouldPlay, setShouldPlay] = useState(true); //视频播放控制

  useEffect(() => {
    let maxRatio = 0;
    const fetchImagesSize = async () => {
      try {
        const sizes = await Promise.all(imageUrls.map(getImageSize));
        sizes.forEach(({ width, height }) => {
          const ratio = width / height;
          if (ratio > maxRatio) {
            maxRatio = ratio;
          }
        });
        setMaxRatio(maxRatio);
        const height = screenWidth / maxRatio;
        setContainerHeight(height);
      } catch (error) {
        console.error("Error fetching image sizes:", error);
      }
    };

    if (imageUrls.length > 0) {
      fetchImagesSize();
    }
  }, [imageUrls]);

  const getImageSize = async (url) => {
    return new Promise((resolve, reject) => {
      Image.getSize(
        url,
        (width, height) => {
          resolve({ width, height });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const renderItem = ({ item }) => {
    if (item.type === "video") {
      return (
        <TouchableWithoutFeedback
          onPress={() => {
            if (videoRef.current) {
              videoRef.current.presentFullscreenPlayer(); // 进入全屏
            }
          }}
        >
          <Video
            ref={videoRef}
            source={{ uri: item.url }}
            volume={1.0}
            isMuted={true}
            resizeMode="contain"
            useNativeControls
            style={{
              width: screenWidth,
              height: containerHeight,
              backgroundColor: 'black',
            }}
            shouldPlay={shouldPlay}
            // 让视频播放完毕后进度条回到原点，并且禁止自动播放
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish && !status.isLooping) {
                videoRef.current?.setStatusAsync({ positionMillis: 0, shouldPlay: false });
                setShouldPlay(false); // 确保暂停
              }
            }}
          />
        </TouchableWithoutFeedback>
      );
    } else {
      return (
        <Image
          source={{ uri: item.url }}
          style={{ width: screenWidth, height: containerHeight }}
          resizeMode="contain"
        />
      );
    }
  };

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const page = Math.floor((contentOffset.x + 1) / screenWidth);
    setCurrentPage(page);
  };

  const getMediaData = () => {
    const media = [];
    if (videosUrl) {
      media.push({ type: "video", url: videosUrl });
    }
    imageUrls.forEach((imageUrl) => {
      media.push({ type: "image", url: imageUrl });
    });
    return media;
  };

  const mediaData = getMediaData();

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={mediaData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        onScroll={handleScroll}
        style={{ backgroundColor: "white" }}
        showsHorizontalScrollIndicator={false}
      />
      {mediaData.length > 1 && (
        <View style={styles.dotContainer}>
          {mediaData.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentPage ? styles.activeDot : null]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: "gray",
    marginHorizontal: 3,
    marginTop: 5,
  },
  activeDot: {
    backgroundColor: "red",
  },
  moreDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreDotsText: {
    color: "gray",
    fontSize: 12,
    marginLeft: 5,
  },
});

export default MediaSlider;
