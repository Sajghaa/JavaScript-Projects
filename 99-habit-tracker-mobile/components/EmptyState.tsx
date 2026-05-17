import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface EmptyStateProps {
  title: string;
  message: string;
  icon: string;
}

export default function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={64} color={Colors.lightGray} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray,
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: Colors.lightGray,
    textAlign: 'center',
  },
});