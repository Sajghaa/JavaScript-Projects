import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { loadHabits, clearHabits } from '../../utils/storage';
import { Habit } from '../../types';
import { Colors } from '../../constants/Colors';

export default function ProfileScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const loadedHabits = await loadHabits();
    setHabits(loadedHabits);
  };

  const handleClearData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Clear All Data',
      'This will delete all your habits and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await clearHabits();
            await loadData();
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ]
    );
  };

  const totalCompleted = habits.reduce(
    (sum, h) => sum + h.items.filter(i => i.completed).length,
    0
  );
  const totalItems = habits.reduce((sum, h) => sum + h.items.length, 0);
  const completionRate = totalItems > 0 
    ? Math.round((totalCompleted / totalItems) * 100) 
    : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={Colors.white} />
        </View>
        <Text style={styles.userName}>Habit Tracker User</Text>
        <Text style={styles.userEmail}>user@example.com</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>{habits.length}</Text>
            <Text style={styles.statsLabel}>Habits</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>{totalCompleted}</Text>
            <Text style={styles.statsLabel}>Completed</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>{totalItems}</Text>
            <Text style={styles.statsLabel}>Tasks</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsNumber}>{completionRate}%</Text>
            <Text style={styles.statsLabel}>Success</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementList}>
          {totalCompleted >= 10 && (
            <View style={styles.achievementItem}>
              <Ionicons name="trophy" size={24} color={Colors.warning} />
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>First Steps</Text>
                <Text style={styles.achievementDesc}>Complete 10 tasks</Text>
              </View>
            </View>
          )}
          {habits.length >= 3 && (
            <View style={styles.achievementItem}>
              <Ionicons name="star" size={24} color={Colors.success} />
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>Habit Builder</Text>
                <Text style={styles.achievementDesc}>Create 3 habits</Text>
              </View>
            </View>
          )}
          {completionRate >= 80 && (
            <View style={styles.achievementItem}>
              <Ionicons name="flame" size={24} color={Colors.danger} />
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>On Fire!</Text>
                <Text style={styles.achievementDesc}>80% completion rate</Text>
              </View>
            </View>
          )}
          {habits.length === 0 && (
            <Text style={styles.noAchievements}>
              Complete habits to earn achievements!
            </Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="notifications-outline" size={24} color={Colors.gray} />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.gray} style={styles.settingIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="moon-outline" size={24} color={Colors.gray} />
          <Text style={styles.settingText}>Dark Mode</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.gray} style={styles.settingIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
          <Ionicons name="trash-outline" size={24} color={Colors.danger} />
          <Text style={[styles.settingText, { color: Colors.danger }]}>Clear All Data</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.danger} style={styles.settingIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>Habit Tracker v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: `${Colors.white}cc`,
  },
  statsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsItem: {
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statsLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
  },
  achievementList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark,
  },
  achievementDesc: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  noAchievements: {
    textAlign: 'center',
    color: Colors.gray,
    paddingVertical: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lighterGray,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
    marginLeft: 12,
  },
  settingIcon: {
    marginLeft: 'auto',
  },
  versionInfo: {
    padding: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: Colors.lightGray,
  },
});