import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitStats } from '../types';
import { Colors } from '../constants/Colors';

interface StatsCardProps {
  stats: HabitStats;
}

export default function StatsCard({ stats }: StatsCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Ionicons name="apps-outline" size={28} color={Colors.primary} />
          <Text style={styles.statValue}>{stats.totalHabits}</Text>
          <Text style={styles.statLabel}>Active Habits</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="list-outline" size={28} color={Colors.success} />
          <Text style={styles.statValue}>{stats.totalItems}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="checkmark-done-outline" size={28} color={Colors.warning} />
          <Text style={styles.statValue}>{stats.completedItems}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="trending-up-outline" size={28} color={Colors.info} />
          <Text style={styles.statValue}>{stats.completionRate}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>
      <View style={styles.streakContainer}>
        <Ionicons name="flame-outline" size={20} color={Colors.warning} />
        <Text style={styles.streakText}>
          {stats.streak} day streak! Keep it up! 🔥
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    width: '23%',
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.lighterGray,
  },
  streakText: {
    fontSize: 14,
    color: Colors.warning,
    marginLeft: 8,
    fontWeight: '500',
  },
});