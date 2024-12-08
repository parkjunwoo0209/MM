import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { 
  href: string;  // 외부 URL을 위한 문자열 타입
};

export function ExternalLink({ href, ...rest }: Props) {
  const handlePress = async (event: any) => {
    if (Platform.OS !== 'web') {
      // Prevent the default behavior of linking to the default browser on native
      event.preventDefault();
      // Open the link in an in-app browser
      await openBrowserAsync(href);
    }
  };

  return (
    <Link
      target="_blank"
      {...rest}
      href={href as any}  // 타입 캐스팅으로 임시 해결
      onPress={handlePress}
    />
  );
}