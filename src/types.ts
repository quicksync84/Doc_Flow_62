export interface ContentTag {
  tag: string;
  content: string;
}

export interface ParentTag {
  name: string;
  children: ContentTag[];
}

export interface ParsedContent {
  parentTags: ParentTag[];
}

export interface PluginMessage {
  type: 'parse-content' | 'process-complete' | 'error';
  content?: string;
  parentTags?: string[];
  error?: string;
}