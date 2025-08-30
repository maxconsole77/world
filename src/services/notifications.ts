import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Ensure permissions + Android channel
export async function ensurePermissions() {
  const s = await Notifications.getPermissionsAsync();
  if (!s.granted) await Notifications.requestPermissionsAsync();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: undefined,
      vibrationPattern: [250, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

export async function scheduleLocal(title: string, body: string, seconds: number) {
  await ensurePermissions();
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { seconds, channelId: Platform.OS === 'android' ? 'reminders' : undefined }
  });
}

/** Schedule a reminder at a specific Date. */
export async function scheduleAt(title: string, body: string, when: Date) {
  await ensurePermissions();
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { date: when, channelId: Platform.OS === 'android' ? 'reminders' : undefined }
  });
}
