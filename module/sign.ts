import Adachi from "ROOT";
import {scheduleJob} from "node-schedule";
import {hasSignPromise, signPromise, userGameRolesPromise} from "../utils/promise";
import {UserGameRolesData} from "#/genshin_sign/utils/resultObjectType";
import {Cookies} from "./cookies";
import {SignConfig} from "./config";


export class SignClass {
	private cookies: Cookies;
	
	constructor(signConfig: SignConfig, cookies: Cookies) {
		this.cookies = cookies;
		if(signConfig.openTiming){
			Adachi.logger.info("米游社签到定时已开启");
			scheduleJob( signConfig.cron, async () => {
				await this.sign(null, null);
			} );
		}
	}
	
	public async sign(sendMessage, cookies): Promise<void> {
		const cookieList = cookies ? cookies : this.cookies.getCookies();
		let users:UserGameRolesData[] | undefined
		// 用户数量
		let userIndex:number=0;
		for (const cookie of cookieList) {
			try {
				users = await userGameRolesPromise(cookie) as UserGameRolesData[];
			} catch (error) {
				if (error !== "gotten") {
					sendMessage ? await sendMessage(error as string) : await Adachi.client.sendPrivateMsg( Adachi.config.master, error as string );
					continue;
				}
			}
			Adachi.logger.info("绑定角色信息：" + JSON.stringify(users));
			for (const item of <UserGameRolesData[]>users) {
				try {
					Adachi.logger.info(`第${userIndex}位绑定角色信息：`,item);
					const signResult = await hasSignPromise(item.game_uid, item.region, cookie);
					
					console.log(signResult)
					Adachi.logger.info("查询是否签到信息：" + JSON.stringify(signResult));
	
					if (signResult.is_sign) {
						Adachi.logger.info(`用户 ${item.game_uid} ${signResult.today} 已签到，请勿重复签到`);
						const msg = `用户 ${item.game_uid} ${signResult.today} 已签到，请勿重复签到，总签到天数：${signResult.total_sign_day}`;
						sendMessage ? await sendMessage(msg) : await Adachi.client.sendPrivateMsg( Adachi.config.master, msg );
						continue;
					}
					const sign: Object = await signPromise(item.game_uid, item.region, cookie);
	
					Adachi.logger.info("签到信息：" + JSON.stringify(sign));
	
					Adachi.logger.info(`用户 ${item.game_uid} ${signResult.today} 签到成功，总签到天数：${signResult.total_sign_day + 1}`);
					const msg = `用户 ${item.game_uid} ${signResult.today} 签到成功，总签到天数：${signResult.total_sign_day + 1}`;
					sendMessage ? await sendMessage(msg) : await Adachi.client.sendPrivateMsg( Adachi.config.master, msg );
				} catch (error) {
					if (error !== "gotten") {
						sendMessage ? await sendMessage(error as string) : await Adachi.client.sendPrivateMsg( Adachi.config.master, error as string );
						continue;
					}
				}
			}
			userIndex++
		}
		userIndex=0;
	}
}
