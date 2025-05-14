// components/TravelCard.js
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

export default function TravelCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(item)}>
      <Image source={{ uri: item.imageUrl }} style={[styles.image, { height: item.height }]} />
      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
      <View style={styles.footer}>
        <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
        <Text style={styles.uesrinfo} >
          {item.username}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 4,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  uesrinfo: {
    fontSize: 14,
  }
});
