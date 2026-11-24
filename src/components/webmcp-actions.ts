export type WebMcpHandlers = {
  onNavigate: (page: string) => void;
  onFilterProjects: (filter: string) => void;
  onPrefillContact: (values: { fullname: string; email: string; message: string }) => void;
};

let currentHandlers: WebMcpHandlers | null = null;

export function setWebMcpHandlers(handlers: WebMcpHandlers) {
  currentHandlers = handlers;
  return () => {
    if (currentHandlers === handlers) currentHandlers = null;
  };
}

export function getWebMcpHandlers() {
  return currentHandlers;
}
