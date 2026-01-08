import * as schema from "@/db/schema";
import { useDrizzle } from "@/hooks/useDrizzle";
import { getHashedPiece } from "@/lib/utils";
import { inArray } from "drizzle-orm";
import React, { useEffect, useMemo, useState } from "react";
import { Text, type TextStyle } from "react-native";
import { SvgXml } from "react-native-svg";

interface MathSvgData {
  xml: string;
  w: number;
  h: number;
  v: number;
}

interface MathTextProps {
  text: string;
  color?: string;
  fontSize?: number;
  className?: string;
  style?: TextStyle;
}

// MathJax LiteAdaptor defaults 1ex to roughly 0.5em
const EX_RATIO = 0.5;

const MathText = ({
  text,
  className,
  style,
  color = "black",
  fontSize = 16,
}: MathTextProps) => {
  const drizzleDb = useDrizzle();

  // 1. Split text into pieces
  const mathPieces = useMemo(() => {
    return text.split(/(\$[^$]+\$)/g).map((piece, index) => {
      const isMath = piece.startsWith("$") && piece.endsWith("$");
      const rawFormula = isMath ? piece.slice(1, -1) : piece;
      return {
        id: index,
        content: piece,
        isMath,
        hash: isMath ? getHashedPiece(rawFormula) : null,
      };
    });
  }, [text]);

  // 2. Local state for SVG data
  const [svgDataMap, setSvgDataMap] = useState<Record<string, MathSvgData>>({});

  // 3. Bulk fetch missing SVGs
  useEffect(() => {
    const fetchSvgs = async () => {
      const hashesToFetch = mathPieces
        .filter((p) => p.isMath && p.hash && !svgDataMap[p.hash])
        .map((p) => p.hash as string);

      if (hashesToFetch.length === 0) return;

      try {
        const results = await drizzleDb
          .select({
            hash: schema.math_svgs.hash,
            xml: schema.math_svgs.xml,
            w: schema.math_svgs.w,
            h: schema.math_svgs.h,
            v: schema.math_svgs.v,
          })
          .from(schema.math_svgs)
          .where(inArray(schema.math_svgs.hash, hashesToFetch));

        if (results.length > 0) {
          setSvgDataMap((prev) => {
            const next = { ...prev };
            results.forEach((row) => {
              if (row.hash && row.xml) {
                next[row.hash] = {
                  xml: row.xml,
                  w: row.w,
                  h: row.h,
                  v: row.v,
                };
              }
            });
            return next;
          });
        }
      } catch (error) {
        console.error("DB Fetch Error:", error);
      }
    };

    fetchSvgs();
  }, [mathPieces, drizzleDb]);

  // 4. Calculate scaling factor (Pixels per 1 MathJax ex)
  const scalePx = fontSize * EX_RATIO;

  return (
    <Text className={className} style={[style]}>
      {mathPieces.map((piece) => {
        // --- CASE A: Regular Text ---
        if (!piece.isMath) {
          return piece.content;
        }

        // --- CASE B: Math ---
        const data = piece.hash ? svgDataMap[piece.hash] : null;

        if (!data) {
          // Placeholder while loading
          return <Text key={piece.id}>...</Text>;
        }

        // Dimensions in pixels
        const widthPx = data.w * scalePx;
        const heightPx = data.h * scalePx;

        // Vertical Align Calculation:
        // 'v' is usually negative (e.g., -0.2).
        // React Native aligns the SVG bottom to the text baseline.
        // To shift it DOWN, we need a positive Y translation.
        // We invert 'v' because 'v' is "distance from baseline", and negative means down.
        const translateY = -1 * (data.v * scalePx);

        return (
          <SvgXml
            key={piece.id}
            xml={data.xml}
            width={widthPx}
            height={heightPx}
            color={color}
            style={{
              // Apply the shift to align the math baseline with text baseline
              transform: [{ translateY: translateY }],
            }}
          />
        );
      })}
    </Text>
  );
};

export default MathText;
