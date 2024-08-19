import {OrderConfig} from "@/modules/command";
import {AuthLevel} from "@/modules/management/auth";
import {MessageScope} from "@/modules/message";
import {Cookies} from "./module/cookies";
import {SignConfig} from "./module/config";
import {SignClass} from "./module/sign";
import bot from "ROOT";
import {createServer} from "./server";
import {definePlugin} from "@/modules/plugin";
import SignRouter from "#/genshin_sign/routes/sign-route";

export const cookies = new Cookies();
export const signConfig = new SignConfig(bot.file);
export const signClass = new SignClass(signConfig, cookies);

const sign: OrderConfig = {
	type: "order",
	cmdKey: "genshin.mys.sign",
	desc: [ "米游社签到", ""],
	headers: [ "mysSign"],
	regexps: [ "" ],
	main: "achieves/sign",
	auth: AuthLevel.Manager,
	detail: "使用配置中cookie的米游社签到",
	scope: MessageScope.Private
}

const privateSign: OrderConfig = {
	type: "order",
	cmdKey: "genshin.mys.private-sign",
	desc: [ "私人服务列表米游社签到", "(账户编号)" ],
	headers: [ "sub_mys_sign" ],
	regexps: [ "(\\d+)?" ],
	main: "achieves/private/sign"
};

// test-plugin/init.ts
export default definePlugin( {
	name: "genshin_sign",
	cfgList: [ sign, privateSign, ],
	repo: {
		owner: "wickedll",
		repoName: "genshin_sign", // 仓库名称
		ref: "main" // 分支名称
	},
	server: {
		routers:{
			"/api/sign" : SignRouter
		}
	},
	mounted() {
		console.log( "[genshin_sign] 插件初始化")
		// 插件行为
		if(!signConfig.openTiming){
			createServer(signConfig, bot.logger);
		}
	}
} );
