/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Share, TouchableOpacity, Platform, PermissionsAndroid, ToastAndroid, TextInput, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import TypeaheadInput from '../../components/TypeaheadInput/TypeaheadInput';
import { getApprovedSubGenres, getSubGenreSuggestions } from '../../services/onboarding/genreAlpha.service';
import getLocationFromZip from '../../services/onboarding/zipLookup.service';
import checkUpriseStatus from '../../services/onboarding/checkUpriseStatus.service';
import { setCommunityKey, setRevolutionary } from '../../state/actions/community/community.actions';
import { accessToken } from '../../state/selectors/UserProfile';
import { toCommunityKey } from '../../contracts/community';
import Colors from '../../theme/colors';
import Config from 'react-native-config';
import Geocoder from 'react-native-geocoding';
import Geolocation from 'react-native-geolocation-service';
import { CheckBox, Icon } from 'react-native-elements';

export default function HomeSceneRegistry({ navigation }) {
  const dispatch = useDispatch();
  const token = useSelector(accessToken);
  const [subGenre, setSubGenre] = useState(null);
  const [zip, setZip] = useState('');
  const [city, setCity] = useState(null);
  const [stateName, setStateName] = useState(null);
  const [gpsVerified, setGpsVerified] = useState(false);

  const sceneReady = Boolean(city && stateName && subGenre);

  const openAppSettings = async () => {
    try {
      // RN 0.66: Linking.openSettings should handle both platforms
      await Linking.openSettings();
    } catch (_) {
      try {
        // iOS fallback
        if (Platform.OS === 'ios') {
          await Linking.openURL('app-settings:');
        }
      } catch (_) { /* noop */ }
    }
  };

  const onZipChange = async t => {
    const onlyDigits = (t || '').replace(/[^0-9]/g, '').slice(0, 5);
    setZip(onlyDigits);
    if (onlyDigits.length === 5) {
      try {
        const loc = await getLocationFromZip(onlyDigits);
        if (loc && loc.city && loc.state) { setCity(loc.city); setStateName(loc.state); }
      } catch (_) { /* noop */ }
    } else { setCity(null); setStateName(null); }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    }
    if (Platform.OS === 'android' && Platform.Version < 23) return true;
    const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (granted) return true;
    const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (status === PermissionsAndroid.RESULTS.GRANTED) return true;
    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show('Location permission denied by user', ToastAndroid.LONG);
    }
    return false;
  };

  const verifyWithGps = async () => {
    try {
      const ok = await requestLocationPermission();
      if (!ok) {
        Alert.alert(
          'Verification Failed',
          'We could not access your GPS. Check app permissions and try again, or verify later from Profile > Settings > GPS Verification.',
          [
            { text: 'Open Settings', onPress: () => { openAppSettings(); } },
            { text: 'Try Again', onPress: () => verifyWithGps() },
            { text: 'Verify Later', style: 'cancel' },
          ],
        );
        return;
      }
      Geolocation.getCurrentPosition(async pos => {
        try {
          const apiKey = Config.GOOGLE_MAPS_API_KEY || Config.MAP_API_KEY || 'AIzaSyCNNmfTGsBatXy77JEAcjxuHCR2WSxVhvg';
          Geocoder.init(apiKey);
          const geo = await Geocoder.from(pos.coords.latitude, pos.coords.longitude);
          const best = geo?.results?.[0] || geo?.results?.[1] || {};
          let gpsZip = '';
          if (Array.isArray(best.address_components)) {
            const pc = best.address_components.find(c => Array.isArray(c.types) && c.types.includes('postal_code'));
            if (pc && pc.long_name) gpsZip = pc.long_name;
          }
          if (!gpsZip && best.formatted_address) {
            const m = best.formatted_address.match(/\b(\d{5})(?:-\d{4})?\b/);
            if (m) gpsZip = m[1];
          }
          if (!gpsZip) {
            Alert.alert('Verification Failed', 'We could not determine your ZIP from GPS. Try again or verify later from Profile > Settings > GPS Verification.', [
              { text: 'Try Again', onPress: () => verifyWithGps() },
              { text: 'Verify Later', style: 'cancel' },
            ]);
            return;
          }
          if (zip && zip.length === 5 && zip === gpsZip) {
            setGpsVerified(true);
            // Also update city/state preview using reverse geocode data
            const parts = (best.formatted_address || '').split(',');
            if (parts.length >= 3) {
              setCity(parts[parts.length - 3].trim());
              setStateName(parts[parts.length - 2].replace(/[^A-Za-z ]/g, '').trim());
            }
          } else {
            Alert.alert(
              'Verification Failed',
              `GPS shows ${gpsZip} as your current zipcode. If this is your home ZIP, press Confirm to use it, or choose Verify Later to continue without voting enabled.`,
              [
                { text: 'Confirm', onPress: () => { setZip(gpsZip); setGpsVerified(true); const parts = (best.formatted_address || '').split(','); if (parts.length >= 3) { setCity(parts[parts.length - 3].trim()); setStateName(parts[parts.length - 2].replace(/[^A-Za-z ]/g, '').trim()); } } },
                { text: 'Verify Later', style: 'cancel', onPress: () => {} },
              ],
            );
          }
        } catch (e) {
          Alert.alert('Verification Failed', 'An error occurred during GPS verification. Try again or verify later from Profile > Settings > GPS Verification.', [
            { text: 'Try Again', onPress: () => verifyWithGps() },
            { text: 'Verify Later', style: 'cancel' },
          ]);
        }
      }, err => {
        Alert.alert('Verification Failed', `${err?.message || 'Unable to access GPS'}`, [
          { text: 'Open Settings', onPress: () => { openAppSettings(); } },
          { text: 'Try Again', onPress: () => verifyWithGps() },
          { text: 'Verify Later', style: 'cancel' },
        ]);
      }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
    } catch (_) {}
  };

  const onSubmit = async () => {
    if (!zip || zip.length !== 5) { Alert.alert('Incomplete', 'Please enter a valid 5-digit ZIP'); return; }
    if (!city || !stateName) { Alert.alert('Incomplete', 'Could not resolve city/state from ZIP'); return; }
    if (!subGenre) { Alert.alert('Incomplete', 'Please choose your primary genre'); return; }

    const subSlug = subGenre && (subGenre.id || subGenre.slug || subGenre.value?.id || subGenre.value?.slug || (subGenre.name && subGenre.name.toLowerCase().replace(/\s+/g, '-')));
    const key = toCommunityKey({ city, state: stateName, genre: subSlug });
    try {
      if (!gpsVerified) {
        Alert.alert('Zip Verification', 'You chose not to verify your home ZIP. This means you will not have the ability to vote in your Home Scene. If this was by mistake press "Verify", or join without verification.', [
          { text: 'Verify', onPress: () => verifyWithGps() },
          { text: 'Join Home Scene', onPress: async () => {
            // proceed without verification
            if ((Config.COMMUNITY_VIABILITY_BYPASS || '').toString() === 'true') {
              dispatch(setCommunityKey(key));
              navigation && navigation.replace && navigation.replace('Dashboard');
              return;
            }
            const status = await checkUpriseStatus({ city, state: stateName, genre: subSlug, accessToken: token });
            if (status && status.active) {
              dispatch(setCommunityKey(status.primary?.community_key || key));
              navigation && navigation.replace && navigation.replace('Dashboard');
            } else {
              const needed = status && typeof status.needed === 'number' ? status.needed : 7;
              const nearest = status && (status.nearestActive || (status.alternatives && status.alternatives[0]));
              const targetKey = nearest && (nearest.community_key || toCommunityKey({ city: nearest.city, state: nearest.state, genre: (nearest.subGenre || nearest.superGenre || subSlug) })) || key;
              Alert.alert('🚀 Oh, You\'re THAT Early?', `Your scene needs ${needed} more songs to go live.`, [
                { text: 'Share', onPress: async () => { try { await Share.share({ message: 'Join me on UPRISE!' }); } catch (_) {} } },
                { text: 'Find Nearest', onPress: () => { dispatch(setCommunityKey(targetKey)); navigation && navigation.replace && navigation.replace('Dashboard'); } },
                { text: 'Change Genre', style: 'cancel' },
              ]);
            }
          } },
        ]);
        return;
      }
      if ((Config.COMMUNITY_VIABILITY_BYPASS || '').toString() === 'true') {
        dispatch(setCommunityKey(key));
        navigation && navigation.replace && navigation.replace('Dashboard');
        return;
      }
      const status = await checkUpriseStatus({ city, state: stateName, genre: subSlug, accessToken: token });
      if (status && status.active) {
        dispatch(setCommunityKey(status.primary?.community_key || key));
        navigation && navigation.replace && navigation.replace('Dashboard');
        return;
      }

      const needed = status && typeof status.needed === 'number' ? status.needed : 7;
      const nearest = status && (status.nearestActive || (status.alternatives && status.alternatives[0]));
      const targetKey = nearest && (nearest.community_key || toCommunityKey({ city: nearest.city, state: nearest.state, genre: (nearest.subGenre || nearest.superGenre || subSlug) })) || key;
      const quotes = [
        'First one here gets to pick the playlist forever.',
        'The revolution will not be televised, but it will be locally sourced.',
        'Be the change you wish to see in the world. — Gandhi',
        'They control the airwaves. We\'re building our own.',
        'It takes a village to raise a scene.',
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      const msg = `Not only did you find us... you\'re literally leading the ${city} ${stateName} ${subSlug} revolution!\n\nYour scene needs ${needed} more songs to go live. Recruit your fellow rebels.\n\n“${q}”`;
      Alert.alert('🚀 Oh, You\'re THAT Early?', msg, [
        { text: 'Share', onPress: async () => { try { await Share.share({ message: msg }); } catch (_) {} } },
        { text: 'Find Nearest', onPress: () => { dispatch(setCommunityKey(targetKey)); navigation && navigation.replace && navigation.replace('Dashboard'); } },
        { text: 'Change Genre', style: 'cancel' },
      ]);
    } catch (e) {
      dispatch(setCommunityKey(key));
      navigation && navigation.replace && navigation.replace('Dashboard');
    }
  };

  return (
    <View style={ styles.container }>
      <Text style={ styles.title }>Join Your Home Scene</Text>
      <Text style={ styles.note }>
        Home Scenes represent the core music communities in your city of residence. These are the communities where you’ll have influence through your music and your vote. (GPS Verification Required)
      </Text>
      <View style={ styles.card }>
        <Text style={ styles.label }>City of Residence</Text>
        <TextInput
          value={ zip }
          onChangeText={ onZipChange }
          keyboardType='number-pad'
          maxLength={ 5 }
          placeholder='Enter Zip Code'
          placeholderTextColor='#aaa'
          style={ styles.input }
        />
        <TouchableOpacity style={ styles.verifyBtn } onPress={ verifyWithGps }>
          <Text style={ styles.verifyBtnText }>Verify with GPS</Text>
        </TouchableOpacity>
        <View style={ styles.verifiedRow }>
          {gpsVerified ? (
            <CheckBox
              checked
              disabled
              containerStyle={ [styles.checkbox, { marginLeft: -10 }] }
              accessibilityLabel='Verified'
            />
          ) : (
            <Icon
              type='ionicon'
              name='warning'
              size={ 18 }
              color='#f5a623'
              containerStyle={ { marginLeft: -6, marginRight: 6 } }
              accessibilityLabel='Unverified'
            />
          )}
          <Text style={ styles.verifiedLabel }>{ gpsVerified ? 'Verified' : 'Unverified' }</Text>
        </View>
      </View>

      <TypeaheadInput
        placeholder='Primary genre of interest / affiliation'
        minChars={ 0 }
        showOnFocus
        dropdownMaxHeight={ 320 }
        fetchSuggestions={ async (q) => {
          const list = await getApprovedSubGenres();
          const query = (q || '').toString().trim().toLowerCase();
          const filtered = !query ? list : list.filter(g => {
            const name = String(g.name || '').toLowerCase();
            const id = String(g.id || '').toLowerCase();
            const aliases = Array.isArray(g.aliases) ? g.aliases.map(a => String(a || '').toLowerCase()) : [];
            return name.includes(query) || id.includes(query) || aliases.some(a => a.includes(query));
          });
          const arr = filtered.map(g => ({ key: g.id || g.key, label: g.name || g.label, value: g }));
          return arr.sort((a,b)=> String(a.label).localeCompare(String(b.label)));
        } }
        onChangeText={ t => {
          const name = (t || '').trim();
          if (name.length === 0) { setSubGenre(null); return; }
          const slug = name.toLowerCase().replace(/\s+/g, '-');
          setSubGenre({ id: slug, name });
        } }
        onSelect={ item => setSubGenre(item.value) }
      />

      { /* removed secondary GPS button per UX */ }

      <View style={ styles.preview }>
        <Text style={ styles.previewTitle }>Your Home Scene:</Text>
        <Text style={ styles.previewText }>
          { (city && stateName) ? `${city}, ${stateName}` : '' } { subGenre ? (subGenre.name || subGenre.id) : '' }
        </Text>
      </View>

      <TouchableOpacity style={ [styles.cta, !sceneReady && styles.ctaDisabled] } onPress={ onSubmit } disabled={ !sceneReady }>
        <Text style={ styles.ctaText }>{ sceneReady ? 'Join Home Scene' : 'Join Home Scene' }</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ContainerColor, padding: 20 },
  title: { color: '#fff', fontSize: 18, marginBottom: 6 },
  note: { color: '#cfcfcf', fontSize: 12, marginBottom: 12 },
  card: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 12, marginBottom: 12 },
  label: { color: '#ddd', marginBottom: 6 },
  input: { width: '100%', borderWidth: 1, borderColor: '#444', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#fff', backgroundColor: '#222' },
  checkbox: { backgroundColor: 'transparent', borderWidth: 0, paddingHorizontal: 0, marginLeft: 0 },
  verifyBtn: { marginTop: 8, backgroundColor: '#2a2a2a', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  verifyBtnText: { color: '#ddd', fontSize: 14, fontWeight: '600' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  verifiedLabel: { color: '#cfcfcf', fontSize: 12 },
  cta: { marginTop: 16, backgroundColor: Colors.Primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryCta: { marginTop: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#444', borderRadius: 8 },
  secondaryCtaText: { color: '#ddd', fontSize: 14 },
  preview: { marginTop: 16, backgroundColor: '#121212', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#333' },
  previewTitle: { color: '#bbb', marginBottom: 6 },
  previewText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
