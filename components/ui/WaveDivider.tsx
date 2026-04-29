interface WaveDividerProps {
  topColor: string;
  bottomColor: string;
}

export function WaveDivider({ topColor, bottomColor }: WaveDividerProps) {
  return (
    <div style={{ background: topColor, paddingBottom: 60, marginBottom: -60 }}>
      <div
        style={{
          background: bottomColor,
          borderRadius: "50% 50% 0 0 / 60px 60px 0 0",
          height: 60,
        }}
      />
    </div>
  );
}
