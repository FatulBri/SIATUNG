import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { RECIPE_DETAIL_STORAGE_KEY_PREFIX, RECIPE_LIST_STORAGE_KEY } from '../../constants/dummyData';
import { useAppPreferences } from '../../constants/preferences';
import { colors, radius, spacing, typography } from '../../constants/theme';

type Recipe = {
  id: number;
  name: string;
  image: string;
  cookTimeMinutes: number;
  rating: number;
  difficulty: string;
  cuisine?: string;
  tags?: string[];
  ingredients?: string[];
  instructions?: string[];
  caloriesPerServing?: number;
  servings?: number;
};

type RecipeForm = {
  name: string;
  cuisine: string;
  cookTimeMinutes: string;
  difficulty: string;
  image: string;
  ingredients: string;
  instructions: string;
};

const emptyForm: RecipeForm = {
  name: '',
  cuisine: '',
  cookTimeMinutes: '',
  difficulty: 'Medium',
  image: '',
  ingredients: '',
  instructions: '',
};

const difficultyLabels: Record<string, string> = {
  Easy: 'Mudah',
  Medium: 'Sedang',
  Hard: 'Sulit',
};

function translateDifficulty(difficulty: string) {
  return difficultyLabels[difficulty] ?? difficulty;
}

export default function RecipeScreen() {
  const { language, t, theme } = useAppPreferences();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [form, setForm] = useState<RecipeForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function saveRecipesToStorage(nextRecipes: Recipe[]) {
    await AsyncStorage.setItem(RECIPE_LIST_STORAGE_KEY, JSON.stringify(nextRecipes));
  }

  const fetchRecipes = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError('');

      const cachedRecipes = await AsyncStorage.getItem(RECIPE_LIST_STORAGE_KEY);

      if (cachedRecipes && !refresh) {
        setRecipes(JSON.parse(cachedRecipes));
        return;
      }

      const response = await fetch('https://dummyjson.com/recipes');

      if (!response.ok) {
        throw new Error('Gagal mengambil data resep.');
      }

      const data = await response.json();
      setRecipes(data.recipes);
      await saveRecipesToStorage(data.recipes);
    } catch {
      const cachedRecipes = await AsyncStorage.getItem(RECIPE_LIST_STORAGE_KEY);

      if (cachedRecipes) {
        setRecipes(JSON.parse(cachedRecipes));
        setError('');
      } else {
      setError(
        language === 'id'
          ? 'Tidak dapat memuat resep. Periksa koneksi internet lalu coba lagi.'
          : 'Unable to load recipes. Check your internet connection and try again.',
      );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  function openCreateForm() {
    setEditingRecipe(null);
    setForm(emptyForm);
    setIsFormVisible(true);
  }

  function openEditForm(recipe: Recipe) {
    setEditingRecipe(recipe);
    setForm({
      name: recipe.name,
      cuisine: recipe.cuisine ?? '',
      cookTimeMinutes: String(recipe.cookTimeMinutes),
      difficulty: recipe.difficulty,
      image: recipe.image,
      ingredients: recipe.ingredients?.join(', ') ?? '',
      instructions: recipe.instructions?.join('\n') ?? '',
    });
    setIsFormVisible(true);
  }

  function closeForm() {
    setIsFormVisible(false);
    setEditingRecipe(null);
    setForm(emptyForm);
  }

  async function handleSaveRecipe() {
    if (!form.name.trim()) {
      Alert.alert(
        language === 'id' ? 'Data belum lengkap' : 'Incomplete data',
        language === 'id' ? 'Nama resep wajib diisi.' : 'Recipe name is required.',
      );
      return;
    }

    const recipeData: Recipe = {
      id: editingRecipe?.id ?? Date.now(),
      name: form.name.trim(),
      cuisine: form.cuisine.trim() || (language === 'id' ? 'Resep Lokal' : 'Local Recipe'),
      cookTimeMinutes: Number(form.cookTimeMinutes) || 30,
      rating: editingRecipe?.rating ?? 5,
      difficulty: form.difficulty,
      image: form.image.trim(),
      tags: [form.cuisine.trim() || (language === 'id' ? 'Resep Lokal' : 'Local Recipe')],
      ingredients: form.ingredients
        .split(',')
        .map((ingredient) => ingredient.trim())
        .filter(Boolean),
      instructions: form.instructions
        .split('\n')
        .map((instruction) => instruction.trim())
        .filter(Boolean),
      caloriesPerServing: editingRecipe?.caloriesPerServing ?? 250,
      servings: editingRecipe?.servings ?? 2,
    };

    const nextRecipes = editingRecipe
      ? recipes.map((recipe) => (recipe.id === editingRecipe.id ? recipeData : recipe))
      : [recipeData, ...recipes];

    setRecipes(nextRecipes);
    await saveRecipesToStorage(nextRecipes);
    await AsyncStorage.setItem(
      `${RECIPE_DETAIL_STORAGE_KEY_PREFIX}${recipeData.id}`,
      JSON.stringify(recipeData),
    );
    closeForm();
  }

  function handleDeleteRecipe(recipeId: number) {
    Alert.alert(
      language === 'id' ? 'Hapus resep' : 'Delete recipe',
      language === 'id'
        ? 'Yakin ingin menghapus resep ini dari database lokal?'
        : 'Delete this recipe from the local database?',
      [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          const nextRecipes = recipes.filter((recipe) => recipe.id !== recipeId);
          setRecipes(nextRecipes);
          await saveRecipesToStorage(nextRecipes);
          await AsyncStorage.removeItem(`${RECIPE_DETAIL_STORAGE_KEY_PREFIX}${recipeId}`);
        },
      },
    ]);
  }

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const categories = useMemo(() => {
    const uniqueCategories = recipes.flatMap((recipe) => [
      recipe.cuisine,
      ...(recipe.tags ?? []),
    ]).filter((category): category is string => Boolean(category));

    return ['Semua', ...Array.from(new Set(uniqueCategories)).slice(0, 8)];
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    if (selectedCategory === 'Semua') {
      return recipes;
    }

    return recipes.filter(
      (recipe) => recipe.cuisine === selectedCategory || recipe.tags?.includes(selectedCategory),
    );
  }, [recipes, selectedCategory]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>{t('loadingRecipes')}</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: theme.background }]}>
        <Ionicons color={colors.danger} name="cloud-offline-outline" size={44} />
        <Text style={styles.errorTitle}>{t('recipeUnavailable')}</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Pressable onPress={() => fetchRecipes()} style={styles.retryButton}>
          <Text style={styles.retryText}>{t('retry')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.content}
        data={filteredRecipes}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.screenTitle}>{t('recipePracticum')}</Text>
            <Text style={styles.screenSubtitle}>
              {t('recipeSubtitle')}
            </Text>

            <Pressable onPress={openCreateForm} style={styles.addButton}>
              <Ionicons color={colors.surface} name="add-circle-outline" size={20} />
              <Text style={styles.addButtonText}>{t('addRecipe')}</Text>
            </Pressable>

            <ScrollView
              horizontal
              contentContainerStyle={styles.categoryList}
              showsHorizontalScrollIndicator={false}
            >
              {categories.map((category) => {
                const isActive = selectedCategory === category;

                return (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isActive && styles.categoryTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        refreshControl={
          <RefreshControl
            colors={[colors.primary]}
            refreshing={isRefreshing}
            tintColor={colors.primary}
            onRefresh={() => fetchRecipes(true)}
          />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/recipe/${item.id}`)} style={styles.recipePressable}>
            {({ pressed }) => (
              <View style={[styles.recipeCard, pressed && styles.pressedCard]}>
                <RecipeThumbnail uri={item.image} />
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName}>{item.name}</Text>
                  <View style={styles.metaRow}>
                    <Meta icon="time-outline" value={`${item.cookTimeMinutes} menit`} />
                    <Meta icon="star-outline" value={item.rating.toFixed(1)} />
                  </View>
                  <Text style={styles.difficultyText}>
                    {translateDifficulty(item.difficulty)}
                  </Text>
                  <View style={styles.actionRow}>
                    <Pressable onPress={() => openEditForm(item)} style={styles.actionButton}>
                      <Ionicons color={colors.surface} name="create-outline" size={14} />
                      <Text style={styles.actionText}>{t('edit')}</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDeleteRecipe(item.id)} style={styles.actionButton}>
                      <Ionicons color={colors.surface} name="trash-outline" size={14} />
                      <Text style={styles.actionText}>{t('delete')}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </Pressable>
        )}
      />

      <RecipeFormModal
        form={form}
        isEditing={Boolean(editingRecipe)}
        isVisible={isFormVisible}
        onChangeForm={setForm}
        onClose={closeForm}
        onSave={handleSaveRecipe}
      />
    </SafeAreaView>
  );
}

function RecipeFormModal({
  form,
  isEditing,
  isVisible,
  onChangeForm,
  onClose,
  onSave,
}: {
  form: RecipeForm;
  isEditing: boolean;
  isVisible: boolean;
  onChangeForm: (form: RecipeForm) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  function updateForm(field: keyof RecipeForm, value: string) {
    onChangeForm({ ...form, [field]: value });
  }

  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Resep' : 'Tambah Resep'}</Text>
            <Text style={styles.modalSubtitle}>
              Data ini akan disimpan ke database lokal AsyncStorage.
            </Text>

            <FormInput
              label="Nama Resep"
              placeholder="Contoh: Nasi Goreng Rumahan"
              value={form.name}
              onChangeText={(value) => updateForm('name', value)}
            />
            <FormInput
              label="Kategori"
              placeholder="Contoh: Indonesia"
              value={form.cuisine}
              onChangeText={(value) => updateForm('cuisine', value)}
            />
            <FormInput
              keyboardType="numeric"
              label="Waktu Memasak (menit)"
              placeholder="30"
              value={form.cookTimeMinutes}
              onChangeText={(value) => updateForm('cookTimeMinutes', value)}
            />
            <FormInput
              label="Tingkat Kesulitan"
              placeholder="Easy / Medium / Hard"
              value={form.difficulty}
              onChangeText={(value) => updateForm('difficulty', value)}
            />
            <FormInput
              label="URL Gambar"
              placeholder="https://..."
              value={form.image}
              onChangeText={(value) => updateForm('image', value)}
            />
            <FormInput
              label="Bahan-bahan"
              multiline
              placeholder="Pisahkan dengan koma, contoh: nasi, telur, bawang"
              value={form.ingredients}
              onChangeText={(value) => updateForm('ingredients', value)}
            />
            <FormInput
              label="Langkah-langkah"
              multiline
              placeholder="Tulis satu langkah per baris"
              value={form.instructions}
              onChangeText={(value) => updateForm('instructions', value)}
            />

            <View style={styles.modalActions}>
              <Pressable onPress={onClose} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.cancelButtonText}>Batal</Text>
              </Pressable>
              <Pressable onPress={onSave} style={[styles.modalButton, styles.saveButton]}>
                <Text style={styles.saveButtonText}>Simpan</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function FormInput({
  label,
  ...inputProps
}: {
  label: string;
} & TextInputProps) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.formInput, inputProps.multiline && styles.formInputMultiline]}
        {...inputProps}
      />
    </View>
  );
}

function Meta({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons color={colors.surface} name={icon} size={15} />
      <Text style={styles.metaText}>{value}</Text>
    </View>
  );
}

function RecipeThumbnail({ uri }: { uri: string }) {
  const [hasImageError, setHasImageError] = useState(false);

  if (hasImageError || !uri) {
    return (
      <View style={[styles.recipeImage, styles.imageFallback]}>
        <Ionicons color={colors.primary} name="image-outline" size={34} />
        <Text style={styles.imageFallbackText}>Gambar tidak tersedia</Text>
      </View>
    );
  }

  return (
    <Image
      resizeMode="cover"
      source={{ uri }}
      style={styles.recipeImage}
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
  pressedCard: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  recipeImage: {
    width: '100%',
    height: 128,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  imageFallbackText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  header: {
    marginBottom: spacing.md,
  },
  screenTitle: {
    color: colors.secondary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 4,
  },
  screenSubtitle: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.secondary,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  addButtonText: {
    color: colors.surface,
    fontSize: typography.body,
    fontWeight: '900',
  },
  categoryList: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingRight: spacing.lg,
  },
  categoryChip: {
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  categoryChipActive: {
    backgroundColor: colors.secondary,
  },
  categoryText: {
    color: colors.secondary,
    fontSize: typography.body,
    fontWeight: '800',
  },
  categoryTextActive: {
    color: colors.surface,
  },
  columnWrapper: {
    gap: spacing.md,
  },
  recipePressable: {
    flex: 1,
    marginBottom: spacing.md,
  },
  recipeCard: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.secondary,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  recipeInfo: {
    minHeight: 112,
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
  },
  recipeName: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  metaText: {
    color: colors.surface,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  difficultyText: {
    color: '#FDE68A',
    fontSize: typography.caption,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 5,
  },
  actionText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  modalCard: {
    maxHeight: '88%',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  modalTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  formGroup: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  formLabel: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: typography.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  formInputMultiline: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  cancelButton: {
    backgroundColor: colors.background,
  },
  saveButton: {
    backgroundColor: colors.secondary,
  },
  cancelButtonText: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: '900',
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: typography.body,
    fontWeight: '900',
  },
});
