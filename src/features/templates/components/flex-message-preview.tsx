"use client";

import { CSSProperties } from "react";

interface FlexMessagePreviewProps {
  rawJson?: string;
  altText: string;
}

type FlexObject = Record<string, unknown>;

const fontSizes: Record<string, string> = {
  xxs: "10px",
  xs: "11px",
  sm: "12px",
  md: "14px",
  lg: "16px",
  xl: "18px",
  xxl: "22px",
  "3xl": "28px",
  "4xl": "32px",
  "5xl": "36px",
};

const spacing: Record<string, string> = {
  none: "0",
  xs: "4px",
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "18px",
  xxl: "24px",
};

const componentSizes: Record<string, string> = {
  xxs: "12px",
  xs: "16px",
  sm: "20px",
  md: "28px",
  lg: "36px",
  xl: "44px",
  xxl: "52px",
  "3xl": "64px",
  "4xl": "76px",
  "5xl": "88px",
};

const bubbleWidths: Record<string, string> = {
  nano: "120px",
  micro: "160px",
  kilo: "210px",
  mega: "260px",
  giga: "300px",
};

export function FlexMessagePreview({
  rawJson,
  altText,
}: FlexMessagePreviewProps) {
  const contents = parseContents(rawJson);

  if (!contents) {
    return (
      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white px-4 py-5 text-xs text-gray-500 shadow-sm">
        Flex preview will appear when the JSON is complete.
      </div>
    );
  }

  if (contents.type === "carousel") {
    const bubbles = Array.isArray(contents.contents)
      ? contents.contents.filter(isObject)
      : [];

    return (
      <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
        {bubbles.map((bubble, index) => (
          <div
            key={index}
            className="shrink-0"
            style={{ width: bubbleWidth(bubble.size) }}
          >
            <FlexBubble bubble={bubble} altText={altText} fullWidth />
          </div>
        ))}
      </div>
    );
  }

  return <FlexBubble bubble={contents} altText={altText} />;
}

function FlexBubble({
  bubble,
  altText,
  fullWidth = false,
}: {
  bubble: FlexObject;
  altText: string;
  fullWidth?: boolean;
}) {
  const bubbleStyle: CSSProperties = {
    direction: bubble.direction === "rtl" ? "rtl" : "ltr",
    width: fullWidth ? "100%" : bubbleWidth(bubble.size),
    maxWidth: fullWidth ? "100%" : "85%",
  };

  return (
    <div
      className="overflow-hidden rounded-2xl rounded-tl-md bg-white text-gray-900 shadow-sm"
      style={bubbleStyle}
      aria-label={altText}
    >
      {renderSection(bubble.header, "header", bubble.styles)}
      {renderSection(bubble.hero, "hero", bubble.styles)}
      {renderSection(bubble.body, "body", bubble.styles)}
      {renderSection(bubble.footer, "footer", bubble.styles)}
    </div>
  );
}

function renderSection(value: unknown, section: string, styles: unknown) {
  if (!isObject(value)) {
    return null;
  }

  const blockStyle =
    isObject(styles) && isObject(styles[section]) ? styles[section] : undefined;

  return (
    <div style={blockStyleValue(blockStyle)}>
      <FlexComponent key={section} component={value} section={section} isRoot />
    </div>
  );
}

function FlexComponent({
  component,
  section,
  isRoot = false,
}: {
  component: FlexObject;
  section?: string;
  isRoot?: boolean;
}) {
  switch (component.type) {
    case "box":
      return (
        <FlexBox component={component} section={section} isRoot={isRoot} />
      );
    case "text":
      return <FlexText component={component} />;
    case "image":
      return <FlexImage component={component} section={section} />;
    case "video":
      return <FlexVideo component={component} />;
    case "button":
      return <FlexButton component={component} />;
    case "separator":
      return (
        <div
          style={{
            ...positionStyle(component),
            width: pixelValue(component.width) ?? "100%",
            height: pixelValue(component.height) ?? "1px",
            backgroundColor:
              typeof component.color === "string" ? component.color : "#e5e7eb",
            marginTop: spaceValue(component.margin),
            flex: numberValue(component.flex),
          }}
        />
      );
    case "spacer":
      return (
        <div
          style={{
            height: spaceValue(component.size) ?? "10px",
            flex: numberValue(component.flex),
          }}
        />
      );
    case "filler":
      return <div style={{ flex: numberValue(component.flex) ?? 1 }} />;
    case "icon":
      return <FlexIcon component={component} />;
    default:
      return null;
  }
}

