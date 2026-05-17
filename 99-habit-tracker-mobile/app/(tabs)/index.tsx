import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import HabitCard from '../../components/HabitCard';
import StatsCard from '../../components/StatsCard';
import EmptyState from '../../components/EmptyState';
import { loadHabits, deleteHabit, updateHabit } from '../../utils/storage';
import { Habit, HabitStats } from '../../types';
import { Colors } from '../../constants/Colors';

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<HabitStats>({
    totalHabits: 0,
    totalItems: 0,
    completedItems: 0,
    completionRate: 0,
    streak: 0,
  });

  const calculateStats = (habitsData: Habit[]) => {
    const totalHabits = habitsData.length;
    let totalItems = 0;
    let completedItems = 0;

    habitsData.forEach(habit => {
      totalItems += habit.items.length;
      completedItems += habit.items.filter(item => item.completed).length;
    });

    const completionRate = totalItems > 0 
      ? Math.round((completedItems / totalItems) * 100) 
      : 0;

    const today = new Date().toDateString();
    let streak = 0;
    const todayHabits = habitsData.filter(habit => 
      new Date(habit.lastUpdated).toDateString() === today
    );
    streak = todayHabits.length > 0 ? Math.min(todayHabits.length, 7) : 0;

    setStats({
      totalHabits,
      totalItems,
      completedItems,
      completionRate,
      streak,
    });
  };

  const loadData = async () => {
    const loadedHabits = await loadHabits();
    setHabits(loadedHabits);
    calculateStats(loadedHabits);
  };

  const handleDeleteHabit = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Habit',
      'Are you sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(id);
            await loadData();
          },
        },
      ]
    );
  };

  const handleToggleComplete = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      const allCompleted = habit.items.every(item => item.completed);
      const updatedItems = habit.items.map(item => ({
        ...item,
        completed: !allCompleted,
      }));
      await updateHabit(id, {
        items: updatedItems,
        lastUpdated: new Date().toISOString(),
      });
      await loadData();
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            onDelete={handleDeleteHabit}
            onToggleComplete={handleToggleComplete}
          />
        )}
        ListHeaderComponent={<StatsCard stats={stats} />}
        ListEmptyComponent={
          <EmptyState
            title="No habits yet"
            message="Tap the + button to create your first habit tracker"
            icon="list-outline"
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/habit/new')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});