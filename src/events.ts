export type Tool = 'magnitude' | 'phase';

export type EditStartEvent = {
  tool: Tool,
}

export type EditEvent = {
  angle: number,
  delta: number,
  tool: Tool,
};

export type EditEndEvent = {
  editFired: boolean,
  tool: Tool,
};