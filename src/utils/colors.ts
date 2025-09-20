const tintColorLight = "#2f95dc";

export interface ColorTheme {
  text: string;
  background: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

export interface Colors {
  light: ColorTheme;
}

const Colors: Colors = {
  light: {
    text: "#000",
    background: "#fff",
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
  },
};

export default Colors;
