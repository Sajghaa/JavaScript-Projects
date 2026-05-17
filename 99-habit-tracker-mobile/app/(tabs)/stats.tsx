import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { loadHabits } from '../../utils/storage';
import { Habit } from '../../types';
import { Colors } from '../../constants/Colors';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
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

  const getWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = new Array(7).fill(0);
    
    habits.forEach(habit => {
      const date = new Date(habit.lastUpdated);
      const dayIndex = date.getDay() - 1;
      if (dayIndex >= 0 && dayIndex < 7) {
        const completed = habit.items.filter(i => i.completed).length;
        data[dayIndex] += completed;
      }
    });
    
    return {
      labels: days,
      datasets: [{ data, color: () => Colors.primary }],
    };
  };

  const getCategoryData = () => {
    const categoryCount: Record<string, number> = {};
    habits.forEach(habit => {
      const completed = habit.items.filter(i => i.completed).length;
      categoryCount[habit.name] = (categoryCount[habit.name] || 0) + completed;
    });
    
    return Object.entries(categoryCount).slice(0, 5).map(([name, count]) => ({
      name: name.length > 10 ? name.substring(0, 10) + '...' : name,
      population: count,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      legendFontColor: Colors.dark,
    }));
  };

  const totalCompleted = habits.reduce(
    (sum, h) => sum + h.items.filter(i => i.completed).length,
    0
  );
  const totalItems = habits.reduce((sum, h) => sum + h.items.length, 0);
  const bestHabit = habits.reduce(
    (best, h) => {
      const completed = h.items.filter(i => i.completed).length;
      return completed > best.completed ? { name: h.name, completed } : best;
    },
    { name: 'None', completed: 0 }
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics Overview</Text>
        <Text style={styles.headerSubtitle}>Track your progress over time</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Ionicons name="checkmark-done" size={24} color={Colors.success} />
          <Text style={styles.statValue}>{totalCompleted}</Text>
          <Text style={styles.statLabel}>Tasks Completed</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="list" size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{totalItems}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="trophy" size={24} color={Colors.warning} />
          <Text style={styles.statValue}>{bestHabit.name}</Text>
          <Text style={styles.statLabel}>Best Habit</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="calendar" size={24} color={Colors.info} />
          <Text style={styles.statValue}>{habits.length}</Text>
          <Text style={styles.statLabel}>Active Habits</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weekly Activity</Text>
        <LineChart
          data={getWeeklyData()}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: Colors.white,
            backgroundGradientFrom: Colors.white,
            backgroundGradientTo: Colors.white,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {getCategoryData().length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Habit Distribution</Text>
          <PieChart
            data={getCategoryData()}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
        <View style={styles.tipItem}>
          <Ionicons name="bulb-outline" size={20} color={Colors.warning} />
          <Text style={styles.tipText}>Complete at least one task daily to maintain your streak</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="trending-up-outline" size={20} color={Colors.success} />
          <Text style={styles.tipText}>Focus on your top 3 habits for better results</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="time-outline" size={20} color={Colors.info} />
          <Text style={styles.tipText}>Consistency beats intensity - small steps every day</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: `${Colors.white}cc`,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 16,
  },
  chart: {
    marginLeft: -20,
    borderRadius: 16,
  },
  tipsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
});