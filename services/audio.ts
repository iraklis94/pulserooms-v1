import { Audio } from 'expo-av';

export interface AudioRecording {
  uri: string;
  duration: number;
}

export async function requestAudioPermissions(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting audio permissions:', error);
    return false;
  }
}

export async function startRecording(): Promise<Audio.Recording | null> {
  try {
    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) {
      return null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    return recording;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return null;
  }
}

export async function stopRecording(
  recording: Audio.Recording
): Promise<AudioRecording | null> {
  try {
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    const status = await recording.getStatusAsync();

    if (!uri) return null;

    return {
      uri,
      duration: status.durationMillis || 0,
    };
  } catch (error) {
    console.error('Failed to stop recording:', error);
    return null;
  }
}

export async function playSound(uri: string): Promise<Audio.Sound | null> {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
    return sound;
  } catch (error) {
    console.error('Failed to play sound:', error);
    return null;
  }
}

export async function unloadSound(sound: Audio.Sound): Promise<void> {
  try {
    await sound.unloadAsync();
  } catch (error) {
    console.error('Failed to unload sound:', error);
  }
}

