import React from "react"
import { View, Text, ActivityIndicator, StyleSheet } from "react-native"

const LoadingIndicator = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#A67B5B" style={styles.spinner} />
      <Text>Processing...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    marginRight: 8,
  },
})

export default LoadingIndicator
