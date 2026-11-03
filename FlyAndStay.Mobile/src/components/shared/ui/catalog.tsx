import { Ionicons } from "@expo/vector-icons";
import { ReactElement, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";

import { ThemeColors } from "@/constants/theme";
import SkeletonList from "@/components/shared/ui/skeleton";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";

type CatalogProps<T> = {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;

  numColumns?: number;
  horizontal?: boolean;
  gap?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;

  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  initialQuery?: string;

  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyTitle?: string;
  emptyText?: string;
  emptyAction?: { label: string; onPress: () => void };
  skeletonHeight?: number;

  header?: ReactElement | null;
};

export default function Catalog<T>({
  data,
  renderItem,
  keyExtractor,
  numColumns = 1,
  horizontal = false,
  gap = 12,
  contentContainerStyle,
  searchKeys,
  searchPlaceholder = "Search",
  initialQuery = "",
  loading = false,
  error = null,
  onRetry,
  refreshing,
  onRefresh,
  emptyTitle = "Nothing found",
  emptyText = "Try changing your search.",
  emptyAction,
  skeletonHeight = 120,
  header = null,
}: CatalogProps<T>) {
  const { colors } = useTheme();
  const { t } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [query, setQuery] = useState(initialQuery);
  const searchable = !!searchKeys?.length;

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!searchable || !q) return data;
    return data.filter((item) => searchKeys!.some((key) => String(item[key]).toLowerCase().includes(q)));
  }, [data, query, searchable, searchKeys]);

  const columns = horizontal ? 1 : numColumns;

  const searchBar = searchable ? (
    <View style={styles.search}>
      <Ionicons name="search" size={18} color={colors.muted} />
      <TextInput
        style={styles.searchInput}
        placeholder={searchPlaceholder}
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {query.length > 0 && (
        <Ionicons name="close-circle" size={18} color={colors.muted} onPress={() => setQuery("")} />
      )}
    </View>
  ) : null;

  let placeholder: ReactElement;
  if (loading && data.length === 0) {
    placeholder = <SkeletonList count={horizontal ? 3 : 4} height={skeletonHeight} horizontal={horizontal} />;
  } else if (error && data.length === 0) {
    placeholder = (
      <View style={styles.empty}>
        <Ionicons name="cloud-offline-outline" size={36} color={colors.muted} />
        <Text style={styles.emptyTitle}>{t("Couldn't load")}</Text>
        <Text style={styles.emptyText}>{error}</Text>
        {onRetry && (
          <Pressable style={styles.actionButton} onPress={onRetry}>
            <Text style={styles.actionText}>{t("Try again")}</Text>
          </Pressable>
        )}
      </View>
    );
  } else {
    placeholder = (
      <View style={styles.empty}>
        <Ionicons name="search-outline" size={36} color={colors.muted} />
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptyText}>{emptyText}</Text>
        {emptyAction && (
          <Pressable style={styles.actionButton} onPress={emptyAction.onPress}>
            <Text style={styles.actionText}>{emptyAction.label}</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <FlatList

      key={`columns-${columns}`}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={columns}
      horizontal={horizontal}
      columnWrapperStyle={columns > 1 ? { gap } : undefined}
      ItemSeparatorComponent={() => <View style={horizontal ? { width: gap } : { height: gap }} />}
      ListHeaderComponent={
        header || searchBar ? (
          <View>
            {header}
            {searchBar}
          </View>
        ) : undefined
      }
      ListEmptyComponent={placeholder}
      refreshing={onRefresh ? (refreshing ?? false) : undefined}
      onRefresh={onRefresh}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
    />
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    search: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      height: 46,
      paddingHorizontal: 14,
      borderRadius: 23,
      backgroundColor: colors.card,
      boxShadow: colors.shadow,
      marginBottom: 14,
    },
    searchInput: { flex: 1, height: "100%", fontSize: 14, color: colors.text },
    empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 16, gap: 6 },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginTop: 6 },
    emptyText: { fontSize: 13, color: colors.muted, textAlign: "center" },
    actionButton: {
      marginTop: 12,
      height: 40,
      paddingHorizontal: 20,
      borderRadius: 20,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    actionText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  });
