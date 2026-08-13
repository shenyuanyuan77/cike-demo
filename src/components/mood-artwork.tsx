import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

interface MoodArtworkProps {
  rounded?: number;
}

/**
 * 品牌化的「城市晚风」封面。
 * 使用矢量图形而不是远程占位图，保证离线、Web 与原生端显示一致。
 */
export function MoodArtwork({ rounded = 18 }: MoodArtworkProps) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 240" accessibilityLabel="紫色暮光城市道路歌单封面">
      <Defs>
        <SvgLinearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#161A56" />
          <Stop offset="0.48" stopColor="#73528E" />
          <Stop offset="1" stopColor="#F0A4C2" />
        </SvgLinearGradient>
        <SvgLinearGradient id="road" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2B315A" />
          <Stop offset="1" stopColor="#11152A" />
        </SvgLinearGradient>
        <SvgLinearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#8D68FF" stopOpacity="0" />
          <Stop offset="0.5" stopColor="#E0B4FF" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#8D68FF" stopOpacity="0" />
        </SvgLinearGradient>
      </Defs>

      <Rect width="320" height="240" rx={rounded} fill="url(#sky)" />
      <Circle cx="238" cy="58" r="34" fill="#F7CBDB" opacity="0.22" />
      <Circle cx="238" cy="58" r="18" fill="#FFD9E7" opacity="0.32" />

      <G opacity="0.88">
        <Rect x="0" y="104" width="32" height="54" fill="#191C3C" />
        <Rect x="28" y="88" width="44" height="72" fill="#20234A" />
        <Rect x="68" y="116" width="29" height="44" fill="#171B3A" />
        <Rect x="226" y="101" width="38" height="58" fill="#20234A" />
        <Rect x="260" y="79" width="60" height="81" fill="#181C3B" />
      </G>
      <G fill="#F3B7CF" opacity="0.65">
        <Rect x="38" y="101" width="4" height="4" rx="1" />
        <Rect x="53" y="115" width="4" height="4" rx="1" />
        <Rect x="274" y="96" width="4" height="4" rx="1" />
        <Rect x="293" y="112" width="4" height="4" rx="1" />
        <Rect x="239" y="116" width="4" height="4" rx="1" />
      </G>

      <Path d="M0 153L119 142L201 142L320 154V240H0Z" fill="url(#road)" />
      <Path d="M132 145L154 145L117 240H55Z" fill="#1A1D36" />
      <Path d="M166 145L188 145L268 240H202Z" fill="#181B34" />
      <Path d="M159 150L165 150L171 188H153Z" fill="#F8D4E4" opacity="0.85" />
      <Path d="M148 199L176 199L189 240H132Z" fill="url(#glow)" opacity="0.72" />

      <G stroke="#A98BFF" strokeWidth="3" opacity="0.75">
        <Path d="M81 65V163" />
        <Path d="M245 71V164" />
      </G>
      <G fill="#E8C5FF">
        <Circle cx="81" cy="70" r="5" />
        <Circle cx="245" cy="76" r="5" />
      </G>
      <G fill="#F5A6C3">
        <Rect x="21" y="169" width="18" height="4" rx="2" />
        <Rect x="271" y="171" width="21" height="4" rx="2" />
        <Rect x="77" y="181" width="15" height="3" rx="1.5" />
      </G>
    </Svg>
  );
}
