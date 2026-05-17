import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChecklistItem as ChecklistItemType } from '../types';
import { Colors } from '../constants/Colors';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ChecklistItem({ item, onToggle, onDelete }: ChecklistItemProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onToggle(item.id)} style={styles.checkbox}>
        <Ionicons
          name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={item.completed ? Colors.success : Colors.gray}
        />
      </TouchableOpacity>
      <Text style={[styles.text, item.completed && styles.completedText]}>
        {item.text}
      </Text>
      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
        <Ionicons name="close-circle-outline" size={20} color={Colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lighterGray,
  },
  checkbox: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.lightGray,
  },
  deleteBtn: {
    padding: 4,
  },
});