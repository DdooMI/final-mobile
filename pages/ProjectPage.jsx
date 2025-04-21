/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  TextInput,
  Alert,
  Linking,
  Share,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
// No external document picker needed
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { db } from '../firebase/firebaseConfig';
import { createNotification } from '../firebase/notifications';
import { useAuth } from '../firebase/auth';
import { useBalance } from '../zustand/balance';
import { findExistingConversation, sendMessage } from '../firebase/messages';
import ErrorBoundary from '../Components/ErrorBoundary';
import ImageZoomModal from '../Components/ImageZoomModal';
import DesignerRating from '../Components/DesignerRating';
import { useNavigation, useRoute } from '@react-navigation/native';

const ProjectPage = () => {
  const { user } = useAuth();
  const { balance, fetchBalance } = useBalance();
  const navigation = useNavigation();
  const route = useRoute();
  const proposalId = route.params?.proposalId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [request, setRequest] = useState(null);
  const [designer, setDesigner] = useState(null);
  const [client, setClient] = useState(null);
  const [projectStatus, setProjectStatus] = useState("in_progress"); // in_progress, completed_by_designer, completed
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [htmlFileName, setHtmlFileName] = useState('');
  const [projectRating, setProjectRating] = useState(null);
  const [role, setRole] = useState(null);
  // Only using direct file upload now

  useEffect(() => {
    if (user && user.uid) {
      fetchBalance(user.uid);
      // Determine user role
      const checkRole = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          }
        } catch (err) {
          console.error('Error getting user role:', err);
        }
      };
      checkRole();
    }
  }, [user, fetchBalance]);

  // Fetch project rating when project is completed
  useEffect(() => {
    const fetchProjectRating = async () => {
      if (projectStatus === "completed" && proposalId) {
        try {
          const ratingsRef = collection(db, "ratings");
          const q = query(
            ratingsRef,
            where("projectId", "==", proposalId)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const ratingData = querySnapshot.docs[0].data();
            setProjectRating({
              ...ratingData,
              id: querySnapshot.docs[0].id
            });
          }
        } catch (error) {
          console.error("Error fetching project rating:", error);
        }
      }
    };

    fetchProjectRating();
  }, [projectStatus, proposalId]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (!proposalId) {
          throw new Error("Proposal ID is required");
        }

        // Get proposal data
        const proposalRef = doc(db, "designProposals", proposalId);
        const proposalSnap = await getDoc(proposalRef);

        if (!proposalSnap.exists()) {
          throw new Error("Proposal not found");
        }

        const proposalData = proposalSnap.data();
        const processedProposal = {
          id: proposalSnap.id,
          ...proposalData,
          createdAt: proposalData.createdAt
            ? formatDistanceToNow(proposalData.createdAt.toDate(), { addSuffix: true })
            : "Unknown date",
          htmlUpdatedAt: proposalData.htmlUpdatedAt
            ? formatDistanceToNow(proposalData.htmlUpdatedAt.toDate(), { addSuffix: true })
            : "Not updated yet"
        };
        setProposal(processedProposal);

        // Get request data
        if (proposalData.requestId) {
          const requestRef = doc(db, "designRequests", proposalData.requestId);
          const requestSnap = await getDoc(requestRef);

          if (requestSnap.exists()) {
            const requestData = requestSnap.data();
            setRequest({
              id: requestSnap.id,
              ...requestData,
              createdAt: requestData.createdAt
                ? formatDistanceToNow(requestData.createdAt.toDate(), { addSuffix: true })
                : "Unknown date",
            });
          }
        }

        // Get designer data
        if (proposalData.designerId) {
          const designerRef = doc(db, "users", proposalData.designerId);
          const designerSnap = await getDoc(designerRef);

          if (designerSnap.exists()) {
            const designerData = designerSnap.data();

            // Get designer profile
            const profileRef = collection(db, "users", proposalData.designerId, "profile");
            const profileSnap = await getDocs(profileRef);
            let designerProfile = {};

            if (!profileSnap.empty) {
              designerProfile = profileSnap.docs[0].data();
            }

            setDesigner({
              id: designerSnap.id,
              ...designerData,
              ...designerProfile,
            });
          }
        }

        // Get client data
        if (proposalData.clientId) {
          const clientRef = doc(db, "users", proposalData.clientId);
          const clientSnap = await getDoc(clientRef);

          if (clientSnap.exists()) {
            const clientData = clientSnap.data();

            // Get client profile
            const profileRef = collection(db, "users", proposalData.clientId, "profile");
            const profileSnap = await getDocs(profileRef);
            let clientProfile = {};

            if (!profileSnap.empty) {
              clientProfile = profileSnap.docs[0].data();
            }

            setClient({
              id: clientSnap.id,
              ...clientData,
              ...clientProfile,
            });
          }
        }

        // Check project status
        if (proposalData.projectStatus) {
          setProjectStatus(proposalData.projectStatus);
        }

        // Get HTML content if any
        if (proposalData.htmlContent) {
          setHtmlContent(proposalData.htmlContent);
          setHtmlFileName(proposalData.htmlFileName || 'design.html');
        }
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [proposalId]);

  // Handle marking project as completed by designer
  const handleMarkAsCompletedByDesigner = async () => {
    if (!proposal) return;

    setUpdateLoading(true);
    setError(null);

    try {
      // Validate HTML content exists
      const proposalSnap = await getDoc(doc(db, "designProposals", proposalId));
      const content = proposalSnap.data()?.htmlContent;

      if (!content) {
        throw new Error('Please upload HTML design before marking as completed');
      }

      const proposalRef = doc(db, "designProposals", proposalId);

      // Update proposal status
      await updateDoc(proposalRef, {
        projectStatus: "completed_by_designer",
        htmlUpdatedAt: serverTimestamp()
      });

      // Refresh proposal data
      const updatedProposal = await getDoc(proposalRef);
      if (updatedProposal.exists()) {
        const updatedData = updatedProposal.data();

        const processedData = {
          ...updatedData,
          htmlUpdatedAt: updatedData.htmlUpdatedAt
            ? formatDistanceToNow(updatedData.htmlUpdatedAt.toDate(), { addSuffix: true })
            : "Recently"
        };

        setProposal(prev => ({
          ...prev,
          ...processedData
        }));
      }

      // Create notification for client
      await createNotification({
        userId: proposal?.clientId,
        title: "Project Completed by Designer",
        message: `The designer has completed your project "${request?.title || 'Design Project'}". Please review and mark it as completed if you're satisfied.`,
        type: "success",
        relatedId: proposalId,
      });

      // Update local state
      setProjectStatus("completed_by_designer");

      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Status update failed:', err);
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle marking project as completed by client
  const handleMarkAsCompleted = async () => {
    if (!proposal) return;

    setUpdateLoading(true);
    setError(null);

    try {
      const proposalRef = doc(db, "designProposals", proposalId);

      // Update proposal status
      await updateDoc(proposalRef, {
        projectStatus: "completed",
        status: "completed",
        completedAt: serverTimestamp()
      });

      // Update the request status to completed
      if (proposal.requestId) {
        const requestRef = doc(db, "designRequests", proposal.requestId);
        await updateDoc(requestRef, {
          status: "completed",
          completedAt: serverTimestamp()
        });
      }

      // Transfer funds from client to designer
      if (proposal.price) {
        try {
          const clientRef = doc(db, 'users', proposal.clientId);
          const designerRef = doc(db, 'users', proposal.designerId);

          await runTransaction(db, async (transaction) => {
            const clientDoc = await transaction.get(clientRef);
            const designerDoc = await transaction.get(designerRef);

            if (!clientDoc.exists() || !designerDoc.exists()) {
              throw new Error('User documents not found');
            }

            const clientBalance = clientDoc.data().balance || 0;
            const transferAmount = parseFloat(proposal.price);

            if (clientBalance < transferAmount) {
              throw new Error('Client has insufficient balance for transfer');
            }

            // Update client balance
            transaction.update(clientRef, {
              balance: clientBalance - transferAmount
            });

            // Update designer balance
            const designerBalance = designerDoc.data().balance || 0;
            transaction.update(designerRef, {
              balance: designerBalance + transferAmount
            });
          });
          setTransferSuccess(true);

          // Refresh client's balance
          if (role === 'client' && user && user.uid) {
            fetchBalance(user.uid);
          }
        } catch (transferError) {
          console.error('Error transferring funds:', transferError);
          setError('Failed to transfer funds. Please try again.');
          return;
        }
      }

      // Create notification for designer
      await createNotification({
        userId: proposal?.designerId,
        title: "Project Marked as Completed",
        message: `The client has marked the project "${request?.title || 'Design Project'}" as completed. Thank you for your work!`,
        type: "success",
        relatedId: proposal.id,
      });

      // Update local state
      setProjectStatus("completed");
      setProposal(prev => ({
        ...prev,
        projectStatus: "completed",
        status: "completed",
        completedAt: serverTimestamp() // Use serverTimestamp for consistency
      }));

      // Show rating form
      setShowRatingForm(true);

      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Status update failed:', err);
      setError(err.message || 'Failed to mark project as completed');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle HTML upload success
  const handleHtmlUploadSuccess = async (fileInfo) => {
    // Validate required fields
    if (!fileInfo?.htmlContent) {
      setError('Invalid file upload - missing HTML content');
      return;
    }

    try {
      // Update local state
      setHtmlContent(fileInfo.htmlContent);
      setHtmlFileName(fileInfo.fileName || 'design.html');

      // Update Firestore document
      const proposalRef = doc(db, "designProposals", proposalId);
      await updateDoc(proposalRef, {
        htmlContent: fileInfo.htmlContent,
        htmlFileName: fileInfo.fileName || 'design.html',
        htmlUpdatedAt: serverTimestamp()
      });

      // Show success message
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving HTML content:', err);
      setError(err.message || 'Failed to save HTML content');
    }
  };

  // Handle requesting changes
  const handleRequestChanges = async () => {
    if (!proposal) return;

    setUpdateLoading(true);
    setError(null);

    try {
      const proposalRef = doc(db, "designProposals", proposalId);

      // Update proposal status back to in_progress
      await updateDoc(proposalRef, {
        projectStatus: "in_progress",
        htmlUpdatedAt: serverTimestamp()
      });

      // Create notification for designer
      await createNotification({
        userId: proposal?.designerId,
        title: "Design Changes Requested",
        message: `The client has requested changes for the project "${request?.title || 'Design Project'}". Please review and update the design.`,
        type: "info",
        relatedId: proposalId,
      });

      // Update local state
      setProjectStatus("in_progress");
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Status update failed:', err);
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle rating submission
  const handleRatingSubmit = (ratingData) => {
    // Hide the rating form after submission
    setShowRatingForm(false);
  };

  // Start a conversation with the other party
  const startConversation = async () => {
    try {
      // Determine sender and receiver based on user role
      const senderId = user.uid;
      const receiverId = role === "client" ? proposal.designerId : proposal.clientId;

      // Navigate to messages screen with the conversation info
      navigation.navigate('messages', { senderId, receiverId, projectId: proposalId });
    } catch (error) {
      console.error("Error starting conversation:", error);
      setError("Failed to start conversation. Please try again.");
    }
  };

  // Helper functions for status display
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "in_progress":
        return styles.statusBadgeBlue;
      case "completed_by_designer":
        return styles.statusBadgeYellow;
      case "completed":
        return styles.statusBadgeGreen;
      default:
        return styles.statusBadgeGray;
    }
  };

  const getStatusTextStyle = (status) => {
    switch (status) {
      case "in_progress":
        return styles.statusTextBlue;
      case "completed_by_designer":
        return styles.statusTextYellow;
      case "completed":
        return styles.statusTextGreen;
      default:
        return styles.statusTextGray;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "completed_by_designer":
        return "Ready for Review";
      case "completed":
        return "Completed";
      default:
        return "Unknown Status";
    }
  };

  // Function to safely format timestamp with error handling
  const formatTimestamp = (timestamp) => {
    try {
      if (typeof timestamp === 'string') {
        return timestamp;
      } else if (timestamp?.toDate) {
        // Handle Firestore Timestamp
        const updatedDate = timestamp.toDate();
        return formatDistanceToNow(updatedDate, { addSuffix: true });
      } else if (timestamp?.seconds) {
        // Fallback for raw timestamp
        const updatedDate = new Date(timestamp.seconds * 1000);
        return formatDistanceToNow(updatedDate, { addSuffix: true });
      } else if (timestamp instanceof Date) {
        // Handle JavaScript Date objects
        return formatDistanceToNow(timestamp, { addSuffix: true });
      } else {
        return "recently";
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return "recently";
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C19A6B" />
        <Text style={styles.loadingText}>Loading project details...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Not found state
  if (!proposal || (!designer && role === "client") || (!client && role === "designer")) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Project Not Found</Text>
        <Text style={styles.errorMessage}>
          The project you're looking for doesn't exist or you don't have permission to view it.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Prepare HTML content message
  let lastUpdatedText = "No HTML design has been uploaded yet.";
  if (htmlContent) {
    if (proposal?.htmlUpdatedAt) {
      lastUpdatedText = `HTML design available (last updated ${formatTimestamp(proposal.htmlUpdatedAt)})`;
    } else {
      lastUpdatedText = "HTML design available.";
    }
  }

  // Handle file upload from device using expo-document-picker
  const pickHtmlFile = async () => {
    try {
      // Show loading indicator
      setUpdateLoading(true);
      
      // Use DocumentPicker to select a file
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/html', 'application/octet-stream'],
        copyToCacheDirectory: true
      });
      
      // Check if the user canceled the picker
      if (result.canceled) {
        setUpdateLoading(false);
        return;
      }
      
      // Get the first selected asset (file)
      const file = result.assets[0];
      if (!file) {
        throw new Error('No file selected');
      }
      
      // Check if file has .html or .htm extension
      const fileName = file.name;
      if (!fileName.toLowerCase().endsWith('.html') && !fileName.toLowerCase().endsWith('.htm')) {
        setError('Only .html/.htm files are supported');
        setUpdateLoading(false);
        return;
      }
      
      console.log('Selected HTML file:', fileName);
      
      // Read the file content
      const fileContent = await FileSystem.readAsStringAsync(file.uri);
      
      // Process the HTML content
      await handleHtmlUploadSuccess({
        htmlContent: fileContent,
        fileName: fileName
      });
      
      setUpdateLoading(false);
    } catch (error) {
      console.error('Error with file selection:', error);
      Alert.alert('Error', 'Failed to upload HTML file: ' + (error.message || 'Please try again.'));
      setUpdateLoading(false);
    }
  };

  // Only using direct file upload with expo-document-picker now

  return (
    <ScrollView style={styles.container}>
      {/* Image Zoom Modal */}
      {zoomImage && (
        <ImageZoomModal
          imageUrl={zoomImage}
          onClose={() => setZoomImage(null)}
        />
      )}
      
      {/* HTML Input Modal */}
      {/* Using only direct file upload with expo-document-picker */}
      
      {/* Header with project title and navigation */}
      <View style={styles.headerContainer}>
        <ErrorBoundary fallback="Project Information">
          <View style={styles.headerContent}>
            <Text style={styles.projectTitle}>{request?.title || "Design Project"}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, getStatusBadgeStyle(projectStatus)]}>
                <Text style={[styles.statusBadgeText, getStatusTextStyle(projectStatus)]}>
                  {getStatusLabel(projectStatus)}
                </Text>
              </View>
              <Text style={styles.participantText}>
                {role === "client" ? "Designer: " : "Client: "}
                <Text style={styles.participantName}>
                  {role === "client" ? designer?.name || designer?.email : client?.name || client?.email}
                </Text>
              </Text>
            </View>
            {transferSuccess && (
              <View style={styles.successNotification}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.successText}>Payment successfully transferred</Text>
              </View>
            )}
          </View>
        </ErrorBoundary>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Project Rating Section */}
      {projectStatus === "completed" && projectRating && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Project Rating</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= projectRating.rating ? "star" : "star-outline"}
                  size={24}
                  color={star <= projectRating.rating ? "#FFD700" : "#CCCCCC"}
                  style={styles.starIcon}
                />
              ))}
              <Text style={styles.ratingLabel}>
                {projectRating.rating === 1 && 'Poor'}
                {projectRating.rating === 2 && 'Fair'}
                {projectRating.rating === 3 && 'Good'}
                {projectRating.rating === 4 && 'Very Good'}
                {projectRating.rating === 5 && 'Excellent'}
              </Text>
            </View>
            {projectRating.comment && (
              <Text style={styles.ratingComment}>"{projectRating.comment}"</Text>
            )}
            <Text style={styles.ratingTimestamp}>
              {projectRating.createdAt ? `Rated ${formatTimestamp(projectRating.createdAt)}` : "Recently rated"}
            </Text>
          </View>
        </View>
      )}

      {/* Success message */}
      {updateSuccess && (
        <View style={styles.alertContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Success!</Text>
            <Text style={styles.alertMessage}>
              {transferSuccess ? "Payment successfully transferred to designer!" : "Project status updated successfully."}
            </Text>
          </View>
        </View>
      )}

      {/* HTML Design Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>HTML Design</Text>
        <Text style={styles.sectionDescription}>
          {role === "designer" 
            ? (projectStatus !== "completed"
                ? "Upload your HTML design for the client to view."
                : htmlContent ? `HTML design uploaded ${proposal?.htmlUpdatedAt || 'recently'}` : "No HTML design has been uploaded yet.")
            : htmlContent ? `HTML design uploaded ${proposal?.htmlUpdatedAt || 'recently'}` : "No HTML design has been uploaded yet."}
        </Text>

        {role === "designer" && projectStatus !== "completed" && (
          <View style={styles.uploadContainer}>
            {/* HTML File Upload */}
            <View style={styles.fileUploadContainer}>
              {!htmlContent ? (
                <>
                  <View style={styles.uploadInstructions}>
                    <Ionicons name="document-text-outline" size={40} color="#C19A6B" />
                    <Text style={styles.uploadTitle}>Upload HTML Design</Text>
                    <Text style={styles.uploadSubtitle}>Select an HTML file from your device</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.uploadFileButton}
                    onPress={pickHtmlFile}
                  >
                    <View style={styles.buttonContent}>
                      <Ionicons name="document-outline" size={24} color="#FFFFFF" />
                      <Text style={styles.uploadButtonText}>Select HTML File</Text>
                    </View>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.uploadSuccessContainer}>
                  <View style={styles.uploadSuccessHeader}>
                    <Ionicons name="checkmark-circle" size={30} color="#4CAF50" />
                    <Text style={styles.uploadSuccessTitle}>HTML File Uploaded Successfully</Text>
                  </View>
                  <Text style={styles.uploadSuccessInfo}>
                    File: <Text style={styles.uploadSuccessFileName}>{htmlFileName}</Text>
                  </Text>
                  <Text style={styles.uploadSuccessSubtitle}>
                    Your HTML design has been uploaded and is ready for review.
                  </Text>
                  <TouchableOpacity 
                    style={styles.changeFileButton}
                    onPress={pickHtmlFile}
                  >
                    <View style={styles.buttonContent}>
                      <Ionicons name="refresh-outline" size={18} color="#C19A6B" />
                      <Text style={styles.changeFileButtonText}>Change File</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.actionButton, !htmlContent && styles.disabledButton]}
              disabled={!htmlContent || updateLoading || projectStatus === "completed_by_designer"}
              onPress={handleMarkAsCompletedByDesigner}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {updateLoading ? "Processing..." : 
                   projectStatus === "completed_by_designer" ? "Marked as Completed" : 
                   "Mark as Completed"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* HTML content preview */}
        {htmlContent && (
          <View style={styles.htmlPreviewContainer}>
            <View style={styles.htmlPreviewHeader}>
              <Text style={styles.htmlFileName}>{htmlFileName || 'design.html'}</Text>
              
              {(role === "designer" || projectStatus === "completed") && (
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => {
                    Alert.alert(
                      'HTML Options',
                      'Choose an action for the HTML content:',
                      [
                        {
                          text: 'Copy to Clipboard',
                          onPress: () => {
                            Share.share({
                              message: htmlContent,
                              title: htmlFileName || 'design.html'
                            }).then(() => {
                              Alert.alert('Success', 'HTML content copied to clipboard!');
                            }).catch(error => {
                              console.error('Error sharing HTML:', error);
                              Alert.alert('Error', 'Failed to copy HTML content.');
                            });
                          }
                        },
                        {
                          text: 'Share HTML',
                          onPress: () => {
                            Share.share({
                              message: `HTML Design: ${htmlContent}`,
                              title: htmlFileName || 'design.html'
                            });
                          }
                        },
                        {
                          text: 'Open in Browser',
                          onPress: () => {
                            // Create a data URI for the HTML content
                            const htmlUri = `data:text/html;charset=UTF-8,${encodeURIComponent(htmlContent)}`;
                            Linking.canOpenURL(htmlUri).then(supported => {
                              if (supported) {
                                return Linking.openURL(htmlUri);
                              } else {
                                Alert.alert('Error', 'Cannot open HTML in browser on this device.');
                              }
                            }).catch(error => {
                              console.error('Error opening URL:', error);
                              Alert.alert('Error', 'Failed to open HTML in browser.');
                            });
                          }
                        },
                        {
                          text: 'Download as HTML File',
                          onPress: async () => {
                            try {
                              // Get the document directory path
                              const fileName = htmlFileName || 'design.html';
                              const fileUri = FileSystem.documentDirectory + fileName;
                              
                              // Write the HTML content to a file
                              await FileSystem.writeAsStringAsync(fileUri, htmlContent);
                              
                              // Check if the file was created successfully
                              const fileInfo = await FileSystem.getInfoAsync(fileUri);
                              
                              if (fileInfo.exists) {
                                // On iOS, use the share functionality to save the file
                                if (Platform.OS === 'ios') {
                                  await Share.share({
                                    url: fileUri,
                                    title: fileName,
                                  });
                                  Alert.alert('Success', 'HTML file saved successfully!');
                                } 
                                // On Android, save to downloads folder if possible
                                else {
                                  // For Android, we can only save to app's directory
                                  Alert.alert(
                                    'File Saved',
                                    `HTML file saved to: ${fileUri}\n\nYou can access this file through your device's file manager in the Expo directory.`,
                                    [
                                      { text: 'OK' },
                                      { 
                                        text: 'Share File', 
                                        onPress: () => {
                                          Share.share({
                                            url: fileUri,
                                            title: fileName,
                                          });
                                        }
                                      }
                                    ]
                                  );
                                }
                              } else {
                                throw new Error('File was not created');
                              }
                            } catch (error) {
                              console.error('Error saving HTML file:', error);
                              Alert.alert('Error', 'Failed to save HTML file. ' + error.message);
                            }
                          }
                        },
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  }}
                >
                  <View style={styles.buttonContent}>
                    <Ionicons name="ellipsis-horizontal" size={16} color="#FFFFFF" />
                    <Text style={styles.downloadButtonText}>HTML Options</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.htmlPreviewContent}>
              {htmlContent ? (
                <View style={styles.htmlContainer}>
                  <View style={styles.htmlPreviewHeader}>
                    <Text style={styles.htmlPreviewTitle}>HTML Preview</Text>
                  </View>
                  <WebView
                    source={{
                      html:htmlContent
                    }}
                    style={styles.webView}
                    originWhitelist={['*']}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    androidHardwareAccelerationDisabled={true}
                    startInLoadingState={true}
                    renderLoading={() => (
                      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)'}}>
                        <ActivityIndicator size="large" color="#C19A6B" />
                        <Text style={{marginTop: 10, color: '#666'}}>Loading preview...</Text>
                      </View>
                    )}
                    onError={(syntheticEvent) => {
                      const { nativeEvent } = syntheticEvent;
                      console.error('WebView error: ', nativeEvent);
                      Alert.alert('Error', 'There was a problem displaying the HTML content.');
                    }}
                  />
                </View>
              ) : (
                <View style={styles.noContentContainer}>
                  <Ionicons name="document-text-outline" size={48} color="#999" />
                  <Text style={styles.noContentText}>
                    No HTML content available for this project.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* For client to mark project as completed */}
        {role === "client" && projectStatus === "completed_by_designer" && (
          <View style={styles.clientActionContainer}>
            <TouchableOpacity 
              style={[styles.completeButton, updateLoading && styles.disabledButton]}
              disabled={updateLoading}
              onPress={handleMarkAsCompleted}
            >
              {updateLoading ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.completeButtonText}>Processing...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.completeButtonText}>Mark Project as Completed</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.clientActionDescription}>
              By marking this project as completed, you confirm that the design meets your requirements and the designer will receive payment.
            </Text>
          </View>
        )}
      </View>

      {/* Rating Form Section */}
      {projectStatus === "completed" && showRatingForm && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Rate Designer</Text>
          <DesignerRating
            clientId={user.uid}
            designerId={proposal?.designerId}
            projectId={proposalId}
            onRatingSubmit={handleRatingSubmit}
          />
        </View>
      )}

      {/* Project Details Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Project Details</Text>

        {request && (
          <View style={styles.subsectionContainer}>
            <Text style={styles.subsectionTitle}>Request Information</Text>
            
            {/* Reference Image Display */}
            {request.referenceImageUrl && (
              <View style={styles.imageContainer}>
                <Text style={styles.imageLabel}>Reference Image</Text>
                <TouchableOpacity
                  style={styles.referenceImage}
                  onPress={() => setZoomImage(request.referenceImageUrl)}
                >
                  <Image
                    source={{ uri: request.referenceImageUrl }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.descriptionText}>{request.description}</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Budget:</Text>
                <Text style={styles.detailValue}>${request.budget}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>{request.duration} days</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Room Type:</Text>
                <Text style={styles.detailValue}>{request.roomType}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Posted:</Text>
                <Text style={styles.detailValue}>{formatTimestamp(request.createdAt)}</Text>
              </View>
            </View>
            
            {request.additionalDetails && (
              <View style={styles.additionalDetails}>
                <Text style={styles.detailLabel}>Additional Details:</Text>
                <Text style={styles.additionalDetailsText}>{request.additionalDetails}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.subsectionContainer}>
          <Text style={styles.subsectionTitle}>Proposal Information</Text>
          <Text style={styles.descriptionText}>{proposal.description}</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Price:</Text>
              <Text style={styles.detailValue}>${proposal.price}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Estimated Time:</Text>
              <Text style={styles.detailValue}>{proposal.estimatedTime} days</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Submitted:</Text>
              <Text style={styles.detailValue}>{formatTimestamp(proposal.createdAt)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Project Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Project Actions</Text>
        
        <View style={styles.actionsContent}>
          {role !== 'designer' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('DesignerPortfolio', { designerId: proposal.designerId })}
            >
              <Text style={styles.actionButtonText}>View Portfolio</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              try {
                const receiverId = role === "client" ? proposal.designerId : proposal.clientId;
                const recipientName = role === "client" ? (designer?.name || designer?.email) : (client?.name || client?.email);
                
                // First, find if a conversation already exists between these users
                const existingConversationId = await findExistingConversation(user.uid, receiverId);
                
                if (existingConversationId) {
                  // If conversation exists, navigate to it
                  navigation.navigate('messages/:conversationId', { 
                    conversationId: existingConversationId
                  });
                } else {
                  // If no conversation exists, create one by sending an initial message
                  const initialMessage = `Hello! I'm messaging about the project: ${request?.title || 'our design project'}`;
                  
                  const newConversationId = await sendMessage({
                    senderId: user.uid,
                    receiverId: receiverId,
                    content: initialMessage
                  });
                  
                  // Then navigate to the new conversation
                  navigation.navigate('messages/:conversationId', { 
                    conversationId: newConversationId
                  });
                }
              } catch (error) {
                console.error('Error starting conversation:', error);
                Alert.alert('Error', 'Failed to start conversation. Please try again.');
              }
            }}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="chatbubble-outline" size={18} color="#C19A6B" />
              <Text style={styles.actionButtonText}>
                Message {role === "client" ? "Designer" : "Client"}
              </Text>
            </View>
          </TouchableOpacity>

          {role === "client" && projectStatus === "completed_by_designer" && (
            <View style={styles.clientActionsContainer}>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleMarkAsCompleted}
                disabled={updateLoading}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.completeButtonText}>
                    {updateLoading ? "Processing..." : "Confirm Completion"}
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.changeRequestButton}
                onPress={handleRequestChanges}
                disabled={updateLoading}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="refresh" size={18} color="#fff" />
                  <Text style={styles.completeButtonText}>
                    {updateLoading ? "Processing..." : "Request Changes"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // Header styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flex: 1,
    paddingRight: 10,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 5,
  },
  statusBadgeBlue: {
    backgroundColor: '#e3f2fd',
  },
  statusBadgeYellow: {
    backgroundColor: '#fff8e1',
  },
  statusBadgeGreen: {
    backgroundColor: '#e8f5e9',
  },
  statusBadgeGray: {
    backgroundColor: '#f5f5f5',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusTextBlue: {
    color: '#1976d2',
  },
  statusTextYellow: {
    color: '#ffa000',
  },
  statusTextGreen: {
    color: '#388e3c',
  },
  statusTextGray: {
    color: '#757575',
  },
  participantText: {
    fontSize: 14,
    color: '#666',
  },
  participantName: {
    fontWeight: '500',
    color: '#333',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c19a6b',
  },
  backButtonText: {
    color: '#c19a6b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  successNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    marginLeft: 5,
  },
  
  // Alert container styles
  alertContainer: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  alertContent: {
    marginLeft: 10,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 14,
    color: '#555',
  },
  
  // Section container styles
  sectionContainer: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  subsectionContainer: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
  },
  
  // HTML content styles
  htmlContentContainer: {
    marginTop: 10,
  },
  uploadContainer: {
    marginBottom: 15,
  },
  fileUploadContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C19A6B',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadInstructions: {
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  uploadFileButton: {
    backgroundColor: '#C19A6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadSuccessContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f0f9f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0e9d0',
    alignItems: 'center',
  },
  uploadSuccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadSuccessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  uploadSuccessInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  uploadSuccessFileName: {
    fontWeight: 'bold',
    color: '#333',
  },
  uploadSuccessSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  changeFileButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C19A6B',
    backgroundColor: 'transparent',
  },
  changeFileButtonText: {
    color: '#C19A6B',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  // HTML Preview styles with WebView
  htmlPreviewContent: {
    width: '100%',
    marginBottom: 20,
  },
  htmlContainer: {
    width: '100%',
    height: 450,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  htmlPreviewHeader: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  htmlPreviewTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  webView: {
    flex: 1,
    height: 450,
    backgroundColor: '#ffffff',
  },
  noContentContainer: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  noContentText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  uploadIcon: {
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#888',
  },
  htmlPreviewContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
  },
  htmlPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  htmlFileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C19A6B',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  htmlPreviewContent: {
    padding: 15,
    backgroundColor: '#fff',
  },
  htmlPreviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  clientActionContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  clientActionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    lineHeight: 20,
  },
  
  // Rating styles
  ratingContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starIcon: {
    marginRight: 5,
  },
  ratingLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  ratingComment: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 10,
    lineHeight: 20,
  },
  ratingTimestamp: {
    fontSize: 12,
    color: '#888',
  },
  
  // Project details styles
  descriptionText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    lineHeight: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  detailItem: {
    width: '50%',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  additionalDetails: {
    marginTop: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  additionalDetailsText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    lineHeight: 20,
  },
  
  // Image styles
  imageContainer: {
    marginBottom: 15,
  },
  imageLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  referenceImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  
  // Action buttons styles
  actionsContainer: {
    marginBottom: 30,
  },
  actionsContent: {
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c19a6b',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    backgroundColor: '#C19A6B',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  changeRequestButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  clientActionsContainer: {
    marginTop: 10,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  fileNameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  htmlInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    height: 200,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#C19A6B',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  modalNote: {
    fontSize: 12,
    color: '#888',
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ProjectPage;
