---
name: Pokemon Battle Tool Google Default
version: 1.0.0
description: Clean Google-inspired mobile-first design system for a Pokemon battle support tool.

colors:
  background:
    app: "#F8FAFD"
    surface: "#FFFFFF"
    surfaceVariant: "#F1F5F9"
    elevated: "#FFFFFF"

  text:
    primary: "#1F2937"
    secondary: "#4B5563"
    muted: "#6B7280"
    inverse: "#FFFFFF"

  primary:
    main: "#1A73E8"
    container: "#E8F0FE"
    onContainer: "#174EA6"

  secondary:
    main: "#5F6368"
    container: "#F1F3F4"

  success:
    main: "#188038"
    container: "#E6F4EA"

  warning:
    main: "#F29900"
    container: "#FEF7E0"

  danger:
    main: "#D93025"
    container: "#FCE8E6"

  border:
    default: "#DADCE0"
    subtle: "#E5E7EB"
    focus: "#1A73E8"

typography:
  fontFamily:
    base: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  size:
    xs: "0.75rem"
    sm: "0.875rem"
    base: "1rem"
    md: "1.0625rem"
    lg: "1.25rem"
    xl: "1.5rem"
    xxl: "2rem"
  weight:
    regular: 400
    medium: 500
    semibold: 600
    bold: 700

spacing:
  base: "4px"
  scale:
    1: "4px"
    2: "8px"
    3: "12px"
    4: "16px"
    5: "20px"
    6: "24px"
    8: "32px"
    10: "40px"

radius:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  pill: "999px"

shadow:
  card: "0 1px 2px rgba(60, 64, 67, 0.15), 0 1px 3px rgba(60, 64, 67, 0.10)"
  elevated: "0 4px 12px rgba(60, 64, 67, 0.18)"

layout:
  maxWidth: "960px"
  mobilePadding: "16px"
  desktopPadding: "24px"
---

# Overview

ポケモンバトルツールは、相手の選出予測と自分のおすすめ選出を分かりやすく確認するためのモバイルファーストなWeb UIです。このデザインシステムは、Google / Material Design 3 風の標準的でクリーンな見た目を土台にします。

黒背景、発光、HUD風の装飾ではなく、白から淡いグレーの背景、余白のあるカード、読みやすい文字、押しやすいボタンで構成します。

# Design Principles

1. **子どもにも分かる**: 文言は短く、専門用語を避ける。
2. **情報をカードで整理する**: 登録、保存、使い方、予測、スコアをカード単位でまとめる。
3. **モバイルファースト**: iPhone Safariで横スクロールを出さず、44px以上のタップ領域を確保する。
4. **迷わない状態表示**: 成功は緑、注意はオレンジ、削除やエラーは赤で示し、色だけに頼らず短い説明を添える。
5. **既存機能を守る**: UI変更時も登録、編集、削除、候補選択、予測、保存、復元を壊さない。

# Colors

- App background: `#F8FAFD`
- Surface/card: `#FFFFFF`
- Surface variant/chips: `#F1F5F9`
- Primary action: `#1A73E8`
- Primary container: `#E8F0FE`
- Success: `#188038` / `#E6F4EA`
- Warning: `#F29900` / `#FEF7E0`
- Danger: `#D93025` / `#FCE8E6`
- Border: `#DADCE0` / `#E5E7EB`

Use blue for navigation, selected tabs, primary buttons, focus rings, and important scores. Use green for good results, orange for warnings, and red for destructive actions or errors.

# Typography

- Base font: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Body text: `1rem`, regular to medium weight.
- Helper text: `0.875rem`, muted color.
- Section titles: `1.25rem` to `1.5rem`, semibold or bold.
- App title: up to `2rem`, bold.
- Avoid tiny labels below `0.75rem`.

# Spacing

Use a 4px spacing scale.

