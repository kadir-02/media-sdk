

export interface UseLightboxNativeOptions<T> {
  items: T[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  onIndexChange?: (index: number, item: T) => void;
}

export interface UseLightboxNativeReturn<T> {
  currentIndex: number;
  currentItem: T | null;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

export function useLightboxNative<T>(_options: UseLightboxNativeOptions<T>): UseLightboxNativeReturn<T> {
  throw new Error(
    "useLightboxNative is not implemented in this take-home submission — scoped out due to time. " +
      "See media-ui-native/src/Lightbox/index.ts for the intended contract and README 'What we cut'."
  );
}

export interface UseReelSwiperNativeOptions<T> {
  items: T[];
  initialIndex?: number;
  onActiveIndexChange?: (index: number, item: T) => void;
}

export interface UseReelSwiperNativeReturn<T> {
  activeIndex: number;
  activeItem: T | null;
  goToIndex: (index: number) => void;
}

export function useReelSwiperNative<T>(
  _options: UseReelSwiperNativeOptions<T>
): UseReelSwiperNativeReturn<T> {
  throw new Error(
    "useReelSwiperNative is not implemented in this take-home submission — scoped out due to time. " +
      "See README 'What we cut' for the FlatList-based approach we'd take."
  );
}
