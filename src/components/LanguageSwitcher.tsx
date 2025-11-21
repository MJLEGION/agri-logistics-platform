import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

type Language = 'en' | 'rw' | 'fr';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

interface LanguageSwitcherProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function LanguageSwitcher({
  showLabel = true,
  size = 'medium'
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLanguage = LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];

  const handleLanguageChange = async (langCode: Language) => {
    await setLanguage(langCode);
    setModalVisible(false);
  };

  const buttonSize = size === 'small' ? 32 : size === 'large' ? 48 : 40;
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 16 : 14;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            height: buttonSize,
            paddingHorizontal: showLabel ? 12 : 8,
          },
        ]}
        onPress={() => setModalVisible(true)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={t('common.selectLanguage')}
        accessibilityHint={`Current language: ${currentLanguage.name}`}
      >
        <Text style={{ fontSize: iconSize + 4 }}>{currentLanguage.flag}</Text>
        {showLabel && (
          <Text
            style={[
              styles.buttonText,
              { color: theme.text, fontSize }
            ]}
          >
            {currentLanguage.code.toUpperCase()}
          </Text>
        )}
        <Ionicons name="chevron-down" size={iconSize} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {t('common.selectLanguage')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.languageList}>
              {LANGUAGES.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageOption,
                      {
                        backgroundColor: isSelected
                          ? `${theme.primary}15`
                          : 'transparent',
                        borderColor: isSelected
                          ? theme.primary
                          : theme.border,
                      },
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${lang.name}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.languageInfo}>
                      <Text style={styles.languageFlag}>{lang.flag}</Text>
                      <View style={styles.languageTextContainer}>
                        <Text
                          style={[
                            styles.languageName,
                            {
                              color: theme.text,
                              fontWeight: isSelected ? '600' : '400',
                            }
                          ]}
                        >
                          {lang.name}
                        </Text>
                        <Text
                          style={[
                            styles.languageNativeName,
                            { color: theme.textSecondary }
                          ]}
                        >
                          {lang.nativeName}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={theme.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  buttonText: {
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  languageList: {
    gap: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageFlag: {
    fontSize: 32,
  },
  languageTextContainer: {
    gap: 2,
  },
  languageName: {
    fontSize: 16,
  },
  languageNativeName: {
    fontSize: 13,
  },
});
