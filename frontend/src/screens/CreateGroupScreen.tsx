import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { CreateGroupRequest } from '../shared/types';
import { useGroupStore } from '../shared/stores/groupStore';

interface CreateGroupScreenProps {
  onClose: () => void;
  onGroupCreated?: () => void;
}

export default function CreateGroupScreen({ 
  onClose, 
  onGroupCreated 
}: CreateGroupScreenProps) {
  const { createGroup, isCreating, error, clearError } = useGroupStore();

  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: '',
    description: '',
    isPrivate: false,
  });

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    try {
      await createGroup(formData);
      onGroupCreated?.();
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to create group. Please try again.');
    }
  };

  React.useEffect(() => {
    return () => clearError();
  }, []);

  const isFormValid = formData.name.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Group</Text>
        <TouchableOpacity
          onPress={handleCreateGroup}
          disabled={!isFormValid || isCreating}
          style={[styles.createButton, (!isFormValid || isCreating) && styles.disabledButton]}
        >
          <Text style={[styles.createText, (!isFormValid || isCreating) && styles.disabledText]}>
            {isCreating ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Group Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              maxLength={50}
            />
            <Text style={styles.helperText}>
              Choose a descriptive name for your poker group
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your group (optional)"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.helperText}>
              Help members understand what this group is about
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchContent}>
              <Text style={styles.switchLabel}>Private Group</Text>
              <Text style={styles.switchDescription}>
                {formData.isPrivate 
                  ? 'Only members can see this group and its sessions'
                  : 'Group is visible to all users'
                }
              </Text>
            </View>
            <Switch
              value={formData.isPrivate}
              onValueChange={(value) => setFormData(prev => ({ ...prev, isPrivate: value }))}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>After creating your group:</Text>
            <Text style={styles.infoText}>• You'll be the group admin</Text>
            <Text style={styles.infoText}>• Invite friends using invite links</Text>
            <Text style={styles.infoText}>• Create and manage group sessions</Text>
            <Text style={styles.infoText}>• Track group statistics and performance</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Guidelines</Text>
          <View style={styles.guidelinesCard}>
            <Text style={styles.guidelinesTitle}>Admin Responsibilities:</Text>
            <Text style={styles.guidelinesText}>
              • Only admins can create group sessions
            </Text>
            <Text style={styles.guidelinesText}>
              • Admins can invite/remove members
            </Text>
            <Text style={styles.guidelinesText}>
              • Manage session permissions and settings
            </Text>
            <Text style={styles.guidelinesText}>
              • Assign group members to session players
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#007bff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  createButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  createText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledText: {
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  infoCard: {
    backgroundColor: '#e7f3ff',
    borderColor: '#b8daff',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004085',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#004085',
    marginBottom: 4,
  },
  guidelinesCard: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
});