function FlexBox({
  component,
  section,
  isRoot,
}: {
  component: FlexObject;
  section?: string;
  isRoot: boolean;
}) {
  const contents = Array.isArray(component.contents)
    ? component.contents.filter(isObject)
    : [];
  const layout =
    component.layout === "horizontal" || component.layout === "baseline"
      ? "row"
      : "column";

  const style: CSSProperties = {
    display: "flex",
    position: component.position === "absolute" ? "absolute" : "relative",
    flexDirection: layout,
    alignItems:
      component.alignItems === "center"
        ? "center"
        : component.alignItems === "flex-end"
          ? "flex-end"
          : undefined,
    justifyContent:
      component.justifyContent === "center"
        ? "center"
        : component.justifyContent === "flex-end"
          ? "flex-end"
          : component.justifyContent === "space-between"
            ? "space-between"
            : undefined,
    gap: component.spacing === "none" ? 0 : spaceValue(component.spacing),
    flex: numberValue(component.flex),
    width: sizeValue(component.width),
    height: sizeValue(component.height),
    minWidth: sizeValue(component.minWidth),
    minHeight: sizeValue(component.minHeight),
    maxWidth: sizeValue(component.maxWidth),
    maxHeight: sizeValue(component.maxHeight),
    backgroundColor:
      typeof component.backgroundColor === "string"
        ? component.backgroundColor
        : undefined,
    backgroundImage: gradientValue(component.background),
    borderColor:
      typeof component.borderColor === "string"
        ? component.borderColor
        : undefined,
    borderWidth: pixelValue(component.borderWidth),
    borderStyle: component.borderWidth ? "solid" : undefined,
    borderRadius: pixelValue(component.cornerRadius),
    overflow: component.cornerRadius ? "hidden" : undefined,
    marginTop: spaceValue(component.margin),
    paddingTop: paddingValue(
      component.paddingTop,
      component.paddingAll,
      isRoot && section !== "hero" ? "12px" : undefined,
    ),
    paddingRight: paddingValue(
      component.paddingEnd,
      component.paddingAll,
      isRoot && section !== "hero" ? "14px" : undefined,
    ),
    paddingBottom: paddingValue(
      component.paddingBottom,
      component.paddingAll,
      isRoot && section !== "hero" ? "12px" : undefined,
    ),
    paddingLeft: paddingValue(
      component.paddingStart,
      component.paddingAll,
      isRoot && section !== "hero" ? "14px" : undefined,
    ),
    ...positionStyle(component),
  };

  return (
    <div style={style}>
      {contents.map((child, index) => (
        <FlexComponent key={index} component={child} />
      ))}
    </div>
  );
}

function FlexText({ component }: { component: FlexObject }) {
  const text =
    typeof component.text === "string" ? component.text : "Flex text";
  const spans = Array.isArray(component.contents)
    ? component.contents.filter(isObject)
    : [];
  const wrap = component.wrap !== false;
  const maxLines = numberValue(component.maxLines);

  const style: CSSProperties = {
    color: typeof component.color === "string" ? component.color : undefined,
    fontSize:
      typeof component.size === "string"
        ? fontSizes[component.size] || pixelValue(component.size)
        : undefined,
    fontWeight: component.weight === "bold" ? 700 : 400,
    fontStyle: component.style === "italic" ? "italic" : undefined,
    textDecoration:
      component.decoration === "underline"
        ? "underline"
        : component.decoration === "line-through"
          ? "line-through"
          : undefined,
    textAlign:
      component.align === "center"
        ? "center"
        : component.align === "end"
          ? "right"
          : undefined,
    whiteSpace: wrap ? "pre-wrap" : "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    overflowWrap: "anywhere",
    marginTop: spaceValue(component.margin),
    flex: numberValue(component.flex),
    width: sizeValue(component.width),
    height: sizeValue(component.height),
    minWidth: sizeValue(component.minWidth),
    minHeight: sizeValue(component.minHeight),
    maxWidth: sizeValue(component.maxWidth),
    maxHeight: sizeValue(component.maxHeight),
    lineHeight:
      typeof component.lineSpacing === "string"
        ? pixelValue(component.lineSpacing)
        : 1.35,
    display: maxLines ? "-webkit-box" : undefined,
    WebkitBoxOrient: maxLines ? "vertical" : undefined,
    WebkitLineClamp: maxLines,
    ...positionStyle(component),
  };

  return (
    <div style={style}>
      {spans.length > 0
        ? spans.map((span, index) => <FlexSpan key={index} span={span} />)
        : text}
    </div>
  );
}

