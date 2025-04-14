export interface Plugin {
  handleMessage(msg: any): Promise<void>;
}

export interface PluginMessage {
  type: string;
  [key: string]: any;
}

export interface Warning {
  instance: InstanceNode;
  node: TextNode;
  originalState: boolean;
  resolved: boolean;
}

export interface ComponentContent {
  [key: string]: string;
}

export interface Component {
  number: string;
  content: ComponentContent;
}

export interface AnalysisResult {
  name: string;
  tags: string[];
  errors: string[];
  warnings: {
    type: string;
    tag: string;
    message: string;
    matchedTag?: string;
    distance?: number;
  }[];
}