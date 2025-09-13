import { Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';

export default function CommunityLayout() {
  return (
    
    <View style={styles.container}>
       <View style={styles.headerBg}>
          <Text style={styles.headerTxt}>Recipes</Text>
        </View>
      <View style={{
        width: 350,
        height: 700,
        backgroundColor: '#fffcfcff',
      }}>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f1f1ff',
    justifyContent: 'center',
        alignItems: 'center'
  },
  headerTxt:{
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerBg:{
    backgroundColor: '#3c7746ff',
    padding: 10,

  },

 
});