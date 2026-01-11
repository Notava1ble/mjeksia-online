import { Image } from "expo-image";

/**
 * Renders an Image from expo-image that fills its container with rounded corners.
 *
 * @param source - Image source passed to the underlying Image (e.g., `{ uri: string }`, a require result, or other supported source)
 * @returns A React element that displays the provided image with width and height set to 100%, `borderRadius` of 2, and `contentFit` set to `"contain"`.
 */
export default function DynamicImage({ source }: { source: any }) {
  return (
    <Image
      source={source}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 2,
      }}
      contentFit="contain"
    />
  );
}