import React from "react"
import { View, ActivityIndicator, Text, StyleSheet } from "react-native"

const LoadingIndicator = ({ size = "small", color = "#6B7280", message = "Processing..." }) => {
  return (
    <View style={styles.container} accessibilityRole="status" accessibilityLiveRegion="polite">
      <ActivityIndicator size={size} color={color} style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  spinner: {
    marginRight: 8,
  },
  message: {
    fontSize: 16,
    color: "#4B5563", // Tailwind gray-600
  },
})

export default LoadingIndicator
