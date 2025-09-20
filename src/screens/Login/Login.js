/* eslint-disable global-require */
import React, { useEffect, useRef } from 'react';
import {
  View, Image, Platform, BackHandler,
} from 'react-native';
import { useSelector } from 'react-redux';
import Config from 'react-native-config';
import * as RootNavigation from '../../navigators/RootNavigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SvgImage from '../../components/SvgImage/SvgImage';
import URContainer from '../../components/URContainer/URContainer';
import Googlebtn from '../../components/Googlebtn/Googlebtn';
import upriseTxt from '../../../assets/images/upriseTxt.svg';
import orText from '../../../assets/images/orText.svg';
import LoginForm from './Login.form';
import styles from './Login.styles';
import Loader from '../../components/Loader/Loader';
import Applebtn from '../../components/Applebtn/Applebtn';

const Login = props => {
  const { navigation } = props;
  const showLoading = useSelector(state => state.login.isWaiting || state.verifyUser.isWaiting);
  const loginResult = useSelector(state => state.login.result);
  const hasCommunity = !!(loginResult && (
    (loginResult.user && (loginResult.user.primary && loginResult.user.primary.community_key)) ||
    (loginResult.user && loginResult.user.community_key) ||
    (loginResult.user && loginResult.user.communityKey)
  ));
  const navigatedRef = useRef(false);
  function handleBackButtonClick() {
    BackHandler.exitApp();
    return true;
  }
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return async () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);

  // Fallback navigation on successful login: go to Dashboard if community exists; else to CommunitySetup
  useEffect(() => {
    if (loginResult) {
      try { if (__DEV__) { /* eslint-disable no-console */ console.log('LOGIN UI side-effect: navigating after login', { hasCommunity }); } } catch (_) {}
      try {
        if (hasCommunity) {
          navigation.navigate('Dashboard');
        } else {
          navigation.navigate('CommunitySetup', { fromLogin: true });
        }
      } catch (_) { /* noop */ }
    }
  }, [loginResult, hasCommunity, navigation]);

  // Guarded replace to ensure we actually leave the Login screen once
  useEffect(() => {
    if (loginResult && !navigatedRef.current) {
      navigatedRef.current = true;
      try { if (__DEV__) { /* eslint-disable no-console */ console.log('LOGIN UI side-effect: replace after login', { hasCommunity }); } } catch (_) {}
      try {
        if (navigation && navigation.replace) {
          if (hasCommunity) {
            navigation.replace('Dashboard');
            try { RootNavigation.resetTo && RootNavigation.resetTo('Dashboard', {}); } catch (_) {}
          } else {
            navigation.replace('CommunitySetup', { fromLogin: true });
            try { RootNavigation.resetToAuthCommunitySetup && RootNavigation.resetToAuthCommunitySetup({ fromLogin: true, uiFallback: true }); } catch (_) {}
          }
        } else {
          if (hasCommunity) {
            navigation.navigate('Dashboard');
          } else {
            navigation.navigate('CommunitySetup', { fromLogin: true });
          }
        }
      } catch (_) { /* noop */ }
    }
  }, [loginResult, hasCommunity, navigation]);
  return (
    <URContainer safeAreaViewStyle={ { flex: 1 } }>
      <Loader
        visible={ showLoading }
      />
      <KeyboardAwareScrollView
        contentContainerStyle={ {
          flex: 1, alignItems: 'center',
        } }
        enableOnAndroid
        extraHeight={ 130 }
        extraScrollHeight={ 130 }
        keyboardOpeningTime={ 0 }
        keyboardShouldPersistTaps='handled'
      >
        <View style={ styles.loginContainer }>
          <View style={ { alignItems: 'center' } }>
            <Image
              style={ styles.upriseRadiyoIcon }
              source={ require('../../../assets/images/upriseRadiyoIcon.png') }
            />
            <SvgImage iconName={ upriseTxt } width={ 115 } height={ 27 } iconStyle={ styles.container } />
            <Googlebtn navigation={ navigation } />
            { /* { Platform.OS === 'ios' && (
            <Applebtn />
            ) } */ }
            <SvgImage iconName={ orText } width={ 41 } height={ 15 } />
          </View>
          <LoginForm navigation={ navigation } />
        </View>
      </KeyboardAwareScrollView>
    </URContainer>
  );
};

export default Login;
