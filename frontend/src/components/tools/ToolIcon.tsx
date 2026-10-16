import {
  AlignLeft, ArrowDownUp, ArrowRightLeft, BookOpen, Bot, Braces, CalendarDays,
  Crop, Droplet, Edit3, Eye, File, FileCheck, FileCode, FileImage, FileOutput,
  FileSpreadsheet, FileText, FileType, FileUp, FolderOpen, FormInput, GitCompare,
  Grid3X3, Hash, HelpCircle, Image, Languages, Layers, Lock, Merge,
  MessageSquare, Minimize2, Pen, PenLine, PenTool, Presentation, QrCode,
  RotateCw, Scan, ScanLine, Scissors, Search, Share2, Shield, Sparkles, Stamp,
  Trash2, Type, Unlock, Wrench,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps registry icon names to Lucide components.
 * Unknown names fall back to FileText so a bad registry entry
 * can never break rendering.
 */
const icons: Record<string, LucideIcon> = {
  AlignLeft, ArrowDownUp, ArrowRightLeft, BookOpen, Bot, Braces, CalendarDays,
  Crop, Droplet, Edit3, Eye, File, FileCheck, FileCode, FileImage, FileOutput,
  FileSpreadsheet, FileText, FileType, FileUp, FolderOpen, FormInput, GitCompare,
  Grid3X3, Hash, HelpCircle, Image, Languages, Layers, Lock, Merge,
  MessageSquare, Minimize2, Pen, PenLine, PenTool, Presentation, QrCode,
  RotateCw, Scan, ScanLine, Scissors, Search, Share2, Shield, Sparkles, Stamp,
  Trash2, Type, Unlock, Wrench,
};

export function ToolIcon({
  name,
  className = '',
}: {
  name: string;
  className?: string;
}) {
  const Icon = icons[name] ?? FileText;
  return <Icon className={className} aria-hidden="true" />;
}
