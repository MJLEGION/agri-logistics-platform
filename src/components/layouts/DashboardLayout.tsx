import React, { useState } from 'react';
import {
  View,
  Text,
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

// Tooltip component for web hover
const TooltipWrapper = ({ children, tooltip, isWeb }: { children: React.ReactNode; tooltip: string; isWeb: boolean }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isWeb) {
    return <>{children}</>;
  }

  return (
    <View
      style={{ position: 'relative' }}
      // @ts-ignore - web-only props
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <View style={tooltipStyles.tooltipContainer}>
          <Text style={tooltipStyles.tooltipText}>{tooltip}</Text>
        </View>
      )}
    </View>
  );
};

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
      {/* Mobile Header with Hamburger Menu */}
      {isMobile && (
        <View style={[styles.mobileHeader, { backgroundColor: sidebarColor }]}>
          <TouchableOpacity
            onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={styles.hamburgerButton}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={24} color="#FFF" />
          </TouchableOpacity>
          <Image
            source={require('../../../assets/images/logos/logo.png')}
            style={styles.mobileHeaderLogo}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.mobileHeaderLogout}
            onPress={() => dispatch(logout())}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* Sidebar - Hidden on mobile by default, overlay when shown */}
      {(!isMobile || !sidebarCollapsed) && (
        <>
          {isMobile && !sidebarCollapsed && (
            <TouchableOpacity
              style={styles.sidebarOverlay}
              onPress={() => setSidebarCollapsed(true)}
              activeOpacity={1}
            />
          )}
          <View style={[
            styles.sidebar,
            { backgroundColor: sidebarColor },
            isMobile && styles.sidebarMobile,
            isMobile && !sidebarCollapsed && styles.sidebarMobileOpen
          ]}>
            {!isMobile && (
              <TouchableOpacity
                style={styles.sidebarHeader}
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
                  style={styles.logo}
                  resizeMode="contain"
                />
                {isWeb && (
                  <View style={[styles.roleBadge, { backgroundColor: accentColor }]}>
                    <Ionicons name={userRole === 'shipper' ? 'cube' : 'car'} size={12} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.sidebarNav}>
              {sidebarNav.map((nav, idx) => (
                <TooltipWrapper key={idx} tooltip={nav.label} isWeb={isWeb && !isMobile}>
                  <TouchableOpacity
                    style={[styles.sidebarIconBtn, isMobile && styles.sidebarIconBtnMobile]}
                    onPress={() => {
                      handleNavigation(nav);
                      if (isMobile) setSidebarCollapsed(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={nav.icon as any}
                      size={isMobile ? 24 : 28}
                      color="#93C5FD"
                    />
                    {isMobile && (
                      <Text style={styles.navLabel}>{nav.label}</Text>
                    )}
                  </TouchableOpacity>
                </TooltipWrapper>
              ))}
            </View>

            {!isMobile && (
              <View style={styles.sidebarFooter}>
                <ThemeToggle />
                <TooltipWrapper tooltip="Logout" isWeb={isWeb}>
                  <TouchableOpacity
                    style={styles.logoutIcon}
                    onPress={() => dispatch(logout())}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="log-out" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </TooltipWrapper>
              </View>
            )}
          </View>
        </>
      )}

      {/* Main Content */}
      <View style={[styles.mainContent, isMobile && styles.mainContentMobile]}>
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
    flexDirection: isMobile ? 'column' : 'row',
    width: '100%',
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    zIndex: 100,
  },
  hamburgerButton: {
    padding: 8,
  },
  mobileHeaderLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  mobileHeaderLogout: {
    padding: 8,
  },
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 998,
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
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
    position: 'absolute',
    left: -280,
    top: 0,
    bottom: 0,
    width: 250,
    zIndex: 999,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 16,
  },
  sidebarMobileOpen: {
    left: 0,
  },
  sidebarHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 8,
    borderRadius: 16,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
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
    alignItems: isMobile ? 'flex-start' : 'center',
    paddingVertical: 12,
    gap: isMobile ? 8 : 20,
    width: '100%',
  },
  sidebarIconBtn: {
    width: isMobile ? '100%' : 56,
    height: 56,
    borderRadius: 12,
    flexDirection: isMobile ? 'row' : 'column',
    justifyContent: isMobile ? 'flex-start' : 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: isMobile ? 16 : 0,
    gap: isMobile ? 12 : 0,
  },
  sidebarIconBtnMobile: {
    height: 48,
  },
  navLabel: {
    color: '#93C5FD',
    fontSize: 16,
    fontWeight: '500',
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
  mainContent: {
    flex: 1,
  },
  mainContentMobile: {
    width: '100%',
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

const tooltipStyles = StyleSheet.create({
  tooltipContainer: {
    position: 'absolute',
    left: SIDEBAR_WIDTH + 8,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    minWidth: 100,
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
    whiteSpace: 'nowrap' as any,
  },
});
