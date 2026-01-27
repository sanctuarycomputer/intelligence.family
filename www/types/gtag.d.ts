declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date | Record<string, any>,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export {};
