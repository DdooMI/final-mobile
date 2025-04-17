// Components/AppBar.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AppBar({ routeName }) {
  // تحويل اسم الصفحة ليكون أول حرف كبير وباقي الحروف صغيرة (اختياري)
  const displayName = routeName
    .replace(/([A-Z])/g, " $1") // إضافة مسافة قبل الحروف الكبيرة
    .replace(/^./, (str) => str.toUpperCase()) // أول حرف كبير
    .trim();

  return (
    <View style={styles.appBar}>
      <Text style={styles.title}>{displayName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    backgroundColor: "#C19A6B", // لون الـ App Bar
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 60,
    justifyContent: "center",
    alignItems: "center", // توسيط النص
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});
