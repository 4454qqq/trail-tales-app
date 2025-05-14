import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerItems } from 'react-navigation-drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SideMenu = ({ navigation, route }) => {
  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <DrawerItems
          items={[
            {
              label: '发现好友',
              icon: 'person-add',
              onPress: () => {
                navigation.navigate('AddUser', { type: 0 });
              },
            },
            {
              label: '浏览记录',
              icon: 'history',
              onPress: () => {
                navigation.navigate('BrowsingHistory');
              },
            },
            {
              label: '免流量',
              icon: 'sim-card',
              onPress: () => {
                navigation.navigate('FreeData');
              },
            },
            {
              label: '社区公约',
              icon: 'eco',
              onPress: () => {
                navigation.navigate('CommunityRules');
              },
            },
          ]}
        />
      </View>
      <View style={styles.footerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Setting')}>
          <View style={styles.footerItem}>
            <Icon name="settings" color="#2E4053" size={24} />
            <Text style={styles.footerText}>设置</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Help')}>
          <View style={styles.footerItem}>
            <Icon name="headset" color="#2E4053" size={24} />
            <Text style={styles.footerText}>帮助与客服</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ScanQR')}>
          <View style={styles.footerItem}>
            <Icon name="qr-code-scanner" color="#2E4053" size={24} />
            <Text style={styles.footerText}>扫一扫</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  menuContainer: {
    flex: 8,
    backgroundColor: '#E5E7E9',
  },
  footerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#F8F9F9',
  },
  footerItem: {
    alignItems: 'center',
    padding: 10,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 5,
  },
});

export default SideMenu;