/**
 * SpicyChicken — React bindings for sc.css.
 *
 * Thin wrappers over the design system's own classes: every component emits the
 * markup the style guide already documents. sc.css remains the source of truth.
 */

// Layout
export { Wrap, type WrapProps } from './Wrap';
export { Section, type SectionProps } from './Section';
export { Grid, type GridProps } from './Grid';
export { Stack, type StackProps } from './Stack';
export { Row, type RowProps } from './Row';

// Page chrome
export { Masthead, type MastheadProps } from './Masthead';
export { Brand, type BrandProps } from './Brand';
export { Nav, type NavProps, type NavItem } from './Nav';
export { ThemeToggle, type ThemeToggleProps, type ThemeChoice } from './ThemeToggle';
export { Footer, type FooterProps } from './Footer';
export { Watermark, type WatermarkProps } from './Watermark';
export { Mark, type MarkProps } from './Mark';

// Title block
export { Eyebrow, type EyebrowProps } from './Eyebrow';
export { Dek, type DekProps } from './Dek';
export { Meta, type MetaProps } from './Meta';
export { Hero, type HeroProps } from './Hero';

// Surfaces
export { Card, type CardProps } from './Card';
export { Tile, type TileProps } from './Tile';
export { Delta, type DeltaProps } from './Delta';
export { Callout, type CalloutProps } from './Callout';
export { Notice, type NoticeProps } from './Notice';
export { Doc, type DocProps } from './Doc';

// Controls
export { Button, type ButtonProps } from './Button';
export { Chip, type ChipProps } from './Chip';
export { Input, type InputProps } from './Input';
export { Select, type SelectProps } from './Select';
export { Checkbox, type CheckboxProps } from './Checkbox';
export { Field, type FieldProps } from './Field';
export { Filters, type FiltersProps } from './Filters';

// Data
export { Table, type TableProps, type TableColumn } from './Table';
export { Tabs, type TabsProps, type TabItem } from './Tabs';
export { Legend, type LegendProps, type LegendItem } from './Legend';
export { Tooltip, type TooltipProps, type TooltipRow } from './Tooltip';
export { Details, type DetailsProps } from './Details';

// Brand assets
export { SC_MARKS, type MarkForm } from './marks.generated';
