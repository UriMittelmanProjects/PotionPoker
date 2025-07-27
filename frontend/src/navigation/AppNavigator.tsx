import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../shared/stores/authStore';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

/**
 * Main App Navigator component
 * Handles authentication state and routing between auth and main app screens
 * Acts as an auth guard to protect authenticated routes
 */
export default function AppNavigator() {
  const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();

  /**
   * Load stored authentication data on app startup
   */
  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  /**
   * Show loading spinner while checking authentication status
   */
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  /**
   * Route to appropriate navigator based on authentication status
   */
  return isAuthenticated ? <TabNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});