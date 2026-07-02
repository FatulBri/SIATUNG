import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Card } from '../../components/Card';
import {
  RECIPE_DETAIL_STORAGE_KEY_PREFIX,
  RECIPE_LIST_STORAGE_KEY,
} from '../../constants/dummyData';
import { useAppPreferences } from '../../constants/preferences';
import { colors, radius, spacing, typography } from '../../constants/theme';

type RecipeDetail = {
  id: number;
  name: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  caloriesPerServing: number;
  servings: number;
  cookTimeMinutes: number;
  rating: number;
  difficulty: string;
};

const difficultyLabels: Record<string, string> = {
  Easy: 'Mudah',
  Medium: 'Sedang',
  Hard: 'Sulit',
};

function translateDifficulty(difficulty: string) {
  return difficultyLabels[difficulty] ?? difficulty;
}

function normalizeRecipeDetail(recipe: Partial<RecipeDetail> & { id: number; name: string }) {
  return {
    id: recipe.id,
    name: recipe.name,
    image: recipe.image ?? '',
    ingredients: recipe.ingredients ?? ['Bahan belum diisi.'],
    instructions: recipe.instructions ?? ['Langkah memasak belum diisi.'],
    caloriesPerServing: recipe.caloriesPerServing ?? 250,
    servings: recipe.servings ?? 2,
    cookTimeMinutes: recipe.cookTimeMinutes ?? 30,
    rating: recipe.rating ?? 5,
    difficulty: recipe.difficulty ?? 'Medium',
  };
}

export default function RecipeDetailScreen() {
  const { theme } = useAppPreferences();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecipeDetail = useCallback(async () => {
    let cachedRecipeData: RecipeDetail | null = null;

    try {
      setIsLoading(true);
      setError('');

      const detailStorageKey = `${RECIPE_DETAIL_STORAGE_KEY_PREFIX}${id}`;
      const cachedRecipe = await AsyncStorage.getItem(detailStorageKey);
      const cachedRecipeList = await AsyncStorage.getItem(RECIPE_LIST_STORAGE_KEY);
      const recipeFromList = cachedRecipeList
        ? JSON.parse(cachedRecipeList).find((item: RecipeDetail) => String(item.id) === String(id))
        : null;

      if (cachedRecipe || recipeFromList) {
        cachedRecipeData = normalizeRecipeDetail(
          cachedRecipe ? JSON.parse(cachedRecipe) : recipeFromList,
        );
        setRecipe(cachedRecipeData);
      }

      const response = await fetch(`https://dummyjson.com/recipes/${id}`);

      if (!response.ok) {
        throw new Error('Gagal mengambil detail resep.');
      }

      const data = await response.json();
      const normalizedRecipe = normalizeRecipeDetail(data);
      setRecipe(normalizedRecipe);
      await AsyncStorage.setItem(detailStorageKey, JSON.stringify(normalizedRecipe));
    } catch {
      if (cachedRecipeData) {
        setError('');
      } else {
        setError('Detail resep tidak dapat dimuat. Periksa koneksi internet lalu coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecipeDetail();
  }, [fetchRecipeDetail]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Memuat detail resep...</Text>
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: theme.background }]}>
        <Ionicons color={colors.danger} name="alert-circle-outline" size={44} />
        <Text style={styles.errorTitle}>Detail gagal dimuat</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Pressable onPress={fetchRecipeDetail} style={styles.retryButton}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RecipeHeroImage uri={recipe.image} />
        <Text style={styles.title}>{recipe.name}</Text>

        <View style={styles.statsGrid}>
          <Stat icon="time-outline" label="Waktu" value={`${recipe.cookTimeMinutes} menit`} />
          <Stat icon="star-outline" label="Penilaian" value={recipe.rating.toFixed(1)} />
          <Stat icon="flame-outline" label="Tingkat" value={translateDifficulty(recipe.difficulty)} />
          <Stat icon="people-outline" label="Porsi" value={`${recipe.servings} porsi`} />
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Informasi Nutrisi</Text>
          <Text style={styles.paragraph}>{recipe.caloriesPerServing} kalori per porsi.</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Bahan-bahan</Text>
          {recipe.ingredients.map((ingredient) => (
            <Bullet key={ingredient} text={ingredient} />
          ))}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Langkah-langkah</Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={`${index}-${instruction}`} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{instruction}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <Card style={styles.statCard}>
      <Ionicons color={colors.primary} name={icon} size={22} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Card>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function RecipeHeroImage({ uri }: { uri: string }) {
  const [hasImageError, setHasImageError] = useState(false);

  if (hasImageError || !uri) {
    return (
      <View style={[styles.heroImage, styles.imageFallback]}>
        <Ionicons color={colors.primary} name="image-outline" size={44} />
        <Text style={styles.imageFallbackText}>Gambar tidak tersedia</Text>
      </View>
    );
  }

  return (
    <Image
      resizeMode="cover"
      source={{ uri }}
      style={styles.heroImage}
      onError={() => setHasImageError(true)}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.muted,
    fontSize: typography.body,
  },
  errorTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '900',
  },
  errorMessage: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  retryButton: {
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  retryText: {
    color: colors.surface,
    fontSize: typography.body,
    fontWeight: '900',
  },
  heroImage: {
    width: '100%',
    height: 240,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  imageFallbackText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '47%',
    gap: spacing.xs,
  },
  statLabel: {
    color: colors.muted,
    fontSize: typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statValue: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  paragraph: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  stepNumberText: {
    color: colors.surface,
    fontSize: typography.caption,
    fontWeight: '900',
  },
  stepText: {
    flex: 1,
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 23,
  },
});
