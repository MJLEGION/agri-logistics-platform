import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = width < 768;
const isSmallMobile = width < 375;
const SIDEBAR_WIDTH = isMobile ? (isSmallMobile ? 60 : 70) : 80;

interface SidebarNav {
  icon: string;
  label: string;
  screen?: string;
  onPress?: () => void;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  sidebarColor?: string;
  accentColor?: string;
  backgroundImage?: any;
  sidebarNav?: SidebarNav[];
  userRole?: 'transporter' | 'shipper' | 'admin';
  navigation?: any;
  contentPadding?: boolean;
}

export default function DashboardLayout({
  children,
  title = 'Dashboard',
  sidebarColor = '#0F172A',
  accentColor = '#3B82F6',
  backgroundImage,
  sidebarNav = [],
  userRole = 'transporter',
  navigation,
  contentPadding = true,
}: DashboardLayoutProps) {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [expandedNav, setExpandedNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);

  const handleNavigation = (nav: SidebarNav) => {
    if (nav.screen && navigation) {
      navigation.navigate(nav.screen);
    } else if (nav.onPress) {
      nav.onPress();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Sidebar */}
      <View style={[
        styles.sidebar,
        { backgroundColor: sidebarColor, width: SIDEBAR_WIDTH },
        isMobile && styles.sidebarMobile
      ]}>
        <TouchableOpacity
          style={[styles.sidebarHeader, isMobile && styles.sidebarHeaderMobile]}
          onPress={() => {
            if (navigation?.canGoBack?.()) {
              navigation.goBack();
            } else if (navigation) {
              navigation.navigate('Home');
            }
          }}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../../assets/images/logos/logo.png')}
            style={[styles.logo, isMobile && styles.logoMobile]}
            resizeMode="contain"
          />
          {!isMobile && isWeb && (
            <View style={[styles.roleBadge, { backgroundColor: accentColor }]}>
              <Ionicons name={userRole === 'shipper' ? 'cube' : 'car'} size={12} color="#FFF" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.sidebarNav}>
          {sidebarNav.map((nav, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.sidebarIconBtn, isMobile && styles.sidebarIconBtnMobile]}
              onPress={() => handleNavigation(nav)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={nav.icon as any}
                size={isMobile ? (isSmallMobile ? 20 : 24) : 28}
                color="#93C5FD"
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sidebarFooter}>
          {!isSmallMobile && <ThemeToggle />}
          <TouchableOpacity
            style={[styles.logoutIcon, isMobile && styles.logoutIconMobile]}
            onPress={() => dispatch(logout())}
            activeOpacity={0.7}
          >
            <Ionicons
              name="log-out"
              size={isMobile ? 20 : 24}
              color="#EF4444"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundContainer}
          imageStyle={styles.backgroundImage}
        >
          <View style={[styles.backgroundOverlay, { backgroundColor: theme.background + 'E6' }]} />

          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={[
              contentPadding && styles.contentPadding,
              isMobile && contentPadding && styles.contentPaddingMobile
            ]}
            showsVerticalScrollIndicator={true}
          >
            {children}
          </ScrollView>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
  },
  sidebar: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '100%',
  },
  sidebarMobile: {
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sidebarHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 8,
    borderRadius: 16,
    transition: 'all 0.2s ease',
  },
  sidebarHeaderMobile: {
    marginBottom: 12,
    padding: 4,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  logoMobile: {
    width: isSmallMobile ? 35 : 40,
    height: isSmallMobile ? 35 : 40,
    borderRadius: 8,
  },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sidebarNav: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 20,
  },
  sidebarIconBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  sidebarIconBtnMobile: {
    width: isSmallMobile ? 40 : 48,
    height: isSmallMobile ? 40 : 48,
    borderRadius: 8,
  },
  sidebarFooter: {
    alignItems: 'center',
    gap: 12,
  },
  logoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIconMobile: {
    width: isSmallMobile ? 36 : 40,
    height: isSmallMobile ? 36 : 40,
    borderRadius: 8,
  },
  mainContent: {
    flex: 1,
  },
  backgroundContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    opacity: 0.35,
    resizeMode: 'cover',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  contentScroll: {
    flex: 1,
    zIndex: 1,
  },
  contentPadding: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contentPaddingMobile: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
