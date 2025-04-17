import React, { useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

function DesignerPortfolioPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { designer } = route.params || {};
  const [activeTab, setActiveTab] = useState("all");

  const projects = [
    {
      id: "1",
      title: "Luxury Living Room",
      description: "A modern luxury living room design.",
      status: "completed",
    },
    {
      id: "2",
      title: "Minimalist Office",
      description: "A sleek and professional office setup.",
      status: "featured",
    },
  ];

  const filteredProjects =
    activeTab === "all"
      ? projects
      : projects.filter((project) => project.status === activeTab);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F8F8F8", padding: 20 }}>
      <View
        style={{
          backgroundColor: "#FFF",
          padding: 20,
          borderRadius: 10,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <Image
         source={{ uri: designer?.photoURL || "https://example.com/default-avatar.png" }}

          style={{ width: 120, height: 120, borderRadius: 60 }}
        />
        <Text style={{ fontSize: 26, fontWeight: "bold", marginTop: 10 }}>
          {designer?.name || "Unknown Designer"}
        </Text>
        <Text style={{ fontSize: 16, color: "gray" }}>
          {designer?.email || "No email available"}
        </Text>
        <Text style={{ fontSize: 14, color: "#A97D50", marginTop: 5 }}>
          {designer?.specialization || "Interior Design"}
        </Text>
        <Text
          style={{
            backgroundColor: "#EDE0D4",
            padding: 5,
            borderRadius: 5,
            marginTop: 5,
          }}
        >
          {designer?.experience || "Not specified Experience"}
        </Text>
        <Text style={{ marginTop: 10, textAlign: "center" }}>
          {designer?.bio || "No bio available"}
        </Text>

        <View style={{ flexDirection: "row", marginTop: 15 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("messages/:conversationId")}
            style={{
              backgroundColor: "#A97D50",
              padding: 10,
              borderRadius: 5,
              marginRight: 10,
            }}
          >
            <Text style={{ color: "#FFF" }}>Contact Designer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderColor: "#A97D50",
              borderWidth: 1,
              padding: 10,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "#A97D50" }}>Request Design</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}
      >
        <TouchableOpacity onPress={() => setActiveTab("all")} style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontWeight: activeTab === "all" ? "bold" : "normal" }}>All Projects</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("completed")} style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontWeight: activeTab === "completed" ? "bold" : "normal" }}>Completed Projects</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("featured")} style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontWeight: activeTab === "featured" ? "bold" : "normal" }}>Featured Projects</Text>
        </TouchableOpacity>
      </View>

      <View>
        {filteredProjects.length === 0 ? (
          <Text style={{ textAlign: "center", color: "gray" }}>No projects to display</Text>
        ) : (
          filteredProjects.map((project) => (
            <View
              key={project.id}
              style={{ backgroundColor: "#FFF", padding: 15, borderRadius: 10, marginBottom: 15 }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>{project.title}</Text>
              <Text style={{ color: "gray", marginTop: 5 }}>{project.description}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

export default DesignerPortfolioPage;
