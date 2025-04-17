import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';

const ProjectDetails = () => {
  const projectData = {
    title: "living",
    client: "ossamas",
    request: {
      description: "living room",
      budget: "$10",
      duration: "1 days",
      roomType: "living",
      posted: "7 days ago"
    },
    proposal: {
      description: "UI مصمح مخزط",
      price: "$10",
      estimatedTime: "1 days",
      submitted: "7 days ago"
    },
    clientInfo: {
      name: "ossamas",
      email: "latifosama3ll@gmail.com"
    }
  };

  const [projectState, setProjectState] = useState('in_progress');

  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* عنوان المشروع مع الأزرار */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.projectTitle}>Project: {projectData.title}</Text>
          <Text style={styles.clientName}>Client: {projectData.client}</Text>
        </View>
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.topButton}>
            <Text style={styles.topButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topButton}>
            <Text style={styles.topButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* حالة المشروع */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Project In Progress</Text>
        <Text style={styles.statusText}>
          You are currently working on this project. Mark it as completed when you're done.
        </Text>
      </View>

      {/* تفاصيل المشروع */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Details</Text>

        {/* معلومات الطلب */}
        <View style={styles.detailBox}>
          <Text style={styles.detailTitle}>Request Information</Text>
          <Text style={styles.detailText}>{projectData.request.description}</Text>
          <View style={styles.row}>
            <Text style={styles.detailLabel}>Budget:</Text>
            <Text style={styles.detailValue}>{projectData.request.budget}</Text>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>{projectData.request.duration}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.detailLabel}>Room Type:</Text>
            <Text style={styles.detailValue}>{projectData.request.roomType}</Text>
            <Text style={styles.detailLabel}>Posted:</Text>
            <Text style={styles.detailValue}>{projectData.request.posted}</Text>
          </View>
        </View>

        {/* معلومات العرض */}
        <View style={styles.detailBox}>
          <Text style={styles.detailTitle}>Proposal Information</Text>
          <Text style={styles.detailText}>{projectData.proposal.description}</Text>
          <View style={styles.row}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>{projectData.proposal.price}</Text>
            <Text style={styles.detailLabel}>Estimated Time:</Text>
            <Text style={styles.detailValue}>{projectData.proposal.estimatedTime}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.detailLabel}>Submitted:</Text>
            <Text style={styles.detailValue}>{projectData.proposal.submitted}</Text>
          </View>
        </View>
      </View>

      {/* الجدول الزمني */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Timeline</Text>
        <View style={styles.timelinePlaceholder}>
          <Text style={styles.timelineText}>
            Project updates and timeline will be displayed here.
          </Text>
          <Text style={styles.timelineText}>This feature will be available soon.</Text>
        </View>
      </View>

      {/* معلومات العميل */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client Information</Text>
        <View style={styles.clientInfoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{projectData.clientInfo.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{projectData.clientInfo.email}</Text>
          </View>
        </View>
      </View>

      {/* أزرار المشروع */}
      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>Project Actions</Text>
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.buttonText}>Project Panel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => setProjectState('completed')}
          >
            <Text style={[styles.buttonText, styles.completeButtonText]}>Mark as Completed</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clientName: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  buttonsRow: {
    flexDirection: 'row',
  },
  topButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c19a6b',
    marginLeft: 10,
  },
  topButtonText: {
    color: '#c19a6b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2a5885',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#555',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  detailBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#777',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  timelinePlaceholder: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 5,
  },
  clientInfoBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c19a6b',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  completeButton: {
    backgroundColor: '#c19a6b', // اللون البتي
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  completeButtonText: {
    color: '#fff',
  },
});

export default ProjectDetails;