function FlexSpan({ span }: { span: FlexObject }) {
  if (span.type !== "span" || typeof span.text !== "string") {
    return null;
  }

  return (
    <span
      style={{
        color: typeof span.color === "string" ? span.color : undefined,
        fontSize:
          typeof span.size === "string"
            ? fontSizes[span.size] || pixelValue(span.size)
            : undefined,
        fontWeight: span.weight === "bold" ? 700 : undefined,
        fontStyle: span.style === "italic" ? "italic" : undefined,
        textDecoration:
          span.decoration === "underline"
            ? "underline"
            : span.decoration === "line-through"
              ? "line-through"
              : undefined,
      }}
    >
      {span.text}
    </span>
  );
}

function FlexImage({
  component,
  section,
}: {
  component: FlexObject;
  section?: string;
}) {
  if (typeof component.url !== "string" || !component.url) {
    return null;
  }

  const width =
    component.size === "full"
      ? "100%"
      : sizeValue(component.width) ||
        componentSize(component.size) ||
        (section === "hero" ? "100%" : "48px");
  const height =
    sizeValue(component.height) || (component.size === "full" ? "auto" : width);
  const aspectRatio =
    typeof component.aspectRatio === "string"
      ? component.aspectRatio.replace(":", " / ")
      : undefined;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={component.url}
      alt=""
      referrerPolicy="no-referrer"
      style={{
        width,
        maxWidth: "100%",
        height,
        minWidth: sizeValue(component.minWidth),
        minHeight: sizeValue(component.minHeight),
        maxHeight: sizeValue(component.maxHeight),
        aspectRatio,
        objectFit: component.aspectMode === "fit" ? "contain" : "cover",
        objectPosition:
          component.gravity === "bottom"
            ? "bottom"
            : component.gravity === "top"
              ? "top"
              : "center",
        borderRadius: pixelValue(component.cornerRadius),
        backgroundColor:
          typeof component.backgroundColor === "string"
            ? component.backgroundColor
            : undefined,
        marginTop: spaceValue(component.margin),
        flex: numberValue(component.flex),
        ...positionStyle(component),
      }}
    />
  );
}

function FlexVideo({ component }: { component: FlexObject }) {
  const altContent = isObject(component.altContent)
    ? component.altContent
    : undefined;

  if (altContent) {
    return <FlexComponent component={altContent} section="hero" />;
  }

  if (typeof component.previewUrl !== "string") {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={component.previewUrl}
      alt="Video preview"
      referrerPolicy="no-referrer"
      style={{
        width: "100%",
        aspectRatio:
          typeof component.aspectRatio === "string"
            ? component.aspectRatio.replace(":", " / ")
            : undefined,
        objectFit: "cover",
      }}
    />
  );
}

function FlexButton({ component }: { component: FlexObject }) {
  const action = isObject(component.action) ? component.action : {};
  const label = typeof action.label === "string" ? action.label : "Flex action";
  const primary = component.style === "primary";
  const secondary = component.style === "secondary";
  const color =
    typeof component.color === "string" ? component.color : "#06c755";

  return (
    <div
      style={{
        marginTop: spaceValue(component.margin),
        padding: component.height === "sm" ? "6px 10px" : "9px 10px",
        borderRadius: pixelValue(component.cornerRadius) ?? "7px",
        backgroundColor: primary ? color : secondary ? "#f3f4f6" : undefined,
        color: primary ? "#ffffff" : color,
        border: primary || secondary ? undefined : `1px solid ${color}`,
        textAlign: "center",
        fontSize: "12px",
        fontWeight: 600,
        flex: numberValue(component.flex),
        width: sizeValue(component.width),
        maxWidth: sizeValue(component.maxWidth),
        ...positionStyle(component),
      }}
    >
      {label}
    </div>
  );
}

