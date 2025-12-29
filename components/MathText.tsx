import * as schema from "@/db/schema";
import { getHashedPiece } from "@/lib/utils";
import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useMemo, useState } from "react";
import { Text } from "react-native";
import { SvgXml } from "react-native-svg";

// This should match the font size of your wrapping Text component
const BASE_FONT_SIZE = 16;

const MathPlaceholder = ({
  xml,
  color,
}: {
  xml: string | null;
  color: string;
}) => {
  if (!xml) return <Text>... </Text>;

  // 1. Parse viewBox: [minX, minY, width, height]
  // Example: "0 -442 640 453"
  const viewBoxMatch = xml.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch
    ? viewBoxMatch[1].split(/\s+/).map(Number)
    : null;

  if (!viewBox || viewBox.length !== 4) return <Text>... </Text>;

  const [vbX, vbY, vbW, vbH] = viewBox;

  /**
   * MATHJAX SCALING:
   * 1000 units in viewBox = 1em (BASE_FONT_SIZE).
   * This prevents small chars from being "blown up".
   */
  const scale = BASE_FONT_SIZE / 1000;
  const width = vbW * scale;
  const height = vbH * scale;

  /**
   * BASELINE ALIGNMENT:
   * MathJax baseline is at y=0.
   * vbY is the distance from the top of the viewBox to y=0 (usually negative).
   * Descent = (Total Height + vbY) -> the part below the baseline.
   */
  const descent = (vbH + vbY) * scale;

  return (
    <SvgXml
      xml={xml}
      width={width}
      height={height}
      color={color}
      style={{
        // Shift the SVG down so its internal baseline matches the text baseline
        top: descent,
        // Offset the shift so it doesn't add extra space to the line height
        marginBottom: -descent,
      }}
    />
  );
};

const MathText = ({
  text,
  className,
  color,
}: {
  text: string;
  className?: string;
  color: string;
}) => {
  const db = useSQLiteContext();
  const drizzleDb = useMemo(() => drizzle(db, { schema }), [db]);

  // 1. Split text and calculate hashes
  const mathPieces = useMemo(() => {
    return text.split(/(\$[^$]+\$)/g).map((piece, index) => {
      const isMath = piece.startsWith("$") && piece.endsWith("$");
      // Remove $ symbols for hashing (standard for MathJax DB entries)
      const rawFormula = isMath ? piece.slice(1, -1) : piece;
      return {
        id: index,
        content: piece,
        isMath,
        hash: isMath ? getHashedPiece(rawFormula) : null,
      };
    });
  }, [text]);

  const [svgMap, setSvgMap] = useState<Record<string, string>>({});

  // 2. Bulk fetch SVGs from DB
  useEffect(() => {
    const fetchSvgs = async () => {
      const hashesToFetch = mathPieces
        .filter((p) => p.isMath && p.hash && !svgMap[p.hash])
        .map((p) => p.hash as string);

      if (hashesToFetch.length === 0) return;

      try {
        const results = await drizzleDb
          .select()
          .from(schema.math_svgs)
          .where(inArray(schema.math_svgs.hash, hashesToFetch));

        if (results.length > 0) {
          const newMap: Record<string, string> = {};
          results.forEach((row) => {
            if (row.hash && row.xml) newMap[row.hash] = row.xml;
          });
          setSvgMap((prev) => ({ ...prev, ...newMap }));
        }
      } catch (error) {
        console.error("DB Fetch Error:", error);
      }
    };

    fetchSvgs();
  }, [mathPieces, drizzleDb]);

  return (
    <Text className={className} style={{ fontSize: BASE_FONT_SIZE }}>
      {mathPieces.map((piece) =>
        piece.isMath ? (
          <MathPlaceholder
            key={piece.id}
            color={color}
            xml={piece.hash ? svgMap[piece.hash] : null}
          />
        ) : (
          piece.content
        )
      )}
    </Text>
  );
};

export default MathText;
