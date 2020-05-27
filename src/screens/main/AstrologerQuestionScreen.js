import React from "react";
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  Button,
  Divider,
  Headline,
  Subheading,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useGlobals } from "../../contexts/Global";
import i18n from "i18n-js";
import { useIsDark } from "../../hooks/useTheme";
import { BlurView } from "expo-blur";
import PlatformUtils from "../../utils/Platform";
import Close from "../../components/navs/Close";
import { AdMobBanner, AdMobInterstitial } from "expo-ads-admob";
import Ads from "../../credentials/admob";
import api_calls from "../../constants/apis";
import { fetcher } from "../../hooks/useFetch";

/**
 * @param route
 * @param navigation
 * @returns {*}
 * @constructor
 */
function AstrologerQuestionScreen({ route, navigation }) {
  const [{ session }, dispatch] = useGlobals();
  const { colors } = useTheme();
  const astrologist = route.params.astrologist;
  const [data, setData] = React.useState({
    message: null,
    email: null,
    astrologer: astrologist.name,
  });
  const [disabled, setDisabled] = React.useState(false);
  const isDark = useIsDark();
  const isAndroid = PlatformUtils.isAndroid;
  const _handleProceed = async () => {
    try {
      dispatch({ type: "setShowLoader" });
      await AdMobInterstitial.setAdUnitID(Ads.astrologers);
      await AdMobInterstitial.requestAdAsync();
      await AdMobInterstitial.showAdAsync();
      dispatch({ type: "setShowLoader" });
    } catch {
      //
    } finally {
      const { method, url, params } = api_calls.astrology;
      const response = await fetcher(method, url, params, data);
      if (response) {
        setDisabled(true);
      }
    }
  };
  return (
    <BlurView
      style={[StyleSheet.absoluteFill, { flex: 1 }]}
      tint={isDark ? "dark" : "light"}
      intensity={isAndroid ? 150 : 100}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView style={{ paddingBottom: 200 }}>
          <Close position="right" />
          <View style={{ margin: 20, alignItems: "center" }}>
            <Headline>{astrologist.name}</Headline>
            <Subheading>
              {i18n.t(astrologist.school, { word: i18n.t("Astrology") })}
            </Subheading>
            <Image source={{ uri: astrologist.photo }} style={styles.image} />
          </View>
          <Divider />
          <View style={{ margin: 20 }}>
            <View style={{ height: 5 }} />
            <TextInput
              label={i18n.t("Your question")}
              multiline={true}
              style={{ height: 150 }}
              maxLength={250}
              onChangeText={(text) =>
                setData((data) => ({ ...data, message: text }))
              }
            />
            <View style={{ height: 5 }} />
            <TextInput
              label={i18n.t("Your email")}
              keyboardType="email-address"
              onChangeText={(text) =>
                setData((data) => ({ ...data, email: text }))
              }
            />
          </View>
          <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <Button
              onPress={_handleProceed}
              mode="contained"
              style={{ borderRadius: 20 }}
              icon="send"
              disabled={disabled}
            >
              {i18n.t("Proceed")}
            </Button>
            <Text style={styles.advice}>
              *
              {i18n.t(
                "You'll need to see an ad before you can send the question"
              )}
            </Text>
          </View>
          <Divider />
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <AdMobBanner
              adUnitID={Ads.astrologersBanner}
              bannerSize="largeBanner"
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 80,
    aspectRatio: 100 / 100,
    borderRadius: 100,
    marginTop: 10,
  },
  advice: {
    marginTop: 7,
    fontSize: 10,
    textAlign: "center",
    opacity: 0.8,
  },
});

export default AstrologerQuestionScreen;
