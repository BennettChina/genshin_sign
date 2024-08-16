import express from "express";
import {hasSignPromise, signPromise, userGameRolesPromise,} from "../utils/promise";
import {cookies} from "../init";
import Adachi from "ROOT";
import {UserGameRolesData} from "#/genshin_sign/utils/resultObjectType";

const router = express.Router();

enum SIGN_Message {
	HAVE_SIGN = "已签到，请勿重复签到,总签到天数",
	SIGN_SUCCESS = "签到成功，总签到天数",
	NOT_FOUND = "未查询到角色数据，请检查米哈游通行证（非UID）是否有误或是否设置角色信息公开",
	UNKNOWN = "发生未知错误",
	FORM_MESSAGE = "米游社接口报错: "
}

/**
 * 处理获取用户游戏角色数据
 * @param cookie
 */
async function fetchUserGameRolesData(cookie: string): Promise<UserGameRolesData[] | undefined> {
	try {
		return await userGameRolesPromise(cookie);
	} catch (error) {
		if (error !== "gotten") {
			throw error;
		}
		return undefined;
	}
}

/**
 * 进行用户签到
 * @param userIndex 用户索引
 * @param cookie 用户Cookie
 * @param users 用户游戏角色数据
 * @param resultMessage 结果信息
 */
async function handleSignsForUser(userIndex:number,cookie: string , users: UserGameRolesData[] , resultMessage: string):Promise<string>{
	for (const item of <UserGameRolesData[]>users) {
		try {
			const signResult = await hasSignPromise(item.game_uid, item.region, cookie);
			Adachi.logger.info(`第${userIndex}位签到账号信息：`,item);
			Adachi.logger.info("查询是否签到信息：" + JSON.stringify(signResult));

			if (signResult.is_sign) {
				resultMessage = logSignInfo(item.game_uid,signResult.today,signResult.is_sign,signResult.total_sign_day,SIGN_Message.HAVE_SIGN)
				return resultMessage;
			}

			const sign: Object = await signPromise(item.game_uid, item.region, cookie);
			Adachi.logger.info("签到信息：" + JSON.stringify(sign));
			resultMessage = logSignInfo(item.game_uid,signResult.today,signResult.is_sign,signResult.total_sign_day,SIGN_Message.SIGN_SUCCESS)
			return resultMessage;
		} catch (error) {
			if (error !== "gotten") {
				return 	resultMessage += (error as string);
			}
		}
	}
}

/**
 * 日志记录
 * @param gameUid 游戏UID
 * @param signToday 当前签到日期
 * @param isSigned 是否签到
 * @param totalSignDay 总签到天数
 * @param customMassage 自定义信息结果
 */
function logSignInfo(gameUid:string,signToday:string,isSigned:boolean,totalSignDay:string,customMassage:string):string{
	const message:string =`用户 ${gameUid} ${signToday} ${customMassage}：${totalSignDay}`
	Adachi.logger.info(message)
	return message
}

router.get( "/", async ( req, res ) => {
	const cookieList = cookies.getCookies();
	let resultMessage: string = "";
	// 用户数量
	let userIndex:number=0;
	for (const cookie of cookieList) {
		let users:UserGameRolesData[] | undefined
		users = await fetchUserGameRolesData(cookie)
		Adachi.logger.info("绑定角色信息：" + JSON.stringify(users));

		resultMessage = await handleSignsForUser(userIndex,cookie,<UserGameRolesData[]>users,resultMessage)
		userIndex++;
	}
	userIndex = 0 ;
	await Adachi.client.sendPrivateMsg( Adachi.config.value.base.master, resultMessage );
	res.send( resultMessage );
} );

export default router;


// for (const item of <UserGameRolesData[]>users) {
// 	try {
// 		Adachi.logger.info(`第${userIndex}位绑定角色信息：`,item);
// 		const signResult = await hasSignPromise(item.game_uid, item.region, cookie);
//
// 		Adachi.logger.info("查询是否签到信息：" + JSON.stringify(signResult));
//
// 		if (signResult.is_sign) {
// 			Adachi.logger.info(`用户 ${item.game_uid} ${signResult.today} 已签到，请勿重复签到`);
// 			result += (` 用户 ${item.game_uid} ${signResult.today} 已签到，请勿重复签到，总签到天数：${signResult.total_sign_day}`);
// 			continue;
// 		}
// 		const sign: Object = await signPromise(item.game_uid, item.region, cookie);
//
// 		Adachi.logger.info("签到信息：" + JSON.stringify(sign));
//
// 		Adachi.logger.info(`用户 ${item.game_uid} ${signResult.today} 签到成功，总签到天数：${signResult.total_sign_day + 1}`);
// 		result += (` 用户 ${item.game_uid} ${signResult.today} 签到成功，总签到天数：${signResult.total_sign_day + 1}`);
// 	} catch (error) {
// 		if (error !== "gotten") {
// 			result += (error as string);
// 			continue;
// 		}
// 	}
// 	userIndex++;
// }
