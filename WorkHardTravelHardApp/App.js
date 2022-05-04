import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto } from "@expo/vector-icons";
const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({}); // <- hashmap??

  useEffect(() => {
    loadToDos();
  }, []);
  /*
  Async Storage는 문자열 데이터만 저장할 수 있으므로 
  객체 데이터를 저장하려면 먼저 직렬화해야 합니다.
  JSON으로 직렬화할 수 있는 데이터의 경우 데이터를 저장할 때
  JSON.stringify()를 사용하고 데이터를 로드할 때
  JSON.parse()를 사용할 수 있습니다.
*/

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = payload => setText(payload);

  const saveToDos = async toSave => {
    //현재 있는 toDos를 string으로 바꿔준다
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    s !== null ? setToDos(JSON.parse(s)) : null;
  };

  const addTodo = async () => {
    if (text === "") {
      return;
    }
    // work에서 온것과 travel에서 온 것을 구별하기 위해
    // 첫번째 값은 수정할 수 없으니 set을 이용해서
    // 전에 쓰던걸 새로운 것에 붙여야 된다
    const newTodos = { ...toDos, [Date.now()]: { text, working } };
    setToDos(newTodos);
    //save Todo
    await saveToDos(newTodos);
    setText("");
  };

  const deleteToDo = key => {
    Alert.alert("Delete To Do", "Are you Sure?", [
      { text: "Cancel" },
      {
        text: "Yes!",
        onPress: () => {
          //key(할일)는 시간을 기준으로 생성되서 시간대에 적힌 글을 지우자
          const newToDos = { ...toDos }; //복사?? 비어있는 새 object를 만들어준다
          delete newToDos[key]; //아니 delete가 그냥 되어있네??
          setToDos(newToDos); //삭제한 내역을 업뎃시킨다
          saveToDos(newToDos); //삭제한 내역을 저장시킨다
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addTodo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={
          working ? "What do you have to do?" : "Where do you want to go?"
        }
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map(key =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={20} color={theme.grey} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

// 각 화면에 넘어가면 적은 텍스트가 구분된다
/*keys로 object{}를 가져온다. map으로 각 항목을 경유하고, 내가 보낸 텍스트를 보여주고 있다 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 50,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
