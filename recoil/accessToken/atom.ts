import { atom } from "recoil";

const accessTokenAtom = atom({
  key: "accessToken",
  default: "",
});

export default accessTokenAtom;