function FlexIcon({ component }: { component: FlexObject }) {
  if (typeof component.url !== "string" || !component.url) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={component.url}
      alt=""
      referrerPolicy="no-referrer"
      style={{
        width: componentSize(component.size) ?? "16px",
        height: componentSize(component.size) ?? "16px",
        objectFit: "contain",
        aspectRatio:
          typeof component.aspectRatio === "string"
            ? component.aspectRatio.replace(":", " / ")
            : undefined,
        marginTop: spaceValue(component.margin),
        flex: numberValue(component.flex),
        ...positionStyle(component),
      }}
    />
  );
}

function parseContents(rawJson?: string): FlexObject | null {
  if (!rawJson?.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawJson) as unknown;
    if (!isObject(parsed)) {
      return null;
    }

    const contents = parsed.type === "flex" ? parsed.contents : parsed;
    if (
      !isObject(contents) ||
      (contents.type !== "bubble" && contents.type !== "carousel")
    ) {
      return null;
    }

    return contents;
  } catch {
    return null;
  }
}

function isObject(value: unknown): value is FlexObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function pixelValue(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) {
    return undefined;
  }

  if (/^\d+(\.\d+)?(px|%)$/.test(value)) {
    return value;
  }

  return spacing[value];
}

function spaceValue(value: unknown): string | undefined {
  return typeof value === "string"
    ? spacing[value] || pixelValue(value)
    : undefined;
}

function sizeValue(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return value === "full"
    ? "100%"
    : componentSizes[value] || spacing[value] || pixelValue(value);
}

function componentSize(value: unknown): string | undefined {
  return typeof value === "string"
    ? componentSizes[value] || pixelValue(value)
    : undefined;
}

function bubbleWidth(value: unknown): string {
  return typeof value === "string"
    ? bubbleWidths[value] || bubbleWidths.mega
    : bubbleWidths.mega;
}

function paddingValue(
  side: unknown,
  all: unknown,
  fallback?: string,
): string | undefined {
  return sizeValue(side) ?? sizeValue(all) ?? fallback;
}

function positionStyle(component: FlexObject): CSSProperties {
  const style: CSSProperties = {};

  if (component.position === "absolute") {
    style.position = "absolute";
  } else if (component.position === "relative") {
    style.position = "relative";
  }

  const top = sizeValue(component.offsetTop);
  const bottom = sizeValue(component.offsetBottom);
  const start = sizeValue(component.offsetStart);
  const end = sizeValue(component.offsetEnd);

  if (top) style.top = top;
  if (bottom) style.bottom = bottom;
  if (start) style.left = start;
  if (end) style.right = end;

  return style;
}

function gradientValue(value: unknown): string | undefined {
  if (
    !isObject(value) ||
    value.type !== "linearGradient" ||
    typeof value.startColor !== "string" ||
    typeof value.endColor !== "string"
  ) {
    return undefined;
  }

  const angle = typeof value.angle === "string" ? value.angle : "0deg";
  const stops = [`${value.startColor} 0%`];

  if (typeof value.centerColor === "string") {
    const position =
      typeof value.centerPosition === "string" ? value.centerPosition : "50%";
    stops.push(`${value.centerColor} ${position}`);
  }

  stops.push(`${value.endColor} 100%`);
  return `linear-gradient(${angle}, ${stops.join(", ")})`;
}

function blockStyleValue(value?: FlexObject): CSSProperties {
  if (!value) {
    return {};
  }

  return {
    backgroundColor:
      typeof value.backgroundColor === "string"
        ? value.backgroundColor
        : undefined,
    borderTop:
      value.separator === true
        ? `1px solid ${
            typeof value.separatorColor === "string"
              ? value.separatorColor
              : "#e5e7eb"
          }`
        : undefined,
  };
}
