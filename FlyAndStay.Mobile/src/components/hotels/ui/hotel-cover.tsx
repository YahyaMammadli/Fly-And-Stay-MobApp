import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleProp, View, ViewStyle } from "react-native";

type Props = { imageUrl: string | null; color: string; style?: StyleProp<ViewStyle>; iconSize?: number };

export default function HotelCover({ imageUrl, color, style, iconSize = 34 }: Props) {
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={style as object} contentFit="cover" />;
  }
  return (
    <View style={[{ backgroundColor: color, alignItems: "center", justifyContent: "center" }, style]}>
      <Ionicons name="business" size={iconSize} color="rgba(255,255,255,0.9)" />
    </View>
  );
}
