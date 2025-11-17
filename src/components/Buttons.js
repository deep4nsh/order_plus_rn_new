import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const PrimaryButton = ({ title, onPress, style, textStyle, loading, disabled }) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.primaryButton,
        isDisabled && styles.primaryButtonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.primaryText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const SecondaryButton = ({ title, onPress, style, textStyle, disabled }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.secondaryButton,
        disabled && styles.secondaryButtonDisabled,
        style,
      ]}
    >
      <Text style={[styles.secondaryText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const IconBackButton = ({ label = 'Back', onPress, style, textStyle }) => {
  return (
    <TouchableOpacity
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      onPress={onPress}
      style={[styles.backButton, style]}
    >
      <Text style={[styles.backIcon, textStyle]}>‹</Text>
      <Text style={[styles.backLabel, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#fc8019', // Swiggy-like orange
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonDisabled: {
    backgroundColor: '#fcbf90',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1c1c1c',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#007AFF',
    marginRight: 2,
    marginTop: -1,
  },
  backLabel: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export { PrimaryButton, SecondaryButton, IconBackButton };
