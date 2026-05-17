import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { Colors } from '../constants/Colors';

interface HabitCardProps {
  habit: Habit;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export default function HabitCard({ habit, onDelete, onToggleComplete }: HabitCardProps) {
  const totalItems = habit.items.length;
  const completedItems = habit.items.filter(item => item.completed).length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const remainingItems = totalItems - completedItems;
  const createdAt = new Date(habit.createdAt).toLocaleDateString();

  return (
    <Link href={`/habit/${habit.id}`} asChild>
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: `${habit.color}20` }]}>
              <Ionicons name={habit.icon as any} size={24} color={habit.color} />
            </View>
            <View>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitDate}>Created: {createdAt}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onToggleComplete(habit.id);
              }}
              style={styles.completeButton}
            >
              <Ionicons
                name={progress === 100 ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={progress === 100 ? Colors.success : Colors.lightGray}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDelete(habit.id);
              }}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: habit.color }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="list-outline" size={14} color={Colors.gray} />
            <Text style={styles.statText}>{totalItems} items</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-done-outline" size={14} color={Colors.gray} />
            <Text style={styles.statText}>{completedItems} done</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color={Colors.gray} />
            <Text style={styles.statText}>{remainingItems} left</Text>
          </View>
        </View>

        {habit.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {habit.description}
          </Text>
        ) : null}
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 2,
  },
  habitDate: {
    fontSize: 11,
    color: Colors.lightGray,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.lighterGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 8,
    lineHeight: 18,
  },
});