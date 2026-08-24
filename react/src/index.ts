/**
 * SpicyChicken — React bindings for sc.css (v2.1.0).
 *
 * Thin wrappers over the design system's own classes: every component emits the
 * markup the style guide already documents, forwards its ref to the element it
 * renders, and adds no styling of its own. sc.css remains the source of truth.
 * ESM only.
 */

// Layout
export { Wrap, type WrapProps } from './Wrap.js';
export { Section, type SectionProps } from './Section.js';
export { Grid, type GridProps } from './Grid.js';
export { Stack, type StackProps } from './Stack.js';
export { Row, type RowProps } from './Row.js';

// Page chrome
export { SkipLink, type SkipLinkProps } from './SkipLink.js';
export { Masthead, type MastheadProps } from './Masthead.js';
export { Brand, type BrandProps } from './Brand.js';
export { Nav, type NavProps, type NavItem } from './Nav.js';
export { Sep, type SepProps } from './Sep.js';
export { ThemeToggle, type ThemeToggleProps, type ThemeChoice } from './ThemeToggle.js';
export { Footer, type FooterProps } from './Footer.js';
export { Watermark, type WatermarkProps } from './Watermark.js';
export { Mark, type MarkProps } from './Mark.js';

// Title block
export { Title, type TitleProps } from './Title.js';
export { Eyebrow, type EyebrowProps } from './Eyebrow.js';
export { Dek, type DekProps } from './Dek.js';
export { Meta, type MetaProps } from './Meta.js';
export { Hero, type HeroProps } from './Hero.js';
export { Toc, type TocProps, type TocItem } from './Toc.js';

// Surfaces
export { Card, type CardProps } from './Card.js';
export { Tile, type TileProps } from './Tile.js';
export { Delta, type DeltaProps } from './Delta.js';
export { Callout, type CalloutProps } from './Callout.js';
export { Notice, type NoticeProps } from './Notice.js';
export { Empty, type EmptyProps } from './Empty.js';
export { Doc, type DocProps } from './Doc.js';

// Controls
export { Button, type ButtonProps, type ButtonAnchorProps, type ButtonButtonProps } from './Button.js';
export { Chip, type ChipProps } from './Chip.js';
export { QuietLink, type QuietLinkProps } from './QuietLink.js';
export { Input, type InputProps } from './Input.js';
export { Select, type SelectProps } from './Select.js';
export { Checkbox, type CheckboxProps } from './Checkbox.js';
export { Field, type FieldProps } from './Field.js';
export { Filters, type FiltersProps } from './Filters.js';

// Data
export { Table, type TableProps, type TableColumn, type SortDirection } from './Table.js';
export { Tabs, type TabsProps, type TabItem } from './Tabs.js';
export { Chart, type ChartProps } from './Chart.js';
export { Spark, type SparkProps } from './Spark.js';
export { Legend, type LegendProps, type LegendItem } from './Legend.js';
export { Tooltip, type TooltipProps, type TooltipRow } from './Tooltip.js';
export { Details, type DetailsProps } from './Details.js';
export { Figure, type FigureProps, type NoteProps, Note } from './Figure.js';
export { Frame, type FrameProps } from './Frame.js';
export { Media, type MediaProps } from './Media.js';

// Brand assets and the theme boot script (generated at build time)
export {
  SC_MARKS,
  MARK_COLOR_DARK,
  MARK_COLOR_LIGHT,
  MARK_MONO_CREAM,
  MARK_MONO_INK,
  MARK_AVATAR_TILE,
  MARK_LOCKUP_CREAM,
  MARK_LOCKUP_INK,
  type MarkForm,
} from './marks.generated.js';
export { THEME_BOOT_SCRIPT } from './theme.generated.js';
