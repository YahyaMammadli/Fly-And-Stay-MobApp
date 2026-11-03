import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authApi } from "@/api/auth";
import { getErrorMessage } from "@/api/client";
import AuthField from "@/components/auth/ui/auth-field";
import { profileSchema, ProfileSchema } from "@/components/auth/ui/auth.schema";
import PasswordReset from "@/components/profile/ui/password-reset";
import Avatar from "@/components/shared/ui/avatar";
import Button from "@/components/shared/ui/button";
import ScreenHeader from "@/components/shared/ui/screen-header";
import { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { user, setUser, signOut } = useAuth();

  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const pickPhoto = async () => {
    setPhotoError("");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    setPhotoBusy(true);
    try {
      setUser(await authApi.uploadPhoto({ uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName }));
    } catch (e) {
      setPhotoError(getErrorMessage(e, "Could not upload the photo."));
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = async () => {
    setPhotoError("");
    setPhotoBusy(true);
    try {
      setUser(await authApi.deletePhoto());
    } catch (e) {
      setPhotoError(getErrorMessage(e, "Could not remove the photo."));
    } finally {
      setPhotoBusy(false);
    }
  };

  const saveName = async (data: ProfileSchema) => {
    setNameError("");
    setSaved(false);
    try {
      setUser(await authApi.updateName(data.name.trim()));
      setSaved(true);
    } catch (e) {
      setNameError(getErrorMessage(e, "Could not save your name."));
    }
  };

  const afterPasswordReset = async () => {
    await signOut();
    router.replace("/auth/sign-in");
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScreenHeader title="Edit profile" fallbackHref="/profile" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.photoBlock}>
            <Pressable onPress={pickPhoto} disabled={photoBusy}>
              <Avatar size={104} />
              <View style={styles.camera}>
                <Ionicons name="camera" size={16} color={colors.white} />
              </View>
            </Pressable>
            <View style={styles.photoActions}>
              <Button title="Change photo" variant="outline" style={styles.small} loading={photoBusy} onPress={pickPhoto} />
              {user.hasPhoto && <Button title="Remove" variant="danger" style={styles.small} disabled={photoBusy} onPress={removePhoto} />}
            </View>
            {!!photoError && <Text style={styles.error}>{photoError}</Text>}
          </View>

          <Text style={styles.section}>Personal info</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                icon="person-outline"
                placeholder="Name"
                autoCapitalize="words"
                onBlur={onBlur}
                onChangeText={(t) => {
                  setSaved(false);
                  onChange(t);
                }}
                value={value}
                error={errors.name?.message}
              />
            )}
          />
          <AuthField icon="mail-outline" value={user.email} editable={false} style={{ color: colors.muted }} />
          {!!nameError && <Text style={styles.error}>{nameError}</Text>}
          {saved && <Text style={styles.success}>Saved</Text>}
          <Button title="Save changes" onPress={handleSubmit(saveName)} loading={isSubmitting} />

          <Text style={[styles.section, { marginTop: 32 }]}>Password</Text>
          <PasswordReset email={user.email} onDone={afterPasswordReset} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    photoBlock: { alignItems: "center", marginBottom: 24, gap: 12 },
    camera: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      borderWidth: 3,
      borderColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    photoActions: { flexDirection: "row", gap: 10 },
    small: { height: 40, paddingHorizontal: 18 },
    section: { fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 14 },
    error: { color: colors.error, fontSize: 13, textAlign: "center", marginBottom: 10 },
    success: { color: colors.success, fontSize: 13, textAlign: "center", marginBottom: 10, fontWeight: "600" },
  });