- Screen padding: 16px on mobile, 24px or more on desktop.
- Card padding: 16px to 24px.
- Component gap: 8px to 16px.
- Section gap: 16px to 24px.
- Keep enough space between form fields so labels and inputs are easy to scan.

# Layout

- Center content with max width around `960px`.
- Use a single-column flow on mobile.
- Use responsive grids only when each item can shrink without overflow.
- Chips, badges, and score breakdowns must wrap.
- Do not introduce horizontal scrolling on iPhone Safari widths.

# Shape

- Inputs: 12px radius.
- Cards: 16px to 24px radius.
- Top tabs, chips, badges: pill radius.
- Pokemon image frames: circle.

# Elevation

Use subtle Material-like elevation.

- Cards: `0 1px 2px rgba(60, 64, 67, 0.15), 0 1px 3px rgba(60, 64, 67, 0.10)`.
- Floating lists or active panels: `0 4px 12px rgba(60, 64, 67, 0.18)`.
- Avoid neon glows and heavy dark shadows.

# Components

## Header

Use a white or pale blue card. Show the title and one short sentence.

- Title: `ポケモンバトルツール`
- Description: `相手の選出を予測して、自分のおすすめを確認できます。`

## Navigation

Bottom navigation should be simple and app-like. Active state uses blue text or a pale blue background. Buttons must be easy to tap.

## Tabs

Top tabs use segmented pill buttons. Active tab is blue with white text. Inactive tab is a pale gray surface.

## Cards

Cards are white, rounded, lightly bordered, and lightly elevated. Put headings, short descriptions, and content in clear groups.

## Inputs

Inputs have visible labels, white backgrounds, gray borders, and blue focus rings. Placeholder text should be short.

## Buttons

- Primary: blue background with white text.
- Secondary: white background, blue text, subtle border.
- Danger: red text or red background/container for delete actions.
- Disabled: pale gray, muted text, no strong shadow.

## Chips and Badges

Use pale backgrounds and dark text. Chips must wrap and must not create horizontal scrolling. Use chips for types, moves, abilities, items, roles, and score breakdowns.

## Pokemon Images

Use a white or pale blue circular frame.

- Register screen: 96px to 140px.
- Saved list: 64px to 96px.
- Results: 56px to 80px.
- If no image is available, show a `?` placeholder.
- Image alt text should be like `ガブリアスの画像`.

## Score Results

Show rank badges for 1st, 2nd, and 3rd. Scores are large, clear, and blue or green. Score details are chips that wrap.

## Warning and Error Messages

Warnings use a pale orange card and a short sentence, for example: `Aに多く振っていますが、物理技が少なめです。`

Errors use a pale red card and a short sentence, for example: `詳しい情報を表示できませんでした。入力はそのまま続けられます。`

# Interaction

- Keep all native focus rings or replace them with a clear blue focus ring.
- Buttons and interactive chips should have at least 44px tap height when possible.
- Hover and active states should be subtle, not flashy.
- Suggestions lists open as white elevated panels.

# Accessibility

- Maintain contrast between text and backgrounds.
- Use semantic `button` elements for actions.
- Pair visible labels with inputs where possible.
- Do not rely on color alone to explain a state.
- Preserve keyboard focus styles.
- Use short, simple Japanese wording.
- Ensure the layout does not overflow horizontally on iPhone Safari.

# Do / Don’t

## Do

- Use bright backgrounds and clean white cards.
- Use blue for primary actions and selected states.
- Use green, orange, and red consistently for success, warning, and danger.
- Wrap chips and long score breakdowns.
- Keep descriptions short and helpful.

## Don’t

- Do not return to cyber, HUD, neon, glowing, or dark sci-fi styling.
- Do not show developer words such as `PokeAPI`, `API`, `endpoint`, `cache`, `fetch`, `slug`, or `JSON` in the UI.
- Do not hide focus rings.
- Do not make a layout that requires horizontal scrolling on mobile.
- Do not use long technical explanations for children-facing UI.
