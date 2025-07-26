import React, { useState, useEffect } from 'react';
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
import { SessionType, CreateSessionRequest, LocationSuggestion } from '../shared/types';
import { useSessionStore } from '../shared/stores/sessionStore';
import LocationSuggestions from '../shared/components/LocationSuggestions';

interface CreateSessionScreenProps {
  onClose: () => void;
  onSessionCreated?: () => void;
}

const sessionTypeOptions = [
  { value: SessionType.LIVE_CASINO, label: 'Live Casino' },
  { value: SessionType.HOME_GAME, label: 'Home Game' },
  { value: SessionType.ONLINE, label: 'Online' },
  { value: SessionType.OTHER, label: 'Other' },
];

export default function CreateSessionScreen({ 
  onClose, 
  onSessionCreated 
}: CreateSessionScreenProps) {
  const {
    createSession,
    fetchLocationSuggestions,
    locationSuggestions,
    isCreating,
    error,
    clearError
  } = useSessionStore();

  const [formData, setFormData] = useState<CreateSessionRequest>({
    sessionType: SessionType.LIVE_CASINO,
    venue: '',
    address: '',
    initialBuyIn: undefined,
    gameType: '',
    stakes: '',
    updateStatus: true,
    notifyFriends: true,
  });

  useEffect(() => {
    fetchLocationSuggestions();
    return () => clearError();
  }, []);

  const handleLocationSelect = (location: LocationSuggestion) => {
    setFormData(prev => ({
      ...prev,
      sessionType: location.sessionType,
      venue: location.venue,
      address: location.address || '',
    }));
  };

  const handleCreateSession = async () => {
    try {
      await createSession(formData);
      onSessionCreated?.();
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to create session. Please try again.');
    }
  };

  const isFormValid = formData.sessionType !== undefined;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Start Session</Text>
        <TouchableOpacity
          onPress={handleCreateSession}
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

        <LocationSuggestions
          suggestions={locationSuggestions.slice(0, 3)}
          onSelectLocation={handleLocationSelect}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Type *</Text>
          <View style={styles.sessionTypeContainer}>
            {sessionTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sessionTypeOption,
                  formData.sessionType === option.value && styles.selectedOption,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, sessionType: option.value }))}
              >
                <Text
                  style={[
                    styles.sessionTypeText,
                    formData.sessionType === option.value && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Venue name (optional)"
            value={formData.venue}
            onChangeText={(text) => setFormData(prev => ({ ...prev, venue: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Address (optional)"
            value={formData.address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Game type (e.g., No Limit Hold'em)"
            value={formData.gameType}
            onChangeText={(text) => setFormData(prev => ({ ...prev, gameType: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Stakes (e.g., 1/2, 2/5)"
            value={formData.stakes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, stakes: text }))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Initial Buy-In</Text>
          <TextInput
            style={styles.input}
            placeholder="Amount (optional)"
            value={formData.initialBuyIn?.toString() || ''}
            onChangeText={(text) => {
              const amount = text ? parseFloat(text) : undefined;
              setFormData(prev => ({ ...prev, initialBuyIn: amount }));
            }}
            keyboardType="numeric"
          />
          <Text style={styles.helperText}>
            You can add this later or track multiple buy-ins during the session
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status & Notifications</Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Update playing status?</Text>
            <Switch
              value={formData.updateStatus}
              onValueChange={(value) => setFormData(prev => ({ ...prev, updateStatus: value }))}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Notify friends?</Text>
            <Switch
              value={formData.notifyFriends}
              onValueChange={(value) => setFormData(prev => ({ ...prev, notifyFriends: value }))}
            />
          </View>
          
          <Text style={styles.helperText}>
            Your playing status will automatically reset after 24 hours if session not ended
          </Text>
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
  sessionTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sessionTypeOption: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  sessionTypeText: {
    fontSize: 14,
    color: '#495057',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: -8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#495057',
  },
});