import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { BackButton } from '../components/BackButton';
import { COLORS } from '../src/lib/theme';
import { useAuth } from '../src/store/auth';
import { useToast } from '../src/store/toast';
import { sendRequest } from '../src/lib/connections';

/** Pull a Worldly share code out of a scanned QR — accepts a raw code or an
 *  `…/add/{code}` invite link. */
function extractCode(data: string): string {
  const m = data.match(/add\/([A-Za-z0-9-]+)/);
  return (m ? m[1] : data).trim().toUpperCase();
}

export default function ScanScreen() {
  const [perm, requestPerm] = useCameraPermissions();
  const { user } = useAuth();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function onScan(data: string) {
    if (busy || !user) return;
    setBusy(true);
    const code = extractCode(data);
    const myName = user.displayName || (user.email ? user.email.split('@')[0] : 'Member');
    const res = await sendRequest({ uid: user.uid, name: myName }, code);
    if (res.ok) {
      toast.success('Connection request sent!');
      router.back();
    } else {
      toast.error(res.error ?? "That QR didn't work — try again.");
      setTimeout(() => setBusy(false), 1200);
    }
  }

  if (!perm) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  if (!perm.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <BackButton onPress={() => router.back()} style={{ position: 'absolute', top: 60, left: 20 }} />
        <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: '#fff', textAlign: 'center' }}>Scan a friend's QR</Text>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
          Worldly needs camera access to scan a friend's Worldly code and connect.
        </Text>
        <Pressable onPress={requestPerm} style={{ marginTop: 18, backgroundColor: COLORS.coral, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999 }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontWeight: '700', color: '#fff' }}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView style={{ flex: 1 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => onScan(data)} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 240, height: 240, borderRadius: 24, borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)' }} />
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: '#fff', marginTop: 18 }}>Point at a Worldly QR code</Text>
      </View>
      <BackButton onPress={() => router.back()} style={{ position: 'absolute', top: 60, left: 20 }} />
      {busy ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : null}
    </View>
  );
}
