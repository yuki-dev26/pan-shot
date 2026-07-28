import { localeToPath, locales, type Locale } from "@panshot/shared";
import { getSiteUrl } from "./site";

export const hreflangCodes: Record<Locale, string> = {
  ja: "ja",
  en: "en",
  ko: "ko",
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
};

export const openGraphLocales: Record<Locale, string> = {
  ja: "ja_JP",
  en: "en_US",
  ko: "ko_KR",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
};

export const featureLists: Record<Locale, string[]> = {
  ja: [
    "画像の見どころ（ズーム点）指定",
    "寄り・カット・引きで画像が映えるカメラワーク演出",
    "ブラウザ上での動画書き出し・ダウンロード",
    "登録不要・完全無料",
  ],
  en: [
    "Pick highlight points (zoom targets) on your image",
    "Cinematic zoom-in, cut, and pull-back camera moves",
    "Export and download the video right in your browser",
    "No sign-up, completely free",
  ],
  ko: [
    "이미지의 하이라이트(줌 포인트) 지정",
    "클로즈업·컷·풀백으로 이미지를 돋보이게 하는 카메라 워크 연출",
    "브라우저에서 바로 동영상 내보내기 및 다운로드",
    "가입 불필요, 완전 무료",
  ],
  "zh-CN": [
    "指定图片的亮点（缩放点）",
    "推近、切换、拉远，打造出彩的运镜效果",
    "在浏览器中直接导出并下载视频",
    "无需注册，完全免费",
  ],
  "zh-TW": [
    "指定圖片的亮點（縮放點）",
    "推近、切換、拉遠，打造出彩的運鏡效果",
    "在瀏覽器中直接匯出並下載影片",
    "免註冊、完全免費",
  ],
};

export function absoluteLocaleUrl(locale: Locale): string {
  return `${getSiteUrl()}${localeToPath(locale)}`;
}

export function hreflangAlternates(): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[hreflangCodes[locale]] = absoluteLocaleUrl(locale);
  }
  languages["x-default"] = absoluteLocaleUrl("ja");
  return languages;
}
