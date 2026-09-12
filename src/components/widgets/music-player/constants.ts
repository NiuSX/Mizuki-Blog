import ycslCover from "../../../assets/music/cover/ycsl.webp?url";
import hwysyCover from "../../../assets/music/cover/hwysy.webp?url";
import yfCover from "../../../assets/music/cover/yf.webp?url";

import type { Song } from "./types";

export const STORAGE_KEY_VOLUME = "music-player-volume";

export const DEFAULT_VOLUME = 0.7;

export const DEFAULT_COVER_URL = "/favicon/favicon.ico";

export const LOCAL_PLAYLIST: Song[] = [
	{
		id: 1,
		title: "海娃与三丫",
		artist: "我有一个朋友",
		cover: hwysyCover,
		url: "assets/music/url/hwysy.mp3",
		duration: 359,
	},
	{
		id: 2,
		title: "远方",
		artist: "一起同过窗",
		cover: yfCover,
		url: "assets/music/url/yf.mp3",
		duration: 208,
	},
	{
		id: 3,
		title: "一程山路",
		artist: "毛不易",
		cover: ycslCover,
		url: "assets/music/url/ycsl.mp3",
		duration: 215,
	},

];

export const DEFAULT_SONG: Song = {
	title: "Sample Song",
	artist: "Sample Artist",
	cover: DEFAULT_COVER_URL,
	url: "",
	duration: 0,
	id: 0,
};

export const DEFAULT_METING_API =
	"https://www.bilibili.uno/api?server=:server&type=:type&id=:id&auth=:auth&r=:r";
export const DEFAULT_METING_ID = "14164";
export const DEFAULT_METING_SERVER = "netease";
export const DEFAULT_METING_TYPE = "playlist";

export const ERROR_DISPLAY_DURATION = 3000;
export const SKIP_ERROR_DELAY = 1000;
