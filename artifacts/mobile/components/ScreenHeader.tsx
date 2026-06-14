import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onBack?: () => void;
  noBorder?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  rightElement,
  onBack,
  noBorder = false,
}: ScreenHeaderProps) {
  const { colors: c } = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: c.tabBarBg,
          borderBottomColor: c.border,
          borderBottomWidth: noBorder ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={styles.goldBar} />
      <View style={[styles.inner, { paddingTop: insets.top + 10 }]}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={20} color={c.foreground} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.title, { color: "#C9A84C" }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, { color: c.mutedForeground }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightElement ? (
          <View style={styles.rightSlot}>{rightElement}</View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  goldBar: {
    height: 2,
    backgroundColor: "#C9A84C",
    opacity: 0.75,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  rightSlot: {
    alignItems: "flex-end",
  },
});
