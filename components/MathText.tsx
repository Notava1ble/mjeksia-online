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

const EX_RATIO = 0.5;

const MathText = ({
  text,
  className,
  style,
  color = "black",
  fontSize = 16,
}: MathTextProps) => {
  const drizzleDb = useDrizzle();

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

  const [svgDataMap, setSvgDataMap] = useState<Record<string, MathSvgData>>({});

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

  const scalePx = fontSize * EX_RATIO;

  return (
    <Text className={className} style={[style]}>
      {mathPieces.map((piece) => {
        if (!piece.isMath) {
          return piece.content;
        }

        const data = piece.hash ? svgDataMap[piece.hash] : null;

        if (!data) {
          return <Text key={piece.id}>...</Text>;
        }

        const widthPx = data.w * scalePx;
        const heightPx = data.h * scalePx;
        const translateY = -1 * (data.v * scalePx);

        // Use balanced margins on both sides to keep the SVG visually centered
        // within its line while still preventing overlap with adjacent lines.
        // This ensures fractions and other tall math don't appear offset.
        const verticalMargin = Math.abs(translateY);

        return (
          <SvgXml
            key={piece.id}
            xml={data.xml}
            width={widthPx}
            height={heightPx}
            color={color}
            style={{
              transform: [{ translateY }],
              marginTop: verticalMargin,
              marginBottom: verticalMargin,
            }}
          />
        );
      })}
    </Text>
  );
};

export default MathText;
